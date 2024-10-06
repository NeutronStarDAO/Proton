use crate::{feed::deploy_proton, USERA};
use candid::{Encode, Decode, Principal};
use pocket_ic::PocketIc;
use types::Post;

#[test]
fn test_search_post() {
    let pic = PocketIc::new();
    let proton_info = deploy_proton(&pic);

    let user_a = Principal::from_text(USERA).unwrap();
    let a_init_user_feed = pocket_ic::update_candid_as::<((), ), (Principal, )>(
        &pic,
        proton_info.root_feed_canister, 
        user_a, 
        "init_user_feed", 
        ((), )
    ).unwrap().0;
    assert!(a_init_user_feed == proton_info.feed_canister);

    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a create a post to test root_bucket search_post".to_string(), vec![], )
    ).unwrap().0;

    let search_post_result = pocket_ic::query_candid::<(String, ), (Vec<Post>, )>(
        &pic, 
        proton_info.root_bucket_canister, 
        "search_post", 
        ("bucket".to_string(), )
    ).unwrap().0;
    assert!(search_post_result.len() > 0);
    assert!(search_post_result[0].post_id == post_id);
}
