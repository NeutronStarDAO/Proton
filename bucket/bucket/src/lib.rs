use candid::Principal;
use std::cell::RefCell;
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use types::{Post, Comment};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static FEED_MAP: RefCell<StableBTreeMap<String, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

}

#[ic_cdk::update]
async fn complete_upgrade() -> bool {
    if !is_controller(&ic_cdk::caller()).await {
        return false;
    }

// FEED_MAP 
    let feed_map_entries: Vec<(String, Post)> = FEED_MAP.with(|map| {
        map.borrow().iter().collect()
    });

    for (k, v) in feed_map_entries {
        let mut i = 0;
        let mut new_comment: Vec<Comment> = Vec::new();
        for comment in v.comment {
            new_comment.push(Comment {
                index: Some(i),
                user: comment.user,
                content: comment.content,
                created_at: comment.created_at,
                like: Some(Vec::new())
            });
            i += 1;
        }
        
        FEED_MAP.with(|archieve_post_map| {
            archieve_post_map.borrow_mut().insert(k, Post {
                post_id: v.post_id,
                feed_canister: v.feed_canister,
                index: v.index,
                user: v.user,
                content: v.content,
                photo_url: v.photo_url,
                repost: v.repost,
                like: v.like,
                comment_index: Some(i),
                comment: new_comment,
                comment_to_comment: Some(Vec::new()),
                created_at: v.created_at
            })
        });
    }

    true
}

async fn is_controller(user: &Principal) -> bool {
    let status = status().await;
    let controllers = status.settings.controllers;

    if !controllers.contains(user) {
        return false;
    }

    true
}

#[ic_cdk::update]
fn store_feed(post: Post) -> bool {
    FEED_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post);
    });
    true
}

#[ic_cdk::update]
fn delete_feed(post_id: String) -> bool {
    FEED_MAP.with(|map| {
        map.borrow_mut().remove(&post_id)
    });
    true
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

ic_cdk::export_candid!();