export const idlFactory = ({ IDL }) => {
  const PostFetch = IDL.Service({
    'addUserToFeedEntry' : IDL.Func(
        [IDL.Tuple(IDL.Principal, IDL.Principal)],
        [IDL.Bool],
        [],
      ),
    'getNotifyMapEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text)))],
        ['query'],
      ),
    'getUserToFeedEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
        ['query'],
      ),
    'initUserToFeed' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
        [IDL.Bool],
        [],
      ),
    'receiveNotify' : IDL.Func([IDL.Vec(IDL.Principal), IDL.Text], [], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return PostFetch;
};
export const init = ({ IDL }) => { return []; };
