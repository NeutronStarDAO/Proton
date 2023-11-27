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
import Buffer "mo:base/Buffer";
import Utils "../utils";

shared(msg) actor class Bucket(
    rootPostCanister: Principal,
    _commentFetchCanister: Principal,
    _likeFetchCanister: Principal
) = this {
    
    type FeedActor = Types.FeedActor;
    type PostImmutable = Types.PostImmutable;
    type NewComment = Types.NewComment;
    type NewLike = Types.NewLike;
    type NewRepost = Types.NewRepost;
    type CommentFetchActor = Types.CommentFetchActor;
    type LikeFetchActor = Types.LikeFetchActor;
    type RootPostActor = Types.RootPostActor;

    stable let BUCKET_MAX_POST_NUMBER: Nat = 5000; // 每个Bucket可以存储的最大帖子数 (待计算)
    stable let FLOOR_BUCKET_MAX_POST_NUMBER: Nat = BUCKET_MAX_POST_NUMBER - 50;

    stable let installer = msg.caller;

    // postId -> PostImmutable
    let feedMap = TrieMap.TrieMap<Text, PostImmutable>(Text.equal, Text.hash);

    // 存储帖子
    public shared({caller}) func storeFeed(post: PostImmutable): async Bool {
        ignore checkBucketMemory();
        _storeFeed(post);
    };

    public shared({caller}) func batchStoreFeed(posts: [PostImmutable]): async () {
        for(post in posts.vals()) {
            ignore _storeFeed(post);
        };
    };

    public shared({caller}) func updatePostRepost(postId: Text, newRepost: NewRepost): async Bool {
        assert(_updatePostRepost(postId, newRepost));
        true
    };

    // 更新帖子评论信息 
    public shared({caller}) func updatePostComment(postId: Text, newComment: NewComment): async Bool {
        switch(_updatePostComment(postId, newComment)) {
            case(null) { return false; };
            case(?_post) {
                // 通知 commentFetch
                let commentFetchActor: CommentFetchActor = actor(Principal.toText(commentFetchCanister));
                ignore commentFetchActor.receiveNotify(_post);
            };
        };
        true
    };

    public shared({caller}) func updatePostLike(postId: Text, newLike: NewLike): async Bool {
        switch(_updatePostLike(postId, newLike)) {
            case(null) { return false; };
            case(?_post) {
                // 通知 likeFetch
                let likeFetchActor: LikeFetchActor = actor(Principal.toText(likeFetchCanister));
                ignore likeFetchActor.receiveNotify(_post);
            };     
        };
        true
    };

    func checkBucketMemory(): async () {
        if(feedMap.size() > FLOOR_BUCKET_MAX_POST_NUMBER) {
            let rootPostActor: RootPostActor = actor(Principal.toText(rootPostCanister));
            ignore rootPostActor.reCreateBucket();
        }
    };

    private func _updatePostComment(postId: Text, newComment: NewComment): ?PostImmutable {
        switch(feedMap.get(postId)) {
            case(null) { return null; };
            case(?post) {
                let _newPost = {
                    postId = post.postId;
                    index = post.index;
                    user = post.user;
                    repost = post.repost;
                    title = post.title;
                    content = post.content;
                    like = post.like;
                    comment = newComment;
                    createdAt = post.createdAt;
                };
                feedMap.put(postId, _newPost);
                ?_newPost
            };
        };
    };

    private func _updatePostLike(postId: Text, newLike: NewLike): ?PostImmutable {
        switch(feedMap.get(postId)) {
            case(null) { return null; };
            case(?post) {
                let _newPost = {
                    postId = post.postId;
                    index = post.index;
                    user = post.user;
                    repost = post.repost;
                    title = post.title;
                    content = post.content;
                    like = newLike;
                    comment = post.comment;
                    createdAt = post.createdAt;
                };
                feedMap.put(postId, _newPost);
                ?_newPost              
            };
        };
    };

    private func _updatePostRepost(postId: Text, newRepost: NewRepost): Bool {
        switch(feedMap.get(postId)) {
            case(null) { return false; };
            case(?post) {
                feedMap.put(postId, {
                    postId = post.postId;
                    index = post.index;
                    user = post.user;
                    title = post.title;
                    content = post.content;
                    repost = newRepost;
                    like = post.like;
                    comment = post.comment;
                    createdAt = post.createdAt;
                });
                true              
            };
        };
    };

    private func _storeFeed(post: PostImmutable): Bool {
        ignore Utils.checkPostId(post.postId);
        switch(feedMap.get(post.postId)) {
            case(?_post) {
                // Debug.print("This post has been stored");
                return false;
            };
            case(null) {
                feedMap.put(post.postId, post);
                return true;
            };
        };
    };

    // 查询共有多少个帖子
    public query func getPostNumber(): async Nat {
        feedMap.size()
    };

    // 根据ID查询某几个帖子（可以传入 7 个 ID 一次性返回 7 个帖子的内容）
    public query func getPosts(postIdArray: [Text]): async [PostImmutable] {
       let result = Buffer.Buffer<PostImmutable>(postIdArray.size());
       for(postId in postIdArray.vals()) {
        switch(feedMap.get(postId)) {
            case(null) {};
            case(?post) { result.add(post); };
        };
       };
       Buffer.toArray<PostImmutable>(result)
    };

    public query func getPost(postId: Text): async ?PostImmutable {
        switch(feedMap.get(postId)) {
            case(null) { return null; };
            case(?post) { return ?post; }; 
        };
    };

    // 查询最新的 n 个帖子
    public query func getLatestFeed(n: Nat): async [PostImmutable] {
        let feedArray = Iter.toArray(
            Iter.sort<PostImmutable>(
            feedMap.vals(),
            func (x: PostImmutable, y: PostImmutable): Order.Order {
                if(x.createdAt > y.createdAt) return #less
                else if(x.createdAt < y.createdAt) return #greater
                else return #equal
        }));
        if(n <= feedArray.size()) {
            Array.subArray(feedArray, 0, n)
        } else {
            Array.subArray(feedArray, 0, feedArray.size())
        }
    };

// CommentFetchCanister

    stable var commentFetchCanister = _commentFetchCanister;
    
    public query func getCommentFetchCanister(): async Principal { commentFetchCanister };

    public shared({caller}) func updateCommentFetchCanister(
        newCommentFetchCanister: Principal
    ): async () {
        commentFetchCanister := commentFetchCanister;
    };


// LikeFetchCanister

    stable var likeFetchCanister = _likeFetchCanister;
    
    public query func getLikeFetchCanister(): async Principal { likeFetchCanister };

    public shared({caller}) func updateLikeFetchCanister(
        newLikeFetchCanister: Principal
    ): async () {
        likeFetchCanister := newLikeFetchCanister;
    };

};
