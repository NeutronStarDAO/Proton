use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use candid::{Principal};
use ic_cdk::api::management_canister::main::{CreateCanisterArgument, CanisterIdRecord};

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static USER_FEED_CANISTER_MAP: RefCell<HashMap<Principal, Principal>> = RefCell::new(HashMap::new());
}

#[ic_cdk::update]
async fn create_feed_canister() -> Option<Principal> {
    let caller = ic_cdk::caller();
    assert!(is_user_have_feed_canister(&caller));

    let result
        = ic_cdk::api::management_canister::main::create_canister(
            CreateCanisterArgument {
                settings: None
            },
            4 * T_CYCLES
        ).await.unwrap();
    let new_feed_canister_id = result.0.canister_id;

    Some(new_feed_canister_id)
}

#[ic_cdk::query]
fn get_user_feed_canister(user: Principal) -> Option<Principal> {
    USER_FEED_CANISTER_MAP.with(|map| {
        match map.borrow().get(&user) {
            Some(feed_canister) => Some(feed_canister.clone()),
            None => None
        }
    })
}

#[ic_cdk::query]
fn get_all_user_feed_canister() -> Vec<(Principal, Principal)> {
    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow().iter().map(|(k, v)| (*k, *v)).collect()
    })
}

#[ic_cdk::query] 
fn get_total_user_feed_canister_number() -> u128 {
    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow().len() as u128
    })
}

fn is_user_have_feed_canister(user: &Principal) -> bool {
    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow().get(user).is_some()
    })
}

ic_cdk::export_candid!();