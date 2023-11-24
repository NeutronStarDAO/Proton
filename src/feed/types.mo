import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Types "../types";

module {

  public type Post = Types.Post;

  public type Comment = Types.Comment;
  
  public type NewComment = Types.NewComment;
  
  public type Like = Types.Like;

  public type Repost = Types.Repost; 

  public type NewRepost = Types.NewRepost;

  public type NewLike = Types.NewLike;

  public type RootPostActor = Types.RootPostActor;  

  public type Time = Types.Time;

  public type UserId = Types.UserId;

  public type PostImmutable = Types.PostImmutable;

  public type FeedActor = Types.FeedActor;

  public type UserActor = Types.UserActor;  

  public type BucketActor = Types.BucketActor;

  public type PostFetchActor = Types.PostFetchActor;

  public type CommentFetchActor = Types.CommentFetchActor;

  public type LikeFetchActor = Types.LikeFetchActor;
  
}