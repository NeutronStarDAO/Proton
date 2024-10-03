use pocket_ic::PocketIc;
use candid::{Principal, encode_one};
use crate::feed::deploy_proton;

const T_CYCLES: u64 = 10_u64.pow(12);

fn create_data_analysis_canister(pic: &PocketIc, feed_canister: Principal) -> Principal {
    let data_analysis_canister = pic.create_canister();
    pic.add_cycles(data_analysis_canister, (4 * T_CYCLES) as u128);

    let data_analysis_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/data_analysis.wasm").to_vec();
    pic.install_canister(
        data_analysis_canister, 
        data_analysis_wasm, 
        encode_one(feed_canister).unwrap(), 
        None
    );

    data_analysis_canister
}

#[test]
fn test_receive_post() {
    let pic = PocketIc::new();

    let data_analysis_canister = create_data_analysis_canister(&pic, Principal::anonymous());

    let receive_post_result = pocket_ic::update_candid::<(Vec<String>, String, ), (bool, )>(
        &pic, 
        data_analysis_canister, 
        "receive_post", 
        (
            vec![
                "#ICP".to_string(), "#IceCube".to_string(), "#ckBTC".to_string()
            ],
            "TEST_POST_ID".to_string(),

        )
    ).unwrap().0;
    assert!(receive_post_result);

    let get_hot_topic_result = pocket_ic::query_candid::<(u64, ), (Vec<(String, u64)>, )>(
        &pic, 
        data_analysis_canister, 
        "get_hot_topic", 
        (10_u64, )
    ).unwrap().0;
    assert!(get_hot_topic_result.len() == 3);

    let get_hot_topic_in_week_result = pocket_ic::query_candid::<((), ), (Vec<(String, u64)>, )>(
        &pic, 
        data_analysis_canister, 
        "get_hot_topic_in_week", 
        ((), )
    ).unwrap().0;
    assert!(get_hot_topic_in_week_result.len() == 3);
}

