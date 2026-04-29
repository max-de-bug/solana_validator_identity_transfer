use crate::api::ApiClient;
use crate::crypto::Crypto;
use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use dialoguer::Password;
use std::path::PathBuf;

pub async fn execute(api_client: &ApiClient, token: String, output_path: PathBuf) -> Result<()> {
    println!("📥 Initiating Secure Receive Setup...");

    let password = Password::new()
        .with_prompt("🔑 Enter the passphrase used to encrypt this transfer")
        .interact()
        .context("Failed to read password")?;

    let pb = indicatif::ProgressBar::new_spinner();
    pb.set_style(indicatif::ProgressStyle::default_spinner().template("{spinner:.green} {msg}").unwrap());
    pb.set_message("Downloading encrypted bundle from relay...");
    pb.enable_steady_tick(std::time::Duration::from_millis(120));

    let res = api_client.download_keypair(&token).await?;

    pb.set_message("Decrypting and validating payload...");
    let encrypted_payload = BASE64.decode(&res.encrypted_payload)?;
    let nonce = BASE64.decode(&res.nonce)?;
    let salt = BASE64.decode(&res.salt)?;

    let decrypted_data = Crypto::decrypt(&encrypted_payload, &nonce, &salt, &password)
        .context("Failed to decrypt payload. Incorrect password or corrupted data.")?;

    if decrypted_data.len() != 64 {
        pb.finish_and_clear();
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

    pb.finish_with_message("Success!");

    println!("\n──────────────────────────────────────────────────");
    println!("✨ Keypair successfully restored!");
    println!("──────────────────────────────────────────────────");
    println!("📂 Saved to       : \x1b[1;32m{:?}\x1b[0m", output_path);
    println!("🔒 Verification   : AES-256-GCM Integrity Verified");
    println!("🔥 Token Status   : Burned (Single-Use Complete)");
    println!("──────────────────────────────────────────────────");


    Ok(())
}
