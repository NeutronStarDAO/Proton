use candid::{Principal, Encode, Decode};
use ic_agent::Agent;
use crate::ROOT_FEED_CANISTER;

pub async fn create_feed_canister(
    agent: Agent
) -> Principal {
    let response_blob = agent
        .update(
            &ROOT_FEED_CANISTER, 
            "create_feed_canister"
        )
        .with_arg(Encode!().unwrap())
        .call_and_wait()
        .await.unwrap();

    Decode!(&response_blob, Principal).unwrap()
}

pub async fn init_user_feed(
    agent: Agent
) -> Principal {
    let response_blob = agent
        .update(
            &ROOT_FEED_CANISTER, 
            "init_user_feed"
        )
        .with_arg(Encode!().unwrap())
        .call_and_wait()
        .await.unwrap();

    Decode!(&response_blob, Principal).unwrap()
}

pub async fn update_feed_wasm(
    agent: Agent,
    wasm_chunk: Vec<u8>,
    index: u64
) -> bool {
    let response_blob = agent
        .update(
            &ROOT_FEED_CANISTER,
            "update_feed_wasm"
        )
        .with_arg(Encode!(&wasm_chunk, &index).unwrap())
        .call_and_wait()
        .await.unwrap();
    Decode!(&response_blob, bool).unwrap()
}

pub async fn get_user_feed_canister(
    agent: Agent,
    user: Principal
) -> Option<Principal> {
    let response_blob = agent
        .query(
            &ROOT_FEED_CANISTER, 
            "get_user_feed_canister"
        )
        .with_arg(Encode!(&user).unwrap())
        .call()
        .await.unwrap();

    Decode!(&response_blob, Option<Principal>).unwrap()
}

pub async fn init_fetch_actor(
    agent: Agent,
    post_fetch: &Principal,
) {
    agent
        .update(
            &ROOT_FEED_CANISTER,
            "init_fetch_actor"
        )
        .with_arg(Encode!(post_fetch).unwrap())
        .call_and_wait()
        .await.unwrap();
}