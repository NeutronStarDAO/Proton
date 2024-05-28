use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use ic_agent::Agent;
use serde_bytes;
use crate::utils::build_local_agent;
use crate::USERA_PEM;
use types::Post;

pub async fn create_post(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    content: String,
    photo_url: Vec<String>
) -> String {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_post"
        )
        .with_arg(Encode!(&content, &photo_url).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, String).unwrap()
}

pub async fn create_comment(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    post_id: String,
    content: String
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_comment"
        )
        .with_arg(Encode!(&post_id, &content).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn create_like(
    agent: Agent,
    feed_canister: Principal,
    post_id: String
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_like"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn create_repost(
    agent: Agent,
    feed_canister: Principal,
    post_id: String
) -> bool {
    let reponse_blob = agent
        .update(
            &feed_canister, 
            "create_repost"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call_and_wait()
        .await.unwrap();

    Decode!(&reponse_blob, bool).unwrap()
}

pub async fn get_all_post(
    agent: ic_agent::Agent,
    feed_canister: Principal
) -> Vec<Post> {
    let response_blob = agent
        .query(
            &feed_canister, 
            "get_all_post"
        )
        .with_arg(Encode!().unwrap())
        .call()
        .await.unwrap();
    
    Decode!(&response_blob, Vec<Post>).unwrap()
}