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
export interface DefiniteCanisterSettings {
  'freezing_threshold' : bigint,
  'controllers' : Array<Principal>,
  'reserved_cycles_limit' : bigint,
  'wasm_memory_limit' : bigint,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface Profile {
  'id' : Principal,
  'avatar_url' : string,
  'name' : string,
  'biography' : string,
  'created_at' : [] | [bigint],
  'website' : string,
  'feed_canister' : [] | [Principal],
  'handle' : string,
  'location' : string,
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
  'cancle_follow' : ActorMethod<[Principal], undefined>,
  'create_profile' : ActorMethod<[Profile], boolean>,
  'follow' : ActorMethod<[Principal], undefined>,
  'get_follower_number' : ActorMethod<[Principal], bigint>,
  'get_followers_list' : ActorMethod<[Principal], Array<Principal>>,
  'get_following_list' : ActorMethod<[Principal], Array<Principal>>,
  'get_following_number' : ActorMethod<[Principal], bigint>,
  'get_profile' : ActorMethod<[Principal], [] | [Profile]>,
  'is_followed' : ActorMethod<[Principal, Principal], boolean>,
  'is_handle_available' : ActorMethod<[string], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_handle' : ActorMethod<[string], boolean>,
  'update_profile' : ActorMethod<[Profile], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
