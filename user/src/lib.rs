use std::cell::RefCell;
use candid::{CandidType, Principal, Deserialize, Encode, Decode};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableVec};
use std::borrow::Cow;
use ic_stable_structures::storable::{Bound, Storable};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(Clone, CandidType, Deserialize)]
struct Profile {
    id: Principal,
    handle: String,
    name: String,
    biography: String,
    website: String,
    location: String,
    back_img_url: String,
    avatar_url: String,
    feed_canister: Option<Principal>,
    created_at: Option<u64>
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

    static BLACK_FOLLOW_LIST: RefCell<StableVec<(Principal, Principal), Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        ).unwrap()
    );
}

#[ic_cdk::update]
fn cancle_black_list(user: Principal) -> bool {
    let caller = ic_cdk::caller();
    assert!(caller != Principal::anonymous());

    if _is_black_follow_list(caller, user) {
        let mut new_black_list = Vec::new();
        BLACK_FOLLOW_LIST.with(|black_list| {
            for (from, to) in black_list.borrow().iter() {
                if from == caller && to == user {
                    continue;
                }
                new_black_list.push((from, to));
            }
        });

        BLACK_FOLLOW_LIST.with(|black_list| {
            while !black_list.borrow().is_empty() {
                black_list.borrow_mut().pop();
            };
        });

        BLACK_FOLLOW_LIST.with(|black_list| {
            for value in new_black_list {
                black_list.borrow_mut().push(&value).unwrap();
            }
        });

        true
    } else {
        false
    }
}

#[ic_cdk::update]
fn add_black_list(user: Principal) -> bool {
    let caller = ic_cdk::caller();
    assert!(caller != Principal::anonymous());

    assert!(_cancle_follow(caller, user));
    assert!(_cancle_follow(user, caller));

    _add_black_list(caller, user)
}

fn _add_black_list(from: Principal, to: Principal) -> bool {
    let is_already_add = BLACK_FOLLOW_LIST.with(|list| {
        for (_from, _to) in list.borrow().iter() {
            if _from == from && _to == to {
                return true;
            }
        };
        false
    });

    if is_already_add {
        return true;
    };

    BLACK_FOLLOW_LIST.with(|list| {
        list.borrow_mut().push(&(from, to)).unwrap();
    });

    true
}

#[ic_cdk::query]
fn is_black_follow_list(from: Principal, to: Principal) -> bool {
    _is_black_follow_list(from, to)
}

fn _is_black_follow_list(from: Principal, to: Principal) -> bool {
    BLACK_FOLLOW_LIST.with(|list| {
        for (_from, _to) in list.borrow().iter() {
            if _from == from && _to == to {
                return true;
            }
        };
        false
    })
}

#[ic_cdk::update]
fn follow(to: Principal) {
    let from = ic_cdk::caller();
    assert!(from != Principal::anonymous());

    if _is_black_follow_list(from, to) || _is_black_follow_list(to, from) {
        return;
    };

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

#[ic_cdk::update]
fn cancle_follow(to: Principal) {
    let caller = ic_cdk::caller();
    assert!(caller != Principal::anonymous());

    assert!(_cancle_follow(caller, to));
}

fn _cancle_follow(from: Principal, to: Principal) -> bool {
    let mut follow_list = Vec::new();
    FOLLOW_LIST.with(|list| {
        for (_from, _to) in list.borrow().iter() {
            if _from == from && _to == to {
                continue;
            };
            follow_list.push((_from, _to))
        }
    });

    FOLLOW_LIST.with(|list| {
        while list.borrow().is_empty() == false {
            list.borrow_mut().pop();
        }
    });

    FOLLOW_LIST.with(|list| {
        for (_from, _to) in follow_list {
            list.borrow_mut().push(&(_from, _to)).unwrap();
        }
    });

    true
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
    assert!(ic_cdk::caller() != Principal::anonymous());

    assert!(ic_cdk::caller() == profile.id);
    if !_is_handle_available(&profile.handle) {
        return false;
    }

    let profile_with_time = Profile {
        id: profile.id,
        handle: profile.handle.clone(),
        name: profile.name,
        biography: profile.biography,
        website: profile.website,
        location: profile.location,
        back_img_url: profile.back_img_url,
        avatar_url: profile.avatar_url,
        feed_canister: profile.feed_canister,
        created_at: Some(ic_cdk::api::time())
    };

    HANDLE_MAP.with(|map| map.borrow_mut().insert(profile.handle, profile.id));

    PROFILE_MAP.with(|map| map.borrow_mut().insert(profile.id, profile_with_time));

    true
}

#[ic_cdk::update]
fn update_profile(profile: Profile) {
    assert!(ic_cdk::caller() != Principal::anonymous());

    assert!(ic_cdk::caller() == profile.id);
    let old_profile = PROFILE_MAP.with(|map| map.borrow().get(&profile.id)).unwrap();
    assert!(old_profile.handle == profile.handle);

    let profile_with_time = Profile {
        id: profile.id,
        handle: profile.handle.clone(),
        name: profile.name,
        biography: profile.biography,
        website: profile.website,
        location: profile.location,
        back_img_url: profile.back_img_url,
        avatar_url: profile.avatar_url,
        feed_canister: profile.feed_canister,
        created_at: old_profile.created_at
    };

    PROFILE_MAP.with(|map| map.borrow_mut().insert(profile.id, profile_with_time));
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
    assert!(ic_cdk::caller() != Principal::anonymous());
    
    if !_is_handle_available(&new_handle) {
        return false;
    };

    let old_profile = PROFILE_MAP.with(|map| map.borrow().get(&ic_cdk::caller())).unwrap();
    let new_profile = Profile {
        id: old_profile.id,
        handle: new_handle.clone(),
        name: old_profile.name,
        biography: old_profile.biography,
        website: old_profile.website,
        location: old_profile.location,
        back_img_url: old_profile.back_img_url,
        avatar_url: old_profile.avatar_url,
        feed_canister: old_profile.feed_canister,
        created_at: old_profile.created_at
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
            match map.borrow().get(&user) {
                Some(profile) => {
                    profiles.push(profile);
                },
                None => {
                    let profile = Profile {
                        id: user,
                        handle: "".to_string(),
                        name: "".to_string(),
                        biography: String::from(""),
                        website: String::from(""),
                        location: String::from(""),
                        back_img_url: String::from(""),
                        avatar_url: String::from(""),
                        feed_canister: None,
                        created_at: None
                    };

                    profiles.push(profile);
                }   
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