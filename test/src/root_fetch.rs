use ic_agent::Agent;
use candid::{Principal, Encode, Decode};
// use crate::ROOT_FETCH_CANISTER;

// pub async fn init_fetch_actor(
//     agent: Agent,
//     post_fetch: &Principal,
// ) {
//     agent
//         .update(
//             &ROOT_FETCH_CANISTER, 
//             "init_fetch_actor"
//         )
//         .with_arg(Encode!(post_fetch).unwrap())
//         .call_and_wait()
//         .await.unwrap();
// }

