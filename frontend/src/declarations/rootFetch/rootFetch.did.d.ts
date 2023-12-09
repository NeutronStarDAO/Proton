import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface RootFetch {
  'createCommentFetchCanister' : ActorMethod<[], Principal>,
  'createLikeFetchCanister' : ActorMethod<[], Principal>,
  'createPostFetchCanister' : ActorMethod<[], Principal>,
  'getAllCommentFetchCanister' : ActorMethod<[], Array<Principal>>,
  'getAllLikeFetchCanister' : ActorMethod<[], Array<Principal>>,
  'getAllPostFetchCanister' : ActorMethod<[], Array<Principal>>,
  'init' : ActorMethod<[Principal, Principal, Principal, Principal], undefined>,
}
export interface _SERVICE extends RootFetch {}
