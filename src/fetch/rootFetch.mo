import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import PostFetch "./postFetch";
import CommentFetch "./commentFetch";
import LikeFetch "./likeFetch";

actor class RootFetch(
    userCanister: Principal
) = this {

    stable var postFetchCanisterIndex: Nat = 0;
    stable var commentFetchCanisterIndex: Nat = 0;
    stable var likeFetchCanisterIndex: Nat = 0;

    let postFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let commentFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    
    let likeFetchMap = TrieMap.TrieMap<Nat, Principal>(Nat.equal, Hash.hash);    

    public shared({caller}) func createPostFetchCanister(): async Principal {
        let _canister = Principal.fromActor((await PostFetch.PostFetch()));
        postFetchMap.put(postFetchCanisterIndex, _canister);
        postFetchCanisterIndex += 1;
        _canister
    };

    public shared({caller}) func createCommentFetchCanister(): async Principal {
        let _canister = Principal.fromActor((await CommentFetch.CommentFetch(
            userCanister
        )));
        commentFetchMap.put(commentFetchCanisterIndex, _canister);
        commentFetchCanisterIndex += 1;
        _canister
    };

    public shared({caller}) func createLikeFetchCanister(): async Principal {
        let _canister = Principal.fromActor((await LikeFetch.LikeFetch(
            userCanister
        )));
        likeFetchMap.put(likeFetchCanisterIndex, _canister);
        likeFetchCanisterIndex += 1;
        _canister
    };

};