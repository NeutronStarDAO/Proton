export const idlFactory = ({ IDL }) => {
  const WalletTXType = IDL.Variant({ 'Send' : IDL.Null, 'Receive' : IDL.Null });
  const WalletTX = IDL.Record({
    'time' : IDL.Nat64,
    'tx_hash' : IDL.Text,
    'tx_type' : WalletTXType,
    'amount' : IDL.Nat64,
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
  const LogVisibility = IDL.Variant({
    'controllers' : IDL.Null,
    'public' : IDL.Null,
  });
  const DefiniteCanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'reserved_cycles_limit' : IDL.Nat,
    'log_visibility' : LogVisibility,
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
    'ckBTC_balance' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'ckBTC_tx' : IDL.Func([IDL.Principal], [IDL.Vec(WalletTX)], []),
    'create_feed_canister' : IDL.Func([], [IDL.Principal], []),
    'get_account_identifier' : IDL.Func([IDL.Principal], [IDL.Text], ['query']),
    'get_all_feed_canister' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_available_feed_canister_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_feed_canister_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_feed_canister_users_number_entries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat64))],
        ['query'],
      ),
    'get_feed_wasm' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'get_registered_user_number' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_root_bucket' : IDL.Func([], [IDL.Principal], ['query']),
    'get_subaccount' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Nat8)],
        ['query'],
      ),
    'get_user_actor' : IDL.Func([], [IDL.Principal], ['query']),
    'get_user_feed_canister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_user_feed_canister_entries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
        ['query'],
      ),
    'ghost_balance' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'ghost_tx' : IDL.Func([IDL.Principal], [IDL.Vec(WalletTX)], []),
    'icp_balance' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'icp_tx' : IDL.Func([IDL.Principal], [IDL.Vec(WalletTX)], []),
    'icrc1_transfer' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat64],
        [TransferResult],
        [],
      ),
    'init_fetch_actor' : IDL.Func([IDL.Principal], [], []),
    'init_user_feed' : IDL.Func([], [IDL.Principal], []),
    'set_root_bucket' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'set_user_actor' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'token_balance' : IDL.Func([IDL.Principal, IDL.Principal], [IDL.Nat], []),
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
    'transfer_icp_to_acid' : IDL.Func([IDL.Text, IDL.Nat64], [IDL.Nat64], []),
    'update_feed_canister_controller' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'update_feed_wasm' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Nat64],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
