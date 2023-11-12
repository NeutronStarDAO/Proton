import Database "./database";
import Types "./types";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Time "mo:base/Time";

actor class Feed(
    _owner: Principal,
    postCanister: Principal,
    userCanister: Principal
) = this {

    stable var owner = _owner;

    public query func getOwner(): async Principal { owner };

    public shared({caller}) func updateOwner(newOwner: Principal): async () {
        assert(caller == owner);
        owner := newOwner;
    };

// Post

    type Time = Types.Time;
    type UserId = Types.UserId;

    let postDirectory: Database.PostDirectory = Database.PostDirectory();

    public shared({caller}) func createPost(title: Text, content: Text): async () {
        assert(caller == owner);
        postDirectory.createPost(caller, title, content, Time.now());
    };

    public shared({caller}) func deletePost(postIndex: Nat): async () {
        assert(caller == owner);
        postDirectory.deletePost(postIndex);
    };

    public query func getPosts(): async [PostImmutable] {
        postDirectory.getPosts()
    };

    public shared({caller}) func createComment(commentUser: UserId, postIndex: Nat, content: Text): async () {
        assert(caller == postCanister);
        postDirectory.createComment(commentUser, postIndex, content, Time.now());
    };

    public shared({caller}) func deleteComment(commentUser: UserId, postIndex: Nat, commentIndex: Nat): async () {
        assert(caller == postCanister);
        postDirectory.deleteComment(commentUser, postIndex, commentIndex);
    };

    public shared({caller}) func createLike(likeUser: UserId, postIndex: Nat): async () {
        assert(caller == postCanister);
        postDirectory.createLike(likeUser, postIndex, Time.now());
    };

    public shared({caller}) func deleteLike(likeUser: UserId, postIndex: Nat) {
        assert(caller == postCanister);
        postDirectory.deleteLike(likeUser, postIndex);
    };    

// Feed
    
    type PostImmutable = Types.PostImmutable;
    type FeedActor = Types.FeedActor;
    type UserActor = Types.UserActor;

    let feedMap = TrieMap.TrieMap<Principal, [PostImmutable]>(Principal.equal, Principal.hash);

    public shared({caller}) func sendFeed(): async () {
        let userActor: UserActor = actor(Principal.toText(userCanister));
        let followersList = await userActor.getFollowersList(owner);
        for(user in followersList.vals()) {
            let feedActor: FeedActor = actor(Principal.toText(user));
            ignore feedActor.receiveFeed();
        };
    };

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

    public query({caller}) func whoami(): async Principal { caller };
}