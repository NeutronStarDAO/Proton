import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface RootPost {
  'addAvailBucket' : ActorMethod<[Array<Principal>], undefined>,
  'createBucket' : ActorMethod<[], Principal>,
  'getAllAvailableBuckets' : ActorMethod<[], Array<Principal>>,
  'getAllBuckets' : ActorMethod<[], Array<Principal>>,
  'getAllUnavailableBuckets' : ActorMethod<[], Array<Principal>>,
  'getAvailableBucket' : ActorMethod<[], [] | [Principal]>,
  'getCommentFetchCanister' : ActorMethod<[], Principal>,
  'getLikeFetchCanister' : ActorMethod<[], Principal>,
  'init' : ActorMethod<[], undefined>,
  'reCreateBucket' : ActorMethod<[], undefined>,
  'updateCommentFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateLikeFetchCanister' : ActorMethod<[Principal], undefined>,
}
export interface _SERVICE extends RootPost {}
