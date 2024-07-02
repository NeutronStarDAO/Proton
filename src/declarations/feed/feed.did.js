export const idlFactory = ({ IDL }) => {
  const FeedInitArg = IDL.Record({
    'post_fetch_actor' : IDL.Principal,
    'owner' : IDL.Principal,
    'root_bucket' : IDL.Principal,
    'user_actor' : IDL.Principal,
  });
  const WalletTXType = IDL.Variant({ 'Send' : IDL.Null, 'Receive' : IDL.Null });
  const WalletTX = IDL.Record({
    'time' : IDL.Nat64,
    'tx_hash' : IDL.Text,
    'tx_type' : WalletTXType,
    'amount' : IDL.Nat64,
  });
  const Like = IDL.Record({ 'user' : IDL.Principal, 'created_at' : IDL.Nat64 });
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'user' : IDL.Principal,
    'created_at' : IDL.Nat64,
  });
  const Post = IDL.Record({
    'repost' : IDL.Vec(Like),
    'post_id' : IDL.Text,
    'photo_url' : IDL.Vec(IDL.Text),
    'content' : IDL.Text,
    'like' : IDL.Vec(Like),
    'user' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'comment' : IDL.Vec(Comment),
    'feed_canister' : IDL.Principal,
    'index' : IDL.Nat64,
  });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransferResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TransferError });
  const CanisterStatusType = IDL.Variant({
    'stopped' : IDL.Null,
    'stopping' : IDL.Null,
    'running' : IDL.Null,
  });
  const DefiniteCanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'reserved_cycles_limit' : IDL.Nat,
    'wasm_memory_limit' : IDL.Nat,
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const QueryStats = IDL.Record({
    'response_payload_bytes_total' : IDL.Nat,
    'num_instructions_total' : IDL.Nat,
    'num_calls_total' : IDL.Nat,
    'request_payload_bytes_total' : IDL.Nat,
  });
  const CanisterStatusResponse = IDL.Record({
    'status' : CanisterStatusType,
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : DefiniteCanisterSettings,
    'query_stats' : QueryStats,
    'idle_cycles_burned_per_day' : IDL.Nat,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'reserved_cycles' : IDL.Nat,
  });
  return IDL.Service({
    'batch_delete_feed' : IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'batch_receive_feed' : IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'check_available_bucket' : IDL.Func([], [IDL.Bool], []),
    'ckBTC_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'ckBTC_tx' : IDL.Func([], [IDL.Vec(WalletTX)], ['query']),
    'create_comment' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'create_like' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'create_post' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [IDL.Text], []),
    'create_repost' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'delete_post' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'get_all_post' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'get_bucket' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'get_feed' : IDL.Func([IDL.Text], [IDL.Opt(Post)], ['query']),
    'get_feed_number' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_latest_feed' : IDL.Func([IDL.Nat64], [IDL.Vec(Post)], ['query']),
    'get_owner' : IDL.Func([], [IDL.Principal], ['query']),
    'get_post' : IDL.Func([IDL.Text], [IDL.Opt(Post)], ['query']),
    'get_post_number' : IDL.Func([], [IDL.Nat64], ['query']),
    'ghost_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'ghost_tx' : IDL.Func([], [IDL.Vec(WalletTX)], ['query']),
    'icp_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'icp_tx' : IDL.Func([], [IDL.Vec(WalletTX)], ['query']),
    'icrc1_transfer' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat64],
        [TransferResult],
        [],
      ),
    'receive_feed' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'token_balance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'topup_by_icp' : IDL.Func([IDL.Nat64], [IDL.Bool], []),
    'transfer_ckBTC' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [TransferResult],
        [],
      ),
    'transfer_ghost' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [TransferResult],
        [],
      ),
    'transfer_icp' : IDL.Func([IDL.Principal, IDL.Nat64], [TransferResult], []),
    'update_owner' : IDL.Func([IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => {
  const FeedInitArg = IDL.Record({
    'post_fetch_actor' : IDL.Principal,
    'owner' : IDL.Principal,
    'root_bucket' : IDL.Principal,
    'user_actor' : IDL.Principal,
  });
  return [FeedInitArg];
};
