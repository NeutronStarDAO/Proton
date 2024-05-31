./regenerate_candid.sh

dfx deploy user
user=$(dfx canister id user)

dfx deploy root_bucket 
root_bucket=$(dfx canister id root_bucket)

dfx deploy root_feed --argument "(
    record {
      root_bucket = principal \"$root_bucket\";
      user_actor = principal \"$user\";
    },
)"
root_feed=$(dfx canister id root_feed)

dfx deploy root_fetch --argument "(
  record {
    root_feed = principal \"$root_feed\";
    user_actor = principal \"$user\"
  }
)"
root_fetch=$(dfx canister id root_fetch)

dfx deploy post_fetch --argument "(record {root_feed = principal \"$root_feed\"})";
post_fetch=$(dfx canister id post_fetch)

dfx deploy comment_fetch --argument "(
  record {
    root_feed = principal \"$root_feed\";
    user_actor = principal \"$user\"
  }
)"
comment_fetch=$(dfx canister id comment_fetch)

dfx deploy like_fetch --argument "(
  record {
    root_feed = principal \"$root_feed\";
    user_actor = principal \"$user\"
  }
)"
like_fetch=$(dfx canister id like_fetch)

dfx deploy photo_storage
photo_storage=$(dfx canister id photo_storage)

echo "增发 cycles\n"
wallet=$(dfx identity get-wallet)
dfx ledger fabricate-cycles --t 2000 --canister $wallet
dfx wallet balance

echo "给 root_bucket canister 充值 100T cycles\n"
dfx wallet send $root_bucket 100000000000000
echo "查询 root_bucket canister 状态\n"
dfx canister status $root_bucket

echo "给 root_feed canister 充值 100T cycles\n"
dfx wallet send $root_feed 100000000000000
echo "查询 root_feed canister 状态\n"
dfx canister status $root_feed

echo "给 root_fetch canister 充值 100T cycles\n"
dfx wallet send $root_fetch 100000000000000
echo "查询 root_fetch canister 状态\n"
dfx canister status $root_fetch

echo "给 photo_storage canister 充值 10T cycles\n"
dfx wallet send $photo_storage 10000000000000
echo "查询 photo_storage canister 状态\n"
dfx canister status $photo_storage

dfx deploy internet_identity
