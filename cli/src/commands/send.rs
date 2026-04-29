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

    println!("⏳ Reading and validating keypair...");

    let file_data = std::fs::read(&file_path)
        .with_context(|| format!("Failed to read file: {:?}", file_path))?;

    // Strategy: Try to parse as JSON array first, then fallback to raw bytes
    let keypair_bytes: Vec<u8> = if let Ok(json_array) = serde_json::from_slice::<Vec<u8>>(&file_data) {
        println!("📝 Detected Solana JSON keypair format.");
        json_array
    } else {
        println!("📂 Detected raw binary keypair format.");
        file_data
    };

    if keypair_bytes.len() != 64 {
        anyhow::bail!(
            "Invalid keypair size: expected 64 bytes, got {}. Solana keypairs must be exactly 64 bytes.",
            keypair_bytes.len()
        );
    }

    let crypto_res = Crypto::encrypt(&keypair_bytes, &password)?;

    let req = InitiateTransferRequest {
        encrypted_payload: BASE64.encode(&crypto_res.ciphertext),
        nonce: BASE64.encode(&crypto_res.nonce),
        salt: BASE64.encode(&crypto_res.salt),
        source_pubkey: None, // Omitting pubkey extraction for now
        expiry_minutes: Some(expiry_minutes),
    };

    let res = api_client.upload_keypair(&req).await?;

    println!("✅ Identity encrypted locally (AES-256-GCM).");
    println!("✅ Uploaded to secure relay.");
    println!("\nYour Transfer Token: {}", res.token);
    println!("Expires at: {}", res.expires_at);

    Ok(())
}
