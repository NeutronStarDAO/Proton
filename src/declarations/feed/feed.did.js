export const idlFactory = ({ IDL }) => {
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
    'batch_delete_feed' : IDL.Func([IDL.Principal, IDL.Vec(IDL.Text)], [], []),
    'batch_receive_feed' : IDL.Func([IDL.Principal, IDL.Vec(IDL.Text)], [], []),
    'check_available_bucket' : IDL.Func([], [IDL.Bool], []),
    'create_comment' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'create_like' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'create_post' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [IDL.Text], []),
    'create_repost' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'delete_post' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'get_all_latest_feed' : IDL.Func([IDL.Nat64], [IDL.Vec(Post)], ['query']),
    'get_all_latest_feed_by_length' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_all_post' : IDL.Func([IDL.Principal], [IDL.Vec(Post)], ['query']),
    'get_bucket' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'get_feed_number' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'get_home_feed' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_home_feed_by_length' : IDL.Func(
        [IDL.Principal, IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_latest_feed' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_post' : IDL.Func([IDL.Text], [IDL.Opt(Post)], ['query']),
    'get_post_fetch' : IDL.Func([], [IDL.Principal], ['query']),
    'get_post_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_post_number' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'get_root_bucket' : IDL.Func([], [IDL.Principal], ['query']),
    'get_user_actor' : IDL.Func([], [IDL.Principal], ['query']),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
  });
};
export const init = ({ IDL }) => {
  return [IDL.Principal, IDL.Principal, IDL.Principal];
};
