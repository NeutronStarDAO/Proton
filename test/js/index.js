// src/index.js
import { User } from './user.js';
import { RootFeed } from './rootFeed.js';
import { Feed } from './feed.js';
import {
    identityTest,
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
    
    console.log("test postFetch \n");
 
    const identityA = newIdentity();
    const identityB = newIdentity();
    const identityC = newIdentity();
    const identityD = newIdentity();
    const identityE = newIdentity();
 
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
    console.log("User A 的粉丝 : ", (await new User(identityA).getFollowersList(identityA.getPrincipal())).map((value) => {
        return value.toString();
    }));

    console.log("User A 先创建一个帖子 \n");
    const feed = new Feed(feedCanister, identityA);
    const postId = await feed.createPost();
    console.log("user A create post result ", postId, "\n");

    // 暂停三秒
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("检查 User B, C, D, E 的 feedNumber \n");
    assert(await new Feed(userB_FeedCanister, identityB).getFeedNumber(), BigInt(1));
    assert(await new Feed(userC_FeedCanister, identityC).getFeedNumber(), BigInt(1));
    assert(await new Feed(userD_FeedCanister, identityD).getFeedNumber(), BigInt(1));
    assert(await new Feed(userE_FeedCanister, identityE).getFeedNumber(), BigInt(1));

    console.log("User B Feed : ", await new Feed(userB_FeedCanister, identityB).getLatestFeed(2))

}

async function testCommentFetch() {

    console.log("test commentFetch \n");

    const identityA = newIdentity();
    const identityB = newIdentity();
    const identityC = newIdentity();
    const identityD = newIdentity();
    const identityE = newIdentity();

    console.log("User A 创建一个 feed canister\n");

    const userA_FeedCanister = await new RootFeed(identityA).createFeedCanister();
    const userB_FeedCanister = await new RootFeed(identityB).createFeedCanister();
    const userC_FeedCanister = await new RootFeed(identityC).createFeedCanister();
    const userD_FeedCanister = await new RootFeed(identityD).createFeedCanister();
    const userE_FeedCanister = await new RootFeed(identityE).createFeedCanister();
    console.log("User A feed canister : ", userA_FeedCanister.toString(), "\n");
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
    console.log("User A 的粉丝 : ", (await new User(identityA).getFollowersList(identityA.getPrincipal())).map((value) => {
        return value.toString();
    })), "\n";

    console.log("User A 先创建一个帖子 \n");
    const userA_feed = new Feed(userA_FeedCanister, identityA);
    const postId = await userA_feed.createPost();
    console.log("user A create post result ", postId, "\n");

    console.log("User B 去给 User A 的帖子评论 \n");
    const commentResult = await new Feed(userA_FeedCanister, identityB).createComment(postId, "User B Comment");
    assert(commentResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 commentFetch 是否正常工作 \n");
    console.log("评论后的 user B 的 Feed : ", (await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0], "\n");
    console.log("评论后的 user C 的 Feed : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0], "\n");
    console.log("评论后的 user D 的 Feed : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0], "\n");
    console.log("评论后的 user E 的 Feed : ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0], "\n");

}

async function testLikeFetch() {

    console.log("test likeFetch \n");

    const identityA = newIdentity();
    const identityB = newIdentity();
    const identityC = newIdentity();
    const identityD = newIdentity();
    const identityE = newIdentity();

    console.log("User A 创建一个 feed canister\n");

    const userA_FeedCanister = await new RootFeed(identityA).createFeedCanister();
    const userB_FeedCanister = await new RootFeed(identityB).createFeedCanister();
    const userC_FeedCanister = await new RootFeed(identityC).createFeedCanister();
    const userD_FeedCanister = await new RootFeed(identityD).createFeedCanister();
    const userE_FeedCanister = await new RootFeed(identityE).createFeedCanister();
    console.log("User A feed canister : ", userA_FeedCanister.toString(), "\n");
    console.log("User B feed canister : ", userB_FeedCanister.toString(), "\n");
    console.log("User C feed canister : ", userC_FeedCanister.toString(), "\n");
    console.log("User D feed canister : ", userD_FeedCanister.toString(), "\n");
    console.log("User E feed canister : ", userE_FeedCanister.toString(), "\n");

    console.log("User B, C, D, E 去关注 User A \n");
    await new User(identityB).follow(identityA.getPrincipal());
    await new User(identityC).follow(identityA.getPrincipal());
    await new User(identityD).follow(identityA.getPrincipal());
    await new User(identityE).follow(identityA.getPrincipal());

    console.log("User A 的粉丝 : ", (await new User(identityA).getFollowersList(identityA.getPrincipal())).map((value) => {
        return value.toString();
    })), "\n";

    console.log("User A 先创建一个帖子 \n");
    const userA_feed = new Feed(userA_FeedCanister, identityA);
    const postId = await userA_feed.createPost();
    console.log("user A create post result ", postId, "\n");

    console.log("User B 去给 User A 的帖子点赞 \n");
    const likeResult = await new Feed(userA_FeedCanister, identityB).createLike(postId);
    assert(likeResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 likeFetch 是否正常工作 \n");
    console.log("点赞后的 user B 的 Feed : ", (await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0], "\n");
    console.log("点赞后的 user C 的 Feed : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0], "\n");
    console.log("点赞后的 user D 的 Feed : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0], "\n");
    console.log("点赞后的 user E 的 Feed : ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0], "\n");
    
}

async function testRepostFetch() {

    console.log("Test Repost Fetch \n");

    const identityA = newIdentity();
    const identityB = newIdentity();
    const identityC = newIdentity();
    const identityD = newIdentity();
    const identityE = newIdentity();

    const userA_FeedCanister = await new RootFeed(identityA).createFeedCanister();
    const userB_FeedCanister = await new RootFeed(identityB).createFeedCanister();
    const userC_FeedCanister = await new RootFeed(identityC).createFeedCanister();
    const userD_FeedCanister = await new RootFeed(identityD).createFeedCanister();
    const userE_FeedCanister = await new RootFeed(identityE).createFeedCanister();
    console.log("User A feed canister : ", userA_FeedCanister.toString(), "\n");
    console.log("User B feed canister : ", userB_FeedCanister.toString(), "\n");
    console.log("User C feed canister : ", userC_FeedCanister.toString(), "\n");
    console.log("User D feed canister : ", userD_FeedCanister.toString(), "\n");
    console.log("User E feed canister : ", userE_FeedCanister.toString(), "\n");

    console.log("User B 关注 A");
    await new User(identityB).follow(identityA.getPrincipal());
    console.log("User C, D, E 去关注 User B \n");
    await new User(identityC).follow(identityB.getPrincipal());
    await new User(identityD).follow(identityB.getPrincipal());
    await new User(identityE).follow(identityB.getPrincipal());

    console.log("User A 的粉丝 : ", (await new User(identityA).getFollowersList(identityA.getPrincipal())).map((value) => {
        return value.toString();
    })), "\n";

    console.log("User B 的粉丝 : ", (await new User(identityB).getFollowersList(identityB.getPrincipal())).map((value) => {
        return value.toString();
    })), "\n";

    console.log("User A 先创建一个帖子 \n");
    const userA_feed = new Feed(userA_FeedCanister, identityA);
    const postId = await userA_feed.createPost();
    console.log("user A create post result ", postId, "\n");

    console.log("User B 去转发 A 的帖子 \n");
    const repostResult = await new Feed(userA_FeedCanister, identityB).createRepost(postId);
    assert(repostResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 postFetch 是否正常工作 \n");
    console.log("转发后的 user C 的 Feed : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0], "\n");
    console.log("转发后的 user D 的 Feed : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0], "\n");
    console.log("转发后的 user E 的 Feed : ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0], "\n");

    console.log("User B 去给转发过的帖子评论 \n");
    const commentResult = await new Feed(userA_FeedCanister, identityB).createComment(postId, "User B Repost Comment");
    assert(commentResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 commentFetch 是否正常工作 \n");
    console.log("转发后的 user C 的 Feed : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0], "\n");
    console.log("转发后的 user D 的 Feed : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0], "\n");
    console.log("转发后的 user E 的 Feed : ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0], "\n");

    console.log("User B 去给转发过的帖子点赞 \n");
    const likeResult = await new Feed(userA_FeedCanister, identityB).createLike(postId);
    assert(likeResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 likeFetch 是否正常工作 \n");
    console.log("转发后的 user C 的 Feed : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0], "\n");
    console.log("转发后的 user D 的 Feed : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0], "\n");
    console.log("转发后的 user E 的 Feed : ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0], "\n");

    const identityX = newIdentity();

    console.log("User X 去给 A 的帖子评论 \n");
    const x_commentResult = await new Feed(userA_FeedCanister, identityX).createComment(postId, "User X Comment");
    assert(x_commentResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 commentFetch 是否正常工作 \n");
    assert((await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0].comment.length, 2);
    assert((await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0].comment.length, 2);
    console.log("user B Feed Comment: ", (await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0].comment, "\n");
    console.log("user C Feed Comment : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0].comment, "\n");
    console.log("user D Feed Comment : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0].comment, "\n");
    console.log("user E Feed Comment: ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0].comment, "\n");

    console.log("User X 去给  A 的帖子点赞 \n");
    const x_likeResult = await new Feed(userA_FeedCanister, identityX).createLike(postId);
    assert(x_likeResult, true);

    // 暂停5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("查看 likeFetch 是否正常工作 \n");
    assert((await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0].like.length, 2);
    assert((await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0].like.length, 2);
    console.log("user B Feed Like: ", (await new Feed(userB_FeedCanister, identityB).getFeed(postId))[0].like, "\n");
    console.log("user C Feed Like : ", (await new Feed(userC_FeedCanister, identityC).getFeed(postId))[0].like, "\n");
    console.log("user D Feed Like : ", (await new Feed(userD_FeedCanister, identityD).getFeed(postId))[0].like, "\n");
    console.log("user E Feed Like: ", (await new Feed(userE_FeedCanister, identityE).getFeed(postId))[0].like, "\n");

}


await init();
await testUserCanister();
await testFeed();
await testPostFetch();
await testCommentFetch();
await testLikeFetch();
await testRepostFetch();