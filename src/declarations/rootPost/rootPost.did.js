export const idlFactory = ({ IDL }) => {
  const BucketInfoImmutable = IDL.Record({
    'index' : IDL.Nat,
    'canisterId' : IDL.Principal,
    'postNumber' : IDL.Nat,
  });
  const RootPost = IDL.Service({
    'checkBucket' : IDL.Func([], [], []),
    'createBucket' : IDL.Func([], [IDL.Principal], []),
    'getAllBuckets' : IDL.Func([], [IDL.Vec(BucketInfoImmutable)], ['query']),
    'getAvailableBucket' : IDL.Func(
        [],
        [IDL.Opt(BucketInfoImmutable)],
        ['query'],
      ),
    'getCommentFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getLikeFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getUnavailableBuckets' : IDL.Func(
        [],
        [IDL.Vec(BucketInfoImmutable)],
        ['query'],
      ),
    'init' : IDL.Func([], [], []),
    'reCreateBucket' : IDL.Func([IDL.Nat], [], []),
    'updateCommentFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateLikeFetchCanister' : IDL.Func([IDL.Principal], [], []),
  });
  return RootPost;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
