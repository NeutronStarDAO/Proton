use std::cell::RefCell;
use std::borrow::{Borrow, Cow};
use candid::{CandidType, Decode, Encode, Nat, Principal};
use serde::Deserialize;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, StableLog};
use ic_stable_structures::storable::{Bound, Storable};
use types::{Post, TokenInitArgs, TokenError};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Debug, Clone)]
struct Asset {
    id: u64,
    post_id: String,
    creator: Principal,
    token_id: u64,
    time: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct UserAssetIds(Vec<u64>);

#[derive(CandidType, Deserialize, Debug, Clone)]
struct UserBuyedAssetVec(Vec<(u64, u64)>); // (asset_id, amount)

#[derive(CandidType, Deserialize, Debug, Clone)]
struct CreateEvent {
    asset_id: u64,
    creator: Principal,
    post_id: String
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct RemoveEvent {
    asset_id: u64,
    sender: Principal
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct TradeEvent {
    asset_id: u64,
    trade_type: TradeType,
    sender: Principal,
    token_amount: u64,
    icp_amount: u64,
    creator_fee: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
enum  TradeType {
    Mint,
    Buy,
    Sell
}

#[derive(CandidType, Deserialize, Debug, Clone)]
enum Error {
    AssetAlreadyCreated,
    AssetNotExist,
    Unauthorized,
    CreateTokenError,
    InsufficientPayment,
    InsufficientBalance,
    PostNotExistInBucket,
    TransferToMainAccountError,
    TransferCreatorFeeError,
    TransferToSellAccountError,
    TokenOfAssetNotExist,
    UnknowError,
    SupplyNotAllowedBelowPremintAmount,
    MintError,
    BurnError
}

impl Storable for Asset {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for UserAssetIds {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for CreateEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for RemoveEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for TradeEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for UserBuyedAssetVec {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

const CREATOR_PREMINT: u64 = 100_000_000; // 1e8
const CREATOR_FEE_PERCENT: u64 = 5_000_000; // 5_000_000 / 1e8 = 5%
const TOKEN_FEE: u64 = 0; 

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // asset_id-> Asset
    static ASSET_MAP: RefCell<StableBTreeMap<u64, Asset, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    static ASSET_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 
            0
        ).unwrap()
    );

    // post_id -> asset_id
    static POST_TO_ASSET: RefCell<StableBTreeMap<String, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    // asset_id -> token_id
    static ASSET_TO_TOKEN: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))   
        )
    );

    // user -> Vec<asset_id>
    static USER_ASSET_MAP: RefCell<StableBTreeMap<Principal, UserAssetIds, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    // asset_id -> pool_value
    static POOL_VALUE: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    // asset_id -> asset_token_supply
    static SUPPLY_MAP: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );

    static CREATE_EVENT: RefCell<StableLog<CreateEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        ).unwrap()
    );

    static REMOVE_EVENT: RefCell<StableLog<RemoveEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7)))
        ).unwrap()
    );

    static TRADE_EVENT: RefCell<StableLog<TradeEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(9)))
        ).unwrap()
    );

    static TOKEN_CA: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8))), 
            Principal::from_text("rvcxx-xiaaa-aaaan-qznha-cai").unwrap()
        ).unwrap()
    );
}

#[ic_cdk::query]
fn get_asset_index() -> u64 {
    ASSET_INDEX.with(|asset_index| {
        asset_index.borrow().get().clone()
    })
}

#[ic_cdk::query]
fn get_create_events() -> Vec<CreateEvent> {
    CREATE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_remove_events() -> Vec<RemoveEvent> {
    REMOVE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_trade_events() -> Vec<TradeEvent> {
    TRADE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_asset_to_token(asset_id: u64) -> Option<u64> {
    ASSET_TO_TOKEN.with(|map| {
        match map.borrow().get(&asset_id) {
            None => None,
            Some(token_id) => Some(token_id)
        }
    })
}

#[ic_cdk::query]
fn get_pool_value(asset_id: u64) -> Option<u64> {
    POOL_VALUE.with(|map| {
        match map.borrow().get(&asset_id) {
            None => None,
            Some(pool_value) => Some(pool_value)
        }
    })
}

#[ic_cdk::query]
fn get_recent_trade(asset_id: u64) -> Vec<TradeEvent> {
    let mut events = Vec::new();

    TRADE_EVENT.with(|logs| {
        for event in logs.borrow().iter() {
            if event.asset_id == asset_id {
                events.push(event);
            }
        }

        events
    })   
}

#[ic_cdk::query]
fn get_holders(asset_id: u64) -> Vec<(Principal, u64)> {
    // 调 token 

    vec![]
}

#[ic_cdk::query]
fn get_share_supply(asset_id: u64) -> Option<u64> {
    // 调 token

    None
}

#[ic_cdk::query]
fn get_creator_premint() -> u64 { CREATOR_PREMINT }

#[ic_cdk::query]
fn get_creator_fee_precent() -> u64 { CREATOR_FEE_PERCENT }


// return (asset_id, token_id)
#[ic_cdk::update]
async fn create(post_id: String) -> Result<(u64, u64), Error> {
    // 去 Bucket 检查 
    let (bucket, post_creator, post_index) = check_post_id(&post_id);
    let get_post_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
        bucket, 
        "get_post", 
        (post_id.clone(), )
    ).await.unwrap().0;

    match get_post_result {
        None =>  Err(Error::PostNotExistInBucket),
        Some(post) => {
            let caller = ic_cdk::caller();
            if post.user != caller {
                return Err(Error::Unauthorized);
            }

            if POST_TO_ASSET.with(|map| {
                map.borrow().contains_key(&post_id)
            }) {
                return Err(Error::AssetAlreadyCreated);
            }

            let asset_id = ASSET_INDEX.with(|asset_index| asset_index.borrow().get().clone());
            ASSET_INDEX.with(|asset_index| asset_index.borrow_mut().set(asset_id + 1).unwrap());

            let create_token_result = ic_cdk::call::<(TokenInitArgs, ), (Result<u64, TokenError>, )>(
                TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
                "create", 
                (TokenInitArgs {
                    decimals: 8u8,
                    fee: Nat::from(TOKEN_FEE),
                    mintint_account: None,
                    name: {
                        let mut s = "Dawnlight#".to_string();
                        s.push_str(asset_id.to_string().as_str());
                        s
                    },
                    symbol: {
                        let mut s = "Dawnlight#".to_string();
                        s.push_str(asset_id.to_string().as_str());
                        s
                    },
                    init_balances: vec![(caller, Nat::from(CREATOR_PREMINT))]
                }, )
            ).await.unwrap().0;

            match create_token_result {
                Err(token_err) => Err(Error::CreateTokenError),
                Ok(token_id) => {

                    let asset = Asset {
                        id: asset_id,
                        post_id: post_id.clone(),
                        creator: caller,
                        token_id: token_id,
                        time: ic_cdk::api::time()
                    };
                    ASSET_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, asset)
                    });

                    POST_TO_ASSET.with(|map| {
                        map.borrow_mut().insert(post_id.clone(), asset_id)
                    });

                    ASSET_TO_TOKEN.with(|map| {
                        map.borrow_mut().insert(asset_id, token_id)
                    });

                    match USER_ASSET_MAP.with(|map| {
                        map.borrow().get(&caller) 
                    }) {
                        None => {
                            USER_ASSET_MAP.with(|map| {
                                map.borrow_mut().insert(caller, UserAssetIds(vec![asset_id]))
                            });
                        },
                        Some(mut user_asset_ids) => {
                            user_asset_ids.0.push(asset_id);
                            USER_ASSET_MAP.with(|map| {
                                map.borrow_mut().insert(caller, user_asset_ids)
                            });
                        }
                    };

                    SUPPLY_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, CREATOR_PREMINT)
                    });

                    CREATE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&CreateEvent {
                            asset_id: asset_id,
                            creator: caller,
                            post_id: post_id
                        }).unwrap()
                    });

                    TRADE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&TradeEvent {
                            asset_id: asset_id,
                            trade_type: TradeType::Mint,
                            sender: caller,
                            token_amount: CREATOR_PREMINT,
                            icp_amount: 0,
                            creator_fee: 0
                        }).unwrap()
                    });

                    Ok((asset_id, token_id))
                }
            }
        }
    }
}

#[ic_cdk::update]
fn remove(asset_id: u64) -> Result<(), Error> {
    let caller = ic_cdk::caller();
    match ASSET_MAP.with(|map| {
        map.borrow().get(&asset_id)
    }) {
        None => Err(Error::AssetNotExist),
        Some(asset) => {
            if asset.creator != caller {
                return Err(Error::Unauthorized);
            }

            ASSET_MAP.with(|map| {
                map.borrow_mut().remove(&asset_id)
            });

            POST_TO_ASSET.with(|map| {
                map.borrow_mut().remove(&asset.post_id)
            });

            REMOVE_EVENT.with(|logs| {
                logs.borrow_mut().append(&RemoveEvent {
                    asset_id: asset_id,
                    sender: caller
                }).unwrap()
            });

            Ok(())
        }
    }
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