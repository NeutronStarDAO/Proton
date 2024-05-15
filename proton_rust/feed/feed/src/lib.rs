use candid::{Principal, CandidType, Deserialize};
use std::{borrow::Borrow, collections::HashMap};
use std::cell::RefCell;
use types::{Comment, Like, NewComment, NewLike, NewRepost, Post, Repost};

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreatePostArgs {
    feed_canister: Principal,
    content: String,
    time: u64,
    bucket: Principal
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreateCommentArgs {
    post_id: String,
    content: String, 
    created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreateLikeArgs {

}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PostDatabase {
    post_index: u128,
    post_map: HashMap<u128, Post>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct  FeedDatabase {
    feed_map: HashMap<String, Post>
}

#[derive(CandidType, Deserialize, Debug)]
struct InitArg {
    root_bucket: Principal,
    user_actor: Principal,
    owner: Principal
}

impl PostDatabase {

    fn new() -> Self {
        PostDatabase {
            post_index: 0,
            post_map: HashMap::new()
        }
    }

    fn get_post_index(&self) -> u128 { self.post_index }

    fn get_post_map_entries(&self) -> Vec<(&u128, &Post)> {
        self.post_map.iter().collect()
    }

    fn get_post_id(bucket: Principal, user: Principal, index: u128) -> String {
        bucket.to_text() + "#" + &user.to_text() + "#" + &index.to_string()
        
    }
    
    fn create_post(&mut self, user: Principal, args: CreatePostArgs) -> Post {
        let post_index = self.post_index;
        let post = Post {
            post_id: PostDatabase::get_post_id(args.bucket, user, post_index),
            feed_canister: args.feed_canister,
            index: post_index,
            user: user,
            content: args.content,
            repost: Vec::new(),
            like: Vec::new(),
            comment: Vec::new(),
            created_at: ic_cdk::api::time()
        };
        self.post_map.insert(
            post_index, 
            post.clone()
        );
        self.post_index += 1;
        post
    }

    fn create_repost(&mut self, post_id: String) -> Option<(Principal, NewRepost)> {
        let (bucket, user, post_index) = check_post_id(&post_id);
        let value = self.post_map.get_mut(&post_index).unwrap();
        let mut is_already_repost = false;
        for i in value.repost.iter() {
            if i.user == user {
                is_already_repost = true;
                break;
            }
        }
        if !is_already_repost {
            value.repost.push(Repost { user: user, created_at: ic_cdk::api::time()});
            Some((bucket, value.clone().repost))
        } else {
            None
        }
    
    }

    fn create_comment(&mut self, coment_user: Principal, args: CreateCommentArgs) -> Option<(Principal, NewComment)> {
        let (bucket, user, index) = check_post_id(&args.post_id);
        if let Some(post) = self.post_map.get_mut(&index) {
            post.comment.push(Comment {
                user: coment_user,
                content: args.content,
                created_at: args.created_at
            });
            return Some((bucket, post.comment.clone()));
        };
        None
    }

    fn create_like(&mut self, like_user: Principal, post_id: String) -> Option<(Principal, NewLike)> {
        let (bucket, user, index) = check_post_id(&post_id);
        if let Some(post) = self.post_map.get_mut(&index) {
            for i in post.like.iter() {
                if i.user == like_user {
                    return None;
                }
            }
            post.like.push(Like {
                user: like_user,
                created_at: ic_cdk::api::time()
            });
            return Some((bucket, post.like.clone()))
        }
        None
    }



    fn get_post_number(&self) -> u128 { self.post_map.len() as u128}

    fn get_post(&self, post_id: &String) -> Option<Post> {
        let (bucket, user, index) = check_post_id(post_id);
        self.post_map.get(&index).cloned()
    }

    fn get_all_post(&self) -> Vec<Post> {
        self.post_map.values().cloned().into_iter().collect()
    }

}


impl FeedDatabase {
    fn new() -> Self {
        FeedDatabase {
            feed_map: HashMap::new()
        }
    }

    fn get_feed_map_entries(&self) -> Vec<(String, Post)> {
        let mut entries: Vec<(String, Post)> = Vec::new();
        for (k, v) in self.feed_map.iter() {
            entries.push((k.clone(), v.clone()))
        }
        entries
    }

    fn store_feed(&mut self, post: Post) {
        self.feed_map.insert(post.post_id.clone(), post);
    }

    fn batch_store_feed(&mut self, post_array: Vec<Post>) {
        for post in post_array {
            self.feed_map.insert(post.post_id.clone(), post);
        }
    }

    fn get_feed_number(&self) -> usize {
        self.feed_map.len()
    }

    fn get_feed(&self, post_id: String) -> Option<Post> {
        self.feed_map.get(&post_id).cloned()
    }

    fn get_latest_feed(&self, n: u64) -> Vec<Post> {
        let mut map_post_vec: Vec<Post> = self.feed_map.values().cloned().collect();
        map_post_vec.sort_by(|a, b| {
            a.created_at.partial_cmp(&b.created_at).unwrap()
        });
        let mut result: Vec<Post> = Vec::new();
        let mut i = 0;
        for post in map_post_vec.iter().rev() {
            if i >= n {
                break;
            }
            result.push(post.clone());
            i += 1;
        }
        result
    }
}

thread_local! {
    static POST_DATABASE: RefCell<PostDatabase> = RefCell::new(PostDatabase::new());
    static FEED_DATABASE: RefCell<FeedDatabase> = RefCell::new(FeedDatabase::new());
    static BUCKET: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static ROOT_BUCKET: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static USER_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static OWNER: RefCell<Principal> = RefCell::new(Principal::anonymous());
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    ROOT_BUCKET.set(arg.root_bucket);
    USER_ACTOR.set(arg.user_actor);
    OWNER.set(arg.owner);
}

// owner
#[ic_cdk::query]
fn get_owner() -> Principal {
    OWNER.with(|pr| pr.borrow().clone())
}

fn is_owner() -> Result<(), String>{
    OWNER.with(|owner| {
        assert!(ic_cdk::api::caller() == owner.borrow().clone())
    });
    Ok(())
}

#[ic_cdk::update(guard = "is_owner")]
fn update_owner(new_owner: Principal) {
    OWNER.set(new_owner);
}

// Bucket

#[ic_cdk::update]
async fn check_available_bucket() -> bool {
    let call_result = ic_cdk::call::<(), (Option<Principal>, )>(
        ROOT_BUCKET.with(|id| id.borrow().clone()), 
        "get_availeable_bucket", 
        ()
    ).await.unwrap().0;
    let availeable_bucket = call_result.unwrap();
    BUCKET.set(availeable_bucket);
    true
}

#[ic_cdk::query]
fn get_bucket() -> Option<Principal> {
    BUCKET.with(|pr| {
        if pr.borrow().clone() == Principal::anonymous() {
            return None;
        }
        Some(pr.borrow().clone())
    })
}

// Post
#[ic_cdk::query]
fn get_post_number() -> u128 {
    POST_DATABASE.with(|database| {
        database.borrow().get_post_number()
    })
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    POST_DATABASE.with(|database| {
        database.borrow().get_post(&post_id)
    })
}

#[ic_cdk::query] 
fn get_all_post() -> Vec<Post> {
    POST_DATABASE.with(|database| {
        database.borrow().get_all_post()
    })
}

#[ic_cdk::update(guard = "is_owner")]
async fn creaet_post(content: String) -> String {
    let mut bucket_id = get_bucket();
    if let None = bucket_id {
        check_available_bucket().await;
        bucket_id = get_bucket();
        bucket_id.unwrap();
    };

    // 存储post

    let post = POST_DATABASE.with(|database| {
        database.borrow_mut().create_post(
            ic_cdk::api::caller(),
            CreatePostArgs {
                feed_canister: ic_cdk::api::id(),
                content: content,
                time: ic_cdk::api::time(),
                bucket: BUCKET.with(|id| id.borrow().clone())   
            }
        )
    });

    // 将帖子内容发送给公共区的 Bucket 
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        BUCKET.with(|bucket| bucket.borrow().clone()),
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch 
    post.post_id

}

#[ic_cdk::update]
async fn create_repost(post_id: String) -> bool {
    match POST_DATABASE.with(|database| {
        database.borrow_mut().create_repost(post_id.clone())
    }) {
        None => false,
        Some((bucket, new_repost)) => {
            // 通知 bucket 更新转发信息
            let call_bucket_result = ic_cdk::call::<(String, NewRepost, ), (bool, )>(
                bucket, 
                "update_post_repost", 
                (post_id, new_repost, )
            ).await.unwrap().0;
            assert!(call_bucket_result);

            // 获取转发者的粉丝
            let repost_user_followers = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
                USER_ACTOR.with(|pr| pr.borrow().clone()), 
                "get_followers_list", 
                (ic_cdk::api::caller(), )
            ).await.unwrap().0;

            // 通知 PostFetch
            true
        }
    }
}

#[ic_cdk::update]
async fn create_comment(post_id: String, content: String) -> bool {
    match POST_DATABASE.with(|database| {
        database.borrow_mut().create_comment(
            ic_cdk::api::caller(), 
            CreateCommentArgs {
                post_id: post_id.clone(),
                content: content, 
                created_at: ic_cdk::api::time(),
            }
        )
    }) {
        None => false,
        Some((bucket, new_comment)) => {
            // 通知对应的 bucket 更新评论
            let call_bucket_result = ic_cdk::call::<(String, NewComment, ), (bool,)>(
                bucket,
                "update_post_comment",
                (post_id, new_comment, )
            ).await.unwrap().0;
            assert!(call_bucket_result);
            true
        }
    } 
}

#[ic_cdk::update]
async fn create_like(post_id: String) -> bool {
    match POST_DATABASE.with(|database| {
        database.borrow_mut().create_like(ic_cdk::api::caller(), post_id.clone())
    }) {
        None => false,
        Some((bucket, new_like)) => {
            // 通知 bucket 更新点赞信息
            let call_bucket_result = ic_cdk::call::<(String, NewLike, ), (bool, )>(
                bucket, 
                "update_post_like", 
                (post_id, new_like, )
            ).await.unwrap().0;
            assert!(call_bucket_result);
            true
        }
    }
}

// Feed
#[ic_cdk::update]
async fn receive_feed(post_id: String) -> bool {
    if is_feed_in_post(&post_id) {
        return false;
    };
    let (bucket, _, _) = check_post_id(&post_id);
    let call_bucket_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
        bucket, 
        "get_post", 
        (post_id, )
    ).await.unwrap().0.unwrap();
    FEED_DATABASE.with(|database| {
        database.borrow_mut().store_feed(call_bucket_result)
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
        let call_bucket_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
            bucket, 
            "get_post", 
            (post_id, )
        ).await.unwrap().0.unwrap();
        FEED_DATABASE.with(|database| {
            database.borrow_mut().store_feed(call_bucket_result)
        });
    }
}

#[ic_cdk::update]
async fn receive_comment(post_id: String) -> bool {
    if is_feed_in_post(&post_id) {
        return false;
    }

    let (bucket, _, _) = check_post_id(&post_id);
    let call_bucket_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
        bucket, 
        "get_post", 
        (post_id, )
    ).await.unwrap().0.unwrap();

    FEED_DATABASE.with(|database| {
        database.borrow_mut().store_feed(call_bucket_result)
    });

    true
}

fn is_feed_in_post(post_id: &String) -> bool {
    POST_DATABASE.with(|database| {
        if let None = database.borrow().get_post(post_id) {
            return false;
        }
        true
    })
}

fn check_post_id(
    post_id: &String
) -> (Principal, Principal, u128) {
    let words: Vec<&str> = post_id.split("#").collect();
    let bucket = Principal::from_text(words[0]).unwrap();
    let user = Principal::from_text(words[1]).unwrap();
    let post_index = u128::from_str_radix(words[2], 10).unwrap();
    (bucket, user, post_index)
}

fn is_repost_user()