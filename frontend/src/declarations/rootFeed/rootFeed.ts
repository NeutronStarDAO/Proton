import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface RootFeed {
  'createFeedCanister' : ActorMethod<[], [] | [Principal]>,
  'getAllUserFeedCanister' : ActorMethod<[], Array<[Principal, Principal]>>,
  'getCommentFetchCanister' : ActorMethod<[], Principal>,
  'getLikeFetchCanister' : ActorMethod<[], Principal>,
  'getPostFetchCanister' : ActorMethod<[], Principal>,
  'getTotalUserFeedCanisterNumber' : ActorMethod<[], bigint>,
  'getUserFeedCanister' : ActorMethod<[Principal], [] | [Principal]>,
  'updateCommentFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateLikeFetchCanister' : ActorMethod<[Principal], undefined>,
  'updatePostFetchCanister' : ActorMethod<[Principal], undefined>,
}
export interface _SERVICE extends RootFeed {}
