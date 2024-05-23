use crate::{root_bucket, root_feed};
use crate::utils::{build_local_agent};
use crate::USERA_PEM;

async fn init_root_bucket() {
    // upload bucket wasm
    let bucket_wasm: Vec<u8> =
    include_bytes!("../../target/wasm32-unknown-unknown/release/bucket.wasm").to_vec();
    let len = bucket_wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = bucket_wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = bucket_wasm[middle_len..len].to_vec();

    let agent = build_local_agent(USERA_PEM).await;
    // upload first_chunk
    assert!(root_bucket::update_bucket_wasm(
        agent.clone(), 
        first_wasm_chunk,
        0
    ).await);

    // upload seconde_chunk
    assert!(root_bucket::update_bucket_wasm(
        agent.clone(), 
        seconde_wasm_chunk,
        1
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
}

pub async fn deploy() {
    println!("Deploy and init canisters : \n");

    println!("init root_bucket: \n");
    init_root_bucket().await;

    println!("init root_feed: \n");
    init_root_feed().await;
}

