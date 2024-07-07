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
export interface Profile {
  'id' : Principal,
  'avatar_url' : string,
  'name' : string,
  'education' : string,
  'biography' : string,
  'company' : string,
  'feed_canister' : [] | [Principal],
  'handle' : string,
  'back_img_url' : string,
}
export interface QueryStats {
  'response_payload_bytes_total' : bigint,
  'num_instructions_total' : bigint,
  'num_calls_total' : bigint,
  'request_payload_bytes_total' : bigint,
}
export interface _SERVICE {
  'batch_get_profile' : ActorMethod<[Array<Principal>], Array<Profile>>,
  'create_feed_canister' : ActorMethod<[], Principal>,
  'create_profile' : ActorMethod<[Profile], boolean>,
  'follow' : ActorMethod<[Principal], undefined>,
  'get_feed_wasm' : ActorMethod<[], Uint8Array | number[]>,
  'get_feeds_latest_feed' : ActorMethod<[bigint], Array<Post>>,
  'get_follower_number' : ActorMethod<[Principal], bigint>,
  'get_followers_list' : ActorMethod<[Principal], Array<Principal>>,
  'get_following_list' : ActorMethod<[Principal], Array<Principal>>,
  'get_following_number' : ActorMethod<[Principal], bigint>,
  'get_profile' : ActorMethod<[Principal], [] | [Profile]>,
  'get_user_feed_canister' : ActorMethod<[Principal], [] | [Principal]>,
  'init_user_feed' : ActorMethod<[Principal], Principal>,
  'is_followed' : ActorMethod<[Principal, Principal], boolean>,
  'is_handle_available' : ActorMethod<[string], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_feed_wasm' : ActorMethod<[Uint8Array | number[], bigint], boolean>,
  'update_handle' : ActorMethod<[string], boolean>,
  'update_profile' : ActorMethod<[Profile], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
