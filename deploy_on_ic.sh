dfx build --check

dfx deploy --ic user

dfx deploy --ic root_bucket 

dfx deploy --ic root_feed --argument "( principal \"pc5ag-oiaaa-aaaan-qmthq-cai\", principal \"pf4gs-dqaaa-aaaan-qmtha-cai\")"

dfx deploy --ic root_fetch --argument "(
  record {
    root_feed = principal \"n7aoo-5aaaa-aaaan-qmtia-cai\";
    user_actor = principal \"pf4gs-dqaaa-aaaan-qmtha-cai\"
  }
)"

dfx deploy --ic post_fetch --argument "(record {root_feed = principal \"n7aoo-5aaaa-aaaan-qmtia-cai\"})"

dfx deploy --ic photo_storage
