# 停止dfx
dfx stop

# 删除.dfx文件夹
rm -rf .dfx/

# 启动dfx（后台模式并清除状态）
echo "启动网络"
dfx start --background --clean

echo "生成描述接口"
dfx generate

echo "切换到 Default 用户"
dfx identity use default

# 部署 user canister
echo "部署user canister"
dfx deploy user

# 获取 user canister 的 id
user_canister_id=$(dfx canister id user)

echo "部署 rootFetch canister"
dfx deploy rootFetch --argument "(principal \"$user_canister_id\")"
rootFetch_canister_id=$(dfx canister id rootFetch)

echo "部署 postFetch canister"
dfx deploy postFetch 
postFetch_canister_id=$(dfx canister id postFetch)

echo "部署 commentFetch canister"
dfx deploy commentFetch --argument "(principal \"$user_canister_id\")"
commentFetch_canister_id=$(dfx canister id commentFetch)

echo "部署 likeFetch canister"
dfx deploy likeFetch --argument "(principal \"$user_canister_id\")"
likeFetch_canister_id=$(dfx canister id likeFetch)

echo "部署 rootPost canister"
dfx deploy rootPost --argument "(
    principal \"$commentFetch_canister_id\",
    principal \"$likeFetch_canister_id\")"
rootPost_canister_id=$(dfx canister id rootPost)

echo "部署 rootFeed canister"
dfx deploy rootFeed --argument "(
    principal \"$rootPost_canister_id\",
    principal \"$user_canister_id\",
    principal \"$rootFetch_canister_id\",
    principal \"$postFetch_canister_id\",
    principal \"$commentFetch_canister_id\",
    principal \"$likeFetch_canister_id\")"
rootFeed_canister_id=$(dfx canister id rootFeed)



echo "增发 cycles"
wallet=$(dfx identity get-wallet)
dfx ledger fabricate-cycles --t 500 --canister $wallet
dfx wallet balance

# 给 rootFeed canister 充值cycles
echo "给 rootFeed canister 充值 20T cycles"
dfx wallet send $rootFeed_canister_id 20000000000000
echo "查询 rootFeed canister 状态"
dfx canister status $rootFeed_canister_id

# 给 rootPost canister 充值cycles
echo "给 rootPost canister 充值 40T cycles"
dfx wallet send $rootPost_canister_id 40000000000000
echo "查询 rootPost canister 状态"
dfx canister status $rootPost_canister_id