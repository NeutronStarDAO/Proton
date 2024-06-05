use ic_agent::Agent;
use candid::{Principal, Encode, Decode};
use crate::USER_CANISTER;

pub async fn follow(
    agent: Agent,
    user: Principal
) {
    agent.update(
        &USER_CANISTER, 
        "follow"
    )
    .with_arg(Encode!(&user).unwrap())
    .call_and_wait()
    .await.unwrap();
}

pub async fn is_followed(
    agent: Agent,
    user_a: Principal,
    user_b: Principal
) -> bool {
    let response_blob = agent
        .query(
            &USER_CANISTER, 
            "is_followed"
        )
        .with_arg(Encode!(&user_a, &user_b).unwrap())
        .call()
        .await.unwrap();
        
    Decode!(&response_blob, bool).unwrap()
}