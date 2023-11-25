// src/index.js

import { User } from './user.js';
import { RootFeed } from './rootFeed.js';
import { Feed } from './feed.js';
import {
    identityA, 
    identityB, 
    identityC,
    identityD,
    identityE,
    newIdentity
} from './identity.js';
import { RootPost } from './rootPost.js'
import { Bucket } from './bucket.js';

async function init() {
    const rootPost = new RootPost(identityA);
    console.log("初始化 rootPost\n");
    await rootPost.initRootPost();

    console.log("查询当前bucket\n");
    console.log((await rootPost.getAllBuckets()))
}

async function testUserCanister() {
    const _identity = newIdentity();
    const user = new User(_identity);
    await user.createProfile();
    await user.getProfile();
}

async function testFeed() {
    console.log("Test Feed Canister\n");

    // const _identity = newIdentity();
    const _identity = identityE;
    console.log("test identity : ", _identity.getPrincipal().toString(), "\n");

    // 先创建一个 feed canister
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
    console.log("bucket getPost result : ", (await bucket.getPost(postId)), "\n");
}

await init();
await testUserCanister();
await testFeed(); 
