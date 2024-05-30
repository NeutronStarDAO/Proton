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
  'wasm_memory_limit' : bigint,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface FeedInitArg {
  'owner' : Principal,
  'like_fetch_actor' : Principal,
  'root_bucket' : Principal,
  'user_actor' : Principal,
  'comment_fetch_actor' : Principal,
}
export interface Like { 'user' : Principal, 'created_at' : bigint }
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
  'batch_receive_comment' : ActorMethod<[Array<string>], undefined>,
  'batch_receive_feed' : ActorMethod<[Array<string>], undefined>,
  'batch_receive_like' : ActorMethod<[Array<string>], undefined>,
  'check_available_bucket' : ActorMethod<[], boolean>,
  'create_comment' : ActorMethod<[string, string], boolean>,
  'create_like' : ActorMethod<[string], boolean>,
  'create_post' : ActorMethod<[string, Array<string>], string>,
  'create_repost' : ActorMethod<[string], boolean>,
  'get_all_post' : ActorMethod<[], Array<Post>>,
  'get_bucket' : ActorMethod<[], [] | [Principal]>,
  'get_feed' : ActorMethod<[string], [] | [Post]>,
  'get_feed_number' : ActorMethod<[], bigint>,
  'get_latest_feed' : ActorMethod<[bigint], Array<Post>>,
  'get_owner' : ActorMethod<[], Principal>,
  'get_post' : ActorMethod<[string], [] | [Post]>,
  'get_post_number' : ActorMethod<[], bigint>,
  'receive_comment' : ActorMethod<[string], boolean>,
  'receive_feed' : ActorMethod<[string], boolean>,
  'receive_like' : ActorMethod<[string], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_owner' : ActorMethod<[Principal], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
