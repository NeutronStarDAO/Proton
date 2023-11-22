import Types "./types";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Option "mo:base/Option";
import Feed "../feed/feed";
import IC "mo:ic";
import Prelude "mo:base/Prelude";

actor class Post(
    userCanister: Principal
) = this {
    
// Feed

//     type FeedActor = Types.FeedActor;
//     type PostImmutable = Types.PostImmutable;

//     let feedMap = TrieMap.TrieMap<Principal, [PostImmutable]>(Principal.equal, Principal.hash);

//     public shared({caller}) func receiveFeed(): async () {
//         let feedActor: FeedActor = actor(Principal.toText(caller));
//         let posts = await feedActor.getPosts();
//         feedMap.put(caller, posts);
//     };

//     public query({caller}) func getFeed(): async [PostImmutable] {
//         var ans: [PostImmutable] = [];
//         for(posts in feedMap.vals()) {
//             ans := Array.append<PostImmutable>(ans, posts);
//         };
//         Array.sort(
//             ans,
//             func (x: PostImmutable, y: PostImmutable): Order.Order {
//                 if(x.createdAt > y.createdAt) return #less
//                 else if(x.createdAt < y.createdAt) return #greater
//                 else return #equal
//             }
//         )
//     };

// // Comment

//     type UserId = Types.UserId;

//     public shared({caller}) func createComment(postUser: UserId, postIndex: Nat, content: Text): async () {
//         switch(_getUserFeedCanister(postUser)) {
//             case(null) {};
//             case(?canisterId) {
//                 let feedActor: FeedActor = actor(Principal.toText(canisterId));
//                 await feedActor.createComment(caller, postIndex, content);
//             };
//         };
//     };

//     public shared({caller}) func deleteComment(postUser: UserId, postIndex: Nat, commentIndex: Nat): async () {
//         switch(_getUserFeedCanister(postUser)) {
//             case(null) {};
//             case(?canisterId) {
//                 let feedActor: FeedActor = actor(Principal.toText(canisterId));
//                 await feedActor.deleteComment(caller, postIndex, commentIndex);
//             };
//         };
//     };

// // Like 

//     public shared({caller}) func createLike(postUser: Principal, postIndex: Nat): async () {
//         switch(_getUserFeedCanister(postUser)) {
//             case(null) {};
//             case(?canisterId) {
//                 let feedActor: FeedActor = actor(Principal.toText(canisterId));
//                 await feedActor.createLike(caller, postIndex);
//             };
//         };
//     };

//     public shared({caller}) func deleteLike(postUser: Principal, postIndex: Nat): async () {
//         switch(_getUserFeedCanister(postUser)) {
//             case(null) {};
//             case(?canisterId) {
//                 let feedActor: FeedActor = actor(Principal.toText(canisterId));
//                 await feedActor.deleteLike(caller, postIndex);
//             };
//         };
//     };

}