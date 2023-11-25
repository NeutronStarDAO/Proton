import Types "./types";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";

actor class PostFetch() = this {

    // 内部维护一个通知表：记录每个用户待通知的帖子 ID 有哪些。
    let notifyMap = TrieMap.TrieMap<Principal, [Text]>(Principal.equal, Principal.hash);

    // 接收发帖人的通知：帖子 ID 、发帖人、转发人、followers 、Cycles 。
    public shared({caller}) func receiveNotify(to: [Principal], postId: Text): async () {
        for(_follower in to.vals()) {
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

    public query({caller}) func whoami(): async Principal { caller };

// Timer

    type FeedActor = Types.FeedActor;

    // 根据算法用 ignore call 分批次通知 followers 的 Feed 。
    // 用 Timers 来处理
    func notify(): async () {
        for((_user, _postIdArray) in notifyMap.entries()) {
            switch(userToFeed.get(_user)) {
                case(null) { };
                case(?_feedId) {
                    let feedActor: FeedActor = actor(Principal.toText(_feedId));
                    ignore feedActor.batchReceiveFeed(_postIdArray);
                };
            };
        };
    };

    let cycleTimer = Timer.recurringTimer(
        #seconds(2),
        notify
    );
    
};