use aes_gcm::aead::{Aead, KeyInit, Payload};
use aes_gcm::{Aes256Gcm, Nonce as AesNonce};
use anyhow::{anyhow, Result};
use pbkdf2::pbkdf2_hmac;
use rand::RngCore;
use sha2::Sha256;

const PBKDF2_ITERATIONS: u32 = 600_000;
const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

pub struct CryptoResult {
    pub ciphertext: Vec<u8>,
    pub nonce: Vec<u8>,
    pub salt: Vec<u8>,
}

pub struct Crypto;

impl Crypto {
    pub fn encrypt(data: &[u8], password: &str) -> Result<CryptoResult> {
        let mut salt = vec![0u8; SALT_LEN];
        rand::thread_rng().fill_bytes(&mut salt);

        let mut key = vec![0u8; KEY_LEN];
        pbkdf2_hmac::<Sha256>(password.as_bytes(), &salt, PBKDF2_ITERATIONS, &mut key);

        let mut nonce_bytes = vec![0u8; NONCE_LEN];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = AesNonce::from_slice(&nonce_bytes);

        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| anyhow!("Invalid key length: {}", e))?;

        let ciphertext = cipher
            .encrypt(nonce, Payload { msg: data, aad: &[] })
            .map_err(|e| anyhow!("Encryption failed: {}", e))?;

        Ok(CryptoResult {
            ciphertext,
            nonce: nonce_bytes,
            salt,
        })
    }

    pub fn decrypt(ciphertext: &[u8], nonce: &[u8], salt: &[u8], password: &str) -> Result<Vec<u8>> {
        let mut key = vec![0u8; KEY_LEN];
        pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, PBKDF2_ITERATIONS, &mut key);

        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| anyhow!("Invalid key length: {}", e))?;
        let aes_nonce = AesNonce::from_slice(nonce);

        let plaintext = cipher
            .decrypt(aes_nonce, Payload { msg: ciphertext, aad: &[] })
            .map_err(|e| anyhow!("Decryption failed. Incorrect password or corrupted data: {}", e))?;

        Ok(plaintext)
    }
}
