use std::time::Duration;

use candid::{CandidType, Deserialize, Principal, Encode, Decode, encode_args, encode_one};
use ic_agent::Agent;
use serde_bytes;
use crate::utils::build_local_agent;
use crate::{USERA, USERB};
use pocket_ic::PocketIc;
use types::Post;

const T_CYCLES: u64 = 10_u64.pow(12);

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PostFetchInitArg {
    root_feed: Principal
}

#[derive(CandidType, Deserialize, Debug)]
pub struct RootFetchInitArg {
    pub user_actor: Principal,
    pub root_feed: Principal
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ProtonInfo {
    pub root_feed_canister: Principal,
    pub feed_canister: Principal,
    pub root_bucket_canister: Principal,
    pub user_canister: Principal,
    pub root_fetch_canister: Principal,
    pub post_fetch_canister: Principal,
}

fn create_and_init_root_bucket_canister(pic: &PocketIc) -> Principal {
    let root_bucket_canister = pic.create_canister();
    pic.add_cycles(root_bucket_canister, (50 * T_CYCLES) as u128);
    
    let root_bucket_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/root_bucket.wasm").to_vec();
    pic.install_canister(root_bucket_canister, root_bucket_wasm, vec![], None);

    // upload bucket wasm
    let bucket_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/bucket.wasm").to_vec();
    let len = bucket_wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = bucket_wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = bucket_wasm[middle_len..len].to_vec();

    // upload first_chunk
    let first_chunk_result = pocket_ic::update_candid::<(Vec<u8>, u64, ), (bool, )>(
        &pic, 
        root_bucket_canister,
        "update_bucket_wasm",
        (first_wasm_chunk, 0u64, )
    ).unwrap().0;
    assert!(first_chunk_result);

    // upload second_chunk
    let second_chunk_result = pocket_ic::update_candid::<(Vec<u8>, u64, ), (bool, )>(
        &pic, 
        root_bucket_canister,
        "update_bucket_wasm",
        (seconde_wasm_chunk, 1u64, )
    ).unwrap().0;
    assert!(second_chunk_result);

    // call init func
    let init_result = pocket_ic::update_candid::<((), ), ((), )>(
        &pic, 
        root_bucket_canister,
        "init",
        ((),)
    ).unwrap().0;

    root_bucket_canister
}

fn create_and_init_root_feed_canister(
    pic: &PocketIc, 
    root_bucket_canister: Principal, 
    user_canister: Principal,
) -> Principal {
    let root_feed_canister = pic.create_canister();
    pic.add_cycles(root_feed_canister, (50 * T_CYCLES) as u128);
    
    let root_feed_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/root_feed.wasm").to_vec();
    pic.install_canister(
        root_feed_canister, 
        root_feed_wasm, 
        encode_args((root_bucket_canister, user_canister)).unwrap(), 
        None
    );

    // upload feed wasm
    let feed_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/feed.wasm").to_vec();
    let len = feed_wasm.len();
    let middle_len = len / 2;
    let first_wasm_chunk = feed_wasm[0..middle_len].to_vec();
    let seconde_wasm_chunk = feed_wasm[middle_len..len].to_vec();

    // upload first_chunk
    let first_chunk_result = pocket_ic::update_candid::<(Vec<u8>, u64, ), (bool, )>(
        &pic, 
        root_feed_canister,
        "update_feed_wasm",
        (first_wasm_chunk, 0u64, )
    ).unwrap().0;
    assert!(first_chunk_result);

    // upload second_chunk
    let second_chunk_result = pocket_ic::update_candid::<(Vec<u8>, u64, ), (bool, )>(
        &pic, 
        root_feed_canister,
        "update_feed_wasm",
        (seconde_wasm_chunk, 1u64, )
    ).unwrap().0;
    assert!(second_chunk_result);

    root_feed_canister
}

fn create_and_init_user_canister(pic: &PocketIc) -> Principal {
    let user_canister = pic.create_canister();
    pic.add_cycles(user_canister, (4 * T_CYCLES) as u128);
    
    let user_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/user.wasm").to_vec();
    pic.install_canister(user_canister, user_wasm, vec![], None);

    user_canister
}

fn create_and_init_root_fetch_canister(
    pic: &PocketIc,
    user_canister: Principal,
    root_feed_canister: Principal,
    post_fetch_canister: Principal
) -> Principal {
    let root_fetch_canister = pic.create_canister();
    pic.add_cycles(root_fetch_canister, (50 * T_CYCLES) as u128);
    
    let root_fetch_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/root_fetch.wasm").to_vec();
    pic.install_canister(
        root_fetch_canister, 
        root_fetch_wasm, 
        encode_one(RootFetchInitArg {
            user_actor: user_canister,
            root_feed: root_feed_canister
        }).unwrap(),
        None
    );

    // init root_fetch fetch_actor
    let init_fetch_result = pocket_ic::update_candid::<(Principal, ), ((), )>(
        &pic, 
        root_fetch_canister,
        "init_fetch_actor",
        (post_fetch_canister, )
    ).unwrap().0;

    // upload post_fetch wasm

    root_fetch_canister
}

fn create_and_init_post_fetch_canister(pic: &PocketIc, root_feed_canister: Principal) -> Principal {
    let post_fetch_canister = pic.create_canister();
    pic.add_cycles(post_fetch_canister, (4 * T_CYCLES) as u128);

    let wasm_bytes = include_bytes!("../../target/wasm32-unknown-unknown/release/post_fetch.wasm").to_vec();
    pic.install_canister(
        post_fetch_canister, 
        wasm_bytes, 
        encode_one(PostFetchInitArg {
            root_feed: root_feed_canister
        }).unwrap(), 
        None
    );

    post_fetch_canister
}

pub fn deploy_proton(pic: &PocketIc) -> ProtonInfo {
    let user_canister = create_and_init_user_canister(pic);

    let root_bucket_canister = create_and_init_root_bucket_canister(pic);

    let root_feed_canister = create_and_init_root_feed_canister(
        pic, 
        root_bucket_canister, 
        user_canister
    );

    let post_fetch_canister = create_and_init_post_fetch_canister(pic, root_feed_canister);

    // root_feed : init fetch actor
    let init_fetch_actor_result = pocket_ic::update_candid::<(Principal, ), ((), )>(
        &pic, 
        root_feed_canister,
        "init_fetch_actor",
        (post_fetch_canister, )
    ).unwrap().0;

    // create feed canister
    let feed_canister = pocket_ic::update_candid::<((), ), (Principal, )>(
        &pic, 
        root_feed_canister,
        "create_feed_canister",
        ((), )
    ).unwrap().0;

    let root_fetch_canister = create_and_init_root_fetch_canister(
        pic, 
        user_canister, 
        root_feed_canister, 
        post_fetch_canister
    );

    ProtonInfo {
        root_feed_canister: root_feed_canister,
        feed_canister: feed_canister,
        root_bucket_canister: root_bucket_canister,
        user_canister: user_canister,
        root_fetch_canister: root_fetch_canister,
        post_fetch_canister: post_fetch_canister,
    }
}

#[test]
fn test_create_post() {
    let pic = PocketIc::new();

    let proton_info = deploy_proton(&pic);
    
    let user_a = Principal::from_text(USERA).unwrap();

    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a test create_post".to_string(), vec![], )
    ).unwrap().0;

    let get_post_result = pocket_ic::query_candid::<(String, ), (Option<Post>, )>(
        &pic, 
        proton_info.feed_canister, 
        "get_post", 
        (post_id.clone(), )
    ).unwrap().0.unwrap();
    assert!(get_post_result.post_id == post_id);
}

#[test]
fn test_add_feed_to_black_list() {
    let pic = PocketIc::new();

    let proton_info = deploy_proton(&pic);
    
    let user_a = Principal::from_text(USERA).unwrap();
    let user_b = Principal::from_text(USERB).unwrap();

    let a_init_user_feed = pocket_ic::update_candid_as::<((), ), (Principal, )>(
        &pic,
        proton_info.root_feed_canister, 
        user_a, 
        "init_user_feed", 
        ((), )
    ).unwrap().0;
    assert!(a_init_user_feed == proton_info.feed_canister);

    let b_init_user_feed = pocket_ic::update_candid_as::<((), ), (Principal, )>(
        &pic,
        proton_info.root_feed_canister, 
        user_b, 
        "init_user_feed", 
        ((), )
    ).unwrap().0;
    assert!(b_init_user_feed == proton_info.feed_canister);

    let follow_result = pocket_ic::update_candid_as::<(Principal, ), ((), )>(
        &pic, 
        proton_info.user_canister, 
        user_b, 
        "follow", 
        (user_a, )
    ).unwrap().0;

    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a test create_post".to_string(), vec![], )
    ).unwrap().0;

    pic.advance_time(Duration::from_secs(60));
    for _ in 0..100 {
        pic.tick();
    }

    let get_home_feed_result = pocket_ic::query_candid::<(Principal, u64, ), (Vec<Post>, )>(
        &pic, 
        proton_info.feed_canister, 
        "get_home_feed", 
        (user_b, 10_u64, )
    ).unwrap().0;
    assert!(get_home_feed_result.len() == 1usize);

    let add_blacklist_result = pocket_ic::update_candid_as::<(String, ), (bool, )>(
        &pic, 
        proton_info.feed_canister, 
        user_b, 
        "add_feed_to_black_list", 
        (post_id, )
    ).unwrap().0;
    assert!(add_blacklist_result);

    let get_home_feed_result = pocket_ic::query_candid::<(Principal, u64, ), (Vec<Post>, )>(
        &pic, 
        proton_info.feed_canister, 
        "get_home_feed", 
        (user_b, 10_u64, )
    ).unwrap().0;
    assert!(get_home_feed_result.len() == 0);
}

// pub async fn delete_post(
//     agent: ic_agent::Agent,
//     feed_canister: Principal,
//     post_id: String
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "delete_post"
//         )
//         .with_arg(Encode!(&post_id).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }

// pub async fn create_comment(
//     agent: ic_agent::Agent,
//     feed_canister: Principal,
//     post_id: String,
//     content: String
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "create_comment"
//         )
//         .with_arg(Encode!(&post_id, &content).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }

// pub async fn test_comment(
//     agent_a: Agent,
//     agent_b: Agent
// ) {
//     println!("user_B  comment the first post \n");

//     let user_a = agent_a.get_principal().unwrap();
//     let user_a_feed_canister = root_feed::get_user_feed_canister(
//         agent_b.clone(), 
//         user_a
//     ).await.unwrap();

//     let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

//     // comment
//     let comment_result = feed::create_comment(
//         agent_b, 
//         user_a_feed_canister, 
//         post.post_id, 
//         "user_B  comment the first post to test_comment".to_string()
//     ).await;

//     assert!(comment_result);
// }

// pub async fn test_like(
//     agent_a: Agent,
//     agent_b: Agent
// ) {
//     println!("user_B like the first post \n");

//     let user_a = agent_a.get_principal().unwrap();
//     let user_a_feed_canister = root_feed::get_user_feed_canister(
//         agent_b.clone(), 
//         user_a
//     ).await.unwrap();

//     let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

//     // like
//     let like_result = feed::create_like(
//         agent_b, 
//         user_a_feed_canister, 
//         post.post_id
//     ).await;
//     assert!(like_result);
// }

// pub async fn test_repost(
//     agent_a: Agent,
//     agent_b: Agent
// ) {
//     println!("user_B  repost the first post \n");


//     let user_a = agent_a.get_principal().unwrap();
//     let user_a_feed_canister = root_feed::get_user_feed_canister(
//         agent_b.clone(), 
//         user_a
//     ).await.unwrap();

//     let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

//     // repost
//     let repost_result = feed::create_repost(
//         agent_b, 
//         user_a_feed_canister, 
//         post.post_id
//     ).await;
//     assert!(repost_result);
// }

// Fetch 的几种形式

// 1. User D follow User C
// 那么 C 的所有帖子的更新都会推流给D

// 2. User E 转发了 User C 的某个帖子
// 那么 E 会收到此帖子的更新，同时, 此帖子也会推流给E的粉丝F

// pub async fn test_post_fetch(
//     agent_c: Agent,
//     agent_d: Agent,
//     agent_e: Agent,
//     agent_f: Agent
// ) -> (String, Principal) {
//     // 第一种情况
//     let pr_c = agent_c.get_principal().unwrap();
//     let pr_d = agent_d.get_principal().unwrap();

//     // User D Follow User C
//     user::follow(agent_d.clone(), pr_c.clone()).await;
//     assert!(user::is_followed(agent_d.clone(), pr_d.clone(), pr_c.clone()).await);
//     println!("User D : {:?} Follow User C : {:?}\n", pr_d.to_text(), pr_c.to_text());

//     // If User C create a post
//     // the post should be fetched to User D
//         // User C create feed_canister
//     let c_feed = root_feed::init_user_feed(agent_c.clone()).await;
//     println!("User C feed_canister : {:?}\n", c_feed.to_text());
//         // User D create feed_canister
//     let d_feed = root_feed::init_user_feed(agent_d.clone()).await;
//     println!("User D feed_canister : {:?}\n", d_feed.to_text());

//     // User C create a post
//     let post_id = feed::create_post(
//         agent_c.clone(), 
//         c_feed.clone(), 
//         "User C create a post to test_post_fetch".to_string(), 
//         vec![]
//     ).await;
//     println!("the post_id : {:?}\n", post_id);

//     println!("Wait 30s !\n");
//     std::thread::sleep(std::time::Duration::from_secs(30));

//     // Check 
//     assert!(feed::get_feed_number(agent_d, d_feed, pr_d).await == 1);

//     // 第二种情况
//     let pr_e = agent_e.get_principal().unwrap();
//     let pr_f = agent_f.get_principal().unwrap();

//     println!("User F Follow User E\n");
//     user::follow(agent_f.clone(), pr_e).await;

//     let e_feed = root_feed::init_user_feed(agent_e.clone()).await;
//     println!("User E feed_canister : {:?}\n", e_feed.to_text());

//     let f_feed = root_feed::init_user_feed(agent_f.clone()).await;
//     println!("User F feed_canister : {:?}\n", f_feed.to_text());

//     println!("User E repsot User C's post\n");
//     assert!(feed::create_repost(
//         agent_e.clone(), 
//         c_feed, 
//         post_id.clone()
//     ).await);

//     // 此帖子会推流给 User E 及其粉丝 F
//     println!("Wait 30s !\n");
//     std::thread::sleep(std::time::Duration::from_secs(30));

//     // Check 
//     assert!(feed::get_feed_number(agent_e, e_feed, pr_e).await == 1);
//     assert!(feed::get_feed_number(agent_f, f_feed, pr_f).await == 1);

//     (post_id, c_feed)
// }

// pub async fn comment_comment(
//     agent: ic_agent::Agent,
//     feed_canister: Principal,
//     post_id: String,
//     to: u64,
//     content: String
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "comment_comment"
//         )
//         .with_arg(Encode!(&post_id, &to, &content).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }

// Comment Fetch 

// 任何一个 User 对某一帖子评论，其帖子创建者的粉丝和转帖者及转帖者的粉丝会收到推流
// USERG 对帖子评论

// 1. User D follow User C
// 那么 C 的所有帖子的更新都会推流给D

// 2. User E 转发了 User C 的某个帖子
// 那么 E 会收到此帖子的更新，同时, 此帖子也会推流给E的粉丝F
// pub async fn test_comment_fetch(
//     agent_g: Agent,
//     post_id: String,
//     c_feed: Principal
// ) {
//     assert!(feed::create_comment(
//         agent_g,
//         c_feed, 
//         post_id, 
//         "User G comment to test comment_fetch".to_string()
//     ).await);

//     // 检查Bukcet, D, E, F 的帖子是否更新
// }

// pub async fn test_like_fetch(
//     agent_g: Agent,
//     post_id: String,
//     c_feed: Principal
// ) {
//     assert!(feed::create_like(
//         agent_g,
//         c_feed, 
//         post_id
//     ).await);

//     // 检查Bukcet, D, E, F 的帖子是否更新
// }

// pub async fn like_comment(
//     agent: Agent,
//     feed_canister: Principal,
//     post_id: String,
//     comment_index: u64
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "like_comment"
//         )
//         .with_arg(Encode!(&post_id, &comment_index).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }


// pub async fn test_delete_post(agent_c: Agent) {
//     println!("Delete User C Post\n");

//     let c_feed = root_feed::get_user_feed_canister(
//         agent_c.clone(), 
//         agent_c.get_principal().unwrap()
//     ).await.unwrap();

//     let post_vec = feed::get_all_post(agent_c.clone(), c_feed, agent_c.get_principal().unwrap()).await;

//     let delete_result = feed::delete_post(
//         agent_c.clone(), 
//         c_feed, 
//         post_vec[0].post_id.clone()
//     ).await;
//     println!("delete_result : {:?}\n", delete_result);

//     assert!(delete_result);

//     // 检查其粉丝D
//     // 转帖者E，E的粉丝F
// }

// pub async fn like_comment_comment(
//     agent: Agent,
//     feed_canister: Principal,
//     post_id: String,
//     comment_index: u64
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "like_comment_comment"
//         )
//         .with_arg(Encode!(&post_id, &comment_index).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }

// pub async fn create_like(
//     agent: Agent,
//     feed_canister: Principal,
//     post_id: String,
// ) -> bool {
//     let response_blob = agent
//         .update(
//             &feed_canister, 
//             "create_like"
//         )
//         .with_arg(Encode!(&post_id).unwrap())
//         .call_and_wait()
//         .await.unwrap();
    
//     Decode!(&response_blob, bool).unwrap()
// }

// pub async fn create_repost(
//     agent: Agent,
//     feed_canister: Principal,
//     post_id: String
// ) -> bool {
//     let reponse_blob = agent
//         .update(
//             &feed_canister, 
//             "create_repost"
//         )
//         .with_arg(Encode!(&post_id).unwrap())
//         .call_and_wait()
//         .await.unwrap();

//     Decode!(&reponse_blob, bool).unwrap()
// }

// pub async fn get_all_post(
//     agent: ic_agent::Agent,
//     feed_canister: Principal,
//     user: Principal
// ) -> Vec<Post> {
//     let response_blob = agent
//         .query(
//             &feed_canister, 
//             "get_all_post"
//         )
//         .with_arg(Encode!(&user).unwrap())
//         .call()
//         .await.unwrap();
    
//     Decode!(&response_blob, Vec<Post>).unwrap()
// }

// pub async fn get_post(
//     agent: ic_agent::Agent,
//     feed_canister: Principal,
//     post_id: String
// ) -> Option<Post> {
//     let response_blob = agent
//         .query(
//             &feed_canister, 
//             "get_post"
//         )
//         .with_arg(Encode!(&post_id).unwrap())
//         .call()
//         .await.unwrap();
    
//     Decode!(&response_blob,Option<Post>).unwrap()
// }

// pub async fn get_feed_number(
//     agent: Agent,
//     feed_canister: Principal,
//     user: Principal
// ) -> u64 {
//     let response_blob = agent
//         .query(
//             &feed_canister, 
//             "get_feed_number"
//         )
//         .with_arg(Encode!(&user).unwrap())
//         .call().await.unwrap();
    
//     Decode!(&response_blob, u64).unwrap()
// }

// pub async fn get_latest_feed(
//     agent: Agent,
//     feed_canister: Principal,
//     user: Principal,
//     n: u64
// ) -> Vec<Post> {
//     let response_blob = agent
//         .query(
//             &feed_canister, 
//             "get_latest_feed"
//         )
//         .with_arg(Encode!(&user, &n).unwrap())
//         .call().await.unwrap();
    
//     Decode!(&response_blob, Vec<Post>).unwrap()
// }

// async fn test_comment_comment(
//     agent_a: Agent,
//     agent_b: Agent,
//     agent_c: Agent
// ) {
//     let pr_a = agent_a.get_principal().unwrap();
//     let pr_b = agent_b.get_principal().unwrap();
//     let pr_c = agent_c.get_principal().unwrap();

//     // B 的粉丝为A
//     // B 新发一个帖子
//     root_feed::init_user_feed(agent_b.clone()).await;
//     let feed_canister = root_feed::get_user_feed_canister(agent_b.clone(), pr_b).await.unwrap();
//     let post_id = feed::create_post(
//         agent_b, 
//         feed_canister,
//         "User_B : test_comment_comment".to_string(),
//     Vec::new()
//     ).await;

//     // A 去评论
//     assert!(feed::create_comment(
//         agent_a.clone(),
//         feed_canister, 
//         post_id.clone(), 
//         "test_comment_comment : UserA comment UserB".to_string()
//     ).await);

//     // C 去评论 A 的评论
//     let post = feed::get_post(agent_a.clone(), feed_canister, post_id.clone()).await.unwrap();
//     assert!(feed::comment_comment(
//         agent_c, 
//         feed_canister, 
//         post_id.clone(), 
//         post.comment[0].index.unwrap(), 
//         "test_comment_comment : UserC comment_comment to UserA".to_string()
//     ).await);

// // 检查post
//     let post = feed::get_post(agent_a.clone(), feed_canister, post_id.clone()).await.unwrap();
//     assert!(post.comment_index.unwrap() == 2);
//     assert!(post.comment.len() > 0);
//     assert!(post.comment_to_comment.clone().unwrap().len() > 0);
//     println!("test_comment_comment 后的 Post : {:?}", post);

// // 检查 A 是否收到推流
//     println!("Wait 30s !\n");
//     std::thread::sleep(std::time::Duration::from_secs(30));
//     let a_feed_vec = feed::get_latest_feed(agent_a.clone(), feed_canister, pr_a, 100).await;
//     let mut is_a_feed_update_flag = false;
//     for feed in a_feed_vec {
//         if feed.post_id == post_id {
//             assert!(feed.comment_index.unwrap() == 2);
//             assert!(feed.comment.len() > 0);
//             assert!(feed.comment_to_comment.unwrap().len() > 0);
//             is_a_feed_update_flag = true;
//         }
//     }
//     assert!(is_a_feed_update_flag);
    
// // 检查 bucket中的帖子是否更新
//     println!("Wait 30s !\n");
//     std::thread::sleep(std::time::Duration::from_secs(30));
//     let (bucket_canister, _, _) = utils::check_post_id(&post_id);
//     let bucket_post = bucket::get_post(
//         agent_a, 
//         bucket_canister, 
//         post_id
//     ).await.unwrap();
//     assert!(bucket_post.comment_index.unwrap() == 2);
//     assert!(bucket_post.comment.len() > 0);
//     assert!(bucket_post.comment_to_comment.unwrap().len() > 0); 

// }

// async fn test_like_comment(
//     agent_a: Agent,
//     agent_b: Agent,
//     agent_c: Agent
// ) {
//     let pr_a = agent_a.get_principal().unwrap();
//     let pr_b = agent_b.get_principal().unwrap();
//     let pr_c = agent_c.get_principal().unwrap();

//     // B 的粉丝为A
//     // 找到 B 有评论的评论的帖子
//     let feed_canister = root_feed::get_user_feed_canister(agent_b.clone(), pr_b).await.unwrap();
//     let b_post_vec = feed::get_all_post(agent_b, feed_canister, pr_b).await;

//     let mut is_find_post_flag = false;

//     for post in b_post_vec {
//         if post.comment_to_comment.clone().unwrap().len() > 0 {
//             // C 点赞 评论，评论的评论
//             assert!(feed::like_comment(
//                 agent_c.clone(), 
//                 feed_canister, 
//                 post.post_id.clone(), 
//                 post.comment[0].index.unwrap()
//             ).await);

//             assert!(feed::like_comment_comment(
//                 agent_c.clone(), 
//                 feed_canister, 
//                 post.post_id.clone(), 
//                 post.comment_to_comment.clone().unwrap()[0].index
//             ).await);

//             // 检查post
//             let feed_get_post = feed::get_post(agent_a.clone(), feed_canister, post.post_id.clone()).await.unwrap();
//             assert!(feed_get_post.comment[0].like.clone().unwrap().len() > 0);
//             assert!(feed_get_post.comment_to_comment.clone().unwrap()[0].like.len() > 0);
//             println!("like_comment &  like_comment_comment 后的 Post : {:?}", feed_get_post);

//             // 检查 A 是否收到推流
//             println!("Wait 30s !\n");
//             std::thread::sleep(std::time::Duration::from_secs(30));
//             let a_feed_vec = feed::get_latest_feed(agent_a.clone(), feed_canister, pr_a, 100).await;
//             let mut is_a_feed_update_flag = false;
//             for feed in a_feed_vec {
//                 if feed.post_id == post.post_id {
//                     assert!(feed.comment[0].like.clone().unwrap().len() > 0);
//                     assert!(feed.comment_to_comment.unwrap()[0].like.len() > 0);
//                     is_a_feed_update_flag = true;
//                 }
//             }
//             assert!(is_a_feed_update_flag);

//             // 检查 bucket中的帖子是否更新
//             println!("Wait 30s !\n");
//             std::thread::sleep(std::time::Duration::from_secs(30));
//             let (bucket_canister, _, _) = utils::check_post_id(&post.post_id);
//             let bucket_post = bucket::get_post(
//                 agent_a.clone(), 
//                 bucket_canister, 
//                 post.post_id
//             ).await.unwrap();
//             assert!(bucket_post.comment[0].like.clone().unwrap().len() > 0);
//             assert!(bucket_post.comment_to_comment.unwrap()[0].like.len() > 0);

//             is_find_post_flag = true;
//         }
//     }

//     assert!(is_find_post_flag);
// }