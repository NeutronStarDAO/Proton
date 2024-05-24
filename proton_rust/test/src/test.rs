use ic_agent::agent;

use crate::photo_storage;
use crate::utils;
use crate::USERA_PEM;
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

    println!("user can not create twice\n");
    assert!((root_feed::create_feed_canister(agent).await) == None);
}

pub async fn test_create_post() {

}

pub async fn test_follow() {

}

pub async fn test_comment() {

}

pub async fn test_like() {

}

pub async fn test_repost() {
    
}

pub async fn test() {
    println!("test_upload_photo : \n");
    test_upload_photo().await;

    println!("test_create_feed_canister : \n");
    test_create_feed_canister().await;
}