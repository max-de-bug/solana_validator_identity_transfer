use crate::api::{ApiClient, InitiateTransferRequest};
use crate::crypto::Crypto;
use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use dialoguer::Password;
use std::path::PathBuf;

pub async fn execute(
    api_client: &ApiClient,
    file_path: PathBuf,
    expiry_minutes: u32,
) -> Result<()> {
    println!("🔐 Initiating Secure Transfer Setup...");

    if !file_path.exists() {
        anyhow::bail!("File not found: {:?}", file_path);
    }
    println!("Found keypair at: {:?}", file_path);

    let password = Password::new()
        .with_prompt("Enter a strong passphrase to encrypt your identity")
        .with_confirmation("Confirm passphrase", "Passwords mismatching")
        .interact()
        .context("Failed to read password")?;

    println!("⏳ Encrypting and uploading...");

    let file_data = std::fs::read(&file_path)?;
    let crypto_res = Crypto::encrypt(&file_data, &password)?;

    let req = InitiateTransferRequest {
        encrypted_payload: BASE64.encode(&crypto_res.ciphertext),
        nonce: BASE64.encode(&crypto_res.nonce),
        salt: BASE64.encode(&crypto_res.salt),
        source_pubkey: None, // Omitting pubkey extraction in CLI for now
        expiry_minutes: Some(expiry_minutes),
    };

    let res = api_client.upload_keypair(&req).await?;

    println!("✅ Identity encrypted locally (AES-256-GCM).");
    println!("✅ Uploaded to secure relay.");
    println!("\nYour Transfer Token: {}", res.token);
    println!("Expires at: {}", res.expires_at);

    Ok(())
}
