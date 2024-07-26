export const idlFactory = ({ IDL }) => {
  const Profile = IDL.Record({
    'id' : IDL.Principal,
    'avatar_url' : IDL.Text,
    'name' : IDL.Text,
    'biography' : IDL.Text,
    'website' : IDL.Text,
    'feed_canister' : IDL.Opt(IDL.Principal),
    'handle' : IDL.Text,
    'location' : IDL.Text,
    'back_img_url' : IDL.Text,
  });
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
    'batch_get_profile' : IDL.Func(
        [IDL.Vec(IDL.Principal)],
        [IDL.Vec(Profile)],
        ['query'],
      ),
    'cancle_follow' : IDL.Func([IDL.Principal], [], []),
    'create_profile' : IDL.Func([Profile], [IDL.Bool], []),
    'follow' : IDL.Func([IDL.Principal], [], []),
    'get_follower_number' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'get_followers_list' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_following_list' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_following_number' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'get_profile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], ['query']),
    'is_followed' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'is_handle_available' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'update_handle' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'update_profile' : IDL.Func([Profile], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
