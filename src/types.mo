import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
// Feed

    public type UserId = Principal;
    public type Time = Time.Time;
    public type PostId = Text; // 帖子 ID 是 Bucket Canister ID 加 UserId 加自增

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

    public type FeedActor = actor {
        getPosts : shared query () -> async [PostImmutable];
        receiveFeed : shared () -> async ();
        createComment : shared (Principal, Nat, Text) -> async ();
        deleteComment : shared (Principal, Nat, Nat) -> async ();
        createLike : shared (Principal, Nat) -> async ();
        deleteLike : shared (Principal, Nat) -> async ();
    };

// Post 

    public type BucketInfoImmutable = {
        index: Nat;
        canisterId: Principal;
        postNumber: Nat; // 已经存储的帖子数量
    };

    public type RootPostActor = actor {
        getAvailableBucket : shared query () -> async ?BucketInfoImmutable;
        getAllBuckets : shared query () -> async [BucketInfoImmutable];
        getUnavailableBuckets : shared query () -> async [BucketInfoImmutable];
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
    public type PostFetchActor = actor {
        receiveNotify : shared ([Principal], Text) -> async ();
    };

    public type CommentFetchActor = actor {
        receiveNotify : shared (PostImmutable) -> async ();
        receiveRepostUserNotify : shared ([Principal], Text) -> async ();
    };
    
    public type LikeFetchActor = actor {
        receiveNotify : shared (PostImmutable) -> async ();
        receiveRepostUserNotify : shared ([Principal], Text) -> async ();
    };

// User 

    public type Vertex = Principal;

    public type UserActor = actor {
        getFollowersList : shared query (Vertex) -> async [Vertex];
    };

}