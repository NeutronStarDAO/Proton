use ic_agent::Agent;
use crate::ROOT_BUCKET_CANISTER;
use candid::{Encode, Decode, Principal};

pub async fn init_fetch_actor(
    agent: Agent,
    comment_fetch: &Principal,
    like_fetch: &Principal
) {
    agent
        .update(
            &ROOT_BUCKET_CANISTER, 
            "init_fetch_actor"
        )
        .with_arg(Encode!(&comment_fetch, &like_fetch).unwrap())
        .call_and_wait()
        .await.unwrap();
}

pub async fn update_bucket_wasm(
    agent: Agent,
    wasm_chunk: Vec<u8>,
    index: u64
) -> bool {
    let response_blob = agent
        .update(
            &ROOT_BUCKET_CANISTER,
            "update_bucket_wasm"
        )
        .with_arg(Encode!(&wasm_chunk, &index).unwrap())
        .call_and_wait()
        .await.unwrap();
    Decode!(&response_blob, bool).unwrap()
}

pub async fn init(
    agent: Agent
) {
    agent.update(
        &ROOT_BUCKET_CANISTER, 
        "init"
    )
    .with_arg(Encode!().unwrap())
    .call_and_wait()
    .await.unwrap();
}