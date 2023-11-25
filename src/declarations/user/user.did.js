export const idlFactory = ({ IDL }) => {
  const NewProfile = IDL.Record({
    'imgUrl' : IDL.Text,
    'name' : IDL.Text,
    'education' : IDL.Text,
    'biography' : IDL.Text,
    'company' : IDL.Text,
    'feedCanister' : IDL.Opt(IDL.Principal),
  });
  const Vertex = IDL.Principal;
  const UserId__1 = IDL.Principal;
  const UserId = IDL.Principal;
  const Profile = IDL.Record({
    'id' : UserId,
    'imgUrl' : IDL.Text,
    'name' : IDL.Text,
    'education' : IDL.Text,
    'biography' : IDL.Text,
    'company' : IDL.Text,
    'feedCanister' : IDL.Opt(IDL.Principal),
  });
  const User = IDL.Service({
    'createProfile' : IDL.Func([NewProfile], [], []),
    'follow' : IDL.Func([Vertex, Vertex], [], []),
    'getFollowersList' : IDL.Func([Vertex], [IDL.Vec(Vertex)], ['query']),
    'getFollowingList' : IDL.Func([Vertex], [IDL.Vec(Vertex)], ['query']),
    'getProfile' : IDL.Func([UserId__1], [IDL.Opt(Profile)], ['query']),
    'searchProfile' : IDL.Func([IDL.Text], [IDL.Vec(Profile)], ['query']),
    'updateProfile' : IDL.Func([NewProfile], [], []),
  });
  return User;
};
export const init = ({ IDL }) => { return []; };
