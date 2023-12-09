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
  const Feed = IDL.Service({
    'batchReceiveComment' : IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'batchReceiveFeed' : IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'batchReceiveLike' : IDL.Func([IDL.Vec(IDL.Text)], [], []),
    'checkAvailableBucket' : IDL.Func([], [IDL.Bool], []),
    'createComment' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'createLike' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'createPost' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'createRepost' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getAllPost' : IDL.Func([], [IDL.Vec(PostImmutable)], ['query']),
    'getCommentFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getFeed' : IDL.Func([IDL.Text], [IDL.Opt(PostImmutable)], ['query']),
    'getFeedNumber' : IDL.Func([], [IDL.Nat], ['query']),
    'getFollowers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getLatestFeed' : IDL.Func([IDL.Nat], [IDL.Vec(PostImmutable)], ['query']),
    'getLikeFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getOwner' : IDL.Func([], [IDL.Principal], ['query']),
    'getPost' : IDL.Func([IDL.Text], [IDL.Opt(PostImmutable)], ['query']),
    'getPostFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getPostNumber' : IDL.Func([], [IDL.Nat], ['query']),
    'getbucket' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'receiveComment' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'receiveFeed' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'receiveLike' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'updateCommentFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateFollowers' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'updateLikeFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateOwner' : IDL.Func([IDL.Principal], [], []),
    'updatePostFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return Feed;
};
export const init = ({ IDL }) => {
  return [
    IDL.Principal,
    IDL.Principal,
    IDL.Principal,
    IDL.Principal,
    IDL.Principal,
    IDL.Principal,
  ];
};
