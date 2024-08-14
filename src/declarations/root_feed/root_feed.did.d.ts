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
  'log_visibility' : LogVisibility,
  'wasm_memory_limit' : bigint,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export type LogVisibility = { 'controllers' : null } |
  { 'public' : null };
export interface QueryStats {
  'response_payload_bytes_total' : bigint,
  'num_instructions_total' : bigint,
  'num_calls_total' : bigint,
  'request_payload_bytes_total' : bigint,
}
export interface _SERVICE {
  'create_feed_canister' : ActorMethod<[], Principal>,
  'get_all_feed_canister' : ActorMethod<[], Array<Principal>>,
  'get_available_feed_canister_index' : ActorMethod<[], bigint>,
  'get_feed_canister_index' : ActorMethod<[], bigint>,
  'get_feed_canister_users_number_entries' : ActorMethod<
    [],
    Array<[Principal, bigint]>
  >,
  'get_feed_wasm' : ActorMethod<[], Uint8Array | number[]>,
  'get_root_bucket' : ActorMethod<[], Principal>,
  'get_user_actor' : ActorMethod<[], Principal>,
  'get_user_feed_canister' : ActorMethod<[Principal], [] | [Principal]>,
  'get_user_feed_canister_entries' : ActorMethod<
    [],
    Array<[Principal, Principal]>
  >,
  'init_fetch_actor' : ActorMethod<[Principal], undefined>,
  'init_user_feed' : ActorMethod<[], Principal>,
  'set_root_bucket' : ActorMethod<[Principal], boolean>,
  'set_user_actor' : ActorMethod<[Principal], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_feed_canister_controller' : ActorMethod<[Principal], boolean>,
  'update_feed_wasm' : ActorMethod<[Uint8Array | number[], bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
