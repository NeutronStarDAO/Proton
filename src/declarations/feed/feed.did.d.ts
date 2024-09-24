import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CanisterStatusResponse {
  'status' : CanisterStatusType,
  'memory_size' : bigint,
  'cycles' : bigint,
  'settings' : DefiniteCanisterSettings,
  'query_stats' : QueryStats,
  'idle_cycles_burned_per_day' : bigint,
  'module_hash' : [] | [Uint8Array | number[]],
  'reserved_cycles' : bigint,
}
export type CanisterStatusType = { 'stopped' : null } |
  { 'stopping' : null } |
  { 'running' : null };
export interface Comment {
  'content' : string,
  'like' : [] | [Array<Like>],
  'user' : Principal,
  'created_at' : bigint,
  'index' : [] | [bigint],
}
export interface CommentToComment {
  'content' : string,
  'from_user' : Principal,
  'like' : Array<Like>,
  'created_at' : bigint,
  'to_index' : bigint,
  'index' : bigint,
}
export interface CommentTreeNode {
  'dep' : bigint,
  'comment' : [] | [Comment],
  'comment_to_comment' : [] | [CommentToComment],
  'father' : bigint,
}
export interface DefiniteCanisterSettings {
  'freezing_threshold' : bigint,
  'controllers' : Array<Principal>,
  'reserved_cycles_limit' : bigint,
  'log_visibility' : LogVisibility,
  'wasm_memory_limit' : bigint,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface Like { 'user' : Principal, 'created_at' : bigint }
export type LogVisibility = { 'controllers' : null } |
  { 'public' : null };
export interface Post {
  'repost' : Array<Like>,
  'post_id' : string,
  'photo_url' : Array<string>,
  'content' : string,
  'like' : Array<Like>,
  'user' : Principal,
  'created_at' : bigint,
  'comment' : Array<Comment>,
  'feed_canister' : Principal,
  'comment_index' : [] | [bigint],
  'index' : bigint,
  'comment_to_comment' : [] | [Array<CommentToComment>],
}
export interface QueryStats {
  'response_payload_bytes_total' : bigint,
  'num_instructions_total' : bigint,
  'num_calls_total' : bigint,
  'request_payload_bytes_total' : bigint,
}
export interface _SERVICE {
  'batch_delete_feed' : ActorMethod<[Principal, Array<string>], undefined>,
  'batch_get_post' : ActorMethod<[Array<string>], Array<Post>>,
  'batch_receive_feed' : ActorMethod<[Principal, Array<string>], undefined>,
  'check_available_bucket' : ActorMethod<[], boolean>,
  'comment_comment' : ActorMethod<[string, bigint, string], boolean>,
  'complete_upgrade' : ActorMethod<[], boolean>,
  'create_comment' : ActorMethod<[string, string], boolean>,
  'create_like' : ActorMethod<[string], boolean>,
  'create_post' : ActorMethod<[string, Array<string>], string>,
  'create_repost' : ActorMethod<[string], boolean>,
  'delete_post' : ActorMethod<[string], boolean>,
  'get_all_latest_feed' : ActorMethod<[bigint], Array<Post>>,
  'get_all_latest_feed_by_length' : ActorMethod<[bigint, bigint], Array<Post>>,
  'get_all_post' : ActorMethod<[Principal], Array<Post>>,
  'get_bucket' : ActorMethod<[], [] | [Principal]>,
  'get_feed_number' : ActorMethod<[Principal], bigint>,
  'get_home_feed' : ActorMethod<[Principal, bigint], Array<Post>>,
  'get_home_feed_by_length' : ActorMethod<
    [Principal, bigint, bigint],
    Array<Post>
  >,
  'get_latest_feed' : ActorMethod<[Principal, bigint], Array<Post>>,
  'get_post' : ActorMethod<[string], [] | [Post]>,
  'get_post_comment_tree' : ActorMethod<[string], Array<CommentTreeNode>>,
  'get_post_fetch' : ActorMethod<[], Principal>,
  'get_post_index' : ActorMethod<[], bigint>,
  'get_post_number' : ActorMethod<[Principal], bigint>,
  'get_root_bucket' : ActorMethod<[], Principal>,
  'get_user_actor' : ActorMethod<[], Principal>,
  'like_comment' : ActorMethod<[string, bigint], boolean>,
  'like_comment_comment' : ActorMethod<[string, bigint], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
