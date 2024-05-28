use ic_agent::agent;

use crate::feed;
use crate::photo_storage;
use crate::user;
use crate::utils;
use crate::USERA_PEM;
use crate::root_feed;
use crate::USERB_PEM;

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
    println!("test_create_post :{:?}\n", post_id);
}

pub async fn test_follow() {
    // USER A Follow USER B
    let agent = utils::build_local_agent(USERA_PEM).await;
    let user_b = utils::build_local_agent(USERB_PEM).await.get_principal().unwrap();
    user::follow(agent.clone(), user_b).await;

    // is_followed
    assert!((user::is_followed(agent.clone(), agent.get_principal().unwrap(), user_b).await) == true);
}

pub async fn test_comment() {
    // user_b  comment the first post 
    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();
    println!("old_post : {:?}\n", post);

    // comment
    let comment_result = feed::create_comment(
        agent, 
        user_a_feed_canister, 
        post.post_id, 
        "test comment".to_string()
    ).await;

    assert!(comment_result);
}

pub async fn test_like() {
    // user_b like the first post
    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();
    println!("old_post : {:?}\n", post);

    // like
    let like_result = feed::create_like(
        agent, 
        user_a_feed_canister, 
        post.post_id
    ).await;
    assert!(like_result);
}

pub async fn test_repost() {
    // user_b repost the first post
    let agent = utils::build_local_agent(USERB_PEM).await;
    let user_a = utils::build_local_agent(USERA_PEM).await.get_principal().unwrap();
    let user_a_feed_canister = root_feed::get_user_feed_canister(
        agent.clone(), 
        user_a
    ).await.unwrap();

    let post = feed::get_all_post(agent.clone(), user_a_feed_canister).await[0].clone();
    println!("old_post : {:?}\n", post);

    // repost
    let repost_result = feed::create_repost(
        agent, 
        user_a_feed_canister, 
        post.post_id
    ).await;
    assert!(repost_result);
}

pub async fn test() {
    println!("test_upload_photo : \n");
    test_upload_photo().await;

    println!("test_create_feed_canister : \n");
    test_create_feed_canister().await;

    println!("test_create_post : \n");
    test_create_post().await;

    println!("test_follow : \n");
    test_follow().await;

    println!("test_comment : \n");
    test_comment().await;

    println!("test_like : \n");
    test_like().await;

    println!("test_repost : \n");
    test_repost().await;
}