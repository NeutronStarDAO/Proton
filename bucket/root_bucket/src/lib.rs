use candid::{CandidType, Deserialize, Encode, Principal};
use std::borrow::Borrow;
use std::collections::HashMap;
use std::cell::{RefCell, Cell};
use std::result;
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use types::Post;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static BUCKET_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
            0
        ).unwrap()
    );

    static BUCKET_MAP: RefCell<StableBTreeMap<u64, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static AVAILABLE_BUCKET_MAP: RefCell<StableBTreeMap<u64, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static UNAVAILABLE_BUCKET_MAP: RefCell<StableBTreeMap<u64, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static BUCKET_WASM: RefCell<StableCell<Vec<u8>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
            vec![]
        ).unwrap()
    );

    static BUCKET_WASM_BUFFER: RefCell<StableCell<Vec<u8>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))),
            vec![]
        ).unwrap()
    );

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
            wasm_module: BUCKET_WASM.with(|wasm| wasm.borrow().get().clone()),
            arg: vec![]
        }).await.unwrap();
        let bucket_index = BUCKET_INDEX.with(|index| index.borrow().get().clone());
        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                bucket_index,
                canister_id
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                bucket_index,
                canister_id
            )
        });
        BUCKET_INDEX.with(|index| index.borrow_mut().set(bucket_index + 1).unwrap());
    }
}

#[ic_cdk::update]
fn update_bucket_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        BUCKET_WASM_BUFFER.with(|buffer| buffer.borrow_mut().set(wasm_chunk).unwrap());
        true
    } else if index == 1 {
        let mut new_wasm = BUCKET_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().get().clone());
        new_wasm.extend(wasm_chunk);
        BUCKET_WASM.with(|wasm| wasm.borrow_mut().set(new_wasm).unwrap());
        true
    } else {
        false
    }
}

#[ic_cdk::query]
fn get_bucket_wasm() -> Vec<u8> {
    BUCKET_WASM.with(|wasm| wasm.borrow().get().clone())
}

#[ic_cdk::update]
fn add_available_bucket(bucket_array: Vec<Principal>) {
    for bucket in bucket_array {
        let index = BUCKET_INDEX.with(|v| v.borrow().get().clone());
        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                index,
                bucket
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                index,
                bucket
            )
        });
        BUCKET_INDEX.with(|v| v.borrow_mut().set(index + 1).unwrap());
    }
}

#[ic_cdk::query]
fn get_bucket_index() -> u64 {
    BUCKET_INDEX.with(|value| value.borrow().get().clone())
}

#[ic_cdk::update]
async fn create_bucket() -> Principal {
    _create_bucket().await
}

// #[ic_cdk::update]
// fn re_create_bucket() {
//     AVAILABLE_BUCKET_MAP.with(|map| {
//         for (index, bucket) in map.borrow().iter() {
//             if bucket == &ic_cdk::caller() {
//                 _create_bucket();
//                 map.borrow_mut().remove(&index);
//                 UNAVAILABLE_BUCKET_MAP.with(|unavailable_map| {
//                     unavailable_map.borrow_mut().insert(
//                         *index, 
//                         *bucket
//                     )
//                 });
//             }
//         }
//     })
// }

#[ic_cdk::query]
fn get_availeable_bucket() -> Option<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        let size = map.borrow().len() as u64;
        if size == 0 {
            return None;
        }
        map.borrow().get(&(ic_cdk::api::time() % size)).clone()
    })
} 

#[ic_cdk::query]
fn get_all_bucket() -> Vec<Principal> {
    BUCKET_MAP.with(|map| {
        let mut values: Vec<Principal> = vec![];
        for (k, v) in map.borrow().iter() {
            values.push(v.clone())
        }
        values
    })
}

#[ic_cdk::query]
fn get_all_available_bucket() -> Vec<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        let mut values: Vec<Principal> = vec![];
        for (k, v) in map.borrow().iter() {
            values.push(v.clone())
        }
        values
    })
}

#[ic_cdk::query]
fn get_all_unavailable_bucket() -> Vec<Principal> {
    UNAVAILABLE_BUCKET_MAP.with(|map| {
        let mut values: Vec<Principal> = vec![];
        for (k, v) in map.borrow().iter() {
            values.push(v.clone())
        }
        values
    })
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

#[ic_cdk::query(composite = true)]
async fn get_buckets_latest_feed(n: u64) -> Vec<Post> {
    let mut posts: Vec<Post> = Vec::new();
    let mut m = n;
    let buckets: Vec<Principal> = AVAILABLE_BUCKET_MAP.with(|map| {
        let mut values: Vec<Principal> = vec![];
        for (k, v) in map.borrow().iter() {
            values.push(v.clone())
        }
        values
    });
    for bucket in buckets {
        let result = ic_cdk::call::<(u64, ), (Vec<Post>, )>(
            bucket, 
            "get_latest_feed", 
            (m,)
        ).await.unwrap().0;
        if result.len() > 0 {
            let len = result.len() as u64;
            for post in result {
                posts.push(post);
            };
            if len < m {
                m -= len;
            } else {
                m = 0;
                break;
            }
        }
    }

    posts.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut sorted_posts = Vec::new();

    for post in posts.iter().rev() {
        sorted_posts.push(post.clone())
    }

    sorted_posts
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
        wasm_module: BUCKET_WASM.with(|wasm| wasm.borrow().get().clone()),
        arg: vec![]
    }).await.unwrap();

    let bucket_index = BUCKET_INDEX.with(|index| index.borrow().get().clone());
    BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            bucket_index,
            canister_id
        )
    });
    AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            bucket_index,
            canister_id
        )
    });
    BUCKET_INDEX.with(|index| index.borrow_mut().set(bucket_index + 1).unwrap());

    canister_id
}

ic_cdk::export_candid!();