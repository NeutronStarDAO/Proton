dfx build --check

candid-extractor target/wasm32-unknown-unknown/release/bucket.wasm > bucket/bucket/bucket.did

candid-extractor target/wasm32-unknown-unknown/release/root_bucket.wasm > bucket/root_bucket/root_bucket.did

candid-extractor target/wasm32-unknown-unknown/release/root_feed.wasm > feed/root_feed/root_feed.did

candid-extractor target/wasm32-unknown-unknown/release/feed.wasm > feed/feed/feed.did

candid-extractor target/wasm32-unknown-unknown/release/post_fetch.wasm > fetch/post_fetch/post_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/root_fetch.wasm > fetch/root_fetch/root_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/user.wasm > user/user.did

candid-extractor target/wasm32-unknown-unknown/release/photo_storage.wasm > storage/photo_storage/photo_storage.did

candid-extractor target/wasm32-unknown-unknown/release/data_analysis.wasm > data_analysis/data_analysis.did

dfx generate