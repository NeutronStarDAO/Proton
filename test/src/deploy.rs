use candid::{Decode, Encode, Principal};
use ic_agent::Agent;

use crate::{root_bucket, root_feed, root_fetch, ROOT_FETCH_CANISTER};
use crate::utils::{build_local_agent};
use crate::USERA_PEM;
use crate::POST_FETCH_CANISTER;

async fn init_root_bucket() {
    let agent = build_local_agent(USERA_PEM).await;

    // upload bucket wasm
    let bucket_wasm: Vec<u8> =
    include_bytes!("../../target/wasm32-unknown-unknown/release/bucket.wasm").to_vec();
    let len = bucket_wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = bucket_wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = bucket_wasm[middle_len..len].to_vec();

    // upload first_chunk
    assert!(root_bucket::update_bucket_wasm(
        agent.clone(), 
        first_wasm_chunk,
        0u64
    ).await);

    // upload seconde_chunk
    assert!(root_bucket::update_bucket_wasm(
        agent.clone(), 
        seconde_wasm_chunk,
        1u64
    ).await);

    // call init func
    root_bucket::init(agent.clone()).await;
}

pub async fn init_root_feed() {
    // upload feed wasm
    let bucket_wasm: Vec<u8> =
    include_bytes!("../../target/wasm32-unknown-unknown/release/feed.wasm").to_vec();
    let len = bucket_wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = bucket_wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = bucket_wasm[middle_len..len].to_vec();

    let agent = build_local_agent(USERA_PEM).await;
    // upload first_chunk
    assert!(root_feed::update_feed_wasm(
        agent.clone(), 
        first_wasm_chunk,
        0
    ).await);

    // upload seconde_chunk
    assert!(root_feed::update_feed_wasm(
        agent.clone(), 
        seconde_wasm_chunk,
        1
    ).await);

    // init fetch actor
    root_feed::init_fetch_actor(
        agent.clone(), 
        &POST_FETCH_CANISTER, 
    ).await;


    let feed_canister = root_feed::create_feed_canister(agent).await;
    println!("Create the first feed_canister : {:?}\n", feed_canister.to_text());
}

async fn upload_wasm(
    agent: Agent,
    canister: &Principal,
    wasm: Vec<u8>,
    func_name: &str
) {
    let len = wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = wasm[middle_len..len].to_vec();

    // upload first_chunk
    let upload_first_chunk_result = agent.
        update(
            canister, 
            func_name
        )
        .with_arg(Encode!(&first_wasm_chunk, &0u64).unwrap())
        .call_and_wait()
        .await.unwrap();
    assert!(Decode!(&upload_first_chunk_result, bool).unwrap());

    // upload seconde_chunk
    let upload_second_chunk_result = agent
        .update(
            canister, 
            func_name
        )
        .with_arg(Encode!(&seconde_wasm_chunk, &1u64).unwrap())
        .call_and_wait()
        .await.unwrap();
    assert!(Decode!(&upload_second_chunk_result, bool).unwrap());
}

pub async fn init_root_fetch() {
    let agent = build_local_agent(USERA_PEM).await;

    // init root_fetch fetch_actor
    root_fetch::init_fetch_actor(
        agent.clone(), 
        &POST_FETCH_CANISTER
    ).await;

    // upload post_fetch wasm
    let post_fetch_wasm: Vec<u8> =
    include_bytes!("../../target/wasm32-unknown-unknown/release/post_fetch.wasm").to_vec();
    upload_wasm(
        agent.clone(), 
        &ROOT_FETCH_CANISTER, 
        post_fetch_wasm, 
        "update_post_fetch_wasm"
    ).await;
}

pub async fn deploy() {
    println!("Deploy and Init canisters : \n");

    println!("Init root_bucket: \n");
    init_root_bucket().await;

    println!("Init root_feed: \n");
    init_root_feed().await;

    println!("Init_root_fetch: \n");
    init_root_fetch().await;
}

