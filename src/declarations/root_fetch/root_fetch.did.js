export const idlFactory = ({ IDL }) => {
  const FetchInitArg = IDL.Record({ 'user_actor' : IDL.Principal });
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
    'create_comment_fetch_canister' : IDL.Func([], [IDL.Principal], []),
    'create_like_fetch_canister' : IDL.Func([], [IDL.Principal], []),
    'create_post_fetch_canister' : IDL.Func([], [IDL.Principal], []),
    'get_all_comment_fetch_canister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_all_like_fetch_canister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_all_post_fetch_canister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
  });
};
export const init = ({ IDL }) => {
  const FetchInitArg = IDL.Record({ 'user_actor' : IDL.Principal });
  return [FetchInitArg];
};
