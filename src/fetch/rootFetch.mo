import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import PostFetch "./postFetch";
import CommentFetch "./commentFetch";
import LikeFetch "./likeFetch";
import Iter "mo:base/Iter";
import Types "./types";
import Cycles "mo:base/ExperimentalCycles";

actor class RootFetch(
    userCanister: Principal,
) = this {

    type RootFeedActor = Types.RootFeedActor;
    type PostFetchActor = Types.PostFetchActor;
    type CommentFetchActor = Types.CommentFetchActor;
    type LikeFetchActor = Types.LikeFetchActor;

    stable let T_CYCLES = 1_000_000_000_000;
    stable var rootFeedCanister = Principal.fromText("2vxsx-fae");
    stable var postFetchCanisterIndex: Nat = 0;
    stable var commentFetchCanisterIndex: Nat = 0;
    stable var likeFetchCanisterIndex: Nat = 0;

    let postFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let commentFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let likeFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    

    public shared({caller}) func init(
        _rootFeedCanister: Principal,
        _initPostFetchCanister: Principal,
        _initCommentFetchCanister: Principal,
        _initLikeFetchCanister: Principal
    ): async () {
        rootFeedCanister := _rootFeedCanister;

        postFetchMap.put(postFetchCanisterIndex, _initPostFetchCanister);
        commentFetchMap.put(commentFetchCanisterIndex, _initCommentFetchCanister);
        likeFetchMap.put(likeFetchCanisterIndex, _initLikeFetchCanister);

        postFetchCanisterIndex += 1;
        commentFetchCanisterIndex += 1;
        likeFetchCanisterIndex += 1;

        let rootFeedActor: RootFeedActor = actor(Principal.toText(_rootFeedCanister));
        let _postFetchActor: PostFetchActor = actor(Principal.toText(_initPostFetchCanister));
        let _commentFetchActor: CommentFetchActor = actor(Principal.toText(_initCommentFetchCanister));
        let _likeFetchActor: LikeFetchActor = actor(Principal.toText(_initLikeFetchCanister));
        let _allUserFeedCanister = await rootFeedActor.getAllUserFeedCanister();

        assert(await _postFetchActor.initUserToFeed(_allUserFeedCanister));
        assert(await _commentFetchActor.initUserToFeed(_allUserFeedCanister));
        assert(await _likeFetchActor.initUserToFeed(_allUserFeedCanister));
    };

    public shared({caller}) func createPostFetchCanister(): async Principal {
        Cycles.add(4 * T_CYCLES);
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
        Cycles.add(4 * T_CYCLES);
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
        Cycles.add(4 * T_CYCLES);
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