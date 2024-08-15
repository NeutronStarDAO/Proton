export const idlFactory = ({ IDL }) => {
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
    'create_feed_canister' : IDL.Func([], [IDL.Principal], []),
    'get_all_feed_canister' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_available_feed_canister_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_feed_canister_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_feed_canister_users_number_entries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat64))],
        ['query'],
      ),
    'get_feed_wasm' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'get_root_bucket' : IDL.Func([], [IDL.Principal], ['query']),
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
    'init_fetch_actor' : IDL.Func([IDL.Principal], [], []),
    'init_user_feed' : IDL.Func([], [IDL.Principal], []),
    'set_root_bucket' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'set_user_actor' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
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
