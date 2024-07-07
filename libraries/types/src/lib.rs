mod http;
use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use std::borrow::Cow;
use ic_stable_structures::storable::{Bound, Storable};
pub use http::*;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Repost {
    pub user: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Like {
    pub user: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Comment {
    pub user: Principal,
    pub content: String,
    pub created_at: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Post {
    pub post_id: String, // 帖子 ID 
    pub feed_canister: Principal,
    pub index: u64, // Post Index
    pub user: Principal, // 发布者
    pub content: String,
    pub photo_url: Vec<String>, // photo url array
    pub repost: Vec<Repost>, //转发者
    pub like: Vec<Like>,
    pub comment: Vec<Comment>,
    pub created_at: u64 // 发布时间
}

impl Storable for Post {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}