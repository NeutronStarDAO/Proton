import Types "./types";
import IC "mo:ic";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Feed "./feed";
import Iter "mo:base/Iter";

actor class RootFeed(
    rootPostCanister: Principal,
    userCanister: Principal
) = this {

    let userFeedCanisterMap = TrieMap.TrieMap<Principal, Principal>(Principal.equal, Principal.hash);
    let ic: IC.Service = actor("aaaaa-aa");

    // 给用户创建一个用户自己的 Canister
    public shared({caller}) func createFeedCanister(): async ?Principal {
        assert(_getUserFeedCanister(caller) == null);
        let feedCanister = await Feed.Feed(caller, rootPostCanister, userCanister);
        let feedCanisterId = Principal.fromActor(feedCanister);
        userFeedCanisterMap.put(caller, feedCanisterId);
        await ic.update_settings({
            canister_id = feedCanisterId;
            settings = {
                freezing_threshold = null;
                controllers = ?[Principal.fromActor(this), caller, feedCanisterId];
                memory_allocation = null;
                compute_allocation = null;
            }
        });
        ?feedCanisterId
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

}