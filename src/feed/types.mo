import Principal "mo:base/Principal";
import Time "mo:base/Time";
import UserTypes "../user/types";

module {
  public type UserId = Principal;
  public type Time = Time.Time;
  
  public type Post = {
    index: Nat; // Post Index
    user: UserId;
    title: Text;
    content: Text;
    var like: [Like];
    var comment: [Comment];
    var commentIndex: Nat;
    createdAt: Time;
  };

  public type PostImmutable = {
    index: Nat; // Post Index
    user: UserId;
    title: Text;
    content: Text;
    like: [Like];
    comment: [Comment];
    commentIndex: Nat;
    createdAt: Time;
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
      getPosts : () -> async [PostImmutable];
      receiveFeed : shared () -> async ();
      createComment : shared (Principal, Nat, Text) -> async ();
      deleteComment : shared (Principal, Nat, Nat) -> async ();
      createLike : shared (Principal, Nat) -> async ();
      deleteLike : shared (Principal, Nat) -> async ();
  };

  public type UserActor = UserTypes.UserActor;

  public type PostActor = actor {
    receiveFeed : shared () -> async ();
  };

};
