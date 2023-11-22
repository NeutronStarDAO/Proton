import Types "./types";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Option "mo:base/Option";

shared(msg) actor class Bucket() = this {
    
    stable let installer = msg.caller;

    // private func _feedMap_equal(a: (Principal, Nat), b: (Principal, Nat)): Bool {
    //     if(a.0 == b.0 and a.1 == b.1) return true;
    //     false
    // };

    // private func _feedMap_hash(x: (Principal, Nat)): Hash.Hash {
    //     Text.hash(
    //         "User : " # Principal.toText(x.0) #
    //         "PostIndex : " # Nat.toText(x.1)
    //     )
    // };

    type FeedActor = Types.FeedActor;
    type PostImmutable = Types.PostImmutable;

    // postId -> PostImmutable
    let feedMap = TrieMap.TrieMap<Text, PostImmutable>(Text.equal, Text.hash);

    private func checkPostId(postId: Text): (Principal, Principal, Nat) {
        let words = Iter.toArray(Text.split(postId, #char '#'));
        let bucket = Principal.fromText(words[0]);
        let user = Principal.fromText(words[1]);
        let postIndex = Option.unwrap(Nat.fromText(words[2]));
        Debug.print("(bucket, user, index) : (" # words[0] # "," # words[1] # "," # words[2] # ")"); 
        (bucket, user, postIndex)
    };

    // 存储帖子
    public shared({caller}) func storeFeed(post: PostImmutable): async Bool {
        _storeFeed(post)
    };

    public shared({caller}) func batchStoreFeed(posts: [PostImmutable]): async () {
        for(post in posts.vals()) {
            ignore _storeFeed(post);
        };
    };

    private func _storeFeed(post: PostImmutable): Bool {
        ignore checkPostId(post.postId);
        switch(feedMap.get(post.postId)) {
            case(?_post) {
                Debug.print("This post has been stored");
                return false;
            };
            case(null) {
                feedMap.put(post.postId, post);
                return true;
            };
        };
    };

    // 查询共有多少个帖子

    // 根据ID查询某几个帖子（可以传入 7 个 ID 一次性返回 7 个帖子的内容）

    // 查询最新的 n 个帖子


    // public query({caller}) func getFeed(): async [PostImmutable] {
    //     var ans: [PostImmutable] = [];
    //     for(posts in feedMap.vals()) {
    //         ans := Array.append<PostImmutable>(ans, posts);
    //     };
    //     Array.sort(
    //         ans,
    //         func (x: PostImmutable, y: PostImmutable): Order.Order {
    //             if(x.createdAt > y.createdAt) return #less
    //             else if(x.createdAt < y.createdAt) return #greater
    //             else return #equal
    //         }
    //     )
    // };

};
