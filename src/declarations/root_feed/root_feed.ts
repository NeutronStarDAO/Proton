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
export interface InitArg { 'root_bucket' : Principal, 'user_actor' : Principal }
export interface QueryStats {
  'response_payload_bytes_total' : bigint,
  'num_instructions_total' : bigint,
  'num_calls_total' : bigint,
  'request_payload_bytes_total' : bigint,
}
export interface _SERVICE {
  'create_feed_canister' : ActorMethod<[], [] | [Principal]>,
  'get_all_user_feed_canister' : ActorMethod<[], Array<[Principal, Principal]>>,
  'get_feed_wasm' : ActorMethod<[], Uint8Array | number[]>,
  'get_total_user_feed_canister_number' : ActorMethod<[], bigint>,
  'get_user_feed_canister' : ActorMethod<[Principal], [] | [Principal]>,
  'init_fetch_actor' : ActorMethod<
    [Principal, Principal, Principal],
    undefined
  >,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'update_feed_wasm' : ActorMethod<[Uint8Array | number[], bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
