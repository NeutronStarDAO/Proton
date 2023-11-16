import {test; suite; expect} "mo:test";
import {test = asyncTest; suite = asyncSuite} "mo:test/async";
import Principal "mo:base/Principal";
import Post "../src/post/main";
import User "../src/user/main";
import Feed "../src/feed/main";
import Debug "mo:base/Debug";

let userActor = await User.User();
let userActorId = Principal.fromActor(userActor);
Debug.print("userActor : " # Principal.toText(userActorId));

let postActor = await Post.Post(Principal.fromActor(userActor));
let postActorId = Principal.fromActor(postActor);
Debug.print("postActor : " # Principal.toText(Principal.fromActor(postActor)));

// async suite("feed canister test suite", func() : async () {
//     let user = await User.User();

// });

await asyncSuite("curd post test suite", func() : async () {
    let feedActor = await Feed.Feed(
        Principal.fromText("wo5qg-ysjiq-5da"),
        postActorId,
        userActorId
    );
    Debug.print("feedActor : " # Principal.toText(Principal.fromActor(feedActor)));

    await asyncTest("whoami test", func() : async () {
        let caller = await feedActor.whoami();
        Debug.print("test identity : " # Principal.toText(caller));
    });


    await asyncTest("create post test", func() : async () {
        let result = await feedActor.createPost(
            "title",
            "content"
        );
        // let posts = await feedActor.getPosts();

    });
});

// test("simple test", func() {
//     assert true;
// });

// test("test my number", func() {
//     assert 1 > 0;
// });

// async test("test createPost", func() : async() {
//     // let 
//     // let 
// });