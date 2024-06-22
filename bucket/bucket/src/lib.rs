use candid::Principal;
use std::cell::RefCell;
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use types::{Post, NewRepost, NewComment, NewLike};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static FEED_MAP: RefCell<StableBTreeMap<String, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    static COMMENT_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 
            Principal::anonymous()
        ).unwrap()
    );

    static LIKE_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))), 
            Principal::anonymous()
        ).unwrap()
    );
}

#[ic_cdk::init]
fn init(
    comment_fetch: Principal,
    like_fetch: Principal
) {
    COMMENT_FETCH_ACTOR.with(|actor| {
        actor.borrow_mut().set(comment_fetch).unwrap()
    });
    LIKE_FETCH_ACTOR.with(|actor| {
        actor.borrow_mut().set(like_fetch).unwrap()
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {

}

#[ic_cdk::update]
fn store_feed(post: Post) -> bool {
    // check_bucket_memory()
    _store_feed(post)
}

#[ic_cdk::update]
fn batch_store_feed(post_array: Vec<Post>) {
    for post in post_array {
        _store_feed(post);
    }
}

#[ic_cdk::update]
fn update_post_repost(post_id: String, new_repost: NewRepost) -> bool {
    assert!(_update_post_repost(post_id, new_repost));
    true
}

#[ic_cdk::update]
async fn update_post_comment(post_id: String, new_comment: NewComment) -> bool {
    match _update_post_comment(post_id, new_comment) {
        None => false,
        Some(new_post) => {
            // 通知 commentFetch
            let call_comment_fetch_result = ic_cdk::call::<(Post, ), ()>(
                COMMENT_FETCH_ACTOR.with(|comment_fetch| comment_fetch.borrow().get().clone()), 
                "receive_notify", 
                (new_post, )
            ).await.unwrap();
            true
        }
    }
}

#[ic_cdk::update]
async fn update_post_like(post_id: String, new_like: NewLike) -> bool {
    match _update_post_like(post_id, new_like) {
        None => false,
        Some(new_post) => {
            // 通知 likeFetch
            let call_like_fetch_result = ic_cdk::call::<(Post, ), ()>(
                LIKE_FETCH_ACTOR.with(|like_fetch| like_fetch.borrow().get().clone()), 
                "receive_notify", 
                (new_post, )
            ).await.unwrap();
            true
        }
    }
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

#[ic_cdk::query]
fn get_post_number() -> u64 {
    FEED_MAP.with(|map| {
        map.borrow().len() as u64
    })
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    FEED_MAP.with(|map| {
        match map.borrow().get(&post_id) {
            None => None,
            Some(post) => Some(post.clone()),
        }
    })
}

#[ic_cdk::query]
fn get_posts(post_id_array: Vec<String>) -> Vec<Post> {
    let mut result: Vec<Post> = Vec::new();

    FEED_MAP.with(|map| {
        for post_id in post_id_array {
            match map.borrow().get(&post_id) {
                None => {},
                Some(post) => {
                    result.push(post.clone());
                }
            }
        }
    });

    result
}

#[ic_cdk::query]
fn get_latest_feed(n: u64) -> Vec<Post> {
    let mut map_value_vec: Vec<Post> = FEED_MAP.with(|map| {
        let mut values: Vec<Post> = Vec::new();
        for (k, v) in map.borrow().iter() {
            values.push(v.clone())
        }
        values
    });

    map_value_vec.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });
    let mut result: Vec<Post> = Vec::new();
    let mut i = 0;
    for post in map_value_vec.iter().rev() {
        if i >= n {
            break;
        }
        result.push(post.clone());
        i += 1;
    }
    result  
}

fn _store_feed(post: Post) -> bool {
    let is_have_post = FEED_MAP.with(|map| {
        match map.borrow().get(&post.post_id) {
            None => false,
            Some(_) => true 
        }
    });
    if is_have_post == false {
        FEED_MAP.with(|map| {
            map.borrow_mut().insert(post.post_id.clone(), post);
        });
        true
    } else {
        // Debug.print("This post has been stored");
        false
    }
}

fn _update_post_repost(post_id: String, new_repost: NewRepost) -> bool {
    let old_post = FEED_MAP.with(|map| {
        map.borrow().get(&post_id)
    });

    match old_post {
        None => false,
        Some(old_post) => {
            FEED_MAP.with(|map| {
                map.borrow_mut().insert(
                    post_id, 
                    Post {
                        post_id: old_post.post_id.clone(),
                        feed_canister: old_post.feed_canister,
                        index: old_post.index,
                        user: old_post.user,
                        content: old_post.content.clone(),
                        photo_url: old_post.photo_url.clone(),
                        repost: new_repost,
                        like: old_post.like.clone(),
                        comment: old_post.comment.clone(),
                        created_at: old_post.created_at
                    }
                );
            });
            true
        }
    }
}

fn _update_post_comment(post_id: String, new_comment: NewComment) -> Option<Post> {
    let old_post = FEED_MAP.with(|map| {
        map.borrow().get(&post_id)
    });

    match old_post {
        None => None,
        Some(old_post) => {
            let new_post = Post {
                post_id: old_post.post_id.clone(),
                feed_canister: old_post.feed_canister,
                index: old_post.index,
                user: old_post.user,
                content: old_post.content.clone(),
                photo_url: old_post.photo_url.clone(),
                repost: old_post.repost.clone(),
                like: old_post.like.clone(),
                comment: new_comment,
                created_at: old_post.created_at
            };
            FEED_MAP.with(|map| {
                map.borrow_mut().insert(post_id, new_post.clone());
            });
            Some(new_post)
        }
    }
}

fn _update_post_like(post_id: String, new_like: NewLike) -> Option<Post> {
    let old_post = FEED_MAP.with(|map| {
        map.borrow().get(&post_id)
    });

    match old_post {
        None => None,
        Some(old_post) => {
            let new_post = Post {
                post_id: old_post.post_id.clone(),
                feed_canister: old_post.feed_canister,
                index: old_post.index,
                user: old_post.user,
                content: old_post.content.clone(),
                photo_url: old_post.photo_url.clone(),
                repost: old_post.repost.clone(),
                like: new_like,
                comment: old_post.comment.clone(),
                created_at: old_post.created_at
            };
            FEED_MAP.with(|map| {
                map.borrow_mut().insert(post_id, new_post.clone());
            });
            Some(new_post)
        }
    }
}

// async fn check_bucket_memory() 

ic_cdk::export_candid!();