./regenerate_candid.sh

dfx deploy multi_root_feed
multi_root_feed=$(dfx canister id multi_root_feed)

dfx deploy photo_storage
photo_storage=$(dfx canister id photo_storage)

echo "增发 cycles\n"
wallet=$(dfx identity get-wallet)
dfx ledger fabricate-cycles --t 2000 --canister $wallet
dfx wallet balance

echo "给 multi_root_feed canister 充值 200T cycles\n"
dfx wallet send $multi_root_feed 100000000000000
echo "查询 multi_root_feed canister 状态\n"
dfx canister status $multi_root_feed

echo "给 photo_storage canister 充值 10T cycles\n"
dfx wallet send $photo_storage 10000000000000
echo "查询 photo_storage canister 状态\n"
dfx canister status $photo_storage

dfx deploy internet_identity