use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use hmac::{Hmac, Mac};
use pbkdf2::pbkdf2_hmac;
use rand::RngCore;
use sha2::Sha256;

use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Number of PBKDF2 iterations — matches the frontend Web Crypto API
/// and CLI configurations exactly for cross-client interoperability.
const PBKDF2_ITERATIONS: u32 = 600_000;

/// Derives an AES-256 key from a passphrase using PBKDF2-SHA256.
/// Uses 600,000 iterations (OWASP recommended) to match the frontend
/// and CLI key derivation, ensuring payloads encrypted by any client
/// can be decrypted by any other client.
pub fn derive_key_from_passphrase(passphrase: &str, salt: &[u8]) -> Result<[u8; 32], AppError> {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(passphrase.as_bytes(), salt, PBKDF2_ITERATIONS, &mut key);
    Ok(key)
}

/// Encrypts plaintext using AES-256-GCM with the given key.
/// Returns (ciphertext, nonce).
pub fn encrypt_aes256gcm(key: &[u8; 32], plaintext: &[u8]) -> Result<(Vec<u8>, [u8; 12]), AppError> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| AppError::EncryptionError(format!("Cipher init error: {}", e)))?;

    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| AppError::EncryptionError(format!("Encryption error: {}", e)))?;

    Ok((ciphertext, nonce_bytes))
}

/// Decrypts ciphertext using AES-256-GCM.
pub fn decrypt_aes256gcm(
    key: &[u8; 32],
    ciphertext: &[u8],
    nonce_bytes: &[u8; 12],
) -> Result<Vec<u8>, AppError> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| AppError::EncryptionError(format!("Cipher init error: {}", e)))?;

    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| AppError::EncryptionError("Decryption failed — wrong passphrase or corrupted data".to_string()))?;

    Ok(plaintext)
}

/// Generate a cryptographically secure random salt (16 bytes).
pub fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt);
    salt
}

/// Generate an HMAC-SHA256 of the transfer token for storage.
/// The raw token is never stored — only its HMAC.
pub fn hmac_token(token: &str, secret: &str) -> Result<String, AppError> {
    let mut mac = <HmacSha256 as Mac>::new_from_slice(secret.as_bytes())
        .map_err(|e| AppError::EncryptionError(format!("HMAC init error: {}", e)))?;
    mac.update(token.as_bytes());
    let result = mac.finalize();
    Ok(hex::encode(result.into_bytes()))
}

/// Verify an HMAC-SHA256 of the transfer token.
pub fn verify_hmac_token(token: &str, expected_hmac: &str, secret: &str) -> Result<bool, AppError> {
    let computed = hmac_token(token, secret)?;
    Ok(computed == expected_hmac)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let key = [42u8; 32];
        let plaintext = b"This is a test validator keypair";

        let (ciphertext, nonce) = encrypt_aes256gcm(&key, plaintext).unwrap();
        let decrypted = decrypt_aes256gcm(&key, &ciphertext, &nonce).unwrap();

        assert_eq!(plaintext.to_vec(), decrypted);
    }

    #[test]
    fn test_wrong_key_fails_decrypt() {
        let key = [42u8; 32];
        let wrong_key = [99u8; 32];
        let plaintext = b"Secret data";

        let (ciphertext, nonce) = encrypt_aes256gcm(&key, plaintext).unwrap();
        let result = decrypt_aes256gcm(&wrong_key, &ciphertext, &nonce);

        assert!(result.is_err());
    }

    #[test]
    fn test_key_derivation() {
        let salt = generate_salt();
        let key1 = derive_key_from_passphrase("my-passphrase", &salt).unwrap();
        let key2 = derive_key_from_passphrase("my-passphrase", &salt).unwrap();
        let key3 = derive_key_from_passphrase("different-passphrase", &salt).unwrap();

        assert_eq!(key1, key2); // Same passphrase + salt = same key
        assert_ne!(key1, key3); // Different passphrase = different key
    }

    #[test]
    fn test_hmac_token() {
        let token = "test-token-12345";
        let secret = "my-secret";

        let hmac1 = hmac_token(token, secret).unwrap();
        let hmac2 = hmac_token(token, secret).unwrap();

        assert_eq!(hmac1, hmac2); // Deterministic
        assert!(verify_hmac_token(token, &hmac1, secret).unwrap());
        assert!(!verify_hmac_token("wrong-token", &hmac1, secret).unwrap());
    }
}
