use niuma_notebooklm::Client;

#[test]
#[ignore = "requires a live NIUMA_NOTEBOOKLM_AUTH_JSON credential"]
fn live_account_smoke() {
    let credential = std::env::var("NIUMA_NOTEBOOKLM_AUTH_JSON")
        .expect("NIUMA_NOTEBOOKLM_AUTH_JSON must contain Playwright storage-state JSON");
    let client = Client::from_storage_state(&credential).expect("authenticate");
    client.health_check().expect("list notebooks");
}
