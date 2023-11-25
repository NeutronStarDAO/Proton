import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface BucketInfoImmutable {
  'index' : bigint,
  'canisterId' : Principal,
  'postNumber' : bigint,
}
export interface RootPost {
  'checkBucket' : ActorMethod<[], undefined>,
  'createBucket' : ActorMethod<[], Principal>,
  'getAllBuckets' : ActorMethod<[], Array<BucketInfoImmutable>>,
  'getAvailableBucket' : ActorMethod<[], [] | [BucketInfoImmutable]>,
  'getCommentFetchCanister' : ActorMethod<[], Principal>,
  'getLikeFetchCanister' : ActorMethod<[], Principal>,
  'getUnavailableBuckets' : ActorMethod<[], Array<BucketInfoImmutable>>,
  'init' : ActorMethod<[], undefined>,
  'reCreateBucket' : ActorMethod<[bigint], undefined>,
  'updateCommentFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateLikeFetchCanister' : ActorMethod<[Principal], undefined>,
}
export interface _SERVICE extends RootPost {}
