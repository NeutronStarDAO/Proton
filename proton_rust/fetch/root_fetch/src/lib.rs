use std::cell::{RefCell, Cell};
use std::collections::HashMap;
use candid::{CandidType, Deserialize, Encode, Principal};
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use types::FetchInitArg;

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static POST_FETCH_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static COMMENT_FETCH_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static LIKE_FETCH_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());

    static POST_FETCH_INDEX: Cell<u64> = Cell::new(0);
    static COMMENT_FETCH_INDEX: Cell<u64> = Cell::new(0);
    static LIKE_FETCH_INDEX: Cell<u64> = Cell::new(0);

    static USER_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static ROOT_FEED_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());

    static POST_FETCH_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static POST_FETCH_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());

    static COMMENT_FETCH_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static COMMENT_FETCH_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());

    static LIKE_FETCH_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static LIKE_FETCH_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

#[ic_cdk::init]
fn init_function(arg: FetchInitArg) {
    USER_ACTOR.set(arg.user_actor);
    ROOT_FEED_ACTOR.set(arg.root_feed);
}

#[ic_cdk::update]
fn init_fetch_actor(
    post_fetch: Principal,
    comment_fetch: Principal,
    like_fetch: Principal
) {
    POST_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(
            POST_FETCH_INDEX.get(),
            post_fetch
        );
    });
    POST_FETCH_INDEX.set(POST_FETCH_INDEX.get() + 1);

    COMMENT_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(
            COMMENT_FETCH_INDEX.get(),
            comment_fetch
        );
    });
    COMMENT_FETCH_INDEX.set(COMMENT_FETCH_INDEX.get() + 1);

    LIKE_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(
            LIKE_FETCH_INDEX.get(),
            like_fetch
        );
    });
    LIKE_FETCH_INDEX.set(LIKE_FETCH_INDEX.get() + 1);
}

#[ic_cdk::update]
async fn create_post_fetch_canister() -> Principal {
    let canister_id = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::api::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap().0.canister_id;

    let install_result = install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: POST_FETCH_WASM.with(|wasm| wasm.borrow().clone()),
        arg: vec![],
    }).await.unwrap();

    POST_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(POST_FETCH_INDEX.get(), canister_id);
    });
    POST_FETCH_INDEX.set(POST_FETCH_INDEX.get() + 1);

    // postFetch : initUserToFeed
    // ...

    canister_id
}

#[ic_cdk::update]
async fn create_comment_fetch_canister() -> Principal {
    let canister_id = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::api::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap().0.canister_id;

    let init_arg = FetchInitArg {
        user_actor: USER_ACTOR.with(|user_actor| user_actor.borrow().clone()),
        root_feed: ROOT_FEED_ACTOR.with(|root_feed| root_feed.borrow().clone())
    };
    let install_result = install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: COMMENT_FETCH_WASM.with(|wasm| wasm.borrow().clone()),
        arg: Encode!(&init_arg).unwrap()
    }).await.unwrap();

    COMMENT_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(COMMENT_FETCH_INDEX.get(), canister_id);
    });
    COMMENT_FETCH_INDEX.set(COMMENT_FETCH_INDEX.get() + 1);

    // initUserToFeed
    // ....

    canister_id
}

#[ic_cdk::update]
async fn create_like_fetch_canister() -> Principal {
    let canister_id = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::api::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap().0.canister_id;

    let init_arg = FetchInitArg {
        user_actor: USER_ACTOR.with(|user_actor| user_actor.borrow().clone()),
        root_feed: ROOT_FEED_ACTOR.with(|root_feed| root_feed.borrow().clone())
    };
    let install_result = install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: LIKE_FETCH_WASM.with(|wasm| wasm.borrow().clone()),
        arg: Encode!(&init_arg).unwrap()
    }).await.unwrap();

    LIKE_FETCH_MAP.with(|map| {
        map.borrow_mut().insert(LIKE_FETCH_INDEX.get(), canister_id);
    });
    LIKE_FETCH_INDEX.set(LIKE_FETCH_INDEX.get() + 1);

    // initUserToFeed
    // ....

    canister_id
}

#[ic_cdk::query]
fn get_all_post_fetch_canister() -> Vec<Principal> {
    POST_FETCH_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_comment_fetch_canister() -> Vec<Principal> {
    COMMENT_FETCH_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_like_fetch_canister() -> Vec<Principal> {
    LIKE_FETCH_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::update]
fn update_post_fetch_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        POST_FETCH_WASM_BUFFER.set(wasm_chunk);
        true
    } else if index == 1 {
        let mut new_wasm = POST_FETCH_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().clone());
        new_wasm.extend(wasm_chunk);
        POST_FETCH_WASM.set(new_wasm);
        true
    } else {
        false
    }
}

#[ic_cdk::update]
fn update_comment_fetch_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        COMMENT_FETCH_WASM_BUFFER.set(wasm_chunk);
        true
    } else if index == 1 {
        let mut new_wasm = COMMENT_FETCH_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().clone());
        new_wasm.extend(wasm_chunk);
        COMMENT_FETCH_WASM.set(new_wasm);
        true
    } else {
        false
    }
}

#[ic_cdk::update]
fn update_like_fetch_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        LIKE_FETCH_WASM_BUFFER.set(wasm_chunk);
        true
    } else if index == 1 {
        let mut new_wasm = LIKE_FETCH_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().clone());
        new_wasm.extend(wasm_chunk);
        LIKE_FETCH_WASM.set(new_wasm);
        true
    } else {
        false
    }
}

#[ic_cdk::query]
fn get_post_fetch_wasm() -> Vec<u8> {
    POST_FETCH_WASM.with(|wasm| wasm.borrow().clone())
}

#[ic_cdk::query]
fn get_comment_fetch_wasm() -> Vec<u8> {
    COMMENT_FETCH_WASM.with(|wasm| wasm.borrow().clone())
}

#[ic_cdk::query]
fn get_like_fetch_wasm() -> Vec<u8> {
    LIKE_FETCH_WASM.with(|wasm| wasm.borrow().clone())
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

ic_cdk::export_candid!();