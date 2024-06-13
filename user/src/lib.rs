use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal, Deserialize};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};

struct UserDigraph {
    vertex_list: Vec<Principal>,
    edge_list: Vec<(Principal, Principal)>,
}

#[derive(Clone, CandidType, Deserialize)]
struct Profile {
    id: Principal,
    name: String,
    biography: String,
    company: String,
    education: String,
    back_img_url: String,
    avatar_url: String,
    feed_canister: Option<Principal>
}

struct ProfileDatabase {
    map: HashMap<Principal, Profile>
}

impl UserDigraph {

    fn new() -> Self {
        UserDigraph {
            vertex_list: Vec::new(),
            edge_list: Vec::new(),
        }
    }

    fn add_vertex(&mut self, vertex: Principal) {
        self.vertex_list.push(vertex);
    }

    fn get_vertex_list(&self) -> &Vec<Principal> {
        &self.vertex_list
    }

    fn get_edge_list(&self) -> &Vec<(Principal, Principal)> {
        &self.edge_list
    }

    fn add_edge(&mut self, from_vertext: Principal, to_vertext: Principal) {
        if !self.edge_list.contains(&(from_vertext, to_vertext)) {
            self.edge_list.push((from_vertext, to_vertext))
        }
    }

    // 获取正向领边的节点 即得到某人的关注列表
    fn get_forward_adjacent(&self, vertex: Principal) -> Vec<Principal> {
        let mut adjacency_list: Vec<Principal> = Vec::new();
        for (from, to) in self.edge_list.iter() {
            if *from == vertex {
                adjacency_list.push(*to);
            }
        }
        adjacency_list
    }

    // 获取反向领边的节点 即得到某人的粉丝列表
    fn get_reverse_adjacent(&self, vertex: Principal) -> Vec<Principal> {
        let mut adjacency_list: Vec<Principal> = Vec::new();
        for (from, to) in self.edge_list.iter() {
            if *to == vertex {
                adjacency_list.push(*from);
            }
        }
        adjacency_list
    }

}

impl ProfileDatabase {

    fn new() -> Self {
        ProfileDatabase {
            map: HashMap::new()
        }
    }    

    fn create_profile(&mut self, user: Principal, profile: Profile) {
        self.map.insert(user, profile);
    }

    fn update_profile(&mut self, user: Principal, profile: Profile) {
        if user != profile.id {
            return;
        };

        self.map.insert(user, profile);
    }

    fn batch_get_profile(&self, user_ids: Vec<Principal>) -> Vec<Profile> {
        let mut ans: Vec<Profile> = vec![];
        for user in user_ids {
            match self.map.get(&user) {
                Some(val) => {
                    ans.push(val.clone())
                },
                None => {}
            }
        }
        ans
    }

    fn find_profile(&self, user: Principal) -> Option<Profile> {
        self.map.get(&user).cloned()
    }

    fn get_profile_entries(&self) -> Vec<(Principal, Profile)>{
        self.map.clone().into_iter().collect()
    } 

}

thread_local! {
    static USER_DIGRAPH: RefCell<UserDigraph> = RefCell::new(UserDigraph::new()); 
    static USER_PROFILES: RefCell<ProfileDatabase> = RefCell::new(ProfileDatabase::new());
}

#[ic_cdk::update]
fn follow(user: Principal) {
    USER_DIGRAPH.with(|graph| {
        let caller = ic_cdk::api::caller();
        graph.borrow_mut().add_edge(caller, user)
    })
}

// is user_a follow user_b
#[ic_cdk::query]
fn is_followed(user_a: Principal, user_b: Principal) -> bool {
    USER_DIGRAPH.with(|graph| {
        let followers = graph.borrow().get_reverse_adjacent(user_b);
        for follower in followers {
            if follower == user_a {
                return true;
            }
        };
        false
    })
}

#[ic_cdk::query]
fn get_following_list(user: Principal) -> Vec<Principal> {
    USER_DIGRAPH.with(|graph| {
        graph.borrow().get_forward_adjacent(user)
    })
}

#[ic_cdk::query]
fn get_followers_list(user: Principal) -> Vec<Principal> {
    USER_DIGRAPH.with(|graph| {
        graph.borrow().get_reverse_adjacent(user)
    })
}

#[ic_cdk::query]
fn get_following_number(user: Principal) -> u64 {
    USER_DIGRAPH.with(|graph| {
        graph.borrow().get_forward_adjacent(user).len() as u64
    })
}

#[ic_cdk::query]
fn get_follower_number(user: Principal) -> u64 {
    USER_DIGRAPH.with(|graph| {
        graph.borrow().get_reverse_adjacent(user).len() as u64
    })
}

#[ic_cdk::update]
fn create_profile(profile: Profile) {
    USER_PROFILES.with(|profiles| {
        profiles.borrow_mut().create_profile(
            ic_cdk::caller(), 
            profile
        )
    })
}

#[ic_cdk::update]
fn update_profile(profile: Profile) {
    USER_PROFILES.with(|profiles| {
        profiles.borrow_mut().update_profile(
            ic_cdk::caller(), 
            profile
        )
    })
}

#[ic_cdk::query]
fn get_profile(user: Principal) -> Option<Profile> {
    USER_PROFILES.with(|profiles| {
        profiles.borrow().find_profile(user)
    })
}

#[ic_cdk::query]
fn batch_get_profile(user_ids: Vec<Principal>) -> Vec<Profile> {
    USER_PROFILES.with(|profiles| {
        profiles.borrow().batch_get_profile(user_ids)
    })
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

// Enable Candid export
ic_cdk::export_candid!();