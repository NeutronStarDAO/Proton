dfx build --check

candid-extractor target/wasm32-unknown-unknown/release/multi_root_feed.wasm > multi_feed/multi_root_feed/multi_root_feed.did

candid-extractor target/wasm32-unknown-unknown/release/multi_feed.wasm > multi_feed/multi_feed/multi_feed.did

candid-extractor target/wasm32-unknown-unknown/release/photo_storage.wasm > storage/photo_storage/photo_storage.did