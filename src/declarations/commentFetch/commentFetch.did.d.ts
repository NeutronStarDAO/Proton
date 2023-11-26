import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Comment {
  'content' : string,
  'createdAt' : Time,
  'user' : UserId,
}
export interface CommentFetch {
  'addUserToFeedEntry' : ActorMethod<[[Principal, Principal]], boolean>,
  'getNotifyMapEntries' : ActorMethod<[], Array<[Principal, Array<string>]>>,
  'getUserToFeedEntries' : ActorMethod<[], Array<[Principal, Principal]>>,
  'initUserToFeed' : ActorMethod<[Array<[Principal, Principal]>], boolean>,
  'receiveNotify' : ActorMethod<[PostImmutable], undefined>,
  'receiveRepostUserNotify' : ActorMethod<
    [Array<Principal>, string],
    undefined
  >,
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
export interface _SERVICE extends CommentFetch {}
