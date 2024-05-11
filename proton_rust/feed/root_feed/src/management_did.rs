use ic_cdk::export::candid::{self, CandidType, Deserialize};
use ic_cdk::api::call::CallResult;

#[derive(CandidType, Deserialize)]
enum bitcoin_network { mainnet, testnet }

type bitcoin_address = String;
#[derive(CandidType, Deserialize)]
struct bitcoin_get_balance_args {
  network: bitcoin_network,
  address: bitcoin_address,
  min_confirmations: Option<u32>,
}

type satoshi = u64;
type bitcoin_get_balance_result = satoshi;
#[derive(CandidType, Deserialize)]
struct bitcoin_get_balance_query_args {
  network: bitcoin_network,
  address: bitcoin_address,
  min_confirmations: Option<u32>,
}

type bitcoin_get_balance_query_result = satoshi;
#[derive(CandidType, Deserialize)]
struct bitcoin_get_current_fee_percentiles_args { network: bitcoin_network }

type millisatoshi_per_byte = u64;
type bitcoin_get_current_fee_percentiles_result = Vec<millisatoshi_per_byte>;
#[derive(CandidType, Deserialize)]
enum bitcoin_get_utxos_args_filter_inner {
  page(Vec<u8>),
  min_confirmations(u32),
}

#[derive(CandidType, Deserialize)]
struct bitcoin_get_utxos_args {
  network: bitcoin_network,
  filter: Option<bitcoin_get_utxos_args_filter_inner>,
  address: bitcoin_address,
}

type block_hash = Vec<u8>;
#[derive(CandidType, Deserialize)]
struct outpoint { txid: Vec<u8>, vout: u32 }

#[derive(CandidType, Deserialize)]
struct utxo { height: u32, value: satoshi, outpoint: outpoint }

#[derive(CandidType, Deserialize)]
struct bitcoin_get_utxos_result {
  next_page: Option<Vec<u8>>,
  tip_height: u32,
  tip_block_hash: block_hash,
  utxos: Vec<utxo>,
}

#[derive(CandidType, Deserialize)]
enum bitcoin_get_utxos_query_args_filter_inner {
  page(Vec<u8>),
  min_confirmations(u32),
}

#[derive(CandidType, Deserialize)]
struct bitcoin_get_utxos_query_args {
  network: bitcoin_network,
  filter: Option<bitcoin_get_utxos_query_args_filter_inner>,
  address: bitcoin_address,
}

#[derive(CandidType, Deserialize)]
struct bitcoin_get_utxos_query_result {
  next_page: Option<Vec<u8>>,
  tip_height: u32,
  tip_block_hash: block_hash,
  utxos: Vec<utxo>,
}

#[derive(CandidType, Deserialize)]
struct bitcoin_send_transaction_args {
  transaction: Vec<u8>,
  network: bitcoin_network,
}

type canister_id = candid::Principal;
#[derive(CandidType, Deserialize)]
struct canister_info_args {
  canister_id: canister_id,
  num_requested_changes: Option<u64>,
}

#[derive(CandidType, Deserialize)]
enum change_origin {
  from_user{ user_id: candid::Principal },
  from_canister{
    canister_version: Option<u64>,
    canister_id: candid::Principal,
  },
}

#[derive(CandidType, Deserialize)]
enum change_details_code_deployment_mode { reinstall, upgrade, install }

#[derive(CandidType, Deserialize)]
enum change_details {
  creation{ controllers: Vec<candid::Principal> },
  code_deployment{
    mode: change_details_code_deployment_mode,
    module_hash: Vec<u8>,
  },
  controllers_change{ controllers: Vec<candid::Principal> },
  code_uninstall,
}

#[derive(CandidType, Deserialize)]
struct change {
  timestamp_nanos: u64,
  canister_version: u64,
  origin: change_origin,
  details: change_details,
}

#[derive(CandidType, Deserialize)]
struct canister_info_result {
  controllers: Vec<candid::Principal>,
  module_hash: Option<Vec<u8>>,
  recent_changes: Vec<change>,
  total_num_changes: u64,
}

#[derive(CandidType, Deserialize)]
struct canister_status_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
enum canister_status_result_status { stopped, stopping, running }

#[derive(CandidType, Deserialize)]
struct definite_canister_settings {
  freezing_threshold: candid::Nat,
  controllers: Vec<candid::Principal>,
  reserved_cycles_limit: candid::Nat,
  memory_allocation: candid::Nat,
  compute_allocation: candid::Nat,
}

#[derive(CandidType, Deserialize)]
struct canister_status_result {
  status: canister_status_result_status,
  memory_size: candid::Nat,
  cycles: candid::Nat,
  settings: definite_canister_settings,
  idle_cycles_burned_per_day: candid::Nat,
  module_hash: Option<Vec<u8>>,
  reserved_cycles: candid::Nat,
}

#[derive(CandidType, Deserialize)]
struct clear_chunk_store_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
struct canister_settings {
  freezing_threshold: Option<candid::Nat>,
  controllers: Option<Vec<candid::Principal>>,
  reserved_cycles_limit: Option<candid::Nat>,
  memory_allocation: Option<candid::Nat>,
  compute_allocation: Option<candid::Nat>,
}

#[derive(CandidType, Deserialize)]
pub struct create_canister_args {
  settings: Option<canister_settings>,
  sender_canister_version: Option<u64>,
}

#[derive(CandidType, Deserialize)]
struct create_canister_result { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
struct delete_canister_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
struct deposit_cycles_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
enum ecdsa_curve { secp256k1 }

#[derive(CandidType, Deserialize)]
struct ecdsa_public_key_args_key_id { name: String, curve: ecdsa_curve }

#[derive(CandidType, Deserialize)]
struct ecdsa_public_key_args {
  key_id: ecdsa_public_key_args_key_id,
  canister_id: Option<canister_id>,
  derivation_path: Vec<Vec<u8>>,
}

#[derive(CandidType, Deserialize)]
struct ecdsa_public_key_result { public_key: Vec<u8>, chain_code: Vec<u8> }

#[derive(CandidType, Deserialize)]
enum http_request_args_method { get, head, post }

#[derive(CandidType, Deserialize)]
struct http_header { value: String, name: String }

#[derive(CandidType, Deserialize)]
struct http_request_result {
  status: candid::Nat,
  body: Vec<u8>,
  headers: Vec<http_header>,
}

#[derive(CandidType, Deserialize)]
struct http_request_args_transform_inner_function_arg0 {
  context: Vec<u8>,
  response: http_request_result,
}

#[derive(CandidType, Deserialize)]
struct http_request_args_transform_inner {
  function: candid::Func,
  context: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
struct http_request_args {
  url: String,
  method: http_request_args_method,
  max_response_bytes: Option<u64>,
  body: Option<Vec<u8>>,
  transform: Option<http_request_args_transform_inner>,
  headers: Vec<http_header>,
}

#[derive(CandidType, Deserialize)]
struct canister_install_mode_upgrade_inner { skip_pre_upgrade: Option<bool> }

#[derive(CandidType, Deserialize)]
enum canister_install_mode {
  reinstall,
  upgrade(Option<canister_install_mode_upgrade_inner>),
  install,
}

#[derive(CandidType, Deserialize)]
struct chunk_hash { hash: Vec<u8> }

#[derive(CandidType, Deserialize)]
struct install_chunked_code_args {
  arg: Vec<u8>,
  wasm_module_hash: Vec<u8>,
  mode: canister_install_mode,
  chunk_hashes_list: Vec<chunk_hash>,
  target_canister: canister_id,
  store_canister: Option<canister_id>,
  sender_canister_version: Option<u64>,
}

type wasm_module = Vec<u8>;
#[derive(CandidType, Deserialize)]
struct install_code_args {
  arg: Vec<u8>,
  wasm_module: wasm_module,
  mode: canister_install_mode,
  canister_id: canister_id,
  sender_canister_version: Option<u64>,
}

#[derive(CandidType, Deserialize)]
struct node_metrics_history_args {
  start_at_timestamp_nanos: u64,
  subnet_id: candid::Principal,
}

#[derive(CandidType, Deserialize)]
struct node_metrics {
  num_block_failures_total: u64,
  node_id: candid::Principal,
  num_blocks_total: u64,
}

#[derive(CandidType, Deserialize)]
struct node_metrics_history_result_inner {
  timestamp_nanos: u64,
  node_metrics: Vec<node_metrics>,
}

type node_metrics_history_result = Vec<node_metrics_history_result_inner>;
#[derive(CandidType, Deserialize)]
struct provisional_create_canister_with_cycles_args {
  settings: Option<canister_settings>,
  specified_id: Option<canister_id>,
  amount: Option<candid::Nat>,
  sender_canister_version: Option<u64>,
}

#[derive(CandidType, Deserialize)]
struct provisional_create_canister_with_cycles_result {
  canister_id: canister_id,
}

#[derive(CandidType, Deserialize)]
struct provisional_top_up_canister_args {
  canister_id: canister_id,
  amount: candid::Nat,
}

type raw_rand_result = Vec<u8>;
#[derive(CandidType, Deserialize)]
struct sign_with_ecdsa_args_key_id { name: String, curve: ecdsa_curve }

#[derive(CandidType, Deserialize)]
struct sign_with_ecdsa_args {
  key_id: sign_with_ecdsa_args_key_id,
  derivation_path: Vec<Vec<u8>>,
  message_hash: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
struct sign_with_ecdsa_result { signature: Vec<u8> }

#[derive(CandidType, Deserialize)]
struct start_canister_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
struct stop_canister_args { canister_id: canister_id }

#[derive(CandidType, Deserialize)]
struct stored_chunks_args { canister_id: canister_id }

type stored_chunks_result = Vec<chunk_hash>;
#[derive(CandidType, Deserialize)]
struct uninstall_code_args {
  canister_id: canister_id,
  sender_canister_version: Option<u64>,
}

#[derive(CandidType, Deserialize)]
struct update_settings_args {
  canister_id: candid::Principal,
  settings: canister_settings,
  sender_canister_version: Option<u64>,
}

#[derive(CandidType, Deserialize)]
struct upload_chunk_args { chunk: Vec<u8>, canister_id: candid::Principal }

type upload_chunk_result = chunk_hash;

// struct SERVICE(candid::Principal);
// impl SERVICE{
//   pub async fn bitcoin_get_balance(
//     &self,
//     arg0: bitcoin_get_balance_args,
//   ) -> CallResult<(bitcoin_get_balance_result,)> {
//     ic_cdk::call(self.0, "bitcoin_get_balance", (arg0,)).await
//   }
//   pub async fn bitcoin_get_balance_query(
//     &self,
//     arg0: bitcoin_get_balance_query_args,
//   ) -> CallResult<(bitcoin_get_balance_query_result,)> {
//     ic_cdk::call(self.0, "bitcoin_get_balance_query", (arg0,)).await
//   }
//   pub async fn bitcoin_get_current_fee_percentiles(
//     &self,
//     arg0: bitcoin_get_current_fee_percentiles_args,
//   ) -> CallResult<(bitcoin_get_current_fee_percentiles_result,)> {
//     ic_cdk::call(self.0, "bitcoin_get_current_fee_percentiles", (arg0,)).await
//   }
//   pub async fn bitcoin_get_utxos(
//     &self,
//     arg0: bitcoin_get_utxos_args,
//   ) -> CallResult<(bitcoin_get_utxos_result,)> {
//     ic_cdk::call(self.0, "bitcoin_get_utxos", (arg0,)).await
//   }
//   pub async fn bitcoin_get_utxos_query(
//     &self,
//     arg0: bitcoin_get_utxos_query_args,
//   ) -> CallResult<(bitcoin_get_utxos_query_result,)> {
//     ic_cdk::call(self.0, "bitcoin_get_utxos_query", (arg0,)).await
//   }
//   pub async fn bitcoin_send_transaction(
//     &self,
//     arg0: bitcoin_send_transaction_args,
//   ) -> CallResult<()> {
//     ic_cdk::call(self.0, "bitcoin_send_transaction", (arg0,)).await
//   }
//   pub async fn canister_info(&self, arg0: canister_info_args) -> CallResult<
//     (canister_info_result,)
//   > { ic_cdk::call(self.0, "canister_info", (arg0,)).await }
//   pub async fn canister_status(&self, arg0: canister_status_args) -> CallResult<
//     (canister_status_result,)
//   > { ic_cdk::call(self.0, "canister_status", (arg0,)).await }
//   pub async fn clear_chunk_store(
//     &self,
//     arg0: clear_chunk_store_args,
//   ) -> CallResult<()> {
//     ic_cdk::call(self.0, "clear_chunk_store", (arg0,)).await
//   }
//   pub async fn create_canister(&self, arg0: create_canister_args) -> CallResult<
//     (create_canister_result,)
//   > { ic_cdk::call(self.0, "create_canister", (arg0,)).await }
//   pub async fn delete_canister(&self, arg0: delete_canister_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "delete_canister", (arg0,)).await }
//   pub async fn deposit_cycles(&self, arg0: deposit_cycles_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "deposit_cycles", (arg0,)).await }
//   pub async fn ecdsa_public_key(
//     &self,
//     arg0: ecdsa_public_key_args,
//   ) -> CallResult<(ecdsa_public_key_result,)> {
//     ic_cdk::call(self.0, "ecdsa_public_key", (arg0,)).await
//   }
//   pub async fn http_request(&self, arg0: http_request_args) -> CallResult<
//     (http_request_result,)
//   > { ic_cdk::call(self.0, "http_request", (arg0,)).await }
//   pub async fn install_chunked_code(
//     &self,
//     arg0: install_chunked_code_args,
//   ) -> CallResult<()> {
//     ic_cdk::call(self.0, "install_chunked_code", (arg0,)).await
//   }
//   pub async fn install_code(&self, arg0: install_code_args) -> CallResult<()> {
//     ic_cdk::call(self.0, "install_code", (arg0,)).await
//   }
//   pub async fn node_metrics_history(
//     &self,
//     arg0: node_metrics_history_args,
//   ) -> CallResult<(node_metrics_history_result,)> {
//     ic_cdk::call(self.0, "node_metrics_history", (arg0,)).await
//   }
//   pub async fn provisional_create_canister_with_cycles(
//     &self,
//     arg0: provisional_create_canister_with_cycles_args,
//   ) -> CallResult<(provisional_create_canister_with_cycles_result,)> {
//     ic_cdk::call(self.0, "provisional_create_canister_with_cycles", (
//       arg0,
//     )).await
//   }
//   pub async fn provisional_top_up_canister(
//     &self,
//     arg0: provisional_top_up_canister_args,
//   ) -> CallResult<()> {
//     ic_cdk::call(self.0, "provisional_top_up_canister", (arg0,)).await
//   }
//   pub async fn raw_rand(&self) -> CallResult<(raw_rand_result,)> {
//     ic_cdk::call(self.0, "raw_rand", ()).await
//   }
//   pub async fn sign_with_ecdsa(&self, arg0: sign_with_ecdsa_args) -> CallResult<
//     (sign_with_ecdsa_result,)
//   > { ic_cdk::call(self.0, "sign_with_ecdsa", (arg0,)).await }
//   pub async fn start_canister(&self, arg0: start_canister_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "start_canister", (arg0,)).await }
//   pub async fn stop_canister(&self, arg0: stop_canister_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "stop_canister", (arg0,)).await }
//   pub async fn stored_chunks(&self, arg0: stored_chunks_args) -> CallResult<
//     (stored_chunks_result,)
//   > { ic_cdk::call(self.0, "stored_chunks", (arg0,)).await }
//   pub async fn uninstall_code(&self, arg0: uninstall_code_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "uninstall_code", (arg0,)).await }
//   pub async fn update_settings(&self, arg0: update_settings_args) -> CallResult<
//     ()
//   > { ic_cdk::call(self.0, "update_settings", (arg0,)).await }
//   pub async fn upload_chunk(&self, arg0: upload_chunk_args) -> CallResult<
//     (upload_chunk_result,)
//   > { ic_cdk::call(self.0, "upload_chunk", (arg0,)).await }
// }