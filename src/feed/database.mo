import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Types "./types";
import TrieMap "mo:base/TrieMap";
import TrieSet "mo:base/TrieSet";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import utils "../utils";
import Text "mo:base/Text";
import Order "mo:base/Order";
import Utils "../utils";

module {
  type Post = Types.Post;
  public class PostDirectory(
    postIndexEntries: Nat,
    postMapEntries: [(Nat, Post)]
  ) {

    type Post = Types.Post;
    type PostImmutable = Types.PostImmutable;
    type Comment = Types.Comment;
    type NewComment = Types.NewComment;
    type UserId = Types.UserId;
    type Time = Types.Time;
    type Like = Types.Like;
    type NewLike = Types.NewLike;
    type Repost = Types.Repost;
    type NewRepost = Types.NewRepost;

    var postIndex: Nat = postIndexEntries;
    let postMap = TrieMap.fromEntries<Nat, Post>(postMapEntries.vals(), Nat.equal, Hash.hash); // postIndex -> Post

    public func getPostIndexEntries(): Nat { postIndex };

    public func getPostMapEntries(): [(Nat, Post)] { Iter.toArray(postMap.entries()) };

    private func _getPostId(bucket: Principal, user: Principal, index: Nat): Text {
      Principal.toText(bucket) # "#" # Principal.toText(user) # "#" # Nat.toText(index)
    };

    // 发帖
    public func createPost(user: UserId, feedCanister: Principal, content: Text, time: Time, bucket: Principal): PostImmutable {
      let post: Post = {
        postId = _getPostId(bucket, user, postIndex);
        feedCanister = feedCanister;
        index = postIndex;
        user = user;
        content = content;
        var repost = [];
        var like = [];
        var comment = [];
        createdAt = time;
      };

      postMap.put(postIndex, post);
      postIndex += 1;

      Utils._convertPostToImmutable(post)
    };

    public func getPostNumber(): Nat {
      postMap.size()
    };

    public func getPost(postId: Text): ?PostImmutable {
      let (bucket, user, index) = utils.checkPostId(postId);
      switch(postMap.get(index)) {
        case(null) { return null; };
        case(?post) {
          return ?{
            postId = post.postId;
            feedCanister = post.feedCanister;
            index = post.index;
            user = post.user;
            repost = post.repost;
            content = post.content;
            like = post.like;
            comment = post.comment;
            createdAt = post.createdAt;
          }
        };
      };
    };

    // 评论
    public func createComment(commentUser: UserId, postId: Text, content: Text, createdAt: Time): ?(Principal, NewComment) {
      let (bucket, user, index) = utils.checkPostId(postId);
      switch(postMap.get(index)) {
        case(null) { return null;};
        case(?post) {
          post.comment := Array.append(post.comment, [{
            user = commentUser;
            content = content;
            createdAt = createdAt;
          }]);
          ?(bucket, post.comment)
        };
      };
    };

    // 点赞
    public func createLike(likeUser: UserId, postId: Text, createdAt: Time): ?(Principal, NewLike) {
      let (bucket, user, index) = utils.checkPostId(postId);
      switch(postMap.get(index)) {
        case(null) { return null; };
        case(?post) {
          for(like in post.like.vals()) {
            // 已经点赞过
            if(like.user == likeUser) { return null;};
          };
          post.like := Array.append<Like>(post.like, [{
            user = likeUser;
            createdAt = createdAt;
          }]);
          ?(bucket, post.like)
        };
      }
    };

    // 转发
    public func createRepost(repostUser: UserId, postId: Text, createdAt: Time): ?(Principal, NewRepost) {
      let (bucket, user, index) = utils.checkPostId(postId);
      switch(postMap.get(index)) {
        case(null) { return null; };
        case(?post) {
          for(repost in post.repost.vals()) {
            // 已经转发过
            if(repost.user == repostUser) { return null;};
          };
          post.repost := Array.append<Repost>(post.repost, [{
            user = repostUser;
            createdAt = createdAt;
          }]);
          ?(bucket, post.repost)
        };
      }
    };

    public func getAllPost(): [PostImmutable] {
      Iter.toArray(
        Iter.sort<PostImmutable>(
          TrieMap.map<Nat, Post, PostImmutable>(
            postMap, Nat.equal, Hash.hash,
            func (k: Nat, v1: Post): PostImmutable {
              Utils._convertPostToImmutable(v1)
            }
          ).vals(),
          func (x: PostImmutable, y: PostImmutable): Order.Order {
              if(x.createdAt > y.createdAt) return #less
              else if(x.createdAt < y.createdAt) return #greater
              else return #equal
          }))
    };

  };
  
  type PostImmutable = Types.PostImmutable;

  public class FeedDirectory(
    feedMapEntries: [(Text, PostImmutable)]
  ) {
    
    type PostImmutable = Types.PostImmutable;

    let feedMap = TrieMap.fromEntries<Text, PostImmutable>(feedMapEntries.vals(), Text.equal, Text.hash);

    public func getFeedMapEntries(): [(Text, PostImmutable)] { Iter.toArray(feedMap.entries()) };

    public func storeFeed(post: PostImmutable) {
      feedMap.put(post.postId, post);
    };

    public func batchStoreFeed(postArray: [PostImmutable]) {
      for(_post in postArray.vals()) {
        feedMap.put(_post.postId, _post);
      };
    };

    public func getFeedNumber(): Nat {
      feedMap.size()
    };

    public func getFeed(postId: Text): ?PostImmutable {
      switch(feedMap.get(postId)) {
        case(null) { return null; };
        case(?_feed) { return ?_feed; };
      };
    };

    public func getLatestFeed(n: Nat): [PostImmutable] {
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

  };
};
