use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal, Deserialize};
use types::{Post, FetchInitArg as InitArg};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_cdk_timers::TimerId;
use std::time::Duration;

thread_local! {
    static NOTIFY_MAP: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
    static USER_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static ROOT_FEED_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static TIMER_ID: RefCell<TimerId> = RefCell::new(TimerId::default());
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    USER_ACTOR.set(arg.user_actor);
    ROOT_FEED_ACTOR.set(arg.root_feed);

    // start timer
    let timer_id = ic_cdk_timers::set_timer_interval(
        Duration::from_secs(10), 
        || ic_cdk::spawn(notify())
    );
    TIMER_ID.set(timer_id);
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
        let is_user_have_post_id_array = 
            NOTIFY_MAP.with(|map| {
                map.borrow().get(&user).cloned()
            });

        match is_user_have_post_id_array {
            None => {
                NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(user, vec![post_id.clone()]);
                })
            },
            Some(post_id_array) => {
                let mut new_post_id_array = post_id_array.clone();
                new_post_id_array.push(post_id.clone());
                NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(user, new_post_id_array);
                })
            }
        }
    }
}

async fn notify() {
    let entries: Vec<(Principal, Vec<String>)> = NOTIFY_MAP.with(|map| {
        let mut entries: Vec<(Principal, Vec<String>)> = Vec::new();
        for (user, post_id_array) in map.borrow().iter() {
            entries.push((user.clone(), post_id_array.clone()));
        };
        entries
    });

    for (user, post_id_array) in entries {
        // 查询 user -> feed_canister
        let user_feed_canister = ic_cdk::call::<(Principal, ), (Option<Principal>, )>(
            ROOT_FEED_ACTOR.with(|actor| actor.borrow().clone()), 
            "get_user_feed_canister", 
            (user.clone(), )
        ).await.unwrap().0;

        if user_feed_canister.is_none() {
            NOTIFY_MAP.with(|map| {
                map.borrow_mut().remove(&user)
            });
            continue;
        }
        
        // notify
        let notify_result = ic_cdk::call::<(Vec<String>, ), ()>(
            user_feed_canister.unwrap(), 
            "batch_receive_like", 
            (post_id_array, )
        ).await.unwrap();
        
        // delete
        NOTIFY_MAP.with(|map| {
            map.borrow_mut().remove(&user)
        });
    }
}

ic_cdk::export_candid!();