import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import PostFetch "./postFetch";
import CommentFetch "./commentFetch";
import LikeFetch "./likeFetch";
import Iter "mo:base/Iter";
import Types "./types";

actor class RootFetch(
    userCanister: Principal
) = this {
    
    type RootFeedActor = Types.RootFeedActor;

    stable var rootFeedCanister = Principal.fromText("2vxsx-fae");
    stable var postFetchCanisterIndex: Nat = 0;
    stable var commentFetchCanisterIndex: Nat = 0;
    stable var likeFetchCanisterIndex: Nat = 0;

    let postFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let commentFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let likeFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    

    public shared({caller}) func init(_rootFeedCanister: Principal): async () {
        rootFeedCanister := _rootFeedCanister;
    };

    public shared({caller}) func createPostFetchCanister(): async Principal {
        let _canister = await PostFetch.PostFetch();
        let _canisterId = Principal.fromActor(_canister);
        postFetchMap.put(postFetchCanisterIndex, _canisterId);
        postFetchCanisterIndex += 1;

        // postFetch : initUserToFeed
        assert(not Principal.isAnonymous(rootFeedCanister));
        let rootFeedActor: RootFeedActor = actor(Principal.toText(rootFeedCanister));
        assert(await _canister.initUserToFeed((await rootFeedActor.getAllUserFeedCanister())));

        _canisterId
    };

    public shared({caller}) func createCommentFetchCanister(): async Principal {
        let _canister = await CommentFetch.CommentFetch(
            userCanister
        );
        let _canisterId = Principal.fromActor(_canister);
        commentFetchMap.put(commentFetchCanisterIndex, _canisterId);
        commentFetchCanisterIndex += 1;

        // initUserToFeed
        assert(not Principal.isAnonymous(rootFeedCanister));
        let rootFeedActor: RootFeedActor = actor(Principal.toText(rootFeedCanister));
        assert(await _canister.initUserToFeed((await rootFeedActor.getAllUserFeedCanister())));

        _canisterId
    };

    public shared({caller}) func createLikeFetchCanister(): async Principal {
        let _canister = await LikeFetch.LikeFetch(
            userCanister
        );
        let _canisterId = Principal.fromActor(_canister);
        likeFetchMap.put(likeFetchCanisterIndex, _canisterId);
        likeFetchCanisterIndex += 1;

        // initUserToFeed
        assert(not Principal.isAnonymous(rootFeedCanister));
        let rootFeedActor: RootFeedActor = actor(Principal.toText(rootFeedCanister));
        assert(await _canister.initUserToFeed((await rootFeedActor.getAllUserFeedCanister())));

        _canisterId
    };

    public query func getAllPostFetchCanister(): async [Principal] {
        Iter.toArray(postFetchMap.vals())
    };

    public query func getAllCommentFetchCanister(): async [Principal] {
        Iter.toArray(commentFetchMap.vals())
    };

    public query func getAllLikeFetchCanister(): async [Principal] {
        Iter.toArray(likeFetchMap.vals())
    };
    
};