import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Comment {
  'content' : string,
  'createdAt' : Time,
  'user' : UserId,
}
export interface Feed {
  'batchReceiveComment' : ActorMethod<[Array<string>], undefined>,
  'batchReceiveFeed' : ActorMethod<[Array<string>], undefined>,
  'batchReceiveLike' : ActorMethod<[Array<string>], undefined>,
  'checkAvailableBucket' : ActorMethod<[], boolean>,
  'createComment' : ActorMethod<[string, string], boolean>,
  'createLike' : ActorMethod<[string], boolean>,
  'createPost' : ActorMethod<[string, string], string>,
  'createRepost' : ActorMethod<[string], boolean>,
  'getAllPost' : ActorMethod<[], Array<PostImmutable>>,
  'getCommentFetchCanister' : ActorMethod<[], Principal>,
  'getFeed' : ActorMethod<[string], [] | [PostImmutable]>,
  'getFeedNumber' : ActorMethod<[], bigint>,
  'getLatestFeed' : ActorMethod<[bigint], Array<PostImmutable>>,
  'getLikeFetchCanister' : ActorMethod<[], Principal>,
  'getOwner' : ActorMethod<[], Principal>,
  'getPost' : ActorMethod<[string], [] | [PostImmutable]>,
  'getPostFetchCanister' : ActorMethod<[], Principal>,
  'getPostNumber' : ActorMethod<[], bigint>,
  'receiveComment' : ActorMethod<[string], boolean>,
  'receiveFeed' : ActorMethod<[string], boolean>,
  'receiveLike' : ActorMethod<[string], boolean>,
  'updateCommentFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateFollowers' : ActorMethod<[Array<Principal>], undefined>,
  'updateLikeFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateOwner' : ActorMethod<[Principal], undefined>,
  'updatePostFetchCanister' : ActorMethod<[Principal], undefined>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface Like { 'createdAt' : Time, 'user' : UserId }
export type PostId = string;
export interface PostImmutable {
  'repost' : Array<Repost>,
  'title' : string,
  'content' : string,
  'like' : Array<Like>,
  'createdAt' : Time,
  'user' : UserId,
  'comment' : Array<Comment>,
  'index' : bigint,
  'postId' : PostId,
}
export interface Repost { 'createdAt' : Time, 'user' : UserId }
export type Time = bigint;
export type UserId = Principal;
export interface _SERVICE extends Feed {}
