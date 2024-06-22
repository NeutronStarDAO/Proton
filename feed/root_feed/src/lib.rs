use std::cell::RefCell;
use candid::{Principal, Encode, CandidType, Deserialize};
use ic_cdk::api::management_canister::main::{
    create_canister, install_code, CanisterIdRecord, CanisterInstallMode, CanisterSettings, CanisterStatusResponse, CreateCanisterArgument, InstallCodeArgument
};
use types::FeedInitArg;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Debug)]
pub struct InitArg {
    pub root_bucket: Principal,
    pub user_actor: Principal,
}

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USER_FEED_CANISTER_MAP: RefCell<StableBTreeMap<Principal, Principal, Memory>> = 
        RefCell::new(
            StableBTreeMap::init(
                MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
            )
        );
    
    static FEED_WASM: RefCell<StableCell<Vec<u8>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 
            Vec::new()
        ).unwrap() 
    );

    static FEED_WASM_BUFFER: RefCell<StableCell<Vec<u8>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))), 
            Vec::new()
        ).unwrap() 
    );

    static ROOT_BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static USER_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static POST_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static COMMMENT_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 
            Principal::anonymous()
        ).unwrap() 
    );

    static LIKE_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))), 
            Principal::anonymous()
        ).unwrap() 
    );
}

#[ic_cdk::init]
fn init_function(arg: InitArg) {
    ROOT_BUCKET.with(|root_bucket| root_bucket.borrow_mut().set(arg.root_bucket).unwrap());
    USER_ACTOR.with(|user_actor| user_actor.borrow_mut().set(arg.user_actor).unwrap());
}

#[ic_cdk::update]
fn init_fetch_actor(
    post_fetch: Principal,
    comment_fetch: Principal,
    like_fetch: Principal
) {
    POST_FETCH_ACTOR.with(|fetch| fetch.borrow_mut().set(post_fetch).unwrap());
    COMMMENT_FETCH_ACTOR.with(|fetch| fetch.borrow_mut().set(comment_fetch).unwrap());
    LIKE_FETCH_ACTOR.with(|fetch| fetch.borrow_mut().set(like_fetch).unwrap());
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
        root_bucket: ROOT_BUCKET.with(|root_bucket| root_bucket.borrow().get().clone()),
        user_actor: USER_ACTOR.with(|user_actor| user_actor.borrow().get().clone()),
        post_fetch_actor: POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()),
        comment_fetch_actor: COMMMENT_FETCH_ACTOR.with(|comment_fetch_actor| comment_fetch_actor.borrow().get().clone()),
        like_fetch_actor: LIKE_FETCH_ACTOR.with(|like_fetch_actor| like_fetch_actor.borrow().get().clone()),
        owner: ic_cdk::api::caller()
    };
    install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: FEED_WASM.with(|wasm| wasm.borrow().get().clone()),
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
        FEED_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow_mut().set(wasm_chunk).unwrap());
        true
    } else if index == 1 {
        let mut new_wasm = FEED_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().get().clone());
        new_wasm.extend(wasm_chunk);
        FEED_WASM.with(|feed_wasm| feed_wasm.borrow_mut().set(new_wasm).unwrap());
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
    FEED_WASM.with(|wasm| wasm.borrow().get().clone())
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
        map.borrow().iter().map(|(k, v)| (k, v)).collect()
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