use types::{Comment, Like, Post, Repost};

use candid::{CandidType, Decode, Encode, Principal};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};
use ic_stable_structures::storable::{Bound, Storable};
use ic_cdk_timers::TimerId;
use serde::Deserialize;

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::borrow::Cow;
use std::time::Duration;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PostHashMap(HashMap<u64, Post>);

impl Storable for PostHashMap {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct FeedHashMap(HashMap<String, Post>);

impl Storable for FeedHashMap {
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

    static POST_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 
            0
        ).unwrap()
    );

    static POST_MAP: RefCell<StableBTreeMap<Principal, PostHashMap, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static FEED_MAP: RefCell<StableBTreeMap<Principal, FeedHashMap, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static ARCHIEVE_POST_MAP: RefCell<StableBTreeMap<String, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static USER_MAP: RefCell<StableBTreeMap<Principal, bool, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    static ROOT_FEED_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 
            Principal::anonymous()
        ).unwrap()
    );

    // user -> post_id_array
    static NOTIFY_MAP: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
    static DELEYE_NOTIFY_MAP: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());

    static NOTIFY_TIMER_ID: RefCell<TimerId> = RefCell::new(TimerId::default());
    static DELETE_NOTIFY_TIMER_ID: RefCell<TimerId> = RefCell::new(TimerId::default());
}

#[ic_cdk::init]
fn init(
    root_feed: Principal
) {
    ROOT_FEED_ACTOR.with(|actor| {
        actor.borrow_mut().set(root_feed).unwrap()
    });

    // start timer
    let timer_id = ic_cdk_timers::set_timer_interval(
        Duration::from_secs(10), 
        || ic_cdk::spawn(notify())
    );
    NOTIFY_TIMER_ID.set(timer_id);

    let delete_timer_id = ic_cdk_timers::set_timer_interval(
        Duration::from_secs(10), 
        || ic_cdk::spawn(notify_delete())
    );
    NOTIFY_TIMER_ID.set(delete_timer_id);
}

#[ic_cdk::update]
async fn create_post(content: String, photo_url: Vec<String>) -> String {
    let caller = ic_cdk::caller();
    let canister_id = ic_cdk::api::id();
    let post_index = POST_INDEX.with(|index| index.borrow().get().clone());

    let post = Post {
        post_id: get_post_id(&canister_id, &caller, post_index),
        feed_canister: canister_id,
        index: post_index,
        user: caller,
        content: content,
        photo_url: photo_url,
        repost: Vec::new(),
        like: Vec::new(),
        comment: Vec::new(),
        created_at: ic_cdk::api::time()
    };

    let user_map = POST_MAP.with(|map| {
        map.borrow().get(&caller)
    });

    // 存储到 Post_Map 中
    match user_map {
        None => {
            let mut user_map = PostHashMap(HashMap::new());
            user_map.0.insert(post_index, post.clone());
            POST_MAP.with(|map| {
                map.borrow_mut().insert(caller, user_map)
            });
        },
        Some(user_map) => {
            let mut new_user_map = user_map;
            new_user_map.0.insert(post_index, post.clone());
            POST_MAP.with(|map| {
                map.borrow_mut().insert(caller, new_user_map)
            });
        }
    };

    // 公共区存 Post
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post.clone())
    });

    POST_INDEX.with(|index| {
        index.borrow_mut().set(post_index + 1).unwrap()
    });

    // 进行 Feed 推流
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        receive_notify(notify_users, post.post_id.clone());
    };

    post.post_id
}

#[ic_cdk::update]
async fn create_repost(post_id: String) -> bool {
    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let caller = ic_cdk::caller();

    // 判断是否已经转发过
    if is_already_repost(caller, post.clone()) {
        return false;
    };

    post.repost.push(Repost {
        user: caller,
        created_at: ic_cdk::api::time()
    });

    // 更改 Post_Map 中 Post 的数据
    let post_user = post.user.clone();
    let mut user_map = POST_MAP.with(|map| {
        map.borrow().get(&post_user)
    }).unwrap();
    user_map.0.insert(post.index.clone(), post.clone());
    POST_MAP.with(|map| {
        map.borrow_mut().insert(post_user, user_map)
    });

    // 更改 Archiev_Post_Map 中 Post 的数据
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post.clone())
    });

    // 推流 Feed 更新
    let notify_users = get_notify_users(post).await;

    if notify_users.len() > 0 {
        receive_notify(notify_users, post_id);
    };

    true
}

#[ic_cdk::update]
async fn create_comment(post_id: String, content: String) -> bool {
    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let caller = ic_cdk::caller();

    post.comment.push(Comment {
        user: caller,
        content: content,
        created_at: ic_cdk::api::time()
    });

    // 更改 Post_Map 中 Post 的数据
    let post_user = post.user.clone();
    let mut user_map = POST_MAP.with(|map| {
        map.borrow().get(&post_user)
    }).unwrap();
    user_map.0.insert(post.index.clone(), post.clone());
    POST_MAP.with(|map| {
        map.borrow_mut().insert(post_user, user_map)
    });

    // 更改 Archiev_Post_Map 中 Post 的数据
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post.clone())
    });

    // 推流 Feed 更新
    let notify_users = get_notify_users(post).await;

    if notify_users.len() > 0 {
        receive_notify(notify_users, post_id);
    };

    true
}

#[ic_cdk::update]
async fn create_like(post_id: String) -> bool {
    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let caller = ic_cdk::caller();

    // 判断是否已经点赞过
    if is_already_like(caller, post.clone()) {
        return false;
    };

    post.like.push(Like {
        user: caller,
        created_at: ic_cdk::api::time()
    });

    // 更改 Post_Map 中 Post 的数据
    let post_user = post.user.clone();
    let mut user_map = POST_MAP.with(|map| {
        map.borrow().get(&post_user)
    }).unwrap();
    user_map.0.insert(post.index.clone(), post.clone());
    POST_MAP.with(|map| {
        map.borrow_mut().insert(post_user, user_map)
    });

    // 更改 Archiev_Post_Map 中 Post 的数据
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post.clone())
    });

    // 推流 Feed 更新
    let notify_users = get_notify_users(post).await;

    if notify_users.len() > 0 {
        receive_notify(notify_users, post_id);
    };

    true
}

#[ic_cdk::update]
async fn delete_post(post_id: String) -> bool {
    let post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    });

    match post {
        None => {
            // 帖子不存在
            false
        },
        Some(post) => {
            // 只有发帖者能删除
            if post.user != ic_cdk::caller() {
                return false;
            };

            // 删除 Post_Map 中 Post 的数据
            let post_user = post.user.clone();
            let mut user_map = POST_MAP.with(|map| {
                map.borrow().get(&post_user)
            }).unwrap();
            user_map.0.remove(&post.index);
            POST_MAP.with(|map| {
                map.borrow_mut().insert(post_user, user_map)
            });
            
            // 删除 Archiev_Post_Map 中 Post 的数据
            ARCHIEVE_POST_MAP.with(|map| {
                map.borrow_mut().remove(&post_id)
            });

            // 删除 Feed 中的 Post
            let notify_users = get_notify_users(post.clone()).await;

            if notify_users.len() > 0 {
                receive_delete_notify(notify_users, post_id);
            };

            true
        }
    }
}

#[ic_cdk::update]
async fn batch_receive_feed(
    user: Principal,
    post_id_array: Vec<String>
) {
    for post_id in post_id_array {
        let (canister, post_creator, _) = check_post_id(&post_id);

        if post_creator == user {
            continue;
        };

        let post = if canister == ic_cdk::api::id() {
            // 被通知者和发帖者处在同一 Feed Canister 中
            // 可以直接从 Archieve_Map 中拿到最新的 Post
            ARCHIEVE_POST_MAP.with(|map| {
                map.borrow().get(&post_id)
            }).unwrap()
        } else {
            // 被通知者和发帖者不在同一 Feed Canister 中
            // 需要从其他canister中拿到最新的 Post
            let get_post_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
                canister, 
                "get_post", 
                (post_id.clone(), )
            ).await.unwrap().0;
            match get_post_result {
                None => {
                    continue;
                },
                Some(post) => {
                    post
                }
            }
        };

        let user_map = FEED_MAP.with(|map| {
            map.borrow().get(&user)
        });

        match user_map {
            None => {
                // 被通知者第一次收到 feed 推流
                let mut user_map = FeedHashMap(HashMap::new());
                user_map.0.insert(post_id, post);
                FEED_MAP.with(|map| {
                    map.borrow_mut().insert(user, user_map);
                })
            },
            Some(mut user_map) => {
                user_map.0.insert(post_id, post);
                FEED_MAP.with(|map| {
                    map.borrow_mut().insert(user, user_map);
                });
            }
        }
    }
}

#[ic_cdk::update]
fn batch_delete_feed(
    user: Principal, 
    post_id_array: Vec<String>
) {
    let mut user_map = FEED_MAP.with(|map| {
        map.borrow().get(&user)
    }).unwrap();

    for post_id in post_id_array {
        user_map.0.remove(&post_id);
    }

    FEED_MAP.with(|map| {
        map.borrow_mut().insert(user, user_map)
    });
}

fn receive_notify(to: Vec<Principal>, post_id: String) {
    for user in to.iter() {
        let is_user_have_post_id_array = 
            NOTIFY_MAP.with(|map| {
                map.borrow().get(user).cloned()
            });
        
        match is_user_have_post_id_array {
            None => {
                NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(*user, vec![post_id.clone()]);
                })
            },
            Some(post_id_array) => {
                let mut new_post_id_array = post_id_array.clone();
                new_post_id_array.push(post_id.clone());
                NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(*user, new_post_id_array);
                })
            }
        }
    }
}

fn receive_delete_notify(to: Vec<Principal>, post_id: String) {
    for user in to.iter() {
        let is_user_have_post_id_array = 
            DELEYE_NOTIFY_MAP.with(|map| {
                map.borrow().get(user).cloned()
            });
        
        match is_user_have_post_id_array {
            None => {
                DELEYE_NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(*user, vec![post_id.clone()]);
                })
            },
            Some(post_id_array) => {
                let mut new_post_id_array = post_id_array.clone();
                new_post_id_array.push(post_id.clone());
                DELEYE_NOTIFY_MAP.with(|map| {
                    map.borrow_mut().insert(*user, new_post_id_array);
                })
            }
        }
    }
}

async fn notify() {
    let entries: Vec<(Principal, Vec<String>)> = NOTIFY_MAP.with(|map| {
        let mut entries: Vec<(Principal, Vec<String>)> = Vec::new();
        for (user, post_id_array) in map.borrow().iter() {
            entries.push((user.clone(), post_id_array.clone()));
        };
        entries
    });

    for (user, post_id_array) in entries {
        // 查询 user -> feed_canister
        let user_feed_canister = ic_cdk::call::<(Principal, ), (Option<Principal>, )>(
            ROOT_FEED_ACTOR.with(|actor| actor.borrow().get().clone()), 
            "get_user_feed_canister", 
            (user.clone(), )
        ).await.unwrap().0;
        if user_feed_canister.is_none() {
            // 用户还未注册 feed_canister
            NOTIFY_MAP.with(|map| {
                map.borrow_mut().remove(&user)
            });
            continue;
        }
        
        // notify
        let _notify_result = ic_cdk::call::<(Principal, Vec<String>, ), ()>(
            user_feed_canister.unwrap(), 
            "batch_receive_feed", 
            (user, post_id_array.clone(), )
        ).await.unwrap();
        
        // delete
        let mut map_post_id_vec = NOTIFY_MAP.with(|map| {
            map.borrow().get(&user).unwrap().clone()
        });

        map_post_id_vec.retain(|x| !post_id_array.contains(x));

        if map_post_id_vec.len() == 0 {
            NOTIFY_MAP.with(|map| {
                map.borrow_mut().remove(&user)
            });
        } else {
            NOTIFY_MAP.with(|map| {
                map.borrow_mut().insert(user, map_post_id_vec)
            });
        }

    }
}

async fn notify_delete() {
    let entries: Vec<(Principal, Vec<String>)> = DELEYE_NOTIFY_MAP.with(|map| {
        let mut entries: Vec<(Principal, Vec<String>)> = Vec::new();
        for (user, post_id_array) in map.borrow().iter() {
            entries.push((user.clone(), post_id_array.clone()));
        };
        entries
    });

    for (user, post_id_array) in entries {
        // 查询 user -> feed_canister
        let user_feed_canister = ic_cdk::call::<(Principal, ), (Option<Principal>, )>(
            ROOT_FEED_ACTOR.with(|actor| actor.borrow().get().clone()), 
            "get_user_feed_canister", 
            (user.clone(), )
        ).await.unwrap().0;
        if user_feed_canister.is_none() {
            // 用户还未注册 feed_canister
            DELEYE_NOTIFY_MAP.with(|map| {
                map.borrow_mut().remove(&user)
            });
            continue;
        }
        
        // notify
        let _notify_delete_result = ic_cdk::call::<(Principal, Vec<String>, ), ()>(
            user_feed_canister.unwrap(), 
            "batch_delete_feed", 
            (user, post_id_array.clone(), )
        ).await.unwrap();
        
        // delete
        let mut map_post_id_vec = DELEYE_NOTIFY_MAP.with(|map| {
            map.borrow().get(&user).unwrap().clone()
        });

        map_post_id_vec.retain(|x| !post_id_array.contains(x));

        if map_post_id_vec.len() == 0 {
            DELEYE_NOTIFY_MAP.with(|map| {
                map.borrow_mut().remove(&user)
            });
        } else {
            DELEYE_NOTIFY_MAP.with(|map| {
                map.borrow_mut().insert(user, map_post_id_vec)
            });
        }

    }
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    })
}

#[ic_cdk::query]
fn get_post_number(user: Principal) -> u64 {
    let user_map = POST_MAP.with(|map| {
        map.borrow().get(&user)
    });

    match user_map {
        None => {
            0
        },
        Some(user_map) => {
            user_map.0.values().len() as u64
        }
    }
}

#[ic_cdk::query] 
fn get_all_post(user: Principal) -> Vec<Post> {
    let user_map = POST_MAP.with(|map| {
        map.borrow().get(&user)
    });
    
    match user_map {
        None => {
            Vec::new()
        },
        Some(user_map) => {
            let mut post_vec: Vec<Post> = user_map.0.values().cloned().collect();

            post_vec.sort_by(|a, b| {
                a.created_at.partial_cmp(&b.created_at).unwrap()
            });
        
            let mut sorted_post_vec = Vec::new();
        
            for post in post_vec.iter().rev() {
                sorted_post_vec.push(post.clone())
            }
        
            sorted_post_vec
        }
    }
}

#[ic_cdk::query]
fn get_feed_number(user: Principal) -> u64 {
    let user_map = FEED_MAP.with(|map| {
        map.borrow().get(&user)
    });

    match user_map {
        None => {
            0
        },
        Some(user_map) => {
            user_map.0.values().len() as u64
        }
    }
}

#[ic_cdk::query]
fn get_latest_feed(
    user: Principal,
    n: u64
) -> Vec<Post> {
    let user_map = FEED_MAP.with(|map| {
        map.borrow().get(&user)
    });

    match user_map {
        None => {
            Vec::new()
        },
        Some(user_map) => {
            let mut feed_vec: Vec<Post> = user_map.0.values().cloned().collect();

            feed_vec.sort_by(|a, b| {
                a.created_at.partial_cmp(&b.created_at).unwrap()
            });
        
            let mut result: Vec<Post> = Vec::new();
            let mut i = 0;
            for feed in feed_vec.iter().rev() {
                if i >= n {
                    break;
                }
                result.push(feed.clone());
                i += 1;
            }
        
            result
        }
    }
}

#[ic_cdk::query]
fn get_all_latest_feed(
    n: u64
) -> Vec<Post> {
    let mut feed_vec: Vec<Post> = ARCHIEVE_POST_MAP.with(|map| {
        let mut feed_vec: Vec<Post> = Vec::new();
        for (_, feed) in map.borrow().iter() {
            feed_vec.push(feed)
        };
        feed_vec
    });

    feed_vec.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut result: Vec<Post> = Vec::new();
    let mut i = 0;
    for feed in feed_vec.iter().rev() {
        if i >= n {
            break;
        }
        result.push(feed.clone());
        i += 1;
    }

    result
}

#[ic_cdk::query]
fn get_notify_map_entries() -> Vec<(Principal, Vec<String>)> {
    NOTIFY_MAP.with(|map| {
        let mut result: Vec<(Principal, Vec<String>)> = vec![];
        for (user, post_id_array) in map.borrow().iter() {
            result.push((*user, post_id_array.clone()));
        };
        result
    })
}

#[ic_cdk::query]
fn get_delete_notify_map_entries() -> Vec<(Principal, Vec<String>)> {
    DELEYE_NOTIFY_MAP.with(|map| {
        let mut result: Vec<(Principal, Vec<String>)> = vec![];
        for (user, post_id_array) in map.borrow().iter() {
            result.push((*user, post_id_array.clone()));
        };
        result
    })
}

fn get_post_id(canister: &Principal, user: &Principal, index: u64) -> String {
    canister.to_text() + "#" + &user.to_text() + "#" + &index.to_string()   
}

fn check_post_id(
    post_id: &String
) -> (Principal, Principal, u64) {
    let words: Vec<&str> = post_id.split("#").collect();
    let canister = Principal::from_text(words[0]).unwrap();
    let user = Principal::from_text(words[1]).unwrap();
    let post_index = u64::from_str_radix(words[2], 10).unwrap();
    (canister, user, post_index)
}

fn is_already_repost(user: Principal, post: Post) -> bool {
    for repost in post.repost {
        if user == repost.user {
            return true;
        }
    }
    false
}

fn is_already_like(user: Principal, post: Post) -> bool {
    for like in post.like {
        if user == like.user {
            return true;
        }
    }
    false
}

async fn get_notify_users(post: Post) -> Vec<Principal> {
    let mut notify_user_set: HashSet<Principal> = HashSet::new();
    
    let canister = ROOT_FEED_ACTOR.with(|actor| actor.borrow().get().clone());

    // 1. 发帖者的粉丝
    let user_fans = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
        canister.clone(), 
        "get_followers_list", 
        (post.user,)
    ).await.unwrap().0;
    notify_user_set.extend(user_fans);

    // 2. 转发者
    let repost_users: Vec<Principal> = post.repost.iter().map(|repost| repost.user).collect();
    notify_user_set.extend(repost_users.clone());

    // 3. 转发者的粉丝
    for repost_user in repost_users {
        let fans = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
            canister.clone(), 
            "get_followers_list", 
            (repost_user,)
        ).await.unwrap().0;
        notify_user_set.extend(fans);
    }

    // 4. 需要剔除发帖者本身
    notify_user_set.remove(&post.user);

    notify_user_set.into_iter().collect()
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

ic_cdk::export_candid!();