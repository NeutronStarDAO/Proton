import Digraph "./digraph";
import Types "./types";
import Database "./database";

actor class User() = this {
    
// Follow Info

    type Vertex = Types.Vertex;

    var graph: Digraph.Digraph = Digraph.Digraph();

    // User A Follow User B
    public shared({caller}) func follow(userA: Vertex, userB: Vertex): async () {
        graph.addEdge(userA, userB);
    };

    public query({caller}) func getFollowingList(user: Vertex): async [Vertex] {
        graph.getForwardAdjacent(user)
    };

    public query({caller}) func getFollowersList(user: Vertex): async [Vertex] {
        graph.getReverseAdjacent(user)
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