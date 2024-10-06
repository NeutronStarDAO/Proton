use candid::{Principal, Encode, Decode};
use ic_agent::Agent;
use pocket_ic::PocketIc;
use types::Post;

const T_CYCLES: u64 = 10_u64.pow(12);

#[test]
fn test_seatch_post() {
    let pic = PocketIc::new();

    let bucket_canister = pic.create_canister();
    pic.add_cycles(bucket_canister, (4 * T_CYCLES) as u128);

    let bucket_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/bucket.wasm").to_vec();
    pic.install_canister(
        bucket_canister, 
        bucket_wasm, 
        vec![], 
        None
    );

    let test_post = Post {
        post_id: "TEST_POST_ID".to_string(),
        feed_canister: Principal::anonymous(),
        index: 0,
        user: Principal::anonymous(),
        content: "Bucket_Test_Search_Post".to_string(),
        photo_url: vec![],
        repost: vec![],
        like: vec![],
        comment_index: None,
        comment: vec![],
        comment_to_comment: None,
        created_at: 0u64
    };
    let store_feed_result = pocket_ic::update_candid::<(Post, ), (bool, )>(
        &pic, 
        bucket_canister, 
        "store_feed", 
        (test_post, )
    ).unwrap().0;
    assert!(store_feed_result);

    let search_post_result = pocket_ic::query_candid::<(String, ), (Vec<Post>, )>(
        &pic, 
        bucket_canister, 
        "search_post", 
        ("Bucket".to_string(), )
    ).unwrap().0;
    assert!(search_post_result.len() > 0);
    assert!(search_post_result[0].index == 0);
}

pub async fn get_post(
    agent: Agent,
    bucket_canister: Principal,
    post_id: String
) -> Option<Post> {
    let response_blob = agent
        .query(
            &bucket_canister, 
            "get_post"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call().await.unwrap();
    
    Decode!(&response_blob, Option<Post>).unwrap()
}