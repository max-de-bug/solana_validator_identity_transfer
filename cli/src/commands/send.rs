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
        .with_prompt("🔑 Enter a strong passphrase to encrypt your identity")
        .with_confirmation("🔐 Confirm passphrase", "❌ Passwords mismatching")
        .interact()
        .context("Failed to read password")?;

    let pb = indicatif::ProgressBar::new_spinner();
    pb.set_style(indicatif::ProgressStyle::default_spinner().template("{spinner:.green} {msg}").unwrap());
    pb.set_message("Reading and validating keypair...");
    pb.enable_steady_tick(std::time::Duration::from_millis(120));

    let file_data = std::fs::read(&file_path)
        .with_context(|| format!("Failed to read file: {:?}", file_path))?;

    // Strategy: Try to parse as JSON array first, then fallback to raw bytes
    let keypair_bytes: Vec<u8> = if let Ok(json_array) = serde_json::from_slice::<Vec<u8>>(&file_data) {
        pb.set_message("Detected Solana JSON keypair format...");
        json_array
    } else {
        pb.set_message("Detected raw binary keypair format...");
        file_data
    };

    if keypair_bytes.len() != 64 {
        pb.finish_and_clear();
        anyhow::bail!(
            "Invalid keypair size: expected 64 bytes, got {}. Solana keypairs must be exactly 64 bytes.",
            keypair_bytes.len()
        );
    }

    pb.set_message("Encrypting locally (AES-256-GCM)...");
    let crypto_res = Crypto::encrypt(&keypair_bytes, &password)?;

    pb.set_message("Uploading to secure relay...");
    let req = InitiateTransferRequest {
        encrypted_payload: BASE64.encode(&crypto_res.ciphertext),
        nonce: BASE64.encode(&crypto_res.nonce),
        salt: BASE64.encode(&crypto_res.salt),
        source_pubkey: None, 
        expiry_minutes: Some(expiry_minutes),
    };

    let res = api_client.upload_keypair(&req).await?;
    pb.finish_with_message("Done!");

    println!("\n──────────────────────────────────────────────────");
    println!("🚀 Identity securely staged for transfer!");
    println!("──────────────────────────────────────────────────");
    println!("🎫 Transfer Token : \x1b[1;36m{}\x1b[0m", res.token);
    println!("⏰ Expires at     : {}", res.expires_at);
    println!("──────────────────────────────────────────────────");
    println!("ℹ️  Share this token and your passphrase securely with the receiver.");
    println!("⚠️  The token is SINGLE-USE and will be burned after one download.");
    println!("──────────────────────────────────────────────────");

    Ok(())
}
