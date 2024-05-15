use std::cell::{RefCell, Cell};
use std::collections::HashMap;
use std::vec;
use candid::{CandidType, Principal, Deserialize};
use ic_cdk_timers::TimerId;

thread_local! {
    // user_feed_canister -> post_id_array
    static NOTIFY_MAP: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
}

#[ic_cdk::update]
fn receive_notify(to: Vec<Principal>, post_id: String) {
    NOTIFY_MAP.with(|map| {
        for feed_canister in to.iter() {
            match map.borrow().get(feed_canister) {
                None => {
                    map.borrow_mut().insert(*feed_canister, vec![post_id.clone()]);
                },
                Some(post_id_array) => {
                    let mut new_post_id_array = post_id_array.clone();
                    new_post_id_array.push(post_id.clone());
                    map.borrow_mut().insert(*feed_canister, new_post_id_array);
                }
            }
        }
    })
}

#[ic_cdk::query]
fn get_notify_map_entries() -> Vec<(Principal, Vec<String>)> {
    NOTIFY_MAP.with(|map| {
        let mut result: Vec<(Principal, Vec<String>)> = vec![];
        for (user, post_id_array) in map.borrow().iter() {
            result.push((*user, post_id_array.clone()));
        };
        result
    })
}

fn notify() {
    NOTIFY_MAP.with(|map| {
        for (feed_canister, post_id_array) in map.borrow().iter() {
            
        }
    })
}
