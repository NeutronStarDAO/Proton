use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal, Deserialize, Encode, Decode};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, StableVec};
use std::borrow::Cow;
use ic_stable_structures::storable::{Bound, Storable};

type Memory = VirtualMemory<DefaultMemoryImpl>;

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

    static FOLLOW_LIST: RefCell<StableVec<(Principal, Principal), Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ).unwrap()
    );

    static PROFILE_MAP: RefCell<StableBTreeMap<Principal, Profile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static HANDLE_MAP: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );
}

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

#[ic_cdk::query]
fn is_handle_available(handle: String) -> bool {
    _is_handle_available(&handle)
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

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

// Enable Candid export
ic_cdk::export_candid!();