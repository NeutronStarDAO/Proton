export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const UserId = IDL.Principal;
  const Repost = IDL.Record({ 'createdAt' : Time, 'user' : UserId });
  const Like = IDL.Record({ 'createdAt' : Time, 'user' : UserId });
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'createdAt' : Time,
    'user' : UserId,
  });
  const PostId = IDL.Text;
  const PostImmutable = IDL.Record({
    'repost' : IDL.Vec(Repost),
    'title' : IDL.Text,
    'content' : IDL.Text,
    'like' : IDL.Vec(Like),
    'createdAt' : Time,
    'user' : UserId,
    'comment' : IDL.Vec(Comment),
    'index' : IDL.Nat,
    'postId' : PostId,
  });
  const NewComment = IDL.Vec(Comment);
  const NewLike = IDL.Vec(Like);
  const NewRepost = IDL.Vec(Repost);
  const Bucket = IDL.Service({
    'batchStoreFeed' : IDL.Func([IDL.Vec(PostImmutable)], [], []),
    'getCommentFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getLatestFeed' : IDL.Func([IDL.Nat], [IDL.Vec(PostImmutable)], ['query']),
    'getLikeFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getPost' : IDL.Func([IDL.Text], [IDL.Opt(PostImmutable)], ['query']),
    'getPostNumber' : IDL.Func([], [IDL.Nat], ['query']),
    'getPosts' : IDL.Func(
        [IDL.Vec(IDL.Text)],
        [IDL.Vec(PostImmutable)],
        ['query'],
      ),
    'storeFeed' : IDL.Func([PostImmutable], [IDL.Bool], []),
    'updateCommentFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateLikeFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updatePostComment' : IDL.Func([IDL.Text, NewComment], [IDL.Bool], []),
    'updatePostLike' : IDL.Func([IDL.Text, NewLike], [IDL.Bool], []),
    'updatePostRepost' : IDL.Func([IDL.Text, NewRepost], [IDL.Bool], []),
  });
  return Bucket;
};
export const init = ({ IDL }) => {
  return [IDL.Principal, IDL.Principal, IDL.Principal];
};
