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
        repost: [UserId]; //转发者
        title: Text;
        content: Text;
        var like: [Like];
        var comment: [Comment];
        var commentIndex: Nat;
        createdAt: Time; // 发布时间
    };

    public type PostImmutable = {
        postId: PostId; // 帖子 ID 
        index: Nat; // Post Index
        user: UserId; // 发布者
        repost: [UserId]; //转发者
        title: Text;
        content: Text;
        like: [Like];
        comment: [Comment];
        commentIndex: Nat;
        createdAt: Time; // 发布时间
    };

    public type Comment = {
        index: Nat; // Comment Index
        user: UserId;
        content: Text;
        createdAt: Time;
    };

    public type Like = {
        user: UserId;
        createdAt: Time;
    };

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
    };

// User 

    public type Vertex = Principal;

    public type UserActor = actor {
        getFollowersList : shared query (Vertex) -> async [Vertex];
    };

}