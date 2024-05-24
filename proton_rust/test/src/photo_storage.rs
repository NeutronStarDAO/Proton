use ic_agent::Agent;
use crate::PHOTO_STORAGE_CANISTER;
use candid::{Encode, Decode};

pub async fn upload_photo(
    agent: Agent,
    photo: Vec<u8>
) -> u64 {
    let response_blob = agent
        .update(
            &PHOTO_STORAGE_CANISTER, 
            "upload_photo"
        )
        .with_arg(Encode!(&photo).unwrap())
        .call_and_wait()
        .await.unwrap();

    Decode!(&response_blob, u64).unwrap()
}