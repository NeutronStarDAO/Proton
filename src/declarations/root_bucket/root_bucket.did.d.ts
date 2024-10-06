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
  'add_available_bucket' : ActorMethod<[Array<Principal>], undefined>,
  'create_bucket' : ActorMethod<[], Principal>,
  'get_all_available_bucket' : ActorMethod<[], Array<Principal>>,
  'get_all_bucket' : ActorMethod<[], Array<Principal>>,
  'get_all_unavailable_bucket' : ActorMethod<[], Array<Principal>>,
  'get_availeable_bucket' : ActorMethod<[], [] | [Principal]>,
  'get_bucket_index' : ActorMethod<[], bigint>,
  'get_bucket_wasm' : ActorMethod<[], Uint8Array | number[]>,
  'get_buckets_latest_feed' : ActorMethod<[bigint], Array<Post>>,
  'get_buckets_latest_feed_from_start' : ActorMethod<
    [bigint, bigint],
    Array<Post>
  >,
  'init' : ActorMethod<[], undefined>,
  'search_post' : ActorMethod<[string], Array<Post>>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_bucket_canister_controller' : ActorMethod<[Principal], boolean>,
  'update_bucket_wasm' : ActorMethod<[Uint8Array | number[], bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
