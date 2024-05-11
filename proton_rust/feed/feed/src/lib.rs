use candid::{Principal, CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;
use types::{Comment, Post, Like, Repost};

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreatePostArgs {
    feed_canister: Principal,
    content: String,
    time: u64,
    bucket: Principal
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreateCommentArgs {
    post_id: String,
    content: String, 
    created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CreateLikeArgs {

}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PostDatabase {
    post_index: u128,
    post_map: HashMap<u128, Post>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct  FeedDatabase {
    feed_map: HashMap<String, Post>
}

impl PostDatabase {

    fn new() -> Self {
        PostDatabase {
            post_index: 0,
            post_map: HashMap::new()
        }
    }

    fn get_post_index(&self) -> u128 { self.post_index }

    fn get_post_map_entries(&self) -> Vec<(&u128, &Post)> {
        self.post_map.iter().collect()
    }

    fn get_post_id(bucket: Principal, user: Principal, index: u128) -> String {
        bucket.to_text() + "#" + &user.to_text() + "#" + &index.to_string()
        
    }
    
    fn create_post(&mut self, user: Principal, args: CreatePostArgs) {
        let post_index = self.post_index;
        self.post_map.insert(
            post_index, 
            Post {
                post_id: PostDatabase::get_post_id(args.bucket, user, post_index),
                feed_canister: args.feed_canister,
                index: post_index,
                user: user,
                content: args.content,
                repost: Vec::new(),
                like: Vec::new(),
                comment: Vec::new(),
                created_at: ic_cdk::api::time()
            }
        );
        self.post_index += 1;
    }

    fn create_repost(&mut self, post_id: String) {
        let (bucket, user, post_index) = PostDatabase::check_post_id(post_id);
        let value = self.post_map.get_mut(&post_index).unwrap();
        let mut is_already_repost = false;
        for i in value.repost.iter() {
            if i.user == user {
                is_already_repost = true;
                break;
            }
        }
        if !is_already_repost {
            value.repost.push(Repost { user: user, created_at: ic_cdk::api::time()});
        }
    
    }

    fn create_comment(&mut self, coment_user: Principal, args: CreateCommentArgs) {
        let (bucket, user, index) = PostDatabase::check_post_id(args.post_id);
        if let Some(post) = self.post_map.get_mut(&index) {
            post.comment.push(Comment {
                user: coment_user,
                content: args.content,
                created_at: args.created_at
            });
        }
    }

    fn create_like(&mut self, like_user: Principal, post_id: String) {
        let (bucket, user, index) = PostDatabase::check_post_id(post_id);
        if let Some(post) = self.post_map.get_mut(&index) {
            for i in post.like.iter() {
                if i.user == like_user {
                    return;
                }
            }
            post.like.push(Like {
                user: like_user,
                created_at: ic_cdk::api::time()
            })
        }
    }



    fn get_post_number(&self) -> u128 { self.post_map.len() as u128}

    fn get_post(&self, post_id: String) -> Option<Post> {
        let (bucket, user, index) = PostDatabase::check_post_id(post_id);
        self.post_map.get(&index).cloned()
    }

    fn get_all_post(&self) -> Vec<Post> {
        self.post_map.values().cloned().into_iter().collect()
    }



    fn check_post_id(
        post_id: String
    ) -> (Principal, Principal, u128) {
        let words: Vec<&str> = post_id.split("#").collect();
        let bucket = Principal::from_text(words[0]).unwrap();
        let user = Principal::from_text(words[1]).unwrap();
        let post_index = u128::from_str_radix(words[2], 10).unwrap();
        (bucket, user, post_index)
    }


}


impl FeedDatabase {
    
}

thread_local! {
    static POST_DATABASE: RefCell<PostDatabase> = RefCell::new(PostDatabase::new());
}

#[ic_cdk::query]
fn get_post_number() -> u128 {
    POST_DATABASE.with(|database| {
        database.borrow().get_post_number()
    })
}

#[ic_cdk::query]
fn get_post(post_id: String) -> Option<Post> {
    POST_DATABASE.with(|database| {
        database.borrow().get_post(post_id)
    })
}

#[ic_cdk::query] 
fn get_all_post() -> Vec<Post> {
    POST_DATABASE.with(|database| {
        database.borrow().get_all_post()
    })
}

#[ic_cdk::update]
fn creaet_post(content: String) {
    // 存储post
    // POST_DATABASE.with(|database| {
    //     database.borrow_mut().create_post(
    //         ic_cdk::api::caller(),
    //         CreatePostArgs {
    //             feed_canister: ic_cdk::api::id(),
    //             content: content,
    //             time: ic_cdk::api::time(),
    //             bucket: Principal   
    //         }
    //     )
    // })

    // 将帖子内容发送给公共区的 Bucket 
    // ...
}