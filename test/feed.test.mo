import {test; suite; expect} "mo:test";
import {test = asyncTest; suite = asyncSuite} "mo:test/async";
import Principal "mo:base/Principal";
import Post "../src/post/main";
import User "../src/user/main";
import Feed "../src/feed/main";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

let testUser = Principal.fromText("wo5qg-ysjiq-5da");

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
        testUser,
        postActorId,
        userActorId
    );
    Debug.print("feedActor : " # Principal.toText(Principal.fromActor(feedActor)));

    await asyncTest("whoami test", func() : async () {
        let caller = await feedActor.whoami();
        Debug.print("test identity : " # Principal.toText(caller));
    });

    await asyncTest("create post test", func(): async () {
        let index = await feedActor.createPost(
            "title",
            "content"
        );
        Debug.print("create post index : " # Nat.toText(index));
        let result = await feedActor.getPost(index);
        assert(result != null);
        assert(Option.unwrap(result).index == index);
    });

    await asyncTest("delete post test", func() : async () {
        let index = await feedActor.createPost(
            "title",
            "content"
        );
        Debug.print("create post index : " # Nat.toText(index));
        assert((await feedActor.getPost(index)) != null);
        Debug.print("delete post index 1");
        let result = await feedActor.deletePost(index);
        assert(result == ());
        assert(Array.size((await feedActor.getPosts())) == 1);
    });

    await asyncTest("create comment test", func(): async () {
        Debug.print("user: " # Principal.toText(testUser) # "Comment on post index: 0");
        switch(await feedActor.createComment(
            testUser, 0, "comment"
        )) {
            case(null) { assert(false); };
            case(?index) {
                Debug.print("comment index : " # Nat.toText(index));
                assert(index == 0);
            };
        }
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