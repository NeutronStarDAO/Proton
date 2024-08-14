use candid::{Principal, Encode};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};

use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const T_CYCLES: u128 = 1_000_000_000_000;
const MAX_USER_NUMBER: u64 = 1000;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static FEED_CANISTER_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 
            0
        ).unwrap()
    );

    static AVAILABLE_FEED_CANISTER_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 
            0
        ).unwrap()
    );

    static FEED_CANISTER_MAP: RefCell<StableBTreeMap<u64, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static FEED_CANISTER_USERS_NUMBER: RefCell<StableBTreeMap<Principal, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static USER_FEED_CANISTER: RefCell<StableBTreeMap<Principal, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    static ROOT_BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static USER_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static POST_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static FEED_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static FEED_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

#[ic_cdk::init]
fn init_function(
    root_bucket: Principal,
    user_actor: Principal
) {
    ROOT_BUCKET.with(|actor| actor.borrow_mut().set(root_bucket).unwrap());
    USER_ACTOR.with(|actor| actor.borrow_mut().set(user_actor).unwrap());
}

#[ic_cdk::update]
fn init_fetch_actor(
    post_fetch: Principal,
) {
    POST_FETCH_ACTOR.with(|fetch| fetch.borrow_mut().set(post_fetch).unwrap());
}

#[ic_cdk::update]
async fn init_user_feed() -> Principal {
    let user = ic_cdk::caller();
    
    if let Some(feed_canister) = USER_FEED_CANISTER.with(|map| {
        map.borrow().get(&user)
    }) {
        return feed_canister;
    }

    // 分配用户在哪个 feed_canister 中
    let available_index = AVAILABLE_FEED_CANISTER_INDEX.with(|index| {
        index.borrow().get().clone()
    });

    let feed_canister = FEED_CANISTER_MAP.with(|map| {
        map.borrow_mut().get(&available_index)
    }).unwrap();
    
    let user_number = FEED_CANISTER_USERS_NUMBER.with(|map| {
        map.borrow().get(&feed_canister)
    }).unwrap();

    if user_number < MAX_USER_NUMBER {
        USER_FEED_CANISTER.with(|map| {
            map.borrow_mut().insert(user, feed_canister)
        });

        FEED_CANISTER_USERS_NUMBER.with(|map| {
            map.borrow_mut().insert(feed_canister, user_number + 1)
        });

        feed_canister
    } else {
        let new_feed_canister = create_feed_canister().await;

        AVAILABLE_FEED_CANISTER_INDEX.with(|index| {
            index.borrow_mut().set(available_index + 1).unwrap()
        });

        USER_FEED_CANISTER.with(|map| {
            map.borrow_mut().insert(user, new_feed_canister)
        });
        
        FEED_CANISTER_USERS_NUMBER.with(|map| {
            map.borrow_mut().insert(new_feed_canister, user_number + 1)
        });

        new_feed_canister
    }
}

#[ic_cdk::update]
async fn create_feed_canister() -> Principal {
    let canister_id = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::api::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None,
                log_visibility: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap().0.canister_id;

    let root_bucket = ROOT_BUCKET.with(|root_bucket| root_bucket.borrow().get().clone());
    let user_actor = USER_ACTOR.with(|user_actor| user_actor.borrow().get().clone());
    let post_fetch = POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone());

    let install_result = install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: FEED_WASM.with(|wasm| wasm.borrow().clone()),
        arg: Encode!(&root_bucket, &user_actor, &post_fetch).unwrap()
    }).await.unwrap();


    let feed_index = FEED_CANISTER_INDEX.with(|index| index.borrow().get().clone());
    FEED_CANISTER_MAP.with(|map| {
        map.borrow_mut().insert(feed_index, canister_id)
    });

    FEED_CANISTER_INDEX.with(|index| {
        index.borrow_mut().set(feed_index + 1).unwrap()
    });

    FEED_CANISTER_USERS_NUMBER.with(|map| {
        map.borrow_mut().insert(canister_id, 0)
    });

    canister_id
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

#[ic_cdk::query]
fn get_feed_wasm() -> Vec<u8> {
    FEED_WASM.with(|wasm| wasm.borrow().clone())
}

#[ic_cdk::query]
fn get_user_feed_canister(user: Principal) -> Option<Principal> {
    USER_FEED_CANISTER.with(|map| {
        map.borrow().get(&user)
    })
}

#[ic_cdk::query]
fn get_feed_canister_index() -> u64 {
    FEED_CANISTER_INDEX.with(|index| index.borrow().get().clone())
}

#[ic_cdk::query]
fn get_available_feed_canister_index() -> u64 {
    AVAILABLE_FEED_CANISTER_INDEX.with(|index| index.borrow().get().clone())
}

#[ic_cdk::query] 
fn get_all_feed_canister() -> Vec<Principal> {
    FEED_CANISTER_MAP.with(|map| {
        let mut feed_canister_list = Vec::new();
        for (_, feed_canister) in map.borrow().iter() {
            feed_canister_list.push(feed_canister)
        }
        feed_canister_list
    })
}

#[ic_cdk::query]
fn get_feed_canister_users_number_entries() -> Vec<(Principal, u64)> {
    FEED_CANISTER_USERS_NUMBER.with(|map| {
        let mut entries = Vec::new();

        for (feed, number) in map.borrow().iter() {
            entries.push((feed, number))
        }

        entries
    })
}

#[ic_cdk::query]
fn get_root_bucket() -> Principal {
    ROOT_BUCKET.with(|root_bucket| root_bucket.borrow().get().clone())
}

#[ic_cdk::query]
fn get_user_actor() -> Principal {
    USER_ACTOR.with(|user_actor| user_actor.borrow().get().clone())
}

#[ic_cdk::update]
async fn set_root_bucket(canister: Principal) -> bool {
    if !is_controller(&ic_cdk::caller()).await {
        return false;
    }

    ROOT_BUCKET.with(|root_bucket| root_bucket.borrow_mut().set(canister).unwrap());

    true
}

#[ic_cdk::update]
async fn set_user_actor(canister: Principal) -> bool {
    if !is_controller(&ic_cdk::caller()).await {
        return false;
    }

    USER_ACTOR.with(|user_actor| user_actor.borrow_mut().set(canister).unwrap());

    true
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
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
async fn update_feed_canister_controller(
    controller: Principal
) -> bool {
    if !is_controller(&ic_cdk::caller()).await {
        return false;
    }

    let canister_id = ic_cdk::api::id();
    let controllers = vec![ic_cdk::api::id(), controller];

    ic_cdk::api::management_canister::main::update_settings(
        ic_cdk::api::management_canister::main::UpdateSettingsArgument {
            canister_id: canister_id,
            settings: CanisterSettings {
                controllers: Some(controllers),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None,
                log_visibility: None
            }
        }
    ).await.unwrap();

    true
}

// Enable Candid export
ic_cdk::export_candid!();