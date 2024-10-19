use candid::{CandidType, Deserialize, Nat, Principal, Encode, Decode};
use std::{cell::RefCell, collections::HashMap};
use std::borrow::{Borrow, Cow};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, StableLog};
use ic_stable_structures::storable::{Bound, Storable};
use types::{TokenInitArgs, Account, Subaccount, TokenError};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize)]
enum Value { 
    Int(candid::Int), 
    Nat(candid::Nat), 
    Blob(Vec<u8>), 
    Text(String) 
}

type Timestamp = u64;

#[derive(CandidType, Deserialize)]
struct TransferArgs {
    to: Account,
    fee: Option<candid::Nat>,
    memo: Option<Vec<u8>>,
    from_subaccount: Option<Subaccount>,
    created_at_time: Option<Timestamp>,
    amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
enum TransferError {
    GenericError{
        message: String, 
        error_code: candid::Nat 
    },
    TemporarilyUnavailable,
    BadBurn{ min_burn_amount: candid::Nat },
    Duplicate{ duplicate_of: candid::Nat },
    BadFee{ expected_fee: candid::Nat },
    CreatedInFuture{ ledger_time: Timestamp },
    TooOld,
    InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
enum Icrc1transferResult { Ok(candid::Nat), Err(TransferError) }

#[derive(CandidType, Deserialize, Clone)]
struct Icrc1supportedStandardsResult { url: String, name: String }

#[derive(CandidType, Deserialize)]
struct AllowanceArgs { account: Account, spender: Account }

#[derive(CandidType, Deserialize)]
struct Icrc2allowanceResult { allowance: candid::Nat, expires_at: Option<u64> }

#[derive(CandidType, Deserialize)]
struct ApproveArgs {
  fee: Option<candid::Nat>,
  memo: Option<Vec<u8>>,
  from_subaccount: Option<Vec<u8>>,
  created_at_time: Option<u64>,
  amount: candid::Nat,
  expected_allowance: Option<candid::Nat>,
  expires_at: Option<u64>,
  spender: Account,
}

#[derive(CandidType, Deserialize)]
enum ApproveError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  AllowanceChanged{ current_allowance: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  Expired{ ledger_time: u64 },
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
enum Icrc2approveResult { Ok(candid::Nat), Err(ApproveError) }

#[derive(CandidType, Deserialize)]
struct TransferFromArgs {
  to: Account,
  fee: Option<candid::Nat>,
  spender_subaccount: Option<Vec<u8>>,
  from: Account,
  memo: Option<Vec<u8>>,
  created_at_time: Option<u64>,
  amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
enum TransferFromError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  InsufficientAllowance{ allowance: candid::Nat },
  BadBurn{ min_burn_amount: candid::Nat },
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
enum Icrc2transferFromResult { Ok(candid::Nat), Err(TransferFromError) }

#[derive(CandidType, Deserialize, Clone)]
pub struct Token {
    balances: HashMap<Principal, Nat>,
    allowances: HashMap<(Principal, Principal), (Nat, Option<u64>)>,
    decimals: u8,
    fee: Nat,
    mintint_account: Option<Account>,
    name: String,
    icrc1_supported_standards: Vec<Icrc1supportedStandardsResult>,
    symbol: String,
    total_supply: Nat,
    transfer_tx_index: Nat,
    approve_tx_index: Nat,
    transfer_from_tx_index: Nat
}

impl Token {
    fn init(args: TokenInitArgs) -> Self {
        let mut token = Token {
            balances: HashMap::new(),
            allowances: HashMap::new(),
            decimals: args.decimals,
            fee: args.fee,
            mintint_account: args.mintint_account,
            name: args.name,
            icrc1_supported_standards: vec![
                Icrc1supportedStandardsResult {
                    url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1".to_string(),
                    name: "ICRC-1".to_string()
                },
                Icrc1supportedStandardsResult {
                    url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2".to_string(),
                    name: "ICRC-2".to_string()
                }
            ],
            symbol: args.symbol,
            total_supply: Nat::from(0u8),
            transfer_tx_index: Nat::from(0u8),
            approve_tx_index: Nat::from(0u8),
            transfer_from_tx_index: Nat::from(0u8)
        };
        
        token.mint(args.init_balances);

        token
    }

    fn mint(&mut self, mint_vec: Vec<(Principal, Nat)>) -> bool {
        for (account, amount) in mint_vec {
            let old_balance = self.icrc1_balance_of(Account {
                owner: account,
                subaccount: None
            });
            self.balances.insert(account, old_balance + amount.clone());
            self.total_supply += amount;
        }
        true
    }

    fn icrc1_balance_of(&self,account: Account) -> candid::Nat {
        match self.balances.get(&account.owner) {
            None => Nat::from(0u8),
            Some(balance) => balance.clone()
        }
    }

    fn icrc1_decimals(&self) -> u8 {
        self.decimals
    }

    fn icrc1_fee(&self) -> candid::Nat {
        self.fee.clone()
    }

    fn icrc1_metadata(&self) -> Vec<(String, Value)> {
        vec![
            ("icrc1:fee".to_string(), Value::Nat(self.fee.clone())),
            ("icrc1:name".to_string(), Value::Text(self.name.clone())),
            ("icrc1:symbol".to_string(), Value::Text(self.symbol.clone())),
            ("icrc1:total_supply".to_string(), Value::Nat(self.total_supply.clone())),
            ("icrc1:decimals".to_string(), Value::Nat(self.decimals.into())),
            ("icrc1:minting_account".to_string(), Value::Text(self.mintint_account.clone().unwrap().owner.to_string())),
        ]
    }

    fn icrc1_minting_account(&self) -> Option<Account> {
        self.mintint_account.clone()
    }

    fn icrc1_name(&self) -> String {
        self.name.clone()
    }

    fn icrc1_supported_standards(&self) -> Vec<Icrc1supportedStandardsResult> {
        self.icrc1_supported_standards.clone()
    }

    fn icrc1_symbol(&self) -> String {
        self.symbol.clone()
    }

    fn icrc1_total_supply(&self) -> candid::Nat {
        self.total_supply.clone()
    }

    fn icrc1_transfer(&mut self, caller: Principal, args: TransferArgs) -> Icrc1transferResult {
        let balance = self.icrc1_balance_of(Account {
            owner: caller,
            subaccount: None
        });

        if balance < args.amount {
            return Icrc1transferResult::Err(TransferError::InsufficientFunds { balance: balance });
        }
        
        if args.to.owner == caller {
            return  Icrc1transferResult::Err(TransferError::GenericError { 
                message: String::from("Can't transfer to yourself"), 
                error_code: Nat::from(400u32) 
            })
        }

        if args.fee.is_some() && args.fee.unwrap() < self.fee {
            return Icrc1transferResult::Err(TransferError::BadFee { expected_fee: self.fee.clone() });
        }

        if args.from_subaccount.is_some() || args.to.subaccount.is_some() {
            return Icrc1transferResult::Err(TransferError::GenericError { 
                message: String::from("Not support subaccount recently"), 
                error_code: Nat::from(400u32) 
            })
        }

        if args.created_at_time.is_some() {
            return Icrc1transferResult::Err(TransferError::GenericError { 
                message: String::from("Created_at_time wrong"), 
                error_code: Nat::from(400u32) 
            });
        }

        self.balances.insert(caller, balance - args.amount.clone());
        let to_balance = self.icrc1_balance_of(args.to.clone());
        self.balances.insert(args.to.owner.clone(), to_balance + args.amount.clone() - self.fee.clone());
        self.total_supply -= self.fee.clone();
        
        let tx_index = self.transfer_tx_index.clone();
        self.transfer_tx_index += 1u8;

        Icrc1transferResult::Ok(tx_index)
    }

    fn icrc2_allowance(&self, args: AllowanceArgs) -> Icrc2allowanceResult {
        match self.allowances.get(&(args.account.owner, args.spender.owner)) {
            None => Icrc2allowanceResult {
                allowance: Nat::from(0u8),
                expires_at: None
            },
            Some(allowance) => Icrc2allowanceResult {
                allowance: allowance.0.clone(),
                expires_at: allowance.1
            }
        }
    }

    fn icrc2_approve(&mut self, caller: Principal, args: ApproveArgs) -> Icrc2approveResult {

        if args.fee.is_some() && args.fee.unwrap() < self.fee {
            return Icrc2approveResult::Err(ApproveError::BadFee { expected_fee: self.fee.clone() });
        }

        if args.from_subaccount.is_some() || args.spender.subaccount.is_some() {
            return Icrc2approveResult::Err(ApproveError::GenericError { 
                message: String::from("Not support subaccount recently"), 
                error_code: Nat::from(400u32) 
            })
        }

        if args.created_at_time.is_some() {
            return Icrc2approveResult::Err(ApproveError::GenericError { 
                message: String::from("Created_at_time wrong"), 
                error_code: Nat::from(400u32) 
            });
        }

        let old_allowance = self.allowances.get(&(caller, args.spender.owner));

        if args.expected_allowance.is_some() && old_allowance.is_some() && args.expected_allowance.unwrap() != old_allowance.unwrap().0 {
            return Icrc2approveResult::Err(ApproveError::AllowanceChanged { current_allowance: old_allowance.unwrap().0.clone() });
        }

        if args.expires_at.is_some() && args.expires_at.unwrap() < ic_cdk::api::time() {
            return Icrc2approveResult::Err(ApproveError::TooOld);
        }

        if args.spender.owner == caller {
            return Icrc2approveResult::Err(ApproveError::GenericError { 
                message: String::from("Can't approve to yourself"), 
                error_code: Nat::from(400u32) 
            });
        }

        self.allowances.insert((caller, args.spender.owner), (args.amount, args.expires_at));

        let tx_index = self.approve_tx_index.clone();
        self.approve_tx_index += 1u8;

        Icrc2approveResult::Ok(tx_index)
    }

    fn icrc2_transfer_from(&mut self, caller: Principal, args: TransferFromArgs) -> Icrc2transferFromResult {
        if args.to.owner == args.from.owner {
            return Icrc2transferFromResult::Err(TransferFromError::GenericError { 
                message: String::from("Can't transfer to from"), 
                error_code: Nat::from(400u32)
            })
        }

        if args.fee.is_some() && args.fee.unwrap() < self.fee {
            return Icrc2transferFromResult::Err(TransferFromError::BadFee { expected_fee: self.fee.clone() });
        }

        if args.spender_subaccount.is_some() {
            return Icrc2transferFromResult::Err(TransferFromError::GenericError { 
                message: String::from("Not support subaccount recently"), 
                error_code: Nat::from(400u32) 
            })
        }

        if args.from.owner == caller {
            return Icrc2transferFromResult::Err(TransferFromError::GenericError { 
                message: String::from("Spender can't be from"), 
                error_code: Nat::from(400u32) 
            })
        }

        if args.created_at_time.is_some() {
            return Icrc2transferFromResult::Err(TransferFromError::GenericError { 
                message: String::from("Created_at_time wrong"), 
                error_code: Nat::from(400u32) 
            });
        }

        let allowance = self.icrc2_allowance(AllowanceArgs {
            account: args.from.clone(),
            spender: Account {
                owner: caller,
                subaccount: None
            }
        });

        if allowance.allowance < args.amount {
            return Icrc2transferFromResult::Err(TransferFromError::InsufficientAllowance { allowance: allowance.allowance });
        }

        if allowance.expires_at.is_some() && allowance.expires_at.unwrap() < ic_cdk::api::time() {
            return Icrc2transferFromResult::Err(TransferFromError::TooOld);
        }

        let balance = self.icrc1_balance_of(args.from);
        
        if balance < args.amount {
            return Icrc2transferFromResult::Err(TransferFromError::InsufficientFunds { balance: balance });
        }

        let tx_index = self.transfer_from_tx_index.clone();
        self.transfer_from_tx_index += 1u8;

        Icrc2transferFromResult::Ok(tx_index)
    }
}

impl Storable for Token {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static TOKEN_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 
            0
        ).unwrap()
    );

    static TOKENS: RefCell<StableBTreeMap<u64, Token, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static TRADE_CA: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))), 
            Principal::from_text("r4b4l-baaaa-aaaan-qzngq-cai").unwrap()
        ).unwrap()
    );
}

#[ic_cdk::update]
fn create(args: TokenInitArgs) -> Result<u64, TokenError> {
    let caller = ic_cdk::caller();
    let trade_ca = TRADE_CA.with(|ca| ca.borrow().get().clone());

    if caller != trade_ca {
        return Err(TokenError::Unauthorized);
    }

    let token_id = TOKEN_INDEX.with(|index| index.borrow().get().clone());
    TOKEN_INDEX.with(|index| index.borrow_mut().set(token_id + 1).unwrap());

    let token = Token::init(args);

    TOKENS.with(|map| {
        map.borrow_mut().insert(token_id, token)
    });

    Ok(token_id)
}

#[ic_cdk::query]
fn icrc1_balance_of(token_id: u64, account: Account) -> Result<Nat, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_balance_of(account))
        }
    })
}

#[ic_cdk::query]
fn icrc1_decimals(token_id: u64) -> Result<u8, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_decimals())
        }
    })
}

#[ic_cdk::query]
fn icrc1_fee(token_id: u64) -> Result<Nat, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_fee())
        }
    })
}

#[ic_cdk::query]
fn icrc1_metadata(token_id: u64) -> Result<Vec<(String, Value)>, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_metadata())
        }
    })
}

#[ic_cdk::query]
fn icrc1_minting_account(token_id: u64) -> Result<Option<Account>, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_minting_account())
        }
    })
}

#[ic_cdk::query]
fn icrc1_name(token_id: u64) -> Result<String, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_name())
        }
    })
}

#[ic_cdk::query]
fn icrc1_supported_standards(token_id: u64) -> Result<Vec<Icrc1supportedStandardsResult>, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_supported_standards())
        }
    })
}

#[ic_cdk::query] 
fn icrc1_symbol(token_id: u64) -> Result<String, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_symbol())
        }
    })
}

#[ic_cdk::query]
fn icrc1_total_supply(token_id: u64) -> Result<Nat, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc1_total_supply())
        }
    })
}

#[ic_cdk::update]
fn icrc1_transfer(token_id: u64, args: TransferArgs) -> Result<Icrc1transferResult, TokenError> {
    TOKENS.with(|map| {
        match map.borrow_mut().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(mut token) => Ok(token.icrc1_transfer(ic_cdk::caller(), args))
        }
    })
}

#[ic_cdk::query]
fn icrc2_allowance(token_id: u64, args: AllowanceArgs) -> Result<Icrc2allowanceResult, TokenError> {
    TOKENS.with(|map| {
        match map.borrow().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(token) => Ok(token.icrc2_allowance(args))
        }
    })
}

#[ic_cdk::update]
fn icrc2_approve(token_id: u64, args: ApproveArgs) -> Result<Icrc2approveResult, TokenError> {
    TOKENS.with(|map| {
        match map.borrow_mut().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(mut token) => Ok(token.icrc2_approve(ic_cdk::caller(), args))
        }
    })
}

#[ic_cdk::update]
fn icrc2_transfer_from(token_id: u64, args: TransferFromArgs) -> Result<Icrc2transferFromResult, TokenError> {
    TOKENS.with(|map| {
        match map.borrow_mut().get(&token_id) {
            None => Err(TokenError::TokenNotExist),
            Some(mut token) => Ok(token.icrc2_transfer_from(ic_cdk::caller(), args))
        }
    })
}