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

// async fn test_cancle_follow(
//     agent_e: Agent,
//     agent_f: Agent
// ) {
//     // F 取消关注 E
//     let pr_e = agent_e.get_principal().unwrap();
//     let pr_f = agent_f.get_principal().unwrap();

//     assert!(user::is_followed(agent_f.clone(), pr_f, pr_e).await == true);

//     user::cancle_follow(agent_f.clone(), pr_e).await;

//     assert!(user::is_followed(agent_f.clone(), pr_f, pr_e).await == false);
// }

// pub async fn cancle_follow(
//     agent: Agent,
//     user: Principal
// ) {
//     agent.update(
//         &USER_CANISTER, 
//         "cancle_follow"
//     )
//     .with_arg(Encode!(&user).unwrap())
//     .call_and_wait()
//     .await.unwrap();
// }