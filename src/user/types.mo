import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {

    public type Vertex = Principal;
    public type UserId = Principal;
    public type Time = Time.Time;

    public type NewProfile = {
        firstName: Text;
        lastName: Text;
        title: Text;
        company: Text;
        experience: Text;
        education: Text;
        imgUrl: Text;
    };

    public type Profile = {
        id: UserId;
        firstName: Text;
        lastName: Text;
        title: Text;
        company: Text;
        experience: Text;
        education: Text;
        imgUrl: Text;
    };
    

    public type UserActor = actor {
        getFollowersList : shared query (Vertex) -> async [Vertex];
    };
};
