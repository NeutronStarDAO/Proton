import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Types "./types";
import Array "mo:base/Array";
import Timer "mo:base/Timer";
import Iter "mo:base/Iter";

actor class LikeFetch(
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

    public query func getNotifyMapEntries(): async [(Principal, [Text])] {
        Iter.toArray(notifyMap.entries())
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
// userToFeed

    var userToFeed = TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);

    public shared({caller}) func initUserToFeed(_userToFeedArray: [(Principal, Principal)]): async Bool {
        userToFeed := TrieMap.fromEntries(
            _userToFeedArray.vals(),
            Principal.equal,
            Principal.hash
        );
        true
    };

    public shared({caller}) func addUserToFeedEntry(entry: (Principal, Principal)): async Bool {
        switch(userToFeed.get(entry.0)) {
            case(?_feedCanister) { return false; };
            case(null) {
                userToFeed.put(entry.0, entry.1);
                true
            } 
        }
    };

    public query func getUserToFeedEntries(): async [(Principal, Principal)] {
        Iter.toArray(userToFeed.entries())
    };
    
    public query({caller}) func whoami(): async Principal { caller };

// Timer

    type FeedActor = Types.FeedActor;

    func notify(): async () {
        for((_user, _postIdArray) in notifyMap.entries()) {
            switch(userToFeed.get(_user)) {
                case(null) { };
                case(?_feedId) {
                    let feedActor: FeedActor = actor(Principal.toText(_feedId));
                    ignore feedActor.batchReceiveLike(_postIdArray);
                };
            };
        };
    };

    let cycleTimer = Timer.recurringTimer(
        #seconds(2),
        notify
    );
    
};