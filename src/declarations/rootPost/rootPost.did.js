export const idlFactory = ({ IDL }) => {
  const RootPost = IDL.Service({
    'createBucket' : IDL.Func([], [IDL.Principal], []),
    'getAllAvailableBuckets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getAllBuckets' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getAllUnavailableBuckets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getAvailableBucket' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'getCommentFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getLikeFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'init' : IDL.Func([], [], []),
    'reCreateBucket' : IDL.Func([], [], []),
    'updateCommentFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateLikeFetchCanister' : IDL.Func([IDL.Principal], [], []),
  });
  return RootPost;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
