export const idlFactory = ({ IDL }) => {
  const RootFetch = IDL.Service({
    'createCommentFetchCanister' : IDL.Func([], [IDL.Principal], []),
    'createLikeFetchCanister' : IDL.Func([], [IDL.Principal], []),
    'createPostFetchCanister' : IDL.Func([], [IDL.Principal], []),
    'getAllCommentFetchCanister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getAllLikeFetchCanister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getAllPostFetchCanister' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'init' : IDL.Func([IDL.Principal], [], []),
  });
  return RootFetch;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
