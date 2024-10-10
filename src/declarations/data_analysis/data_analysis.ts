import type {Principal} from '@dfinity/principal';
import type {ActorMethod} from '@dfinity/agent';
import type {IDL} from '@dfinity/candid';

export interface Comment {
  'content': string,
  'like': [] | [Array<Like>],
  'user': Principal,
  'created_at': bigint,
  'index': [] | [bigint],
}

export interface CommentToComment {
  'content': string,
  'from_user': Principal,
  'like': Array<Like>,
  'created_at': bigint,
  'to_index': bigint,
  'index': bigint,
}

export interface Like {
  'user': Principal,
  'created_at': bigint
}

export interface Post {
  'repost': Array<Like>,
  'post_id': string,
  'photo_url': Array<string>,
  'content': string,
  'like': Array<Like>,
  'user': Principal,
  'created_at': bigint,
  'comment': Array<Comment>,
  'feed_canister': Principal,
  'comment_index': [] | [bigint],
  'index': bigint,
  'comment_to_comment': [] | [Array<CommentToComment>],
}

export interface _SERVICE {
  'get_hot_topic': ActorMethod<[bigint], Array<[string, bigint]>>,
  'get_hot_topic_in_week': ActorMethod<[], Array<[string, bigint]>>,
  'get_topic_number': ActorMethod<[string], bigint>,
  'get_topic_post': ActorMethod<[string, bigint, bigint], Array<Post>>,
  'get_week_topic_number': ActorMethod<[string], bigint>,
  'receive_post': ActorMethod<[Array<string>, string], boolean>,
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
