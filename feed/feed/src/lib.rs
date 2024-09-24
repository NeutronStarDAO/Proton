use types::{Comment, CommentToComment, Like, Post, Repost, CommentTreeNode};

use candid::{CandidType, Decode, Encode, Principal};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};
use ic_stable_structures::storable::{Bound, Storable};
use serde::Deserialize;

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::borrow::{Borrow, Cow};

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

    static BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))), 
            Principal::anonymous()
        ).unwrap()
    );

    static ROOT_BUCKET: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 
            Principal::anonymous()
        ).unwrap()  
    );

    static POST_FETCH_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 
            Principal::anonymous()
        ).unwrap()   
    );

    static USER_ACTOR: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))), 
            Principal::anonymous()
        ).unwrap()   
    );

}

#[ic_cdk::init]
fn init(
    root_bucket: Principal,
    user_actor: Principal,
    post_fetch: Principal
) {
    ROOT_BUCKET.with(|actor| actor.borrow_mut().set(root_bucket).unwrap());

    USER_ACTOR.with(|actor| actor.borrow_mut().set(user_actor).unwrap());
    
    POST_FETCH_ACTOR.with(|actor| actor.borrow_mut().set(post_fetch).unwrap());
}

#[ic_cdk::update]
async fn complete_upgrade() -> bool {
    if !is_controller(&ic_cdk::caller()).await {
        return false;
    }

// POST_MAP
    let post_map_entries: Vec<(Principal, PostHashMap)> = POST_MAP.with(|map| {
        map.borrow().iter().collect()
    });

    for (user, map_struct) in post_map_entries {
        let mut map = map_struct.0;

        for (k, v) in map.clone() {
            let mut i = 0;
            let mut new_comment: Vec<Comment> = Vec::new();
            for comment in v.comment {
                new_comment.push(Comment {
                    index: Some(i),
                    user: comment.user,
                    content: comment.content,
                    created_at: comment.created_at,
                    like: Some(Vec::new())
                });
                i += 1;
            }

            map.insert(k, Post {
                post_id: v.post_id,
                feed_canister: v.feed_canister,
                index: v.index,
                user: v.user,
                content: v.content,
                photo_url: v.photo_url,
                repost: v.repost,
                like: v.like,
                comment_index: Some(i),
                comment: new_comment,
                comment_to_comment: Some(Vec::new()),
                created_at: v.created_at
            });
        }

        POST_MAP.with(|post_map| {
            post_map.borrow_mut().insert(user, PostHashMap(map))
        });
    }

// FEED_MAP 
    let feed_map_entries: Vec<(Principal, FeedHashMap)> = FEED_MAP.with(|map| {
        map.borrow().iter().collect()
    });

    for (user, map_struct) in feed_map_entries {
        let mut map = map_struct.0;

        for (k, v) in map.clone() {
            let mut i = 0;
            let mut new_comment: Vec<Comment> = Vec::new();
            for comment in v.comment {
                new_comment.push(Comment {
                    index: Some(i),
                    user: comment.user,
                    content: comment.content,
                    created_at: comment.created_at,
                    like: Some(Vec::new())
                });
                i += 1;
            }

            map.insert(k, Post {
                post_id: v.post_id,
                feed_canister: v.feed_canister,
                index: v.index,
                user: v.user,
                content: v.content,
                photo_url: v.photo_url,
                repost: v.repost,
                like: v.like,
                comment_index: Some(i),
                comment: new_comment,
                comment_to_comment: Some(Vec::new()),
                created_at: v.created_at
            });
        }

        FEED_MAP.with(|feed_map| {
            feed_map.borrow_mut().insert(user, FeedHashMap(map))
        });
    }

// ARCHIEVE_POST_MAP 
    let archieve_post_map_entries: Vec<(String, Post)> = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().iter().collect()
    });

    for (k, v) in archieve_post_map_entries {
        let mut i = 0;
        let mut new_comment: Vec<Comment> = Vec::new();
        for comment in v.comment {
            new_comment.push(Comment {
                index: Some(i),
                user: comment.user,
                content: comment.content,
                created_at: comment.created_at,
                like: Some(Vec::new())
            });
            i += 1;
        }
        
        ARCHIEVE_POST_MAP.with(|archieve_post_map| {
            archieve_post_map.borrow_mut().insert(k, Post {
                post_id: v.post_id,
                feed_canister: v.feed_canister,
                index: v.index,
                user: v.user,
                content: v.content,
                photo_url: v.photo_url,
                repost: v.repost,
                like: v.like,
                comment_index: Some(i),
                comment: new_comment,
                comment_to_comment: Some(Vec::new()),
                created_at: v.created_at
            })
        });
    }

    true
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
async fn create_post(content: String, photo_url: Vec<String>) -> String {
    assert!(ic_cdk::caller() != Principal::anonymous());

    // get available bucket
    let mut bucket_id = get_bucket();
    if let None = bucket_id {
        check_available_bucket().await;
        bucket_id = get_bucket();
        bucket_id.unwrap();
    };

    let caller = ic_cdk::caller();
    let canister_id = ic_cdk::api::id();
    let post_index = POST_INDEX.with(|index| index.borrow().get().clone());

    let post = Post {
        post_id: get_post_id(&bucket_id.unwrap(), &caller, post_index),
        feed_canister: canister_id,
        index: post_index,
        user: caller,
        content: content,
        photo_url: photo_url,
        repost: Vec::new(),
        like: Vec::new(),
        comment_index: Some(0),
        comment: Vec::new(),
        comment_to_comment: Some(Vec::new()),
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

    POST_INDEX.with(|index| {
        index.borrow_mut().set(post_index + 1).unwrap()
    });

    // 公共区存 Post
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow_mut().insert(post.post_id.clone(), post.clone())
    });

    let bucket_store_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket_id.unwrap().clone(),
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(bucket_store_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    post.post_id
}

#[ic_cdk::update]
async fn create_repost(post_id: String) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

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

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn create_comment(post_id: String, content: String) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    post.comment.push(Comment {
        index: Some(post.comment_index.unwrap()),
        user: caller,
        content: content,
        created_at: ic_cdk::api::time(),
        like: Some(Vec::new())
    });
    post.comment_index = Some(post.comment_index.unwrap() + 1);

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

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn like_comment(post_id: String, comment_index: u64) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let old_comment_vec = post.comment.clone();
    let mut i = 0;
    for comment in old_comment_vec {
        if comment.index.unwrap() == comment_index {
            let mut is_already_like_flag = false;
            for like in comment.like.clone().unwrap().clone() {
                if like.user == caller {
                    is_already_like_flag = true;
                    break;
                }
            }

            if !is_already_like_flag {
                let mut old_comment = comment.clone();
                let mut old_comment_like = old_comment.like.clone().unwrap();
                old_comment_like.push(Like {
                    user: caller,
                    created_at: ic_cdk::api::time()
                });
                old_comment.like = Some(old_comment_like);

                post.comment[i] = old_comment;

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

                // 推送最新的帖子到Bucket
                let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
                    bucket, 
                    "store_feed", 
                    (post.clone(), )
                ).await.unwrap().0;
                assert!(call_bucket_result);

                // 通知 PostFetch
                let notify_users = get_notify_users(post.clone()).await;

                if notify_users.len() > 0 {
                    let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
                        POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
                        "receive_notify", 
                        (notify_users, post.post_id.clone(), )
                    ).await.unwrap();
                };

                return true;
            }
        }

        i += 1;
    }

    false
}

#[ic_cdk::update]
async fn comment_comment(post_id: String, to: u64, content: String) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let mut old_comment_comment_vec = post.comment_to_comment.clone().unwrap();
    old_comment_comment_vec.push(CommentToComment {
        index: post.comment_index.unwrap(),
        from_user: caller,
        to_index: to,
        content: content,
        created_at: ic_cdk::api::time(),
        like: Vec::new()
    });
    post.comment_to_comment = Some(old_comment_comment_vec);
    ic_cdk::println!("comment_comment : {:?}", post);
    post.comment_index = Some(post.comment_index.unwrap() + 1);

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

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn like_comment_comment(post_id: String, comment_index: u64) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    let mut old_comment_to_comment_vec = post.comment_to_comment.clone().unwrap();
    let mut i = 0;
    for comment_to_comment in old_comment_to_comment_vec.clone() {
        if comment_to_comment.index == comment_index {
            let mut is_already_like_flag = false;
            for like in comment_to_comment.like.clone() {
                if like.user == caller {
                    is_already_like_flag = true;
                    break;
                }
            }

            if !is_already_like_flag {
                let mut old_comment_to_comment = comment_to_comment.clone();
                old_comment_to_comment.like.push(Like {
                    user: caller,
                    created_at: ic_cdk::api::time()
                });
                old_comment_to_comment_vec[i] = old_comment_to_comment;

                post.comment_to_comment = Some(old_comment_to_comment_vec);

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

                // 推送最新的帖子到Bucket
                let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
                    bucket, 
                    "store_feed", 
                    (post.clone(), )
                ).await.unwrap().0;
                assert!(call_bucket_result);

                // 通知 PostFetch
                let notify_users = get_notify_users(post.clone()).await;

                if notify_users.len() > 0 {
                    let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
                        POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
                        "receive_notify", 
                        (notify_users, post.post_id.clone(), )
                    ).await.unwrap();
                };

                return true;
            }
        }

        i += 1;
    }

    false
}

#[ic_cdk::update]
async fn create_like(post_id: String) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);
    let caller = ic_cdk::caller();

    let mut post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

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

    // 推送最新的帖子到Bucket
    let call_bucket_result = ic_cdk::call::<(Post, ), (bool, )>(
        bucket, 
        "store_feed", 
        (post.clone(), )
    ).await.unwrap().0;
    assert!(call_bucket_result);

    // 通知 PostFetch
    let notify_users = get_notify_users(post.clone()).await;

    if notify_users.len() > 0 {
        let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
            POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
            "receive_notify", 
            (notify_users, post.post_id.clone(), )
        ).await.unwrap();
    };

    true
}

#[ic_cdk::update]
async fn delete_post(post_id: String) -> bool {
    assert!(ic_cdk::caller() != Principal::anonymous());

    let (bucket, _, _) = check_post_id(&post_id);

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

            let delete_bucket_feed_result = 
                ic_cdk::call::<(String, ), (bool, )>(
                    bucket, 
                    "delete_feed", 
                    (post_id.clone(), )
                ).await.unwrap().0;
            assert!(delete_bucket_feed_result);
            
            // 通知 PostFetch
            let notify_users = get_notify_users(post.clone()).await;

            if notify_users.len() > 0 {
                let _post_fetch_store_result = ic_cdk::call::<(Vec<Principal>, String, ), ()>(
                    POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone()), 
                    "receive_delete_notify", 
                    (notify_users, post_id, )
                ).await.unwrap();
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
    assert!(ic_cdk::caller() != Principal::anonymous());

    for post_id in post_id_array {
        let (bucket, post_creator, _) = check_post_id(&post_id);

        if post_creator == user {
            continue;
        };

        let new_post = ic_cdk::call::<(String, ), (Option<Post>, )>(
            bucket, 
            "get_post", 
            (post_id.clone(), )
        ).await.unwrap().0;

        if let None = new_post {
            continue;
        }

        let user_map = FEED_MAP.with(|map| {
            map.borrow().get(&user)
        });

        match user_map {
            None => {
                // 被通知者第一次收到 feed 推流
                let mut user_map = FeedHashMap(HashMap::new());
                user_map.0.insert(post_id.clone(), new_post.unwrap());
                FEED_MAP.with(|map| {
                    map.borrow_mut().insert(user, user_map);
                })
            },
            Some(mut user_map) => {
                user_map.0.insert(post_id.clone(), new_post.unwrap());
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
    assert!(ic_cdk::caller() != Principal::anonymous());
    
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

#[ic_cdk::update]
async fn check_available_bucket() -> bool {
    let call_result = ic_cdk::call::<(), (Option<Principal>, )>(
        ROOT_BUCKET.with(|id| id.borrow().get().clone()), 
        "get_availeable_bucket", 
        ()
    ).await.unwrap().0;
    let availeable_bucket = call_result.unwrap();
    BUCKET.with(|bucket| bucket.borrow_mut().set(availeable_bucket).unwrap());
    true
}

#[ic_cdk::query]
fn get_post_comment_tree(post_id: String) -> Vec<CommentTreeNode>{
    let mut tree = Vec::new();

    let post = ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    }).unwrap();

    for comment in post.comment {
        ic_cdk::println!("comment : {:?}", comment.clone());

        tree.push(CommentTreeNode {
            dep: 0,
            father: comment.index.unwrap(),
            comment: Some(comment.clone()),
            comment_to_comment: None
        });
        let mut son_tree = get_one_comment_tree(comment.index.unwrap(), 0, post.comment_to_comment.clone().unwrap());

        if son_tree.len() > 0 {
            tree.append(&mut son_tree)
        }
    }

    tree
}

fn get_one_comment_tree(fa_index: u64, dep: u64, comment_vec: Vec<CommentToComment>) -> Vec<CommentTreeNode> {
    ic_cdk::println!("get_one_comment_tree : {} {} \n", fa_index, dep);

    let mut tree = vec![];
    let mut son_index_vec = Vec::new();

    for comment in comment_vec.clone() {
        if comment.to_index == fa_index {
            son_index_vec.push(comment.index);

            tree.push(CommentTreeNode {
                dep: dep + 1,
                father: fa_index,
                comment: None,
                comment_to_comment: Some(comment)
            });
        }
    }

    for son_index in son_index_vec {
        let mut son_tree = get_one_comment_tree(son_index, dep + 1, comment_vec.clone());

        if son_tree.len() > 0 {
            tree.append(&mut son_tree);
        }
    }

    tree
}

#[ic_cdk::query]
fn get_post_index() -> u64 {
    POST_INDEX.with(|post_index| post_index.borrow().get().clone())
}

#[ic_cdk::query]
fn get_bucket() -> Option<Principal> {
    BUCKET.with(|pr| {
        if pr.borrow().get().clone() == Principal::anonymous() {
            return None;
        }
        Some(pr.borrow().get().clone())
    })
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    ARCHIEVE_POST_MAP.with(|map| {
        map.borrow().get(&post_id)
    })
}

#[ic_cdk::query]
fn batch_get_post(post_id_vec: Vec<String>) -> Vec<Post> {
    let mut posts = Vec::new();

    ARCHIEVE_POST_MAP.with(|map| {
        for post_id in post_id_vec.iter() {
            match map.borrow().get(post_id) {
                None => {

                },
                Some(post) => {
                    posts.push(post.clone());
                }
            }
        }
    });
    
    posts
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
fn get_home_feed(
    user: Principal,
    n: u64
) -> Vec<Post> {
    let user_post = {
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
    };

    let mut user_feed = {
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
    };

    let mut home_feed = user_post;

    home_feed.append(&mut user_feed);

    home_feed.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut result = Vec::new();
    let mut i = 0;
    for feed in home_feed.iter().rev() {
        if i >= n {
            break;
        }
        result.push(feed.clone());
        i += 1;
    }

    result
}

#[ic_cdk::query]
fn get_home_feed_by_length(
    user: Principal,
    start: u64,
    length: u64
) -> Vec<Post> {
    let user_post = {
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
    };

    let mut user_feed = {
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

                let mut sorted_feed_vec = Vec::new();
            
                for feed in feed_vec.iter().rev() {
                    sorted_feed_vec.push(feed.clone())
                }
            
                sorted_feed_vec
            }
        }
    };

    let mut home_feed = user_post;

    home_feed.append(&mut user_feed);

    home_feed.sort_by(|a, b| {
        a.created_at.partial_cmp(&b.created_at).unwrap()
    });

    let mut result = Vec::new();
    let mut i = 0;
    let end = start + length - 1;
    for feed in home_feed.iter().rev() {
        if i > end {
            break;
        }
        if i >= start {
            result.push(feed.clone());
        }
        i += 1;
    }

    result
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
fn get_all_latest_feed_by_length(
    start: u64,
    length: u64
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
    let end = start + length - 1;
    for feed in feed_vec.iter().rev() {
        if i > end {
            break;
        }
        if i >= start {
            result.push(feed.clone());
        }
        i += 1;
    }

    result
}

#[ic_cdk::query]
fn get_root_bucket() -> Principal {
    ROOT_BUCKET.with(|root_bucket| root_bucket.borrow().get().clone())
}

#[ic_cdk::query]
fn get_post_fetch() -> Principal {
    POST_FETCH_ACTOR.with(|post_fetch| post_fetch.borrow().get().clone())
}

#[ic_cdk::query]
fn get_user_actor() -> Principal {
    USER_ACTOR.with(|user| user.borrow().get().clone())
}

fn get_post_id(canister: &Principal, user: &Principal, index: u64) -> String {
    canister.to_text() + "#" + &user.to_text() + "#" + &index.to_string()   
}

fn check_post_id(
    post_id: &String
) -> (Principal, Principal, u64) {
    let words: Vec<&str> = post_id.split("#").collect();
    let bucket = Principal::from_text(words[0]).unwrap();
    let user = Principal::from_text(words[1]).unwrap();
    let post_index = u64::from_str_radix(words[2], 10).unwrap();
    (bucket, user, post_index)
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
    
    let user_canister = USER_ACTOR.with(|actor| actor.borrow().get().clone());

    // 1. 发帖者的粉丝
    let user_fans = ic_cdk::call::<(Principal, ), (Vec<Principal>, )>(
        user_canister.clone(), 
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
            user_canister.clone(), 
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