export const idlFactory = ({ IDL }) => {
  const Like = IDL.Record({ 'user' : IDL.Principal, 'created_at' : IDL.Nat64 });
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'like' : IDL.Opt(IDL.Vec(Like)),
    'user' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'index' : IDL.Opt(IDL.Nat64),
  });
  const CommentToComment = IDL.Record({
    'content' : IDL.Text,
    'from_user' : IDL.Principal,
    'to_user' : IDL.Principal,
    'like' : IDL.Vec(Like),
    'created_at' : IDL.Nat64,
    'index' : IDL.Nat64,
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
    'comment_index' : IDL.Opt(IDL.Nat64),
    'index' : IDL.Nat64,
    'comment_to_comment' : IDL.Opt(IDL.Vec(CommentToComment)),
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
    'complete_upgrade' : IDL.Func([], [IDL.Bool], []),
    'delete_feed' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'get_latest_feed' : IDL.Func([IDL.Nat64], [IDL.Vec(Post)], ['query']),
    'get_post' : IDL.Func([IDL.Text], [IDL.Opt(Post)], ['query']),
    'get_post_number' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_posts' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Vec(Post)], ['query']),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'store_feed' : IDL.Func([Post], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
