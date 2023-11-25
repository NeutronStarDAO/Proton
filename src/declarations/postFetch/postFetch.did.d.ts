import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface PostFetch {
  'addUserToFeedEntry' : ActorMethod<[[Principal, Principal]], boolean>,
  'initUserToFeed' : ActorMethod<[Array<[Principal, Principal]>], boolean>,
  'receiveNotify' : ActorMethod<[Array<Principal>, string], undefined>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface _SERVICE extends PostFetch {}
