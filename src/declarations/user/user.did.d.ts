import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface NewProfile {
  'imgUrl' : string,
  'name' : string,
  'education' : string,
  'biography' : string,
  'company' : string,
  'feedCanister' : [] | [Principal],
}
export interface Profile {
  'id' : UserId,
  'imgUrl' : string,
  'name' : string,
  'education' : string,
  'biography' : string,
  'company' : string,
  'feedCanister' : [] | [Principal],
}
export interface User {
  'createProfile' : ActorMethod<[NewProfile], undefined>,
  'follow' : ActorMethod<[Vertex, Vertex], undefined>,
  'getFollowersList' : ActorMethod<[Vertex], Array<Vertex>>,
  'getFollowingList' : ActorMethod<[Vertex], Array<Vertex>>,
  'getProfile' : ActorMethod<[UserId__1], [] | [Profile]>,
  'searchProfile' : ActorMethod<[string], Array<Profile>>,
  'updateProfile' : ActorMethod<[NewProfile], undefined>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export type Vertex = Principal;
export interface _SERVICE extends User {}
