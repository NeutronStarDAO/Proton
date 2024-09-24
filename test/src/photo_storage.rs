use ic_agent::Agent;
use candid::{Encode, Decode,Principal, encode_one};
use pocket_ic::{PocketIc, PocketIcBuilder};

#[test]
fn test_upload_photo() {
    let pic = PocketIc::new();

    let storage_canister = pic.create_canister();
    pic.add_cycles(storage_canister, (4_u64 * 10_u64.pow(12)) as u128);
    
    let wasm_bytes = include_bytes!("../../target/wasm32-unknown-unknown/release/photo_storage.wasm").to_vec();
    pic.install_canister(storage_canister, wasm_bytes, vec![], None);

    let photo = 
        include_bytes!("../img/img_1.png").to_vec();

    let upload_index = pocket_ic::update_candid::<(Vec<u8>, ), (u64, )>(
        &pic,
        storage_canister, 
        "upload_photo", 
        (photo, )
    ).unwrap().0;

    assert!(upload_index == 0);
}