# 停止dfx
dfx stop

# 删除.dfx文件夹
rm -rf .dfx/

# 启动dfx（后台模式并清除状态）
echo "启动网络"
dfx start --background --clean

# 部署 user canister
echo "部署user canister"
dfx deploy user

# 获取 user canister 的 id
user_canister_id=$(dfx canister id user)

echo "部署 rootFetch canister"
dfx deploy rootFetch --argument "(principal \"$user_canister_id\")"

# # 部署 post canister
# dfx deploy post

# # 获取 post canister 的 id
# post_canister_id=$(dfx canister id post)

# # 输出 post canister 的 id
# echo "post_canister_id : $post_canister_id"


# # 输出 user canister 的 id
# echo "user_canister_id : $user_canister_id"

# #owner="2vxsx-fae"
# owner=$(dfx identity get-principal)

# dfx deploy feed --argument "(
#     principal \"$owner\", 
#     principal \"$post_canister_id\",
#     principal \"$user_canister_id\",)"
