use candid::{Principal, Encode, Decode};
use ic_agent::Agent;
use types::Post;

pub async fn get_post(
    agent: Agent,
    bucket_canister: Principal,
    post_id: String
) -> Option<Post> {
    let response_blob = agent
        .query(
            &bucket_canister, 
            "get_post"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call().await.unwrap();
    
    Decode!(&response_blob, Option<Post>).unwrap()
}