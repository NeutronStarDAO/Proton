use candid::{Principal, CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::{RefCell, Cell};
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};

const T_CYCLES: u128 = 1_000_000_000_000;

// pub const WASM: &[u8] =
//     include_bytes!("../../target/wasm32-unknown-unknown/release/data_partition.wasm");

pub const BUCKET_WASM: &[u8] = &[];

thread_local! {
    static BUCKET_INDEX: Cell<u64> = Cell::new(0);
    static BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static AVAILABLE_BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static UNAVAILABLE_BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
}



#[ic_cdk::update]
async fn init() {
    for _ in 0..5 {
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
            wasm_module: BUCKET_WASM.to_vec(),
            arg: vec![]
        }).await.unwrap();

        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(),
                canister_id
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                canister_id
            )
        });
        BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);
    }
}

#[ic_cdk::update]
fn add_available_bucket(bucket_array: Vec<Principal>) {
    for bucket in bucket_array {
        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                bucket
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                bucket
            )
        });
        BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);
    }
}

#[ic_cdk::query]
fn get_bucket_index() -> u64 {
    BUCKET_INDEX.get()
}

#[ic_cdk::update]
async fn create_bucket() -> Principal {
    _create_bucket().await
}

#[ic_cdk::update]
fn re_create_bucket() {
    AVAILABLE_BUCKET_MAP.with(|map| {
        for (index, bucket) in map.borrow().iter() {
            if bucket == &ic_cdk::caller() {
                _create_bucket();
                map.borrow_mut().remove(&index);
                UNAVAILABLE_BUCKET_MAP.with(|unavailable_map| {
                    unavailable_map.borrow_mut().insert(
                        *index, 
                        *bucket
                    )
                });
            }
        }
    })
}

#[ic_cdk::query]
fn get_availeable_bucket() -> Option<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        let size = map.borrow().len() as u64;
        if size == 0 {
            return None;
        }
        map.borrow().get(&(ic_cdk::api::time() % size)).cloned()
    })
} 

#[ic_cdk::query]
fn get_all_bucket() -> Vec<Principal> {
    BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_available_bucket() -> Vec<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_unavailable_bucket() -> Vec<Principal> {
    UNAVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

async fn _create_bucket() -> Principal {
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
        wasm_module: BUCKET_WASM.to_vec(),
        arg: vec![]
    }).await.unwrap();

    BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            BUCKET_INDEX.get(),
            canister_id
        )
    });
    AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            BUCKET_INDEX.get(), 
            canister_id
        )
    });
    BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);   

    canister_id
}