use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal, Deserialize};
use types::{Post, FetchInitArg as InitArg};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};

thread_local! {
    static NOTIFY_MAP: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
    static USER_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    USER_ACTOR.set(arg.user_actor);
}

#[ic_cdk::update]
async fn receive_notify(post: Post) {
    // 查到这个帖子的主用户的 followers
    let post_user_followers = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
        USER_ACTOR.with(|actor| actor.borrow().clone()), 
        "get_followers_list", 
        (post.user, )
    ).await.unwrap().0;

    // 通知粉丝
    store_notify(post_user_followers, post.post_id.clone());

    // 通知转帖者
    let mut repost_users: Vec<Principal> = Vec::new();
    for repost in post.repost {
        repost_users.push(repost.user);
    }
    store_notify(repost_users, post.post_id);
}

#[ic_cdk::update]
fn receive_repost_user_notify(to: Vec<Principal>, post_id: String) {
    store_notify(to, post_id)
}

#[ic_cdk::query]
fn get_notify_map_entries() -> Vec<(Principal, Vec<String>)> {
    let mut result: Vec<(Principal, Vec<String>)> = Vec::new();

    NOTIFY_MAP.with(|map| {
        for (k, v) in map.borrow().iter() {
            result.push((k.clone(), v.clone()))
        }
    });

    result
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

fn store_notify(to: Vec<Principal>, post_id: String) {
    for user in to {
        NOTIFY_MAP.with(|map| {
            match map.borrow().get(&user) {
                None => {
                    map.borrow_mut().insert(user, vec![post_id.clone()]);
                },
                Some(post_id_array) => {
                    let mut new_post_id_array = post_id_array.clone();
                    new_post_id_array.push(post_id.clone());
                    map.borrow_mut().insert(user, new_post_id_array);
                }
            }
        })
    }
}

ic_cdk::export_candid!();