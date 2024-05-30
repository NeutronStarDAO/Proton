export const idlFactory = ({ IDL }) => {
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
    'add_available_bucket' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'create_bucket' : IDL.Func([], [IDL.Principal], []),
    'get_all_available_bucket' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_all_bucket' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_all_unavailable_bucket' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_availeable_bucket' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'get_bucket_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_bucket_wasm' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'init' : IDL.Func([], [], []),
    're_create_bucket' : IDL.Func([], [], []),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'update_bucket_wasm' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Nat64],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
