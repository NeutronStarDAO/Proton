mod utils;
mod root_bucket;
mod root_feed;
mod deploy;
mod feed;
mod photo_storage;
mod user;
mod test;
mod root_fetch;
mod bucket;
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
pub const USERF_PEM: &str = "test/identity/6.pem";
pub const USERG_PEM: &str = "test/identity/7.pem";

lazy_static! {
    // // local
    pub static ref ROOT_BUCKET_CANISTER: Principal = Principal::from_text("be2us-64aaa-aaaaa-qaabq-cai").unwrap();
    pub static ref ROOT_FEED_CANISTER: Principal = Principal::from_text("br5f7-7uaaa-aaaaa-qaaca-cai").unwrap();
    pub static ref ROOT_FETCH_CANISTER: Principal = Principal::from_text("bw4dl-smaaa-aaaaa-qaacq-cai").unwrap();
    pub static ref POST_FETCH_CANISTER: Principal = Principal::from_text("b77ix-eeaaa-aaaaa-qaada-cai").unwrap();
    pub static ref USER_CANISTER: Principal = Principal::from_text("bkyz2-fmaaa-aaaaa-qaaaq-cai").unwrap(); 
    pub static ref PHOTO_STORAGE_CANISTER: Principal = Principal::from_text("by6od-j4aaa-aaaaa-qaadq-cai").unwrap();

    // ic
    // pub static ref ROOT_BUCKET_CANISTER: Principal = Principal::from_text("pc5ag-oiaaa-aaaan-qmthq-cai").unwrap();
    // pub static ref ROOT_FEED_CANISTER: Principal = Principal::from_text("n7aoo-5aaaa-aaaan-qmtia-cai").unwrap();
    // pub static ref ROOT_FETCH_CANISTER: Principal = Principal::from_text("nybi2-qyaaa-aaaan-qmtiq-cai").unwrap();
    // pub static ref POST_FETCH_CANISTER: Principal = Principal::from_text("nrcdg-gqaaa-aaaan-qmtja-cai").unwrap();
    // pub static ref USER_CANISTER: Principal = Principal::from_text("pf4gs-dqaaa-aaaan-qmtha-cai").unwrap(); 
    // pub static ref PHOTO_STORAGE_CANISTER: Principal = Principal::from_text("nwdfs-liaaa-aaaan-qmtjq-cai").unwrap();
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    println!("Principal A : {:?}\n", utils::build_agent(USERA_PEM).get_principal().unwrap().to_text());
    println!("Principal B : {:?}\n", utils::build_agent(USERB_PEM).get_principal().unwrap().to_text());
    println!("Principal C : {:?}\n", utils::build_agent(USERC_PEM).get_principal().unwrap().to_text());
    println!("Principal D : {:?}\n", utils::build_agent(USERD_PEM).get_principal().unwrap().to_text());
    println!("Principal E : {:?}\n", utils::build_agent(USERE_PEM).get_principal().unwrap().to_text());
    println!("Principal F : {:?}\n", utils::build_agent(USERF_PEM).get_principal().unwrap().to_text());
    println!("Principal G : {:?}\n", utils::build_agent(USERG_PEM).get_principal().unwrap().to_text());

    // deploy and init
    deploy::deploy().await;
    // test 
    test::test().await;

    // // deploy and init On IC
    // deploy::deploy_on_ic().await;
    // // test 
    // test::test_on_ic().await;

    // http://127.0.0.1:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai&id=bw4dl-smaaa-aaaaa-qaacq-cai
}
