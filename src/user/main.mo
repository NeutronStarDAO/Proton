import Digraph "./digraph";
import Types "./types";
import Database "./database";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

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

    stable var vertexListEntries: [Vertex] = [];
    stable var edgeListEntries: [(Vertex, Vertex)] = [];
    var graph: Digraph.Digraph = Digraph.Digraph(vertexListEntries, edgeListEntries);

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

    // is userA follow userB
    public query({caller}) func isFollowed(userA: Vertex, userB: Vertex): async Bool {
        let _followers = graph.getReverseAdjacent(userB);
        for(_follower in _followers.vals()) {
            if(_follower == userA) return true;
        };
        false
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

    stable var directoryMapEntries: [(UserId, Profile)] = [];
    var directory: Database.Directory = Database.Directory(directoryMapEntries);

    public shared({caller}) func createProfile(profile: NewProfile): async () {
        directory.createOne(caller, profile);
    };

    public shared({caller}) func updateProfile(profile: NewProfile): async () {
        directory.updateOne(caller, profile);
    };

    public query func getProfile(userId: UserId): async ?Profile {
        directory.findOne(userId)
    };

    public query func batchGetProfile(userIdArray: [UserId]): async [Profile] {
        var profileBuffer = Buffer.Buffer<Profile>(Array.size(userIdArray));
        for(_user in userIdArray.vals()) {
            switch(directory.findOne(_user)) {
                case(null) { };
                case(?_profile) {
                    profileBuffer.add(_profile);
                };
            };
        };
        Buffer.toArray<Profile>(profileBuffer)
    };

    public query func searchProfile(term: Text): async [Profile] {
        directory.findBy(term)
    };

    system func preupgrade() {
        vertexListEntries := graph.getVertexListEntries();
        edgeListEntries := graph.getEdgeListEntries();
        directoryMapEntries := directory.getHashMapEntries();
    };

    system func postupgrade() {
        vertexListEntries := [];
        edgeListEntries := [];
        directoryMapEntries := [];
    };
}