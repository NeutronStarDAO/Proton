use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use candid::{Principal};
use ic_cdk::api::management_canister::main::{
    create_canister, install_code, CanisterIdRecord, CanisterInstallMode, CanisterSettings, CanisterStatusResponse, CreateCanisterArgument, InstallCodeArgument
};

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static USER_FEED_CANISTER_MAP: RefCell<HashMap<Principal, Principal>> = RefCell::new(HashMap::new());
    static FEED_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static FEED_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

#[ic_cdk::update]
async fn create_feed_canister() -> Option<Principal> {
    let caller = ic_cdk::caller();
    assert!(is_user_have_feed_canister(&caller));

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

    install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: FEED_WASM.with(|wasm| wasm.borrow().clone()),
        arg: vec![]
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