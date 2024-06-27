use candid::Principal;

use crate::feed;
use crate::photo_storage;
use crate::user;
use crate::utils;
use crate::{
    USERA_PEM, USERB_PEM,
    USERC_PEM, USERD_PEM,
    USERE_PEM, USERF_PEM,
    USERG_PEM
};
use crate::root_feed;

pub async fn test_upload_photo() {
    let photo_1 = 
        include_bytes!("../img/img_1.png").to_vec();

    let agent = utils::build_local_agent(USERA_PEM).await;

    let upload_index = photo_storage::upload_photo(
        agent, 
        photo_1
    ).await;
    println!("upload_index : {:?}\n", upload_index);
}

pub async fn test_create_feed_canister() {
    let agent = utils::build_local_agent(USERA_PEM).await;

    let feed_canister = root_feed::create_feed_canister(agent.clone()).await.unwrap();
    println!("user_A feed_canister : {:?}\n", feed_canister.to_text());

    // println!("user can not create twice\n");
    // assert!((root_feed::create_feed_canister(agent).await) == None);
}

pub async fn test_create_post() {
    let agent = utils::build_local_agent(USERA_PEM).await;
    let caller = agent.get_principal().unwrap();
    let user_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        caller
    ).await.unwrap();
    let post_id = feed::create_post(
        agent.clone(), 
        user_feed_canister, 
        "This is test create post content !".to_string(), 
        vec![]
    ).await;
    println!("user_A test_create_post id :{:?}\n", post_id);
}

pub async fn test_follow() {
    println!("user_A follow user_B \n");

    let agent = utils::build_local_agent(USERA_PEM).await;
    let user_b = utils::build_local_agent(USERB_PEM).await.get_principal().unwrap();
    user::follow(agent.clone(), user_b).await;

    // is_followed
    assert!((user::is_followed(agent.clone(), agent.get_principal().unwrap(), user_b).await) == true);
}

pub async fn test_comment() {
    println!("user_B  comment the first post \n");

    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();

    // comment
    let comment_result = feed::create_comment(
        agent, 
        user_a_feed_canister, 
        post.post_id, 
        "user_B  comment the first post to test_comment".to_string()
    ).await;

    assert!(comment_result);
}

pub async fn test_like() {
    println!("user_B like the first post \n");

    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();

    // like
    let like_result = feed::create_like(
        agent, 
        user_a_feed_canister, 
        post.post_id
    ).await;
    assert!(like_result);
}

pub async fn test_repost() {
    println!("user_B  repost the first post \n");

    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();

    // repost
    let repost_result = feed::create_repost(
        agent, 
        user_a_feed_canister, 
        post.post_id
    ).await;
    assert!(repost_result);
}

// Fetch 的几种形式

// 1. User D follow User C
// 那么 C 的所有帖子的更新都会推流给D

// 2. User E 转发了 User C 的某个帖子
// 那么 E 会收到此帖子的更新，同时, 此帖子也会推流给E的粉丝F

pub async fn test_post_fetch() -> (String, Principal) {
    // 第一种情况
    let agent_c = utils::build_local_agent(USERC_PEM).await;
    let agent_d = utils::build_local_agent(USERD_PEM).await;
    let pr_c = agent_c.get_principal().unwrap();
    let pr_d = agent_d.get_principal().unwrap();

    // User D Follow User C
    user::follow(agent_d.clone(), pr_c.clone()).await;
    assert!(user::is_followed(agent_d.clone(), pr_d.clone(), pr_c.clone()).await);
    println!("User D : {:?} Follow User C : {:?}\n", pr_d.to_text(), pr_c.to_text());

    // If User C create a post
    // the post should be fetched to User D
        // User C create feed_canister
    let c_feed = root_feed::create_feed_canister(agent_c.clone()).await.unwrap();
    println!("User C feed_canister : {:?}\n", c_feed.to_text());
        // User D create feed_canister
    let d_feed = root_feed::create_feed_canister(agent_d.clone()).await.unwrap();
    println!("User D feed_canister : {:?}\n", d_feed.to_text());

    // User C create a post
    let post_id = feed::create_post(
        agent_c.clone(), 
        c_feed.clone(), 
        "User C create a post to test_post_fetch".to_string(), 
        vec![]
    ).await;
    println!("the post_id : {:?}\n", post_id);

    println!("Wait 30s !\n");
    std::thread::sleep(std::time::Duration::from_secs(30));

    // Check 
    assert!(feed::get_feed_number(agent_d, d_feed).await == 1);

    // 第二种情况
    let agent_e = utils::build_local_agent(USERE_PEM).await;
    let agent_f = utils::build_local_agent(USERF_PEM).await;
    let pr_e = agent_e.get_principal().unwrap();

    println!("User F Follow User E\n");
    user::follow(agent_f.clone(), pr_e).await;

    let e_feed = root_feed::create_feed_canister(agent_e.clone()).await.unwrap();
    println!("User E feed_canister : {:?}\n", e_feed.to_text());

    let f_feed = root_feed::create_feed_canister(agent_f.clone()).await.unwrap();
    println!("User F feed_canister : {:?}\n", f_feed.to_text());

    println!("User E repsot User C's post\n");
    assert!(feed::create_repost(
        agent_e.clone(), 
        c_feed, 
        post_id.clone()
    ).await);

    // 此帖子会推流给 User E 及其粉丝 F
    println!("Wait 30s !\n");
    std::thread::sleep(std::time::Duration::from_secs(30));

    // Check 
    assert!(feed::get_feed_number(agent_e, e_feed).await == 1);
    assert!(feed::get_feed_number(agent_f, f_feed).await == 1);

    (post_id, c_feed)
}

// Comment Fetch 

// 任何一个 User 对某一帖子评论，其帖子创建者的粉丝和转帖者及转帖者的粉丝会收到推流
// USERG 对帖子评论

// 1. User D follow User C
// 那么 C 的所有帖子的更新都会推流给D

// 2. User E 转发了 User C 的某个帖子
// 那么 E 会收到此帖子的更新，同时, 此帖子也会推流给E的粉丝F
pub async fn test_comment_fetch(
    post_id: String,
    c_feed: Principal
) {
    let agent_g = utils::build_local_agent(USERG_PEM).await;
    assert!(feed::create_comment(
        agent_g,
        c_feed, 
        post_id, 
        "User G comment to test comment_fetch".to_string()
    ).await);

    // 检查Bukcet, D, E, F 的帖子是否更新
}

pub async fn test_like_fetch(
    post_id: String,
    c_feed: Principal
) {
    let agent_g = utils::build_local_agent(USERG_PEM).await;
    assert!(feed::create_like(
        agent_g,
        c_feed, 
        post_id
    ).await);

    // 检查Bukcet, D, E, F 的帖子是否更新
}

pub async fn test_time() {
    let agent_e = utils::build_local_agent(USERE_PEM).await;
    let pr_e = agent_e.get_principal().unwrap();

    let e_feed = root_feed::get_user_feed_canister(
        agent_e.clone(), 
        pr_e
    ).await.unwrap();
    
    for i in 0..10 {
        let mut content = "User E create post ".to_string();
        content.push_str(i.to_string().as_str());

        let result = feed::create_post(
            agent_e.clone(), 
            e_feed.clone(),
            content, 
            Vec::new()
        ).await;

        std::thread::sleep(std::time::Duration::from_secs(5));
    }
}

pub async fn test() {
    println!("---------------- Test Start ---------------- \n");

    println!("---------------- TEST 1 test_upload_photo ------------------ \n");
    test_upload_photo().await;

    println!("---------------- TEST 2 test_create_feed_canister ------------------ \n");
    test_create_feed_canister().await;

    println!("---------------- TEST 3 test_create_post ------------------ \n");
    test_create_post().await;

    println!("---------------- TEST 4 test_follow  ------------------ \n");
    test_follow().await;

    println!("---------------- TEST 5 test_comment ------------------ \n");
    test_comment().await;

    println!("---------------- TEST 6 test_like ------------------ \n");
    test_like().await;

    println!("---------------- TEST 7 test_repost ------------------ \n");
    test_repost().await;

    println!("---------------- TEST 8 test_post_fetch ------------------ \n");
    let (post_id, c_feed) = test_post_fetch().await;

    println!("---------------- TEST 9 test_comment_fetch ------------------ \n");
    test_comment_fetch(post_id.clone(), c_feed.clone()).await;

    println!("---------------- TEST 10 test_like_fetch ------------------ \n");
    test_like_fetch(post_id, c_feed).await;

    test_time().await;
}

// 关注关系
// A 关注 B
// D 关注 C
// F 关注 E

// Post
// A: 有一个帖子，B 点赞、评论、转发
// C: 有一个帖子，G 评论, G点赞

// Feed
// B: 有A的转发帖子
// D: 有粉丝推流的C的帖子, G评论更新, G点赞更新
// E: 有C的转发帖子, G评论更新, G点赞更新
// F: 有E转发C的帖子, G评论更新, G点赞更新