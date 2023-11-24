import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Types "./types";
import Array "mo:base/Array";

actor class CommentFetch(
    userCanister: Principal
) = this {
    
    type UserActor = Types.UserActor;
    type PostImmutable = Types.PostImmutable;

    let notifyMap = TrieMap.TrieMap<Principal, [Text]>(Principal.equal, Principal.hash);
    
    public shared({caller}) func receiveNotify(post: PostImmutable): async () {
        // 查到这个帖子的主用户的 followers
        let userActor: UserActor = actor(Principal.toText(userCanister));
        let postUserFollowers = await userActor.getFollowersList(post.user);

        _storeNotify(postUserFollowers, post.postId);
    };

    public shared({caller}) func receiveRepostUserNotify(to: [Principal], postId: Text): async () {
        _storeNotify(to, postId);
    };

    private func _storeNotify(followerArray: [Principal], postId: Text) {
        for(_follower in followerArray.vals()) {
            switch(notifyMap.get(_follower)) {
                case(null) {
                    notifyMap.put(_follower, [postId]);
                };
                case(?_postIdArray) {
                    let _newPostIdArray = Array.append(_postIdArray, [postId]);
                    notifyMap.put(_follower, _newPostIdArray);
                };
            };
        };
    };
    
};