import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Types "./types";

module {
    type Post = Types.Post;
    type PostImmutable = Types.PostImmutable;

    public func checkPostId(postId: Text): (Principal, Principal, Nat) {
        let words = Iter.toArray(Text.split(postId, #char '#'));
        let bucket = Principal.fromText(words[0]);
        let user = Principal.fromText(words[1]);
        let postIndex = Option.unwrap(Nat.fromText(words[2]));
        // Debug.print("(bucket, user, index) : (" # words[0] # "," # words[1] # "," # words[2] # ")"); 
        (bucket, user, postIndex)
    };

    public func _convertPostToImmutable(post: Post): PostImmutable {
      {
        postId = post.postId;
        index = post.index;
        user = post.user;
        repost = post.repost;
        title = post.title;
        content = post.content;
        like = post.like;
        comment = post.comment;
        createdAt = post.createdAt;
      }
    };

    public func _isRepostUser(post: PostImmutable, user: Principal): Bool {
        for(_repostUser in post.repost.vals()) {
            if(_repostUser.user == user) {
                return true;
            };
        };
        false
    };

}
