use crate::api::ApiClient;
use crate::crypto::Crypto;
use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use dialoguer::Password;
use std::path::PathBuf;

pub async fn execute(api_client: &ApiClient, token: String, output_path: PathBuf) -> Result<()> {
    println!("📥 Initiating Secure Receive Setup...");

    let password = Password::new()
        .with_prompt("Enter the passphrase used to encrypt this transfer")
        .interact()
        .context("Failed to read password")?;

    println!("⏳ Downloading and decrypting...");

    let res = api_client.download_keypair(&token).await?;

    let encrypted_payload = BASE64.decode(&res.encrypted_payload)?;
    let nonce = BASE64.decode(&res.nonce)?;
    let salt = BASE64.decode(&res.salt)?;

    let decrypted_data = Crypto::decrypt(&encrypted_payload, &nonce, &salt, &password)
        .context("Failed to decrypt payload. Incorrect password or corrupted data.")?;

    if decrypted_data.len() != 64 {
        anyhow::bail!(
            "Decrypted data is not a valid Solana keypair (expected 64 bytes, got {})",
            decrypted_data.len()
        );
    }

    // Save as JSON array (standard Solana format)
    let json_data = serde_json::to_string(&decrypted_data)
        .context("Failed to serialize keypair to JSON")?;

    std::fs::write(&output_path, json_data)
        .context("Failed to write decrypted keypair to file")?;

    println!("✅ Encrypted payload downloaded from secure relay.");
    println!("✅ Payload successfully decrypted and validated (64 bytes).");
    println!("✅ Keypair saved to {:?} in JSON format.", output_path);

    Ok(())
}
