import Database "./database";
import Types "./types";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Utils "../utils";

actor class Feed(
    _owner: Principal,
    rootPostCanister: Principal,
    userCanister: Principal,
    _postFetchCanister: Principal,
    _commentFetchCanister: Principal,
    _likeFetchCanister: Principal
) = this {

// owner

    stable var owner = _owner;

    public query func getOwner(): async Principal { owner };

    public shared({caller}) func updateOwner(newOwner: Principal): async () {
        assert(caller == owner);
        owner := newOwner;
    };

    public query({caller}) func whoami(): async Principal { caller };

// PostFetchCanister

    stable var postFetchCanister = _postFetchCanister;
    
    public query func getPostFetchCanister(): async Principal { postFetchCanister };

    public shared({caller}) func updatePostFetchCanister(
        newPostFetchCanister: Principal
    ): async () {
        postFetchCanister := newPostFetchCanister;
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

// Followers
    
    stable var followers: [Principal] = [];

    // 接收 user canister 的更新
    public shared({caller}) func updateFollowers(newFollowers: [Principal]): async () {
        followers := newFollowers;
    };

// Bucket

    type RootPostActor = Types.RootPostActor;
    stable var bucket: ?Principal = null;
    let rootPostActor: RootPostActor = actor(Principal.toText(rootPostCanister));

    // 更新当前 feed 去存储的 bucket canister
    public shared func checkAvailableBucket(): async Bool {
        switch((await rootPostActor.getAvailableBucket())) {
            case(null) { return false; };
            case(?bucketInfo) {
                bucket := ?bucketInfo.canisterId;
                return true;
            };
        };
    };

// Post

    type Time = Types.Time;
    type UserId = Types.UserId;
    type BucketActor = Types.BucketActor;
    type PostFetchActor = Types.PostFetchActor;

    let postDirectory: Database.PostDirectory = Database.PostDirectory();

    // 查询用户发了多少帖子（统计总数）
    public query func getPostNumber(): async Nat {
        postDirectory.getPostNumber()
    };

    // 根据帖子 ID 查询用户发的某个帖子
    public query func getPost(postId: Text): async  ?PostImmutable {
        postDirectory.getPost(postId)
    };

    public query func getAllPost(): async [PostImmutable] {
        postDirectory.getAllPost()
    };

    public shared({caller}) func createPost(title: Text, content: Text): async Bool {
        assert(caller == owner and bucket != null);
        let _bucket = Option.unwrap(bucket);
        let post: PostImmutable = postDirectory.createPost(caller, title, content, Time.now(), _bucket);
        
        // 将帖子内容发送给公共区的 Bucket 
        let bucketActor: BucketActor = actor(Principal.toText(_bucket));
        ignore await bucketActor.storeFeed(post); 

        // 通知 PostFetch 
        let postFetchActor: PostFetchActor = actor(Principal.toText(postFetchCanister));
        ignore postFetchActor.receiveNotify(followers, post.postId);
        true
    };

    public shared({caller}) func createRepost(postId: Text): async Bool {
        switch(postDirectory.createRepost(caller, postId, Time.now())) {
            case(null) { return false; };
            case(?(_bucket, _newRepost)) {
                // 通知 bucket 更新转发信息
                let bucketActor: BucketActor = actor(Principal.toText(_bucket));
                ignore await bucketActor.updatePostRepost(postId, _newRepost);

                // 获取转发者的粉丝
                let userActor: UserActor = actor(Principal.toText(userCanister));
                let _repostUserFollowers = await userActor.getFollowersList(caller);

                // 通知 PostFetch
                let postFetchActor: PostFetchActor = actor(Principal.toText(postFetchCanister));
                ignore postFetchActor.receiveNotify(_repostUserFollowers, postId);
                return true;
            };
        };
    };

    public shared({caller}) func createComment(postId: Text, content: Text): async Bool {
        switch(postDirectory.createComment(caller, postId, content, Time.now())) {
            case(null) { return false; };
            case(?(_bucket, _newComment)) {
                // 通知对应的 bucket 更新评论
                let bucketActor: BucketActor = actor(Principal.toText(_bucket));
                ignore bucketActor.updatePostComment(postId, _newComment);
                return true;
            };
        };
    };

    public shared({caller}) func createLike(postId: Text): async Bool {
        switch(postDirectory.createLike(caller, postId, Time.now())) {
            case(null) { return false; };
            case(?(_bucket, _newLike)) {
                // 通知 bucket 更新点赞信息
                let bucketActor: BucketActor = actor(Principal.toText(_bucket));
                ignore bucketActor.updatePostLike(postId, _newLike);
                return true;
            };
        };

        // await sendFeed();
    };

// Feed
    
    type PostImmutable = Types.PostImmutable;
    type FeedActor = Types.FeedActor;
    type UserActor = Types.UserActor;
    type CommentFetchActor = Types.CommentFetchActor;
    type LikeFetchActor = Types.LikeFetchActor;
    
    let feedDirectory = Database.FeedDirectory();

    // public shared({caller}) func sendFeed(): async () {
    //     assert(caller == owner or caller == Principal.fromActor(this));
    //     let userActor: UserActor = actor(Principal.toText(userCanister));
    //     Debug.print("userCanister : " # Principal.toText(userCanister));
    //     let followersList = await userActor.getFollowersList(owner);
    //     for(user in followersList.vals()) {
    //         let feedActor: FeedActor = actor(Principal.toText(user));
    //         await feedActor.receiveFeed();
    //     };
    //     await postActor.receiveFeed();
    // };

    public shared({caller}) func receiveFeed(postId: Text): async Bool {
        let (_bucket, _, _) = Utils.checkPostId(postId);
        let bucketActor: BucketActor = actor(Principal.toText(_bucket));
        switch((await bucketActor.getPost(postId))) {
            case(null) { return false; };
            case(?_post) {
                feedDirectory.storeFeed(_post);
                return true;
            };
        };
    };

    public shared({caller}) func batchReceiveFeed(postIdArray: [Text]): async () {
        for(_postId in postIdArray.vals()) {
            let (_bucket, _, _) = Utils.checkPostId(_postId);
            let bucketActor: BucketActor = actor(Principal.toText(_bucket));
            switch((await bucketActor.getPost(_postId))) {
                case(null) { };
                case(?_post) {
                    feedDirectory.storeFeed(_post);
                };
            };
        };
    };

    public shared({caller}) func receiveComment(postId: Text): async Bool {
        let (_bucket, _, _) = Utils.checkPostId(postId);
        let bucketActor: BucketActor = actor(Principal.toText(_bucket));
        switch((await bucketActor.getPost(postId))) {
            case(null) { return false; };
            case(?_post) {

                feedDirectory.storeFeed(_post);

                if(Utils._isRepostUser(_post, owner)) {
                    // 如果 follower D 转发过这个帖子，D 的 Feed 在收到新评论通知后，                    
                    let userActor: UserActor = actor(Principal.toText(userCanister));
                    let repostUserFollowers = await userActor.getFollowersList(owner);

                    // 会继续向 Comment Fetch 通知：post15_id 、D 的 followers 。
                    let commentFetchActor: CommentFetchActor = actor(Principal.toText(commentFetchCanister));
                    ignore commentFetchActor.receiveRepostUserNotify(repostUserFollowers, postId);
                };

                return true;
            };
        };
    };

    public shared({caller}) func receiveLike(postId: Text): async Bool {
        let (_bucket, _, _) = Utils.checkPostId(postId);
        let bucketActor: BucketActor = actor(Principal.toText(_bucket));
        switch((await bucketActor.getPost(postId))) {
            case(null) { return false; };
            case(?_post) {

                feedDirectory.storeFeed(_post);

                if(Utils._isRepostUser(_post, owner)) {
                    // 如果 follower D 转发过这个帖子，D 的 Feed 在收到新点赞通知后，                    
                    let userActor: UserActor = actor(Principal.toText(userCanister));
                    let repostUserFollowers = await userActor.getFollowersList(owner);

                    // 会继续向 Like Fetch 通知：post15_id 、D 的 followers 。
                    let likeFetchActor: LikeFetchActor = actor(Principal.toText(likeFetchCanister));
                    ignore likeFetchActor.receiveRepostUserNotify(repostUserFollowers, postId);
                };

                return true;
            };
        };
    };

    public query func getFeedNumber(): async Nat {
        feedDirectory.getFeedNumber()
    };

    public query func getFeed(postId: Text): async ?PostImmutable {
        feedDirectory.getFeed(postId)
    };

    public query func getLatestFeed(n: Nat): async [PostImmutable] {
        feedDirectory.getLatestFeed(n)
    };

}