import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
// Feed

    public type UserId = Principal;
    public type Time = Time.Time;
    public type PostId = Text; // 帖子 ID = BucketCanisterID + UserId + 自增

    public type Post = {
        postId: PostId; // 帖子 ID 
        index: Nat; // Post Index
        user: UserId; // 发布者
        title: Text;
        content: Text;
        var repost: [Repost]; //转发者
        var like: [Like];
        var comment: [Comment];
        createdAt: Time; // 发布时间
    };

    public type PostImmutable = {
        postId: PostId; // 帖子 ID 
        index: Nat; // Post Index
        user: UserId; // 发布者
        title: Text;
        content: Text;
        repost: [Repost]; //转发者
        like: [Like];
        comment: [Comment];
        createdAt: Time; // 发布时间
    };

    public type Comment = {
        user: UserId;
        content: Text;
        createdAt: Time;
    };

    public type NewComment = [Comment];

    public type Like = {
        user: UserId;
        createdAt: Time;
    };

    public type Repost = {
        user: UserId;
        createdAt: Time;
    };

    public type NewRepost = [Repost];

    public type NewLike = [Like];

    public type RootFeedActor = actor {
        getAllUserFeedCanister : shared query () -> async [(Principal, Principal)];
    };

    public type FeedActor = actor {
        getPosts : shared query () -> async [PostImmutable];
        receiveFeed : shared (Text) -> async Bool;
        batchReceiveFeed : shared ([Text]) -> async ();
        batchReceiveComment : shared ([Text]) -> async ();
        batchReceiveLike : shared ([Text]) -> async ();
        createComment : shared (Principal, Nat, Text) -> async ();
        deleteComment : shared (Principal, Nat, Nat) -> async ();
        createLike : shared (Principal, Nat) -> async ();
        deleteLike : shared (Principal, Nat) -> async ();
        updateFollowers : shared ([Principal]) -> async ();
    };

// Post 

    public type RootPostActor = actor {
        getAvailableBucket : shared query () -> async ?Principal;
        getAllBuckets : shared query () -> async [Principal];
        getAllAvailableBuckets : shared query () -> async [Principal];        
        getAllUnavailableBuckets : shared query () -> async [Principal];
        reCreateBucket : shared () -> async ();
    };

// Bucket 

    public type BucketActor = actor {
        storeFeed : shared (PostImmutable) -> async Bool;
        updatePostComment : shared (Text, NewComment) -> async Bool;
        updatePostLike : shared (Text, NewLike) -> async Bool;
        updatePostRepost : shared (Text, NewRepost) -> async Bool;
        getPosts : shared query ([Text]) -> async [PostImmutable];
        getPost : shared query (Text) -> async ?PostImmutable;
    };

// Fetch

    public type RootFetchActor = actor {
        createPostFetchCanister : shared () -> async Principal;
        createCommentFetchCanister : shared () -> async Principal;
        createLikeFetchCanister : shared () -> async Principal;
        getAllPostFetchCanister : shared query () -> async [Principal];
        getAllCommentFetchCanister : shared query () -> async [Principal];
        getAllLikeFetchCanister : shared query () -> async [Principal];
    };

    public type PostFetchActor = actor {
        receiveNotify : shared ([Principal], Text) -> async ();
        addUserToFeedEntry : shared ((Principal, Principal)) -> async Bool;
        initUserToFeed : shared ([(Principal, Principal)]) -> async Bool;
    };

    public type CommentFetchActor = actor {
        receiveNotify : shared (PostImmutable) -> async ();
        receiveRepostUserNotify : shared ([Principal], Text) -> async ();
        addUserToFeedEntry : shared ((Principal, Principal)) -> async Bool;
        initUserToFeed : shared ([(Principal, Principal)]) -> async Bool;
    };
    
    public type LikeFetchActor = actor {
        receiveNotify : shared (PostImmutable) -> async ();
        receiveRepostUserNotify : shared ([Principal], Text) -> async ();
        addUserToFeedEntry : shared ((Principal, Principal)) -> async Bool;
        initUserToFeed : shared ([(Principal, Principal)]) -> async Bool;
    };

// User 

    public type Vertex = Principal;

    public type UserActor = actor {
        getFollowersList : shared query (Vertex) -> async [Vertex];
    };

}