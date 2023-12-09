import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Types "../types";

module {

    public type Vertex = Types.Vertex;
    public type UserId = Principal;
    public type Time = Time.Time;

    public type NewProfile = {
        name: Text;
        biography: Text;
        company: Text;
        education: Text;
        backImgUrl: Text;
        avatarUrl: Text;
        feedCanister: ?Principal;
    };

    public type Profile = {
        id: UserId;
        name: Text;
        biography: Text;
        company: Text;
        education: Text;
        backImgUrl: Text;
        avatarUrl: Text;
        feedCanister: ?Principal;
    };
    
    public type UserActor = Types.UserActor;

    public type RootFeedActor = Types.RootFeedActor;

    public type FeedActor = Types.FeedActor;
    
};
