use std::cell::{Cell, Ref, RefCell};
use std::collections::HashMap;
use candid::{Principal, Encode, CandidType, Deserialize};
use ic_cdk::api::management_canister::main::{
    create_canister, install_code, CanisterIdRecord, CanisterInstallMode, CanisterSettings, CanisterStatusResponse, CreateCanisterArgument, InstallCodeArgument
};
use types::FeedInitArg;

#[derive(CandidType, Deserialize, Debug)]
pub struct InitArg {
    pub root_bucket: Principal,
    pub user_actor: Principal,
}

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static USER_FEED_CANISTER_MAP: RefCell<HashMap<Principal, Principal>> = RefCell::new(HashMap::new());
    static FEED_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static FEED_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static ROOT_BUCKET: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static USER_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static POST_FETCH_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static COMMMENT_FETCH_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static LIKE_FETCH_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    ROOT_BUCKET.set(arg.root_bucket);
    USER_ACTOR.set(arg.user_actor);
}

#[ic_cdk::update]
fn init_fetch_actor(
    post_fetch: Principal,
    comment_fetch: Principal,
    like_fetch: Principal
) {
    POST_FETCH_ACTOR.set(post_fetch);
    COMMMENT_FETCH_ACTOR.set(comment_fetch);
    LIKE_FETCH_ACTOR.set(like_fetch);
}

#[ic_cdk::update]
async fn create_feed_canister() -> Option<Principal> {
    let caller = ic_cdk::caller();
    assert!(is_user_have_feed_canister(&caller) != true);

    let canister_record = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap();
    let canister_id = canister_record.0.canister_id;

    let feed_init_arg = FeedInitArg {
        root_bucket: ROOT_BUCKET.with(|root_bucket| root_bucket.borrow().clone()),
        user_actor: USER_ACTOR.with(|user_actor| user_actor.borrow().clone()),
        post_fetch_actor: POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().clone()),
        comment_fetch_actor: COMMMENT_FETCH_ACTOR.with(|comment_fetch_actor| comment_fetch_actor.borrow().clone()),
        like_fetch_actor: LIKE_FETCH_ACTOR.with(|like_fetch_actor| like_fetch_actor.borrow().clone()),
        owner: ic_cdk::api::caller()
    };
    install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: FEED_WASM.with(|wasm| wasm.borrow().clone()),
        arg: Encode!(&feed_init_arg).unwrap()
    }).await.unwrap();

    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow_mut().insert(ic_cdk::caller(), canister_id)
    });

    Some(canister_id)
}

#[ic_cdk::update]
fn update_feed_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        FEED_WASM_BUFFER.set(wasm_chunk);
        true
    } else if index == 1 {
        let mut new_wasm = FEED_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().clone());
        new_wasm.extend(wasm_chunk);
        FEED_WASM.set(new_wasm);
        true
    } else {
        false
    }
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

#[ic_cdk::query]
fn get_feed_wasm() -> Vec<u8> {
    FEED_WASM.with(|wasm| wasm.borrow().clone())
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
fn get_total_user_feed_canister_number() -> u64 {
    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow().len() as u64
    })
}

fn is_user_have_feed_canister(user: &Principal) -> bool {
    USER_FEED_CANISTER_MAP.with(|map| {
        map.borrow().get(user).is_some()
    })
}

ic_cdk::export_candid!();