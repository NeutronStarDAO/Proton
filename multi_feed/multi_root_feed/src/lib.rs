use types::Post;

use candid::{CandidType, Principal, Deserialize, Encode, Decode};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, StableVec};
use ic_stable_structures::storable::{Bound, Storable};

use std::cell::RefCell;
use std::borrow::Cow;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const T_CYCLES: u128 = 1_000_000_000_000;
const MAX_USER_NUMBER: u64 = 1000;

#[derive(Clone, CandidType, Deserialize)]
struct Profile {
    id: Principal,
    handle: String,
    name: String,
    biography: String,
    company: String,
    education: String,
    back_img_url: String,
    avatar_url: String,
    feed_canister: Option<Principal>
}

impl Storable for Profile {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

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

    static FOLLOW_LIST: RefCell<StableVec<(Principal, Principal), Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        ).unwrap()
    );

    static PROFILE_MAP: RefCell<StableBTreeMap<Principal, Profile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
        )
    );

    static HANDLE_MAP: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))),
        )
    );

    static FEED_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static FEED_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

// --------------- Feed Canister ---------------
#[ic_cdk::update]
async fn init_user_feed(user: Principal) -> Principal {
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

    let install_result = install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: FEED_WASM.with(|wasm| wasm.borrow().clone()),
        arg: Encode!(&ic_cdk::api::id()).unwrap()
    }).await.unwrap();


    let feed_index = FEED_CANISTER_INDEX.with(|index| index.borrow().get().clone());
    FEED_CANISTER_MAP.with(|map| {
        map.borrow_mut().insert(feed_index, canister_id)
    });
    FEED_CANISTER_INDEX.with(|index| {
        index.borrow_mut().set(feed_index + 1).unwrap()
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

#[ic_cdk::query(composite = true)]
async fn get_feeds_latest_feed(n: u64) -> Vec<Post> {
    let mut posts: Vec<Post> = Vec::new();

    let canisters: Vec<Principal> = FEED_CANISTER_MAP.with(|map| {
        let mut canisters: Vec<Principal> = Vec::new();
        for (_, canister) in map.borrow().iter() {
            canisters.push(canister)
        };
        canisters
    });

    for canister in canisters {
        let feeds = ic_cdk::call::<(u64, ), (Vec<Post>, )>(
            canister, 
            "get_all_latest_feed", 
            (n,)
        ).await.unwrap().0;

        for feed in feeds {
            posts.push(feed)
        }
    }

    posts.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut sorted_posts = Vec::new();
    let mut i = 0;

    for post in posts.iter().rev() {
        if i >= n {
            break;
        }
        sorted_posts.push(post.clone());
        i += 1;
    }

    sorted_posts
}

// --------------- Follow --------------------
#[ic_cdk::update]
fn follow(to: Principal) {
    let from = ic_cdk::caller();
    let is_followed = FOLLOW_LIST.with(|list| {
        for (_from, _to) in list.borrow().iter() {
            if _from == from && _to == to {
                return true;
            }
        }
        false
    });
    if !is_followed {
        FOLLOW_LIST.with(|list| {
            list.borrow_mut().push(&(from, to)).unwrap()
        })
    }
}

// is user_a follow user_b
#[ic_cdk::query]
fn is_followed(user_a: Principal, user_b: Principal) -> bool {
    FOLLOW_LIST.with(|list| {
        for (from, to) in list.borrow().iter() {
            if user_a == from && user_b == to {
                return true;
            }
        }
        false
    })
}

#[ic_cdk::query]
fn get_following_list(user: Principal) -> Vec<Principal> {
    FOLLOW_LIST.with(|list| {
        let mut following_list = Vec::new();
        for (from, to) in list.borrow().iter() {
            if from == user {
                following_list.push(to);
            }
        }
        following_list
    })
}

#[ic_cdk::query]
fn get_followers_list(user: Principal) -> Vec<Principal> {
    FOLLOW_LIST.with(|list| {
        let mut followers_list = Vec::new();
        for (from, to) in list.borrow().iter() {
            if to == user {
                followers_list.push(from);
            }
        }
        followers_list
    })
}

#[ic_cdk::query]
fn get_following_number(user: Principal) -> u64 {
    FOLLOW_LIST.with(|list| {
        let mut following_number = 0;
        for (from, _) in list.borrow().iter() {
            if from == user {
                following_number += 1;
            }
        }
        following_number
    })
}

#[ic_cdk::query]
fn get_follower_number(user: Principal) -> u64 {
    FOLLOW_LIST.with(|list| {
        let mut followers_number = 0;
        for (_, to) in list.borrow().iter() {
            if to == user {
                followers_number += 1;
            }
        }
        followers_number
    })
}

// ------------------- Profile -----------------------

#[ic_cdk::update]
fn create_profile(profile: Profile) -> bool {
    assert!(ic_cdk::caller() == profile.id);
    if !_is_handle_available(&profile.handle) {
        return false;
    }

    HANDLE_MAP.with(|map| map.borrow_mut().insert(profile.handle.clone(), profile.id));

    PROFILE_MAP.with(|map| map.borrow_mut().insert(profile.id, profile));

    true
}

#[ic_cdk::update]
fn update_profile(profile: Profile) {
    assert!(ic_cdk::caller() == profile.id);
    let old_profile = PROFILE_MAP.with(|map| map.borrow().get(&profile.id)).unwrap();
    assert!(old_profile.handle == profile.handle);

    PROFILE_MAP.with(|map| map.borrow_mut().insert(profile.id, profile));
}

#[ic_cdk::update]
fn update_handle(new_handle: String) -> bool {
    if !_is_handle_available(&new_handle) {
        return false;
    };

    let old_profile = PROFILE_MAP.with(|map| map.borrow().get(&ic_cdk::caller())).unwrap();
    let new_profile = Profile {
        id: old_profile.id,
        handle: new_handle.clone(),
        name: old_profile.name,
        biography: old_profile.biography,
        company: old_profile.company,
        education: old_profile.education,
        back_img_url: old_profile.back_img_url,
        avatar_url: old_profile.avatar_url,
        feed_canister: old_profile.feed_canister
    };

    HANDLE_MAP.with(|map| map.borrow_mut().remove(&old_profile.handle));
    HANDLE_MAP.with(|map| map.borrow_mut().insert(new_handle, old_profile.id));

    PROFILE_MAP.with(|map| map.borrow_mut().insert(new_profile.id, new_profile));

    true
}

#[ic_cdk::query]
fn is_handle_available(handle: String) -> bool {
    _is_handle_available(&handle)
}

#[ic_cdk::query]
fn get_profile(user: Principal) -> Option<Profile> {
    PROFILE_MAP.with(|map| map.borrow().get(&user))
}

#[ic_cdk::query]
fn batch_get_profile(user_ids: Vec<Principal>) -> Vec<Profile> {
    let mut profiles = Vec::new();
    for user in user_ids {
        PROFILE_MAP.with(|map| {
            if let Some(profile) = map.borrow().get(&user) {
                profiles.push(profile);
            }
        })
    }
    profiles
}

fn _is_handle_available(handle: &String) -> bool {
    HANDLE_MAP.with(|map| {
        if let None = map.borrow().get(handle) {
            return true;
        }
        false
    })
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

// Enable Candid export
ic_cdk::export_candid!();