// src/index.js
import { User } from './user.js';
import { RootFeed } from './rootFeed.js';
import { Feed } from './feed.js';
import {
    identityTest,
    identityA, 
    identityB, 
    identityC,
    identityD,
    identityE,
    newIdentity
} from './identity.js';
import { RootPost } from './rootPost.js'
import { Bucket } from './bucket.js';
import { RootFetch } from './rootFetch.js';
import assert from 'assert';
import { Principal } from "@dfinity/principal";

async function init() {

}

async function testUserCanister() {
    const _identity = newIdentity();
    const user = new User(_identity);
    await user.createProfile();
    await user.getProfile();
}

async function testFeed() {
    console.log("Test Feed Canister\n");

    const _identity = newIdentity();
    console.log("test identity : ", _identity.getPrincipal().toString(), "\n");

    console.log("先创建一个 feed canister\n");
    const rootFeed = new RootFeed(_identity);
    const feedCanister = await rootFeed.createFeedCanister();
    console.log("created feed canister : ", feedCanister.toString(), "\n");

    console.log("test create post \n");
    const feed = new Feed(feedCanister, _identity);
    const postId = await feed.createPost(feedCanister, _identity);
    console.log("create post result ", postId, "\n");

    console.log("检查帖子是否存储到了bucket\n");
    var partsArray = postId.split("#");
    const bucketCanisterId = partsArray[0]
    const bucket = new Bucket(bucketCanisterId, _identity);
    const post_1 = await bucket.getPost(postId);
    console.log("bucket getPost result : ", post_1, "\n");

    console.log("test create comment");
    const commentResult = await feed.createComment(postId, "this is a comment");
    assert(commentResult, true);
    console.log("commentResult : ", commentResult, "\n");
    console.log("检查 bucket 中的 comment 是否更改 \n");
    const post_2 = await bucket.getPost(postId);
    console.log("bucket 评论后的 post : ", post_2, "\n");
    assert(post_2[0].comment[0].content, "this is a comment");
    assert(post_2[0].comment[0].user, _identity.getPrincipal());
    console.log("bucket comment : ", post_2[0].comment, "\n");

    console.log("test create like \n");
    const likeResult = await feed.createLike(postId);
    assert(likeResult, true);
    console.log("likeResult : ", likeResult, "\n");
    console.log("检查 bucket 中的 like 是否更改 \n");
    const post_3 = await bucket.getPost(postId);
    console.log("bucket 点赞后的 post : ", post_3, "\n");
    assert(post_3[0].like[0].user, _identity.getPrincipal());
    console.log("bucket like : ", post_3[0].like, "\n");

    console.log("测试转发 \n");
    const identity_repost = newIdentity();
    console.log("转发者的身份 : ", identity_repost.getPrincipal().toString(), "\n");
    const feed_repost = new Feed(feedCanister, identity_repost);
    const repost_result = await feed_repost.createRepost(postId);
    assert(repost_result, true);
    console.log("repost_result : ", repost_result, "\n");
    console.log("检查 bucket 中的post是否更新 \n");
    const post_4 = await bucket.getPost(postId);
    console.log(" repost 后的 post : ", post_4, "\n");
    assert(post_4[0].repost[0].user, identity_repost.getPrincipal(), "repost assert");
    console.log(" repost : ", post_4[0].repost, "\n");

}

async function testPostFetch() {

    console.log("User A  初始化 Profile \n");
    let userActor = new User(identityA);
    await userActor.createProfile();

    console.log("User A 创建一个 feed canister\n");
    const rootFeed = new RootFeed(identityA);
    const feedCanister = await rootFeed.createFeedCanister();
    const userB_FeedCanister = await new RootFeed(identityB).createFeedCanister();
    const userC_FeedCanister = await new RootFeed(identityC).createFeedCanister();
    const userD_FeedCanister = await new RootFeed(identityD).createFeedCanister();
    const userE_FeedCanister = await new RootFeed(identityE).createFeedCanister();
    console.log("User A feed canister : ", feedCanister.toString(), "\n");
    console.log("User B feed canister : ", userB_FeedCanister.toString(), "\n");
    console.log("User C feed canister : ", userC_FeedCanister.toString(), "\n");
    console.log("User D feed canister : ", userD_FeedCanister.toString(), "\n");
    console.log("User E feed canister : ", userE_FeedCanister.toString(), "\n");

    console.log("User B, C, D, E 去关注 User A \n");
    await new User(identityB).follow(identityA.getPrincipal());
    await new User(identityC).follow(identityA.getPrincipal());
    await new User(identityD).follow(identityA.getPrincipal());
    await new User(identityE).follow(identityA.getPrincipal());

    // console.log((await userActor.getFollowersList(identityA.getPrincipal())));
    console.log("User A 的粉丝 : ", (await userActor.getFollowersList(identityA.getPrincipal())).map((value) => {
        return value.toString();
    }));

    console.log("User A 先创建一个帖子 \n");
    const feed = new Feed(feedCanister, identityA);
    const postId = await feed.createPost(feedCanister, identityA);
    console.log("user A create post result ", postId, "\n");

    // 暂停三秒
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("检查 User B, C, D, E 的 feedNumber \n");
    assert(await new Feed(userB_FeedCanister, identityB).getFeedNumber(), BigInt(1));
    assert(await new Feed(userC_FeedCanister, identityC).getFeedNumber(), BigInt(1));
    assert(await new Feed(userD_FeedCanister, identityD).getFeedNumber(), BigInt(1));
    assert(await new Feed(userE_FeedCanister, identityE).getFeedNumber(), BigInt(1));

}

await init();
await testUserCanister();
await testFeed();
await testPostFetch();
