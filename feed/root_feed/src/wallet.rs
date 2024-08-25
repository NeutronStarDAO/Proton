use candid::{CandidType, Deserialize, Nat, Principal};
use serde::Serialize;
use ic_crypto_sha2::Sha256;
use ic_ledger_hash_of::HashOf;
use ic_ledger_types::{AccountIdentifier, Subaccount};

#[derive(CandidType, Deserialize, Clone)]
pub struct Account {
  pub owner: Principal,
  pub subaccount: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct TransferArg {
  pub to: Account,
  pub fee: Option<candid::Nat>,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub from_subaccount: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum TransferError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  BadBurn{ min_burn_amount: candid::Nat },
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize, Clone)]
pub enum TransferResult { Ok(candid::Nat), Err(TransferError) }

#[derive(CandidType, Deserialize, Clone)]
pub struct GetAccountTransactionsArgs {
  pub max_results: candid::Nat,
  pub start: Option<candid::Nat>,
  pub account: Account,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Tokens { pub e8s: u64 }

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct TimeStamp { pub timestamp_nanos: u64 }

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum Operation {
  Approve{
    fee: Tokens,
    from: String,
    allowance: Tokens,
    expected_allowance: Option<Tokens>,
    expires_at: Option<TimeStamp>,
    spender: String,
  },
  Burn{ from: String, amount: Tokens, spender: Option<String> },
  Mint{ to: String, amount: Tokens },
  Transfer{
    to: String,
    fee: Tokens,
    from: String,
    amount: Tokens,
    spender: Option<String>,
  },
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Transaction {
  pub memo: u64,
  pub icrc1_memo: Option<serde_bytes::ByteBuf>,
  pub operation: Operation,
  pub timestamp: Option<TimeStamp>,
  pub created_at_time: Option<TimeStamp>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Memo(pub u64);

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ForHashTransaction {
    pub operation: Operation,
    pub memo: Memo,
    pub created_at_time: Option<TimeStamp>,
    pub icrc1_memo: Option<serde_bytes::ByteBuf>,
}

impl ForHashTransaction {
    fn hash(&self) -> HashOf<Self> {
        let mut state = Sha256::new();
        state.write(&serde_cbor::ser::to_vec_packed(&self).unwrap());
        HashOf::new(state.finish())
    }
}
#[derive(CandidType, Deserialize, Clone)]
pub struct TransactionWithId { pub id: u64, pub transaction: Transaction }

#[derive(CandidType, Deserialize, Clone)]
pub struct GetAccountIdentifierTransactionsResponse {
  pub balance: u64,
  pub transactions: Vec<TransactionWithId>,
  pub oldest_tx_id: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct GetAccountIdentifierTransactionsError { pub message: String }

#[derive(CandidType, Deserialize, Clone)]
pub enum GetAccountIdentifierTransactionsResult {
  Ok(GetAccountIdentifierTransactionsResponse),
  Err(GetAccountIdentifierTransactionsError),
}

#[derive(CandidType, Deserialize, Clone)]
pub enum WalletTXType{
    Send,
    Receive
}

#[derive(CandidType, Deserialize, Clone)]
pub struct WalletTX {
    tx_type: WalletTXType,
    tx_hash: String,
    amount: u64,
    time: u64
}

#[derive(CandidType, Deserialize)]
pub struct NotifyTopUpArg {
  pub block_index: u64,
  pub canister_id: Principal,
}

#[derive(CandidType, Deserialize)]
pub enum NotifyError {
  Refunded{ block_index: Option<u64>, reason: String },
  InvalidTransaction(String),
  Other{ error_message: String, error_code: u64 },
  Processing,
  TransactionTooOld(u64),
}

#[derive(CandidType, Deserialize)]
pub enum NotifyTopUpResult { Ok(Nat), Err(NotifyError) }

#[derive(CandidType, Deserialize)]
pub struct DfxSendArgs {
  pub to: String,
  pub fee: Tokens,
  pub memo: u64,
  pub from_subaccount: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<TimeStamp>,
  pub amount: Tokens,
}

#[ic_cdk::query]
fn get_subaccount(user: Principal) -> ic_ledger_types::Subaccount {
    Subaccount::from(user)
}

#[ic_cdk::query]
fn get_account_identifier(user: Principal) -> String {
    ic_ledger_types::AccountIdentifier::new(
        &ic_cdk::api::id(), 
        &ic_ledger_types::Subaccount::from(user)
    ).to_hex()
}

#[ic_cdk::update]
pub async fn icp_balance(user: Principal) -> Nat {
    let balance = ic_cdk::call::<(Account, ), (Nat, )>(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), 
        "icrc1_balance_of", 
        (Account {
            owner: ic_cdk::id(),
            subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
        }, )
    ).await.unwrap().0;

    balance
}

#[ic_cdk::update]
pub async fn icp_tx(user: Principal) -> Vec<WalletTX> {
    let txs_result: GetAccountIdentifierTransactionsResult = ic_cdk::call::<(GetAccountTransactionsArgs, ), (GetAccountIdentifierTransactionsResult, )>(
        Principal::from_text("qhbym-qaaaa-aaaaa-aaafq-cai").unwrap(), 
        "get_account_transactions", 
        (GetAccountTransactionsArgs {
            max_results: Nat::from(50u64),
            start: None,
            account: Account {
                owner: ic_cdk::id(),
                subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
            }
        },)
    ).await.unwrap().0;

    let mut wallet_txs = Vec::new();

    match txs_result {
        GetAccountIdentifierTransactionsResult::Ok(txs_response) => {
            let txs = txs_response.transactions;
            let account_hex = AccountIdentifier::new(
                &ic_cdk::id(), 
                &ic_ledger_types::Subaccount::from(user)
            ).to_string();
            for tx_with_id in txs {
                let tx = tx_with_id.transaction;
                if let Operation::Transfer { to, fee, from, amount, spender } = tx.operation.clone() {                    
                    let tx_type = if from == account_hex {
                        WalletTXType::Send
                    } else {
                        WalletTXType::Receive
                    };
                    let for_hash_tx = ForHashTransaction {
                        operation: tx.operation,
                        memo: Memo(tx.memo),
                        created_at_time: tx.created_at_time,
                        icrc1_memo: tx.icrc1_memo
                    };
                    let tx_hash = for_hash_tx.hash().to_string();
                    wallet_txs.push(WalletTX {
                        tx_type: tx_type,
                        tx_hash: tx_hash,
                        amount: amount.e8s,
                        time: tx.timestamp.unwrap().timestamp_nanos
                    })
                };
            }
        },
        GetAccountIdentifierTransactionsResult::Err(_) => {

        }
    }

    wallet_txs
}

#[ic_cdk::update]
pub async fn ckBTC_balance(user: Principal) -> Nat {
    let balance = ic_cdk::call::<(Account, ), (Nat, )>(
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(), 
        "icrc1_balance_of", 
        (Account {
            owner: ic_cdk::id(),
            subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
        }, )
    ).await.unwrap().0;
    
    balance
}

#[ic_cdk::update]
pub async fn ckBTC_tx(user: Principal) -> Vec<WalletTX> {
    let txs_result: GetAccountIdentifierTransactionsResult = ic_cdk::call::<(GetAccountTransactionsArgs, ), (GetAccountIdentifierTransactionsResult, )>(
        Principal::from_text("n5wcd-faaaa-aaaar-qaaea-cai").unwrap(), 
        "get_account_transactions", 
        (GetAccountTransactionsArgs {
            max_results: Nat::from(50u64),
            start: None,
            account: Account {
                owner: ic_cdk::id(),
                subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
            }
        },)
    ).await.unwrap().0;

    let mut wallet_txs = Vec::new();

    match txs_result {
        GetAccountIdentifierTransactionsResult::Ok(txs_response) => {
            let txs = txs_response.transactions;
            let account_hex = AccountIdentifier::new(
                &ic_cdk::id(), 
                &ic_ledger_types::Subaccount::from(user)
            ).to_string();
            for tx_with_id in txs {
                let tx = tx_with_id.transaction;
                if let Operation::Transfer { to, fee, from, amount, spender } = tx.operation.clone() {                    
                    let tx_type = if from == account_hex {
                        WalletTXType::Send
                    } else {
                        WalletTXType::Receive
                    };
                    let for_hash_tx = ForHashTransaction {
                        operation: tx.operation,
                        memo: Memo(tx.memo),
                        created_at_time: tx.created_at_time,
                        icrc1_memo: tx.icrc1_memo
                    };
                    let tx_hash = for_hash_tx.hash().to_string();
                    wallet_txs.push(WalletTX {
                        tx_type: tx_type,
                        tx_hash: tx_hash,
                        amount: amount.e8s,
                        time: tx.timestamp.unwrap().timestamp_nanos
                    })
                };
            }
        },
        GetAccountIdentifierTransactionsResult::Err(_) => {

        }
    }

    wallet_txs
}

#[ic_cdk::update]
pub async fn ghost_balance(user: Principal) -> Nat {
    let balance = ic_cdk::call::<(Account, ), (Nat, )>(
        Principal::from_text("4c4fd-caaaa-aaaaq-aaa3a-cai").unwrap(), 
        "icrc1_balance_of", 
        (Account {
            owner: ic_cdk::id(),
            subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
        }, )
    ).await.unwrap().0;
    
    balance
}

#[ic_cdk::update]
pub async fn ghost_tx(user: Principal) -> Vec<WalletTX> {
    let txs_result: GetAccountIdentifierTransactionsResult = ic_cdk::call::<(GetAccountTransactionsArgs, ), (GetAccountIdentifierTransactionsResult, )>(
        Principal::from_text("5ithz-aqaaa-aaaaq-aaa4a-cai").unwrap(), 
        "get_account_transactions", 
        (GetAccountTransactionsArgs {
            max_results: Nat::from(50u64),
            start: None,
            account: Account {
                owner: ic_cdk::id(),
                subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
            }
        },)
    ).await.unwrap().0;

    let mut wallet_txs = Vec::new();

    match txs_result {
        GetAccountIdentifierTransactionsResult::Ok(txs_response) => {
            let txs = txs_response.transactions;
            let account_hex = AccountIdentifier::new(
                &ic_cdk::id(), 
                &ic_ledger_types::Subaccount::from(user)
            ).to_string();
            for tx_with_id in txs {
                let tx = tx_with_id.transaction;
                if let Operation::Transfer { to, fee, from, amount, spender } = tx.operation.clone() {                    
                    let tx_type = if from == account_hex {
                        WalletTXType::Send
                    } else {
                        WalletTXType::Receive
                    };
                    let for_hash_tx = ForHashTransaction {
                        operation: tx.operation,
                        memo: Memo(tx.memo),
                        created_at_time: tx.created_at_time,
                        icrc1_memo: tx.icrc1_memo
                    };
                    let tx_hash = for_hash_tx.hash().to_string();
                    wallet_txs.push(WalletTX {
                        tx_type: tx_type,
                        tx_hash: tx_hash,
                        amount: amount.e8s,
                        time: tx.timestamp.unwrap().timestamp_nanos
                    })
                };
            }
        },
        GetAccountIdentifierTransactionsResult::Err(_) => {

        }
    }

    wallet_txs
}

#[ic_cdk::update]
pub async fn token_balance(token: Principal, user: Principal) -> Nat {
    let balance = ic_cdk::call::<(Account, ), (Nat, )>(
        token, 
        "icrc1_balance_of", 
        (Account {
            owner: ic_cdk::id(),
            subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(user).0))
        }, )
    ).await.unwrap().0;
    
    balance
}

#[ic_cdk::update]
pub async fn topup_by_icp(icp: u64) -> bool {
    let caller = ic_cdk::caller();

    let balance = ic_cdk::call::<(Account, ), (Nat, )>(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), 
        "icrc1_balance_of", 
        (Account {
            owner: ic_cdk::id(),
            subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(caller).0))
        }, )
    ).await.unwrap().0;

    if Nat::from(icp) > balance {
        return false;
    }

    let transfer_result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), 
        "icrc1_transfer", 
        (TransferArg {
            to: Account {
                owner: Principal::from_text("rkp4c-7iaaa-aaaaa-aaaca-cai").unwrap(),
                subaccount: None
            },
            fee: None,
            memo: None,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(caller).0)),
            created_at_time: None,
            amount: Nat::from(icp)
        }, )
    ).await.unwrap().0;

    match transfer_result {
        TransferResult::Ok(block_index) => {
            assert!(block_index.0.to_u64_digits().len() == 1);
            let block_index_u64 = block_index.0.to_u64_digits()[0];

            let topup_result = ic_cdk::call::<(NotifyTopUpArg, ), (NotifyTopUpResult, )>(
                Principal::from_text("rkp4c-7iaaa-aaaaa-aaaca-cai").unwrap(), 
                "notify_top_up", 
                (NotifyTopUpArg {
                    block_index: block_index_u64,
                    canister_id: ic_cdk::id()
                },)
            ).await.unwrap().0;

            match topup_result {
                NotifyTopUpResult::Ok(_) => {
                    true
                },
                NotifyTopUpResult::Err(_) => {
                    false
                } 
            }
        },
        TransferResult::Err(_) => {
            return false;
        }
    }
}

#[ic_cdk::update]
pub async fn transfer_icp(
    to: Principal,
    amount: u64
) -> TransferResult {
    let transfer_result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), 
        "icrc1_transfer", 
        (TransferArg {
            to: Account {
                owner: to,
                subaccount: None
            },
            fee: None,
            memo: None,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(ic_cdk::caller()).0)),
            created_at_time: None,
            amount: Nat::from(amount)
        }, )
    ).await.unwrap().0;

    transfer_result
}

#[ic_cdk::update]
pub async fn transfer_icp_to_acid(
    to: String,
    amount: u64
) -> u64 {
    let transfer_result = ic_cdk::call::<(DfxSendArgs, ), (u64, )>(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), 
        "send_dfx", 
        (DfxSendArgs {
            to: to,
            fee: Tokens {
                e8s: 10_000
            },
            memo: 0,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(ic_cdk::caller()).0)),
            created_at_time: None,
            amount: Tokens {
                e8s: amount
            }
        }, )
    ).await.unwrap().0;

    transfer_result
}

#[ic_cdk::update]
pub async fn transfer_ckBTC(
    to: Principal,
    amount: u64
) -> TransferResult {
    let transfer_result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(), 
        "icrc1_transfer", 
        (TransferArg {
            to: Account {
                owner: to,
                subaccount: None
            },
            fee: None,
            memo: None,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(ic_cdk::caller()).0)),
            created_at_time: None,
            amount: Nat::from(amount)
        }, )
    ).await.unwrap().0;

    transfer_result
}

#[ic_cdk::update]
pub async fn transfer_ghost(
    to: Principal,
    amount: u64
) -> TransferResult {
    let transfer_result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        Principal::from_text("4c4fd-caaaa-aaaaq-aaa3a-cai").unwrap(), 
        "icrc1_transfer", 
        (TransferArg {
            to: Account {
                owner: to,
                subaccount: None
            },
            fee: None,
            memo: None,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(ic_cdk::caller()).0)),
            created_at_time: None,
            amount: Nat::from(amount)
        }, )
    ).await.unwrap().0;

    transfer_result
}

#[ic_cdk::update]
pub async fn icrc1_transfer(
    token: Principal,
    to: Principal,
    amount: u64
) -> TransferResult {
    let transfer_result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        token, 
        "icrc1_transfer", 
        (TransferArg {
            to: Account {
                owner: to,
                subaccount: None
            },
            fee: None,
            memo: None,
            from_subaccount: Some(serde_bytes::ByteBuf::from(ic_ledger_types::Subaccount::from(ic_cdk::caller()).0)),
            created_at_time: None,
            amount: Nat::from(amount)
        }, )
    ).await.unwrap().0;

    transfer_result
}