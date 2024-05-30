export const idlFactory = ({ IDL }) => {
  const FetchInitArg = IDL.Record({ 'user_actor' : IDL.Principal });
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
    'index' : IDL.Nat,
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
    'get_notify_map_entries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text)))],
        ['query'],
      ),
    'receive_notify' : IDL.Func([Post], [], []),
    'receive_repost_user_notify' : IDL.Func(
        [IDL.Vec(IDL.Principal), IDL.Text],
        [],
        [],
      ),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
  });
};
export const init = ({ IDL }) => {
  const FetchInitArg = IDL.Record({ 'user_actor' : IDL.Principal });
  return [FetchInitArg];
};
