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
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferResult = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export interface WalletTX {
  'time' : bigint,
  'tx_hash' : string,
  'tx_type' : WalletTXType,
  'amount' : bigint,
}
export type WalletTXType = { 'Send' : null } |
  { 'Receive' : null };
export interface _SERVICE {
  'ckBTC_balance' : ActorMethod<[Principal], bigint>,
  'ckBTC_tx' : ActorMethod<[Principal], Array<WalletTX>>,
  'create_feed_canister' : ActorMethod<[], Principal>,
  'get_account_identifier' : ActorMethod<[Principal], string>,
  'get_all_feed_canister' : ActorMethod<[], Array<Principal>>,
  'get_available_feed_canister_index' : ActorMethod<[], bigint>,
  'get_feed_canister_index' : ActorMethod<[], bigint>,
  'get_feed_canister_users_number_entries' : ActorMethod<
    [],
    Array<[Principal, bigint]>
  >,
  'get_feed_wasm' : ActorMethod<[], Uint8Array | number[]>,
  'get_root_bucket' : ActorMethod<[], Principal>,
  'get_subaccount' : ActorMethod<[Principal], Uint8Array | number[]>,
  'get_user_actor' : ActorMethod<[], Principal>,
  'get_user_feed_canister' : ActorMethod<[Principal], [] | [Principal]>,
  'get_user_feed_canister_entries' : ActorMethod<
    [],
    Array<[Principal, Principal]>
  >,
  'ghost_balance' : ActorMethod<[Principal], bigint>,
  'ghost_tx' : ActorMethod<[Principal], Array<WalletTX>>,
  'icp_balance' : ActorMethod<[Principal], bigint>,
  'icp_tx' : ActorMethod<[Principal], Array<WalletTX>>,
  'icrc1_transfer' : ActorMethod<
    [Principal, Principal, bigint],
    TransferResult
  >,
  'init_fetch_actor' : ActorMethod<[Principal], undefined>,
  'init_user_feed' : ActorMethod<[], Principal>,
  'set_root_bucket' : ActorMethod<[Principal], boolean>,
  'set_user_actor' : ActorMethod<[Principal], boolean>,
  'status' : ActorMethod<[], CanisterStatusResponse>,
  'token_balance' : ActorMethod<[Principal, Principal], bigint>,
  'topup_by_icp' : ActorMethod<[bigint], boolean>,
  'transfer_ckBTC' : ActorMethod<[Principal, bigint], TransferResult>,
  'transfer_ghost' : ActorMethod<[Principal, bigint], TransferResult>,
  'transfer_icp' : ActorMethod<[Principal, bigint], TransferResult>,
  'update_feed_canister_controller' : ActorMethod<[Principal], boolean>,
  'update_feed_wasm' : ActorMethod<[Uint8Array | number[], bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
