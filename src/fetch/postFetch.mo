import Types "./types";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

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

    // 根据算法用 ignore call 分批次通知 followers 的 Feed 。
    // 用 Timers 来处理
};