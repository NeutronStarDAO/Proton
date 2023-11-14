import FeedTypes "../feed/types";

module {

  public type PostImmutable = FeedTypes.PostImmutable;
  
  public type FeedActor = FeedTypes.FeedActor;
  
  public type UserId = FeedTypes.UserId;

  public type PostActor = actor {
    receiveFeed : shared () -> async ();
  };
  
};
