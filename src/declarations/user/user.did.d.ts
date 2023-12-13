import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface NewProfile {
  'backImgUrl' : string,
  'name' : string,
  'education' : string,
  'biography' : string,
  'company' : string,
  'avatarUrl' : string,
  'feedCanister' : [] | [Principal],
}
export interface Profile {
  'id' : UserId,
  'backImgUrl' : string,
  'name' : string,
  'education' : string,
  'biography' : string,
  'company' : string,
  'avatarUrl' : string,
  'feedCanister' : [] | [Principal],
}
export interface User {
  'batchGetProfile' : ActorMethod<[Array<UserId__1>], Array<Profile>>,
  'createProfile' : ActorMethod<[NewProfile], undefined>,
  'follow' : ActorMethod<[Vertex], undefined>,
  'getFollowerNumber' : ActorMethod<[Vertex], bigint>,
  'getFollowersList' : ActorMethod<[Vertex], Array<Vertex>>,
  'getFollowingList' : ActorMethod<[Vertex], Array<Vertex>>,
  'getFollowingNumber' : ActorMethod<[Vertex], bigint>,
  'getProfile' : ActorMethod<[UserId__1], [] | [Profile]>,
  'getRootFeedCanister' : ActorMethod<[], Principal>,
  'init' : ActorMethod<[Principal], undefined>,
  'searchProfile' : ActorMethod<[string], Array<Profile>>,
  'updateProfile' : ActorMethod<[NewProfile], undefined>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export type Vertex = Principal;
export interface _SERVICE extends User {}
