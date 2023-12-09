export const idlFactory = ({ IDL }) => {
  const RootFeed = IDL.Service({
    'createFeedCanister' : IDL.Func([], [IDL.Opt(IDL.Principal)], []),
    'getAllUserFeedCanister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
        ['query'],
      ),
    'getCommentFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getLikeFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getPostFetchCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'getTotalUserFeedCanisterNumber' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserFeedCanister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'updateCommentFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updateLikeFetchCanister' : IDL.Func([IDL.Principal], [], []),
    'updatePostFetchCanister' : IDL.Func([IDL.Principal], [], []),
  });
  return RootFeed;
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
