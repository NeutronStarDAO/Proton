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
    'like' : IDL.Vec(Like),
    'created_at' : IDL.Nat64,
    'to_index' : IDL.Nat64,
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
  return IDL.Service({
    'get_hot_topic' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))],
        ['query'],
      ),
    'get_topic_number' : IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    'get_topic_post' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Post)],
        ['composite_query'],
      ),
    'receive_post' : IDL.Func([IDL.Vec(IDL.Text), IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
