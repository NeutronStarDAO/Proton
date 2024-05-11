use candid::{Principal, CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;

use types::{Post, NewRepost, NewComment, NewLike};


thread_local! {
    static FEED_MAP: RefCell<HashMap<String, Post>> = RefCell::new(HashMap::new());
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
fn update_post_comment(post_id: String, new_comment: NewComment) -> bool {
    match _update_post_comment(post_id, new_comment) {
        None => false,
        Some(new_post) => {
            // 通知 commentFetch
            true
        }
    }
}

#[ic_cdk::update]
fn update_post_like(post_id: String, new_like: NewLike) -> bool {
    match _update_post_like(post_id, new_like) {
        None => false,
        Some(new_post) => {
            // 通知 likeFetch
            true
        }
    }
}

#[ic_cdk::query]
fn get_post_number() -> u128 {
    FEED_MAP.with(|map| {
        map.borrow().len() as u128
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
fn get_latest_feed(n: u128) -> Vec<Post> {
    FEED_MAP.with(|map| {
        let mut map_value_vec: Vec<Post> = map.borrow().values().cloned().collect();
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
    })
}

fn _store_feed(post: Post) -> bool {
    FEED_MAP.with(|map| {
        match map.borrow().get(&post.post_id) {
            None => {
                map.borrow_mut().insert(post.post_id.clone(), post);
                true
            },
            Some(_) => {
                // Debug.print("This post has been stored");
                false
            }
        }
    })
}

fn _update_post_repost(post_id: String, new_repost: NewRepost) -> bool {
    FEED_MAP.with(|map| {
        match map.borrow().get(&post_id) {
            None => false,
            Some(old_post) => {
                map.borrow_mut().insert(
                    post_id, 
                    Post {
                        post_id: old_post.post_id.clone(),
                        feed_canister: old_post.feed_canister,
                        index: old_post.index,
                        user: old_post.user,
                        content: old_post.content.clone(),
                        repost: new_repost,
                        like: old_post.like.clone(),
                        comment: old_post.comment.clone(),
                        created_at: old_post.created_at
                    }
                );
                true
            }
        }
    })
}

fn _update_post_comment(post_id: String, new_comment: NewComment) -> Option<Post> {
    FEED_MAP.with(|map| {
        match map.borrow().get(&post_id) {
            None => None,
            Some(old_post) => {
                let new_post = Post {
                    post_id: old_post.post_id.clone(),
                    feed_canister: old_post.feed_canister,
                    index: old_post.index,
                    user: old_post.user,
                    content: old_post.content.clone(),
                    repost: old_post.repost.clone(),
                    like: old_post.like.clone(),
                    comment: new_comment,
                    created_at: old_post.created_at
                };
                map.borrow_mut().insert(post_id, new_post.clone());
                Some(new_post)
            }
        }
    })
}

fn _update_post_like(post_id: String, new_like: NewLike) -> Option<Post> {
    FEED_MAP.with(|map| {
        match map.borrow().get(&post_id) {
            None => None,
            Some(old_post) => {
                let new_post = Post {
                    post_id: old_post.post_id.clone(),
                    feed_canister: old_post.feed_canister,
                    index: old_post.index,
                    user: old_post.user,
                    content: old_post.content.clone(),
                    repost: old_post.repost.clone(),
                    like: new_like,
                    comment: old_post.comment.clone(),
                    created_at: old_post.created_at
                };
                map.borrow_mut().insert(post_id, new_post.clone());
                Some(new_post)
            }
        }
    })
}

// async fn check_bucket_memory() 