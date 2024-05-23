# Proton - A SocialFi DApp

<img src="https://github.com/NeutronStarDAO/Proton/assets/72973293/82b8b9cb-a3b9-4c6d-9cd1-cb536cb451bf" style="width: 70%;" />
<br>

Howdy Y'all - Here is the code for the Constellation Book "[Development DApp](https://neutronstardao.github.io/constellation.github.io/9.DevelopingDApp/2.DesigningDApp.html)".

We gone and built a SocialFi DApp, a DApp like Twitter but with modular data sovereignty based on the Actor model. She's got tutorials and everything to help get ya up to speed.

## Design Philosophy

Truly open Web3 DApp, modular data sovereignty based on the Actor model. 

Each user has their own independent space, under their complete control.

Users can even deploy their own independent Feed canister in code to interact with Proton. (This is cumbersome to do, only suitable for programmer users, they can develop advanced custom features for their canister) This allows the community to create custom advanced features.

No matter whose data, as long as it's posted to a Feed, it is under the complete control of the Feed canister's owner.

## Getting Started
Run：
```shell
./start.sh
```

If'n you wanna try out the demo or get to contributin', mosey on over to the project website and have a looksie. Instructions over yonder'll help get ya started.

## Canister Info

- Frontend Canister : [2f64i-aaaaa-aaaan-qiu4q-cai](https://2f64i-aaaaa-aaaan-qiu4q-cai.icp0.io/)
- User Canister : [j6sa4-jyaaa-aaaan-qgjxq-cai](https://dashboard.internetcomputer.org/canister/j6sa4-jyaaa-aaaan-qgjxq-cai)
- RootPost Canister : [lyksr-aiaaa-aaaan-qgj2q-cai](https://dashboard.internetcomputer.org/canister/lyksr-aiaaa-aaaan-qgj2q-cai)
- RootFeed Canister : [lrjzn-waaaa-aaaan-qgj3a-cai](https://dashboard.internetcomputer.org/canister/lrjzn-waaaa-aaaan-qgj3a-cai)
- RootFetch Canister : [l7luf-nqaaa-aaaan-qgj2a-cai](https://dashboard.internetcomputer.org/canister/l7luf-nqaaa-aaaan-qgj2a-cai)
- PostFetch Canister : [ldpou-2qaaa-aaaan-qgjya-cai](https://dashboard.internetcomputer.org/canister/ldpou-2qaaa-aaaan-qgjya-cai)
- CommentFetch Canister : [lnnd4-baaaa-aaaan-qgjza-cai](https://dashboard.internetcomputer.org/canister/lnnd4-baaaa-aaaan-qgjza-cai)
- LikeFetch Canister : [leoia-xiaaa-aaaan-qgjyq-cai](https://dashboard.internetcomputer.org/canister/leoia-xiaaa-aaaan-qgjyq-cai)

## More Info
Wanna learn more about this here project? Visit [here](https://forum.dfinity.org/t/proton-a-socialfi-dapp-totally-base-on-actor-model/24832) for details on the architecture, roadmap, and more.

We'd be much obliged if y'all would try it out and share feedback. Happy trails!

![2](https://github.com/NeutronStarDAO/Proton/assets/72973293/0092033f-0771-4276-9d28-fee3d5e77706)

# Develop

## Extract Candid
```shell
candid-extractor target/wasm32-unknown-unknown/release/bucket.wasm > bucket/bucket/bucket.did

candid-extractor target/wasm32-unknown-unknown/release/root_bucket.wasm > bucket/root_bucket/root_bucket.did

candid-extractor target/wasm32-unknown-unknown/release/feed.wasm > feed/feed/feed.did

candid-extractor target/wasm32-unknown-unknown/release/root_feed.wasm > feed/root_feed/root_feed.did

candid-extractor target/wasm32-unknown-unknown/release/comment_fetch.wasm > fetch/comment_fetch/comment_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/like_fetch.wasm > fetch/like_fetch/like_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/post_fetch.wasm > fetch/post_fetch/post_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/root_fetch.wasm > fetch/root_fetch/root_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/user.wasm > user/user.did
```
