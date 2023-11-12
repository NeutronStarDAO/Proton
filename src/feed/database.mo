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

module {

  public class PostDirectory() {

    type Post = Types.Post;
    type PostImmutable = Types.PostImmutable;
    type Comment = Types.Comment;
    type UserId = Types.UserId;
    type Time = Types.Time;
    type Like = Types.Like;

    var postIndex: Nat = 0;
    let postMap = TrieMap.TrieMap<Nat, Post>(Nat.equal, Hash.hash);

    // 发帖
    public func createPost(user: UserId, title: Text, content: Text, time: Time) {
      postMap.put(postIndex, {
        index = postIndex;
        user = user;
        title = title;
        content = content;
        var like = [];
        var likeIndex = 0;
        var comment = [];
        var commentIndex = 0;
        createdAt = time;
      });
      postIndex += 1;
    };

    // 删帖
    public func deletePost(postIndex: Nat) {
      postMap.delete(postIndex);
    };

    // 查询所有帖子
    public func getPosts(): [PostImmutable] {
      var ans: [PostImmutable] = [];
      for(post in postMap.vals()) {
        ans := Array.append<PostImmutable>(ans, [{
          index = post.index;
          user = post.user;
          title = post.title;
          content = post.content;
          like = post.like;
          comment = post.comment;
          commentIndex = post.commentIndex;
          createdAt = post.createdAt;
        }]);
      };
      ans
    };

    // 评论
    public func createComment(commentUser: UserId, postIndex: Nat, content: Text, createdAt: Time) {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) {
          post.comment := Array.append(post.comment, [{
            index = post.commentIndex;
            user = commentUser;
            content = content;
            createdAt = createdAt;
          }]);
          post.commentIndex += 1;
        };
      };
    };

    // 删评
    public func deleteComment(commentUser: UserId, postIndex: Nat, commentIndex: Nat) {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) {
          for(comment in post.comment.vals()) {
            if(comment.index == commentIndex) {
              assert(comment.user == commentUser);
              post.comment := Array.filter<Comment>(
                post.comment, 
                func x = x.index != commentIndex 
              );
              return;
            };
          };
        };
      };
    };

    // 查询某个帖子的所有评论
    public func getPostComments(postIndex: Nat): [Comment] {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) { return post.comment;};
      };
      []
    };

    // 点赞
    public func createLike(likeUser: UserId, postIndex: Nat, createdAt: Time) {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) {
          for(like in post.like.vals()) {
            // 已经点赞过
            if(like.user == likeUser) { return;};
          };
          post.like := Array.append<Like>(post.like, [{
            user = likeUser;
            createdAt = createdAt;
          }]);
        };
      }
    };

    // 取点
    public func deleteLike(likeUser: UserId, postIndex: Nat) {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) {
          post.like := Array.filter<Like>(
            post.like, 
            func x = x.user != likeUser 
          );
        };
      }
    };

    // 查询某个帖子的点赞信息
    public func getPostLikes(postIndex: Nat): [Like] {
      switch(postMap.get(postIndex)) {
        case(null) {};
        case(?post) { return post.like;};
      };
      []
    };

  };

};
