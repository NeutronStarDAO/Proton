import Principal "mo:base/Principal";
import Types "../types";

module {

  public type PostImmutable = Types.PostImmutable;
  
  public type NewComment = Types.NewComment;
  
  public type NewLike = Types.NewLike;

  public type FeedActor = Types.FeedActor;
  
  public type NewRepost = Types.NewRepost;
  
  public type UserId = Types.UserId;

  public type BucketInfo = {
    index: Nat;
    canisterId: Principal;
    var postNumber: Nat; // 已经存储的帖子数量
  };

  public type BucketInfoImmutable = Types.BucketInfoImmutable;
  
  public type RootPostActor = Types.RootPostActor;

  public type CommentFetchActor = Types.CommentFetchActor;

  public type LikeFetchActor = Types.LikeFetchActor;

};
