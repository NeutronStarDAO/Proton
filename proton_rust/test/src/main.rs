mod utils;
mod root_bucket;
mod root_feed;
mod deploy;
mod feed;
mod photo_storage;
mod test;
use candid::{Principal, Encode, Decode};
use lazy_static::lazy_static;
use dotenv::dotenv;
use std::env;

// use crate::did::{};

pub const USERA_PEM: &str = "test/identity/1.pem";
pub const USERB_PEM: &str = "test/identity/2.pem";
pub const USERC_PEM: &str = "test/identity/3.pem";
pub const USERD_PEM: &str = "test/identity/4.pem";
pub const USERE_PEM: &str = "test/identity/5.pem";

lazy_static! {
    pub static ref ROOT_BUCKET_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_BUCKET").unwrap()).unwrap();
    pub static ref ROOT_FEED_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_FEED").unwrap()).unwrap();
    pub static ref ROOT_FETCH_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_FETCH").unwrap()).unwrap();
    pub static ref USER_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_USER").unwrap()).unwrap(); 
    pub static ref PHOTO_STORAGE_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_PHOTO_STORAGE").unwrap()).unwrap();
}

// pub async fn call_canister() {
//     let canister = Principal::from_text("").unwrap();
    
//     let response_blob = build_agent("./identity.pem")
//         .update(
//             &canister,
//             "method_name"
//         )
//         .with_arg(Encode!().unwrap())
//         .call_and_wait()
//         .await
//         .expect("Call Response Error !");
//     let result = Decode!(&response_blob, CallResultType).unwrap();

//     println!("result : {:?}", result);
// }


#[tokio::main]
async fn main() {
    dotenv().ok();

    // deploy and init
    // deploy::deploy().await;

    // test 
    test::test().await;
}
