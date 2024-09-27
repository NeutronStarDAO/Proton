use crate::{USERA, USERB};
use candid::{Principal, Encode, Decode};
use pocket_ic::PocketIc;

const T_CYCLES: u64 = 10_u64.pow(12);

#[test]
fn test_follow() {
    let pic = PocketIc::new();

    let user_canister = pic.create_canister();
    pic.add_cycles(user_canister, (4 * T_CYCLES) as u128);
    
    let wasm_bytes = include_bytes!("../../target/wasm32-unknown-unknown/release/user.wasm").to_vec();
    pic.install_canister(user_canister, wasm_bytes, vec![], None);

    let user_a = Principal::from_text(USERA).unwrap();
    let user_b = Principal::from_text(USERB).unwrap();
    let result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_a,
        "follow",
        (user_b, )
    ).unwrap();

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_a, user_b, )
    ).unwrap().0;
    assert!(is_followed);
}

#[test]
fn test_cancle_follow() {
    let pic = PocketIc::new();

    let user_canister = pic.create_canister();
    pic.add_cycles(user_canister, (4 * T_CYCLES) as u128);
    
    let wasm_bytes = include_bytes!("../../target/wasm32-unknown-unknown/release/user.wasm").to_vec();
    pic.install_canister(user_canister, wasm_bytes, vec![], None);

    let user_a = Principal::from_text(USERA).unwrap();
    let user_b = Principal::from_text(USERB).unwrap();
    let result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_a,
        "follow",
        (user_b, )
    ).unwrap();

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_a, user_b, )
    ).unwrap().0;
    assert!(is_followed);

    let cancle_follow_result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_a,
        "cancle_follow",
        (user_b, )
    ).unwrap().0;

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_a, user_b, )
    ).unwrap().0;
    assert!(is_followed == false);
}

#[test]
fn test_add_black_list() {
    let pic = PocketIc::new();

    let user_canister = pic.create_canister();
    pic.add_cycles(user_canister, (4 * T_CYCLES) as u128);
    
    let wasm_bytes = include_bytes!("../../target/wasm32-unknown-unknown/release/user.wasm").to_vec();
    pic.install_canister(user_canister, wasm_bytes, vec![], None);

    let user_a = Principal::from_text(USERA).unwrap();
    let user_b = Principal::from_text(USERB).unwrap();

    let follow_result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_a,
        "follow",
        (user_b, )
    ).unwrap();

    let follow_result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_b,
        "follow",
        (user_a, )
    ).unwrap();

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_a, user_b, )
    ).unwrap().0;
    assert!(is_followed);

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_b, user_a)
    ).unwrap().0;
    assert!(is_followed);

    let add_black_list_result = pocket_ic::update_candid_as::<(Principal, ), (bool, )>(
        &pic, 
        user_canister,
        user_a,
        "add_black_list",
        (user_b, )
    ).unwrap().0;
    assert!(add_black_list_result);

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_a, user_b, )
    ).unwrap().0;
    assert!(is_followed == false);

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_b, user_a)
    ).unwrap().0;
    assert!(is_followed == false);

    let is_black_list = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_black_follow_list", 
        (user_a, user_b)
    ).unwrap().0;
    assert!(is_black_list);

    let follow_result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        user_canister,
        user_b,
        "follow",
        (user_a, )
    ).unwrap();

    let is_followed = pocket_ic::query_candid::<(Principal, Principal, ), (bool, )>(
        &pic, 
        user_canister, 
        "is_followed", 
        (user_b, user_a)
    ).unwrap().0;
    assert!(is_followed == false);
}