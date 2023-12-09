import Digraph "./digraph";
import Types "./types";
import Database "./database";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor class User() = this {
    
    stable var rootFeedCanister = Principal.fromText("2vxsx-fae");

    public shared({caller}) func init(_rootFeedCanister: Principal) {
        rootFeedCanister := _rootFeedCanister;
    };

    public query func getRootFeedCanister(): async Principal {
        rootFeedCanister
    };

// Follow Info

    type Vertex = Types.Vertex;
    type RootFeedActor = Types.RootFeedActor;
    type FeedActor = Types.FeedActor;

    var graph: Digraph.Digraph = Digraph.Digraph();

    // User caller Follow user
    public shared({caller}) func follow(user: Vertex): async () {
        assert(not Principal.isAnonymous(rootFeedCanister));
        let rootFeedActor: RootFeedActor = actor(Principal.toText(rootFeedCanister));
        for((_, _feedCanister) in (await rootFeedActor.getAllUserFeedCanister()).vals()) {
            let feedActor: FeedActor = actor(Principal.toText(_feedCanister));
            ignore feedActor.updateFollowers(Array.append(
                graph.getReverseAdjacent(user),
                [caller]
            ));
        };
        graph.addEdge(caller, user);
    };

    public query({caller}) func getFollowingList(user: Vertex): async [Vertex] {
        graph.getForwardAdjacent(user)
    };

    public query({caller}) func getFollowersList(user: Vertex): async [Vertex] {
        graph.getReverseAdjacent(user)
    };

    public query({caller}) func getFollowingNumber(user: Vertex): async Nat {
        Array.size<Vertex>(graph.getForwardAdjacent(user))
    };

    public query({caller}) func getFollowerNumber(user: Vertex): async Nat {
        Array.size<Vertex>(graph.getReverseAdjacent(user))
    };

// Profiles
    
    type NewProfile = Types.NewProfile;
    type Profile = Types.Profile;
    type UserId = Types.UserId;

    var directory: Database.Directory = Database.Directory();

    public shared({caller}) func createProfile(profile: NewProfile): async () {
        directory.createOne(caller, profile);
    };

    public shared({caller}) func updateProfile(profile: NewProfile): async () {
        directory.updateOne(caller, profile);
    };

    public query func getProfile(userId: UserId): async ?Profile {
        directory.findOne(userId)
    };

    public query func searchProfile(term: Text): async [Profile] {
        directory.findBy(term)
    };

}