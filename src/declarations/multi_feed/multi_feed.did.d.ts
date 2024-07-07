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
  'user' : Principal,
  'created_at' : bigint,
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
  'index' : bigint,
}
export interface QueryStats {
  'response_payload_bytes_total' : bigint,
  'num_instructions_total' : bigint,
  'num_calls_total' : bigint,
  'request_payload_bytes_total' : bigint,
}
export interface _SERVICE {
  'batch_delete_feed' : ActorMethod<[Principal, Array<string>], undefined>,
  'batch_receive_feed' : ActorMethod<[Principal, Array<string>], undefined>,
  'create_comment' : ActorMethod<[string, string], boolean>,
  'create_like' : ActorMethod<[string], boolean>,
  'create_post' : ActorMethod<[string, Array<string>], string>,
  'create_repost' : ActorMethod<[string], boolean>,
  'delete_post' : ActorMethod<[string], boolean>,
  'get_all_latest_feed' : ActorMethod<[bigint], Array<Post>>,
  'get_all_post' : ActorMethod<[Principal], Array<Post>>,
  'get_delete_notify_map_entries' : ActorMethod<
    [],
    Array<[Principal, Array<string>]>
  >,
  'get_feed_number' : ActorMethod<[Principal], bigint>,
  'get_latest_feed' : ActorMethod<[Principal, bigint], Array<Post>>,
  'get_notify_map_entries' : ActorMethod<[], Array<[Principal, Array<string>]>>,
  'get_post' : ActorMethod<[string], [] | [Post]>,
  'get_post_number' : ActorMethod<[Principal], bigint>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
