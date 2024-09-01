use candid::Principal;
use ic_agent::Agent;
use types::Post;

use crate::feed;
use crate::bucket;
use crate::photo_storage;
use crate::user;
use crate::utils;
use crate::utils::{build_agent, build_local_agent};
use crate::{
    USERA_PEM, USERB_PEM,
    USERC_PEM, USERD_PEM,
    USERE_PEM, USERF_PEM,
    USERG_PEM
};
use crate::root_feed;

pub async fn test_upload_photo(agent: Agent) {
    let photo_1 = 
        include_bytes!("../img/img_1.png").to_vec();

    let upload_index = photo_storage::upload_photo(
        agent, 
        photo_1
    ).await;
    println!("upload_index : {:?}\n", upload_index);
}

pub async fn test_init_user_feed(agent: Agent) {
    let feed_canister = root_feed::init_user_feed(agent.clone()).await;
    println!("user_A feed_canister : {:?}\n", feed_canister.to_text());

    // println!("user can not create twice\n");
    // assert!((root_feed::create_feed_canister(agent).await) == None);
}

pub async fn test_create_post(agent: Agent) {
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

pub async fn test_follow(
    agent_a: Agent,
    agent_b: Agent
) {
    println!("user_A follow user_B \n");

    let user_b = agent_b.get_principal().unwrap();
    user::follow(agent_a.clone(), user_b).await;

    // is_followed
    assert!((user::is_followed(agent_a.clone(), agent_a.get_principal().unwrap(), user_b).await) == true);
}

pub async fn test_comment(
    agent_a: Agent,
    agent_b: Agent
) {
    println!("user_B  comment the first post \n");

    let user_a = agent_a.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent_b.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

    // comment
    let comment_result = feed::create_comment(
        agent_b, 
        user_a_feed_canister, 
        post.post_id, 
        "user_B  comment the first post to test_comment".to_string()
    ).await;

    assert!(comment_result);
}

pub async fn test_like(
    agent_a: Agent,
    agent_b: Agent
) {
    println!("user_B like the first post \n");

    let user_a = agent_a.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent_b.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

    // like
    let like_result = feed::create_like(
        agent_b, 
        user_a_feed_canister, 
        post.post_id
    ).await;
    assert!(like_result);
}

pub async fn test_repost(
    agent_a: Agent,
    agent_b: Agent
) {
    println!("user_B  repost the first post \n");


    let user_a = agent_a.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent_b.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent_b.clone(), user_a_feed_canister, user_a).await[0].clone();

    // repost
    let repost_result = feed::create_repost(
        agent_b, 
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

pub async fn test_post_fetch(
    agent_c: Agent,
    agent_d: Agent,
    agent_e: Agent,
    agent_f: Agent
) -> (String, Principal) {
    // 第一种情况
    let pr_c = agent_c.get_principal().unwrap();
    let pr_d = agent_d.get_principal().unwrap();

    // User D Follow User C
    user::follow(agent_d.clone(), pr_c.clone()).await;
    assert!(user::is_followed(agent_d.clone(), pr_d.clone(), pr_c.clone()).await);
    println!("User D : {:?} Follow User C : {:?}\n", pr_d.to_text(), pr_c.to_text());

    // If User C create a post
    // the post should be fetched to User D
        // User C create feed_canister
    let c_feed = root_feed::init_user_feed(agent_c.clone()).await;
    println!("User C feed_canister : {:?}\n", c_feed.to_text());
        // User D create feed_canister
    let d_feed = root_feed::init_user_feed(agent_d.clone()).await;
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
    assert!(feed::get_feed_number(agent_d, d_feed, pr_d).await == 1);

    // 第二种情况
    let pr_e = agent_e.get_principal().unwrap();
    let pr_f = agent_f.get_principal().unwrap();

    println!("User F Follow User E\n");
    user::follow(agent_f.clone(), pr_e).await;

    let e_feed = root_feed::init_user_feed(agent_e.clone()).await;
    println!("User E feed_canister : {:?}\n", e_feed.to_text());

    let f_feed = root_feed::init_user_feed(agent_f.clone()).await;
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
    assert!(feed::get_feed_number(agent_e, e_feed, pr_e).await == 1);
    assert!(feed::get_feed_number(agent_f, f_feed, pr_f).await == 1);

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
    agent_g: Agent,
    post_id: String,
    c_feed: Principal
) {
    assert!(feed::create_comment(
        agent_g,
        c_feed, 
        post_id, 
        "User G comment to test comment_fetch".to_string()
    ).await);

    // 检查Bukcet, D, E, F 的帖子是否更新
}

pub async fn test_like_fetch(
    agent_g: Agent,
    post_id: String,
    c_feed: Principal
) {
    assert!(feed::create_like(
        agent_g,
        c_feed, 
        post_id
    ).await);

    // 检查Bukcet, D, E, F 的帖子是否更新
}

pub async fn test_time(agent_e: Agent) {
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

pub async fn test_delete_post(agent_c: Agent) {
    println!("Delete User C Post\n");

    let c_feed = root_feed::get_user_feed_canister(
        agent_c.clone(), 
        agent_c.get_principal().unwrap()
    ).await.unwrap();

    let post_vec = feed::get_all_post(agent_c.clone(), c_feed, agent_c.get_principal().unwrap()).await;

    let delete_result = feed::delete_post(
        agent_c.clone(), 
        c_feed, 
        post_vec[0].post_id.clone()
    ).await;
    println!("delete_result : {:?}\n", delete_result);

    assert!(delete_result);

    // 检查其粉丝D
    // 转帖者E，E的粉丝F
}

async fn test_cancle_follow(
    agent_e: Agent,
    agent_f: Agent
) {
    // F 取消关注 E
    let pr_e = agent_e.get_principal().unwrap();
    let pr_f = agent_f.get_principal().unwrap();

    assert!(user::is_followed(agent_f.clone(), pr_f, pr_e).await == true);

    user::cancle_follow(agent_f.clone(), pr_e).await;

    assert!(user::is_followed(agent_f.clone(), pr_f, pr_e).await == false);
}

async fn test_comment_comment(
    agent_a: Agent,
    agent_b: Agent,
    agent_c: Agent
) {
    let pr_a = agent_a.get_principal().unwrap();
    let pr_b = agent_b.get_principal().unwrap();
    let pr_c = agent_c.get_principal().unwrap();

    // B 的粉丝为A
    // B 新发一个帖子
    root_feed::init_user_feed(agent_b.clone()).await;
    let feed_canister = root_feed::get_user_feed_canister(agent_b.clone(), pr_b).await.unwrap();
    let post_id = feed::create_post(
        agent_b, 
        feed_canister,
        "User_B : test_comment_comment".to_string(),
    Vec::new()
    ).await;

    // A 去评论
    assert!(feed::create_comment(
        agent_a.clone(),
        feed_canister, 
        post_id.clone(), 
        "test_comment_comment : UserA comment UserB".to_string()
    ).await);

    // C 去评论 A 的评论
    let post = feed::get_post(agent_a.clone(), feed_canister, post_id.clone()).await.unwrap();
    assert!(feed::comment_comment(
        agent_c, 
        feed_canister, 
        post_id.clone(), 
        post.comment[0].index.unwrap(), 
        "test_comment_comment : UserC comment_comment to UserA".to_string()
    ).await);

// 检查post
    let post = feed::get_post(agent_a.clone(), feed_canister, post_id.clone()).await.unwrap();
    assert!(post.comment_index.unwrap() == 2);
    assert!(post.comment.len() > 0);
    assert!(post.comment_to_comment.clone().unwrap().len() > 0);
    println!("test_comment_comment 后的 Post : {:?}", post);

// 检查 A 是否收到推流
    println!("Wait 30s !\n");
    std::thread::sleep(std::time::Duration::from_secs(30));
    let a_feed_vec = feed::get_latest_feed(agent_a.clone(), feed_canister, pr_a, 100).await;
    let mut is_a_feed_update_flag = false;
    for feed in a_feed_vec {
        if feed.post_id == post_id {
            assert!(feed.comment_index.unwrap() == 2);
            assert!(feed.comment.len() > 0);
            assert!(feed.comment_to_comment.unwrap().len() > 0);
            is_a_feed_update_flag = true;
        }
    }
    assert!(is_a_feed_update_flag);
    
// 检查 bucket中的帖子是否更新
    println!("Wait 30s !\n");
    std::thread::sleep(std::time::Duration::from_secs(30));
    let (bucket_canister, _, _) = utils::check_post_id(&post_id);
    let bucket_post = bucket::get_post(
        agent_a, 
        bucket_canister, 
        post_id
    ).await.unwrap();
    assert!(bucket_post.comment_index.unwrap() == 2);
    assert!(bucket_post.comment.len() > 0);
    assert!(bucket_post.comment_to_comment.unwrap().len() > 0); 

}

async fn test_like_comment(
    agent_a: Agent,
    agent_b: Agent,
    agent_c: Agent
) {
    let pr_a = agent_a.get_principal().unwrap();
    let pr_b = agent_b.get_principal().unwrap();
    let pr_c = agent_c.get_principal().unwrap();

    // B 的粉丝为A
    // 找到 B 有评论的评论的帖子
    let feed_canister = root_feed::get_user_feed_canister(agent_b.clone(), pr_b).await.unwrap();
    let b_post_vec = feed::get_all_post(agent_b, feed_canister, pr_b).await;

    let mut is_find_post_flag = false;

    for post in b_post_vec {
        if post.comment_to_comment.clone().unwrap().len() > 0 {
            // C 点赞 评论，评论的评论
            assert!(feed::like_comment(
                agent_c.clone(), 
                feed_canister, 
                post.post_id.clone(), 
                post.comment[0].index.unwrap()
            ).await);

            assert!(feed::like_comment_comment(
                agent_c.clone(), 
                feed_canister, 
                post.post_id.clone(), 
                post.comment_to_comment.clone().unwrap()[0].index
            ).await);

            // 检查post
            let feed_get_post = feed::get_post(agent_a.clone(), feed_canister, post.post_id.clone()).await.unwrap();
            assert!(feed_get_post.comment[0].like.clone().unwrap().len() > 0);
            assert!(feed_get_post.comment_to_comment.clone().unwrap()[0].like.len() > 0);
            println!("like_comment &  like_comment_comment 后的 Post : {:?}", feed_get_post);

            // 检查 A 是否收到推流
            println!("Wait 30s !\n");
            std::thread::sleep(std::time::Duration::from_secs(30));
            let a_feed_vec = feed::get_latest_feed(agent_a.clone(), feed_canister, pr_a, 100).await;
            let mut is_a_feed_update_flag = false;
            for feed in a_feed_vec {
                if feed.post_id == post.post_id {
                    assert!(feed.comment[0].like.clone().unwrap().len() > 0);
                    assert!(feed.comment_to_comment.unwrap()[0].like.len() > 0);
                    is_a_feed_update_flag = true;
                }
            }
            assert!(is_a_feed_update_flag);

            // 检查 bucket中的帖子是否更新
            println!("Wait 30s !\n");
            std::thread::sleep(std::time::Duration::from_secs(30));
            let (bucket_canister, _, _) = utils::check_post_id(&post.post_id);
            let bucket_post = bucket::get_post(
                agent_a.clone(), 
                bucket_canister, 
                post.post_id
            ).await.unwrap();
            assert!(bucket_post.comment[0].like.clone().unwrap().len() > 0);
            assert!(bucket_post.comment_to_comment.unwrap()[0].like.len() > 0);

            is_find_post_flag = true;
        }
    }

    assert!(is_find_post_flag);
}

pub async fn test() {
    println!("---------------- Test Start ---------------- \n");

    println!("---------------- TEST 1 test_upload_photo ------------------ \n");
    test_upload_photo(build_local_agent(USERA_PEM).await).await;

    println!("---------------- TEST 2 init_user_feed_canister ------------------ \n");
    test_init_user_feed(build_local_agent(USERA_PEM).await).await;

    println!("---------------- TEST 3 test_create_post ------------------ \n");
    test_create_post(build_local_agent(USERA_PEM).await).await;

    println!("---------------- TEST 4 test_follow  ------------------ \n");
    test_follow(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await
    ).await;

    println!("---------------- TEST 5 test_comment ------------------ \n");
    test_comment(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await
    ).await;

    println!("---------------- TEST 6 test_like ------------------ \n");
    test_like(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await
    ).await;

    println!("---------------- TEST 7 test_repost ------------------ \n");
    test_repost(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await
    ).await;

    println!("---------------- TEST 8 test_post_fetch ------------------ \n");
    let (post_id, c_feed) = test_post_fetch(
        build_local_agent(USERC_PEM).await,
        build_local_agent(USERD_PEM).await,
        build_local_agent(USERE_PEM).await,
        build_local_agent(USERF_PEM).await
    ).await;

    println!("---------------- TEST 9 test_comment_fetch ------------------ \n");
    test_comment_fetch(
        build_local_agent(USERG_PEM).await,
        post_id.clone(), 
        c_feed.clone()
    ).await;

    println!("---------------- TEST 10 test_like_fetch ------------------ \n");
    test_like_fetch(
        build_local_agent(USERG_PEM).await,
        post_id, 
        c_feed
    ).await;

    test_time(build_local_agent(USERE_PEM).await).await;

    println!("---------------- TEST 11 test_delete_post ------------------ \n");
    test_delete_post(build_local_agent(USERC_PEM).await).await;

    println!("---------------- TEST 12 cancle_follow ------------------ \n");
    test_cancle_follow(
        build_local_agent(USERE_PEM).await,
        build_local_agent(USERF_PEM).await
    ).await;

    println!("---------------- TEST 13 comment_comment ------------------ \n");
    test_comment_comment(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await,
        build_local_agent(USERC_PEM).await
    ).await;

    println!("---------------- TEST 14 like_comment ------------------ \n");
    test_like_comment(
        build_local_agent(USERA_PEM).await,
        build_local_agent(USERB_PEM).await,
        build_local_agent(USERC_PEM).await
    ).await;
}

pub async fn test_on_ic() {
    println!("---------------- Test Start ---------------- \n");

    println!("---------------- TEST 1 test_upload_photo ------------------ \n");
    test_upload_photo(build_agent(USERA_PEM)).await;

    println!("---------------- TEST 2 init_user_feed_canister ------------------ \n");
    test_init_user_feed(build_agent(USERA_PEM)).await;

    println!("---------------- TEST 3 test_create_post ------------------ \n");
    test_create_post(build_agent(USERA_PEM)).await;

    println!("---------------- TEST 4 test_follow  ------------------ \n");
    test_follow(
        build_agent(USERA_PEM),
        build_agent(USERB_PEM)
    ).await;

    println!("---------------- TEST 5 test_comment ------------------ \n");
    test_comment(
        build_agent(USERA_PEM),
        build_agent(USERB_PEM)
    ).await;

    println!("---------------- TEST 6 test_like ------------------ \n");
    test_like(
        build_agent(USERA_PEM),
        build_agent(USERB_PEM)  
    ).await;

    println!("---------------- TEST 7 test_repost ------------------ \n");
    test_repost(
        build_agent(USERA_PEM),
        build_agent(USERB_PEM)  
    ).await;

    println!("---------------- TEST 8 test_post_fetch ------------------ \n");
    let (post_id, c_feed) = test_post_fetch(
        build_agent(USERC_PEM),
        build_agent(USERD_PEM),
        build_agent(USERE_PEM),
        build_agent(USERF_PEM)
    ).await;

    println!("---------------- TEST 9 test_comment_fetch ------------------ \n");
    test_comment_fetch(
        build_agent(USERG_PEM),
        post_id.clone(), 
        c_feed.clone()
    ).await;

    println!("---------------- TEST 10 test_like_fetch ------------------ \n");
    test_like_fetch(
        build_agent(USERG_PEM),
        post_id, 
        c_feed
    ).await;

    test_time(build_agent(USERE_PEM)).await;

    println!("---------------- TEST 11 test_delete_post ------------------ \n");
    test_delete_post(build_agent(USERC_PEM)).await;

    println!("---------------- TEST 12 cancle_follow ------------------ \n");
    test_cancle_follow(
        build_agent(USERE_PEM),
        build_agent(USERF_PEM)
    ).await;


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