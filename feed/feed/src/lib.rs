mod wallet;
use wallet::{TransferResult, WalletTX};

use candid::{Nat, Principal};
use std::cell::RefCell;
use std::collections::HashSet;
use types::{Comment, Like, NewComment, NewLike, NewRepost, Post, Repost, FeedInitArg as InitArg};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static POST_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 
            0
        ).unwrap()
    );

    static POST_MAP: RefCell<StableBTreeMap<u64, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static FEED_MAP: RefCell<StableBTreeMap<String, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))), 
            Principal::anonymous()
        ).unwrap()
    );

    static ROOT_BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))), 
            Principal::anonymous()
        ).unwrap()  
    );
    
    static USER_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 
            Principal::anonymous()
        ).unwrap()   
    );
    
    static POST_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 
            Principal::anonymous()
        ).unwrap()   
    );
    
    static OWNER: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(9))), 
            Principal::anonymous()
        ).unwrap()      
    );
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    ROOT_BUCKET.with(|root_bucket| root_bucket.borrow_mut().set(arg.root_bucket).unwrap());

    USER_ACTOR.with(|user_actor| user_actor.borrow_mut().set(arg.user_actor).unwrap());
    
    POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow_mut().set(arg.post_fetch_actor).unwrap());
    
    OWNER.with(|owner| owner.borrow_mut().set(arg.owner).unwrap());
}

// owner
#[ic_cdk::update(guard = "is_owner")]
fn update_owner(new_owner: Principal) {
    OWNER.with(|owner| owner.borrow_mut().set(new_owner).unwrap());
}

#[ic_cdk::query]
fn get_owner() -> Principal {
    OWNER.with(|pr| pr.borrow().get().clone())
}

fn is_owner() -> Result<(), String>{
    OWNER.with(|owner| {
        assert!(ic_cdk::api::caller() == owner.borrow().get().clone())
    });
    Ok(())
}

// Bucket
#[ic_cdk::update]
async fn check_available_bucket() -> bool {
    let call_result = ic_cdk::call::<(), (Option<Principal>, )>(
        ROOT_BUCKET.with(|id| id.borrow().get().clone()), 
        "get_availeable_bucket", 
        ()
    ).await.unwrap().0;
    let availeable_bucket = call_result.unwrap();
    BUCKET.with(|bucket| bucket.borrow_mut().set(availeable_bucket).unwrap());
    true
}

#[ic_cdk::query]
fn get_bucket() -> Option<Principal> {
    BUCKET.with(|pr| {
        if pr.borrow().get().clone() == Principal::anonymous() {
            return None;
        }
        Some(pr.borrow().get().clone())
    })
}

// Post
#[ic_cdk::update(guard = "is_owner")]
async fn create_post(content: String, photo_url: Vec<String>) -> String {
    // get available bucket
    let mut bucket_id = get_bucket();
    if let None = bucket_id {
        check_available_bucket().await;
        bucket_id = get_bucket();
        bucket_id.unwrap();
    };

    // 存储post
    let post_index = POST_INDEX.with(|index| index.borrow().get().clone());

    let post = Post {
        post_id: get_post_id(bucket_id.unwrap(), ic_cdk::caller(), post_index),
        feed_canister: ic_cdk::api::id(),
        index: post_index,
        user: ic_cdk::caller(),
        content: content,
        photo_url: photo_url,
        repost: Vec::new(),
        like: Vec::new(),
        comment: Vec::new(),
        created_at: ic_cdk::api::time()
    };

    POST_MAP.with(|map| map.borrow_mut().insert(post_index, post.clone()));

    POST_INDEX.with(|index| index.borrow_mut().set(post_index + 1).unwrap());

    // 将帖子内容发送给公共区的 Bucket 
    let bucket_store_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket_id.unwrap().clone(),
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(bucket_store_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    post.post_id
}

#[ic_cdk::update]
async fn create_repost(post_id: String) -> bool {
    let (bucket, _, post_index) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = POST_MAP.with(|map| map.borrow().get(&post_index)).unwrap();
    
    for i in post.repost.iter() {
        if i.user == caller {
            return false;
        }
    };

    post.repost.push(Repost { user: caller, created_at: ic_cdk::api::time()});
    POST_MAP.with(|map| {
        map.borrow_mut().insert(
            post.index, 
            post.clone()
        );
    });

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn create_comment(post_id: String, content: String) -> bool {
    let (bucket, _, index) = check_post_id(&post_id);

    let mut post = POST_MAP.with(|map| map.borrow().get(&index)).unwrap();

    post.comment.push(Comment {
        user: ic_cdk::caller(),
        content: content,
        created_at: ic_cdk::api::time()
    });

    POST_MAP.with(|map| map.borrow_mut().insert(index, post.clone()));

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn create_like(post_id: String) -> bool {
    let (bucket, user, index) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = POST_MAP.with(|map| map.borrow().get(&index)).unwrap();

    for i in post.like.iter() {
        if i.user == caller {
            return false;
        }
    }

    post.like.push(Like {
        user: caller,
        created_at: ic_cdk::api::time()
    });

    POST_MAP.with(|map| map.borrow_mut().insert(index, post.clone()));

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update(guard="is_owner")]
async fn delete_post(post_id: String) -> bool {
    let (bucket, _, post_index) = check_post_id(&post_id);

    let post = POST_MAP.with(|map| map.borrow().get(&post_index).clone()).unwrap();
    POST_MAP.with(|map| {
        map.borrow_mut().remove(&post_index)
    });

    let delete_bucket_feed_result = 
        ic_cdk::call::<(String, ), (bool, )>(
            bucket, 
            "delete_feed", 
            (post_id.clone(), )
        ).await.unwrap().0;
    assert!(delete_bucket_feed_result);
    
    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_delete_notify", 
            (notify_users, post_id, )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::query]
fn get_post_number() -> u64 {
    POST_MAP.with(|map| map.borrow().len())
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    let (_, _, index) = check_post_id(&post_id);
    POST_MAP.with(|map| {
        map.borrow().get(&index)
    })
}

#[ic_cdk::query] 
fn get_all_post() -> Vec<Post> {
    let mut post_vec = POST_MAP.with(|map| {
        let mut post_vec = Vec::new();

        for (_, v) in map.borrow().iter() {
            post_vec.push(v)
        }

        post_vec
    });
    post_vec.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut sorted_post_vec = Vec::new();

    for post in post_vec.iter().rev() {
        sorted_post_vec.push(post.clone())
    }

    sorted_post_vec
}

fn get_post_id(bucket: Principal, user: Principal, index: u64) -> String {
    bucket.to_text() + "#" + &user.to_text() + "#" + &index.to_string()   
}


async fn get_notify_users(post: Post) -> Vec<Principal> {
    let mut notify_user_set: HashSet<Principal> = HashSet::new();
    
    let user_canister = USER_ACTOR.with(|actor| actor.borrow().get().clone());

    // 1. 发帖者的粉丝
    let user_fans = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
        user_canister.clone(), 
        "get_followers_list", 
        (post.user,)
    ).await.unwrap().0;
    notify_user_set.extend(user_fans);

    // 2. 转发者
    let repost_users: Vec<Principal> = post.repost.iter().map(|repost| repost.user).collect();
    notify_user_set.extend(repost_users.clone());

    // 3. 转发者的粉丝
    for repost_user in repost_users {
        let fans = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
            user_canister.clone(), 
            "get_followers_list", 
            (repost_user,)
        ).await.unwrap().0;
        notify_user_set.extend(fans);
    }

    // 4. 需要剔除发帖者本身
    notify_user_set.remove(&post.user);

    notify_user_set.into_iter().collect()
}

// Feed
#[ic_cdk::update]
async fn receive_feed(post_id: String) -> bool {
    if is_feed_in_post(&post_id) {
        return false;
    };
    let (bucket, _, _) = check_post_id(&post_id);
    let new_post = ic_cdk::call::<(String, ), (Option<Post>, )>(
        bucket, 
        "get_post", 
        (post_id.clone(), )
    ).await.unwrap().0.unwrap();
    FEED_MAP.with(|map| {
        map.borrow_mut().insert(
            post_id, 
            new_post
        )
    });
    true
}

#[ic_cdk::update]
async fn batch_receive_feed(post_id_array: Vec<String>) {
    for post_id in post_id_array {
        if is_feed_in_post(&post_id) {
            continue;
        }
        let (bucket, _, _) = check_post_id(&post_id);
        let new_post = ic_cdk::call::<(String, ), (Option<Post>, )>(
            bucket, 
            "get_post", 
            (post_id, )
        ).await.unwrap().0.unwrap();
        FEED_MAP.with(|map| {
            map.borrow_mut().insert(
                new_post.post_id.clone(), 
                new_post.clone()
            )
        });
    }
}

#[ic_cdk::update]
async fn batch_delete_feed(post_id_array: Vec<String>) {
    for post_id in post_id_array {
        FEED_MAP.with(|map| {
            map.borrow_mut().remove(&post_id)
        });
    }
}

#[ic_cdk::query]
fn get_feed_number() -> u64 {
    FEED_MAP.with(|map| {
        map.borrow().len()
    })
}

#[ic_cdk::query]
fn get_feed(post_id: String) -> Option<Post> {
    FEED_MAP.with(|map| {
        map.borrow().get(&post_id)
    })
}

#[ic_cdk::query]
fn get_latest_feed(n: u64) -> Vec<Post> {
    let mut feed_vec: Vec<Post> = FEED_MAP.with(|map| {
        let mut vec: Vec<Post> = Vec::new();

        for (k, v) in map.borrow().iter() {
            vec.push(v)
        }

        vec
    });
    feed_vec.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut result: Vec<Post> = Vec::new();
    let mut i = 0;
    for feed in feed_vec.iter().rev() {
        if i >= n {
            break;
        }
        result.push(feed.clone());
        i += 1;
    }

    result
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

fn is_feed_in_post(post_id: &String) -> bool {
    let (bucket, user, index) = check_post_id(post_id);
    POST_MAP.with(|map| {
        if let None = map.borrow().get(&index) {
            return false;
        }
        true
    })
}

fn check_post_id(
    post_id: &String
) -> (Principal, Principal, u64) {
    let words: Vec<&str> = post_id.split("#").collect();
    let bucket = Principal::from_text(words[0]).unwrap();
    let user = Principal::from_text(words[1]).unwrap();
    let post_index = u64::from_str_radix(words[2], 10).unwrap();
    (bucket, user, post_index)
}

fn is_repost_user(post: Post, user: Principal) -> bool {
    for repost in post.repost.iter() {
        if repost.user == user {
            return true;
        }
    }
    false
}

ic_cdk::export_candid!();