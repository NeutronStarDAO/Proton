use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use std::cell::{RefCell, Cell};
use std::collections::HashMap;
use types::{HttpRequest, HttpResponse, HeaderField};
use serde_bytes::ByteBuf;

thread_local! {
    static PHOTO_MAP: RefCell<HashMap<u64, Vec<u8>>> = RefCell::new(HashMap::new());
    static PHOTO_INDEX: Cell<u64> = Cell::new(0);
}

#[ic_cdk::update]
fn upload_photo(photo: Vec<u8>) -> u64 {
    PHOTO_MAP.with(|map| {
        map.borrow_mut().insert(PHOTO_INDEX.get(), photo)
    });
    PHOTO_INDEX.set(PHOTO_INDEX.get() + 1);
    PHOTO_INDEX.get() - 1
}

#[ic_cdk::query]
fn get_photo(index: u64) -> Option<Vec<u8>> {
    PHOTO_MAP.with(|map| {
        map.borrow().get(&index).cloned()
    })
}

#[ic_cdk::query] 
fn get_photo_number() -> u64 {
    PHOTO_INDEX.get()
}

// canister.raw.icp0.io/photo_index
#[ic_cdk::query]
fn http_request(request: HttpRequest) -> HttpResponse {
    let token_array: Vec<&str> = request.url.split("/").collect();
    let index: u64 = token_array[1].parse().unwrap();
    PHOTO_MAP.with(|map| {
        match map.borrow().get(&index) {
            None => {
                HttpResponse {
                    status_code: 404,
                    headers: vec![HeaderField("Content-Type".to_string(), "text/plain; version=0.0.4".to_string())],
                    body: ByteBuf::from("404 NOT FOUND"),
                    streaming_strategy: None
                }
            },
            Some(photo) => {
                HttpResponse {
                    status_code: 200,
                    headers: vec![HeaderField("Content-Type".to_string(), "image/jpg".to_string())],
                    body: ByteBuf::from(photo.clone()),
                    streaming_strategy: None
                }
            }
        }
    })
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

ic_cdk::export_candid!();