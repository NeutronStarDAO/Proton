use ic_agent::{identity, agent::http_transport};
use candid::Principal;
use ic_agent::Identity;
use std::fs::File;
use std::io::Read;
use candid::{Nat, Int};

const ICP_LEDGER_CANISTER_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";

const GHOST_LEDGER_CANISTER_TEXT: &str = "4c4fd-caaaa-aaaaq-aaa3a-cai";

const CKBTC_LEDGER_CANISTER_TEXT: &str = "mxzaz-hqaaa-aaaar-qaada-cai";

const CKETH_LEDGER_CANISTER_TEXT: &str = "ss2fx-dyaaa-aaaar-qacoq-cai";

const ANONYMOUS_PRINCIPAL_TEXT: &str = "2vxsx-fae";

pub fn build_agent(pem_identity_path: &str) -> ic_agent::Agent {
    let url = "https://ic0.app".to_string();
    let identity = identity::Secp256k1Identity::from_pem_file(String::from(pem_identity_path)).expect("not found identity pem");
    let transport = http_transport::ReqwestTransport::create(&url).expect("create transport error");
    let agent = ic_agent::Agent::builder()
        .with_url(url)
        .with_transport(transport)
        .with_identity(identity)
        .build()
        .expect("build agent error");
    agent
}

pub async fn build_local_agent(pem_identity_path: &str) -> ic_agent::Agent {
    let url = "http://127.0.0.1:4943".to_string();
    // let url = "http://43.128.242.149:4943".to_string();
    let identity = identity::Secp256k1Identity::from_pem_file(String::from(pem_identity_path)).expect("not found identity pem");
    let transport = http_transport::ReqwestTransport::create(&url).expect("create transport error");
    let agent = ic_agent::Agent::builder()
        .with_url(url)
        .with_transport(transport)
        .with_identity(identity)
        .build()
        .expect("build agent error");
    agent.fetch_root_key().await.unwrap();
    agent
}

pub fn get_principal(pem_identity_path: &str) -> Principal {
    let identity = identity::Secp256k1Identity::from_pem_file(String::from(pem_identity_path)).expect("not found identity pem");
    identity.sender().unwrap()
}

pub fn read_file_to_vec(file_path: &str) -> Vec<u8> {
    let mut file = File::open(file_path).unwrap();

    let mut buffer = Vec::new();

    file.read_to_end(&mut buffer).unwrap();

    buffer
}

// sub account = [sun_account_id_size, principal_blob, 0,0,···]
pub fn principal_to_subaccount(pr: Principal) -> Vec<u8> {
    let pr_slice = pr.as_slice();
    let mut buffer: Vec<u8>= Vec::new();
    buffer.push(pr_slice.len() as u8);
    for i in pr_slice.iter() {
        buffer.push(i.clone())
    }
    let mut index = buffer.len();
    while index < 32 {
        buffer.push(0);
        index += 1;
    }
    buffer
}


// pub fn principal_to_hex(pr: Principal) -> 

pub fn ext_get_token_identitier(
    canister_id: Principal,
    token_index: u32
) -> Principal {
    let mut result = [0u8; 18];
    result[0..4].copy_from_slice(b"\x0Atid");
    result[4..14].copy_from_slice(canister_id.as_slice());
    result[14..18].copy_from_slice(&(token_index.clone()).to_be_bytes());
    return Principal::try_from(&result.to_vec()).unwrap();
}


pub fn nat_to_i128(num: Nat) -> i128 {
    i128::from_str_radix(num.to_string().replace("_", "").as_str(), 10).unwrap()
} 

pub fn nat_to_u128(num: Nat) -> u128 {
    u128::from_str_radix(num.to_string().replace("_", "").as_str(), 10).unwrap()
} 

pub fn int_to_i128(num: Int) -> i128 {
    i128::from_str_radix(num.to_string().replace("_", "").as_str(), 10).unwrap()
}

pub fn int_to_u128(num: Int) -> u128 {
    u128::from_str_radix(num.to_string().replace("_", "").as_str(), 10).unwrap()
}

pub fn cketh_decode_principal_to_bytes32_string(
    pr: Principal
) -> String {
    let n = pr.as_slice().len();
    assert!(n <= 29);
    let mut fixed_bytes = [0u8; 32];
    fixed_bytes[0] = n as u8;
    fixed_bytes[1..=n].copy_from_slice(pr.as_slice());
    format!("0x{}", hex::encode(fixed_bytes).as_str())
}