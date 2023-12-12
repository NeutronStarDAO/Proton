import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bucket {
  'batchStoreFeed' : ActorMethod<[Array<PostImmutable>], undefined>,
  'getCommentFetchCanister' : ActorMethod<[], Principal>,
  'getLatestFeed' : ActorMethod<[bigint], Array<PostImmutable>>,
  'getLikeFetchCanister' : ActorMethod<[], Principal>,
  'getPost' : ActorMethod<[string], [] | [PostImmutable]>,
  'getPostNumber' : ActorMethod<[], bigint>,
  'getPosts' : ActorMethod<[Array<string>], Array<PostImmutable>>,
  'storeFeed' : ActorMethod<[PostImmutable], boolean>,
  'updateCommentFetchCanister' : ActorMethod<[Principal], undefined>,
  'updateLikeFetchCanister' : ActorMethod<[Principal], undefined>,
  'updatePostComment' : ActorMethod<[string, NewComment], boolean>,
  'updatePostLike' : ActorMethod<[string, NewLike], boolean>,
  'updatePostRepost' : ActorMethod<[string, NewRepost], boolean>,
}
export interface Comment {
  'content' : string,
  'createdAt' : Time,
  'user' : UserId,
}
export interface Like { 'createdAt' : Time, 'user' : UserId }
export type NewComment = Array<Comment>;
export type NewLike = Array<Like>;
export type NewRepost = Array<Repost>;
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
export interface _SERVICE extends Bucket {}
