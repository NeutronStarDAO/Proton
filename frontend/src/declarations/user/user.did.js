export const idlFactory = ({ IDL }) => {
  const UserId__1 = IDL.Principal;
  const UserId = IDL.Principal;
  const Profile = IDL.Record({
    'id' : UserId,
    'backImgUrl' : IDL.Text,
    'name' : IDL.Text,
    'education' : IDL.Text,
    'biography' : IDL.Text,
    'company' : IDL.Text,
    'avatarUrl' : IDL.Text,
    'feedCanister' : IDL.Opt(IDL.Principal),
  });
  const NewProfile = IDL.Record({
    'backImgUrl' : IDL.Text,
    'name' : IDL.Text,
    'education' : IDL.Text,
    'biography' : IDL.Text,
    'company' : IDL.Text,
    'avatarUrl' : IDL.Text,
    'feedCanister' : IDL.Opt(IDL.Principal),
  });
  const Vertex = IDL.Principal;
  const User = IDL.Service({
    'batchGetProfile' : IDL.Func(
        [IDL.Vec(UserId__1)],
        [IDL.Vec(Profile)],
        ['query'],
      ),
    'createProfile' : IDL.Func([NewProfile], [], []),
    'follow' : IDL.Func([Vertex], [], []),
    'getFollowerNumber' : IDL.Func([Vertex], [IDL.Nat], ['query']),
    'getFollowersList' : IDL.Func([Vertex], [IDL.Vec(Vertex)], ['query']),
    'getFollowingList' : IDL.Func([Vertex], [IDL.Vec(Vertex)], ['query']),
    'getFollowingNumber' : IDL.Func([Vertex], [IDL.Nat], ['query']),
    'getProfile' : IDL.Func([UserId__1], [IDL.Opt(Profile)], ['query']),
    'getRootFeedCanister' : IDL.Func([], [IDL.Principal], ['query']),
    'init' : IDL.Func([IDL.Principal], [], ['oneway']),
    'searchProfile' : IDL.Func([IDL.Text], [IDL.Vec(Profile)], ['query']),
    'updateProfile' : IDL.Func([NewProfile], [], []),
  });
  return User;
};
export const init = ({ IDL }) => { return []; };
