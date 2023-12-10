import Types "./types";
import IC "mo:ic";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Feed "./feed";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";

actor class RootFeed(
    rootPostCanister: Principal,
    userCanister: Principal,
    rootFetchCanister: Principal,
    _postFetchCanister: Principal,
    _commentFetchCanister: Principal,
    _likeFetchCanister: Principal
) = this {
    
    type RootFetchActor = Types.RootFetchActor;
    type PostFetchActor = Types.PostFetchActor;
    type CommentFetchActor = Types.CommentFetchActor;
    type LikeFetchActor = Types.LikeFetchActor;

    stable let T_CYCLES = 1_000_000_000_000;
    let userFeedCanisterMap = TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);
    let ic: IC.Service = actor("aaaaa-aa");

    // 给用户创建一个用户自己的 Canister
    public shared({caller}) func createFeedCanister(): async ?Principal {
        assert(_getUserFeedCanister(caller) == null);
        Cycles.add(2 * T_CYCLES);
        let feedCanister = await Feed.Feed(
            caller, rootPostCanister, userCanister, 
            postFetchCanister,
            commentFetchCanister,
            likeFetchCanister
        );
        let feedCanisterId = Principal.fromActor(feedCanister);
        userFeedCanisterMap.put(caller, feedCanisterId);
        await ic.update_settings({
            canister_id = feedCanisterId;
            settings = {
                freezing_threshold = null;
                // controllers = ?[Principal.fromActor(this), caller, feedCanisterId];
                controllers = ?[Principal.fromActor(this), feedCanisterId];
                memory_allocation = null;
                compute_allocation = null;
            }
        });
        
        // 更新 fetch 中的信息
        ignore updateFetchUserToFeed((caller, feedCanisterId));
        
        ?feedCanisterId
    };

    func updateFetchUserToFeed(entry: (Principal, Principal)): async () {
        let rootFetchActor: RootFetchActor = actor(Principal.toText(rootFetchCanister));

        // 更新 postFetch 中的信息
        let postFetchCanisterArray = await rootFetchActor.getAllPostFetchCanister();
        for(_canister in postFetchCanisterArray.vals()) {
            let postFetchActor: PostFetchActor = actor(Principal.toText(_canister));
            ignore postFetchActor.addUserToFeedEntry(entry);
        };

        // 更新 commentFetch
        let commentFetchCanisterArray = await rootFetchActor.getAllCommentFetchCanister();
        for(_canister in commentFetchCanisterArray.vals()) {
            let commentFetchActor: CommentFetchActor = actor(Principal.toText(_canister));
            ignore commentFetchActor.addUserToFeedEntry(entry);
        };

        // 更新 likeFetch
        let likeFetchCanisterArray = await rootFetchActor.getAllLikeFetchCanister();
        for(_canister in likeFetchCanisterArray.vals()) {
            let likeFetchActor: LikeFetchActor = actor(Principal.toText(_canister));
            ignore likeFetchActor.addUserToFeedEntry(entry);
        };

    };

    public query func getUserFeedCanister(user: Principal): async ?Principal {
        _getUserFeedCanister(user)
    };

    // return [(user, feedCanister)]
    public query func getAllUserFeedCanister(): async [(Principal, Principal)] {
        Iter.toArray(userFeedCanisterMap.entries())
    };

    // 总共创建了多少个 Canister
    public query func getTotalUserFeedCanisterNumber(): async Nat {
        userFeedCanisterMap.size()
    };

    private func _getUserFeedCanister(user: Principal): ?Principal {
        switch(userFeedCanisterMap.get(user)) {
            case(null) { return null;};
            case(?canister) { return ?canister;};
        };
    };

// PostFetchCanister

    stable var postFetchCanister = _postFetchCanister;
    
    public query func getPostFetchCanister(): async Principal { postFetchCanister };

    public shared({caller}) func updatePostFetchCanister(
        newPostFetchCanister: Principal
    ): async () {
        postFetchCanister := newPostFetchCanister;
    };

// CommentFetchCanister

    stable var commentFetchCanister = _commentFetchCanister;
    
    public query func getCommentFetchCanister(): async Principal { commentFetchCanister };

    public shared({caller}) func updateCommentFetchCanister(
        newCommentFetchCanister: Principal
    ): async () {
        commentFetchCanister := commentFetchCanister;
    };

// LikeFetchCanister

    stable var likeFetchCanister = _likeFetchCanister;
    
    public query func getLikeFetchCanister(): async Principal { likeFetchCanister };

    public shared({caller}) func updateLikeFetchCanister(
        newLikeFetchCanister: Principal
    ): async () {
        likeFetchCanister := newLikeFetchCanister;
    };

}