import Types "./types";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Order "mo:base/Order";

actor Post {

    type FeedActor = Types.FeedActor;
    type PostImmutable = Types.PostImmutable;

    let feedMap = TrieMap.TrieMap<Principal, [PostImmutable]>(Principal.equal, Principal.hash);

    public shared({caller}) func receiveFeed(): async () {
        let feedActor: FeedActor = actor(Principal.toText(caller));
        let posts = await feedActor.getPosts();
        feedMap.put(caller, posts);
    };

    public query({caller}) func getFeed(): async [PostImmutable] {
        var ans: [PostImmutable] = [];
        for(posts in feedMap.vals()) {
            ans := Array.append<PostImmutable>(ans, posts);
        };
        Array.sort(
            ans,
            func (x: PostImmutable, y: PostImmutable): Order.Order {
                if(x.createdAt > y.createdAt) return #less
                else if(x.createdAt < y.createdAt) return #greater
                else return #equal
            }
        )
    };

    // public shared({caller}) func createFeedCanister(): async Principal {

    // };

}