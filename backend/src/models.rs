
use serde::{Deserialize, Serialize};

// ─── Database Models ───

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Transfer {
    pub id: String,
    pub token_hash: String,
    pub encrypted_payload: Vec<u8>,
    pub nonce: Vec<u8>,
    pub salt: Vec<u8>,
    pub source_pubkey: Option<String>,
    pub status: String,
    pub created_at: String,
    pub expires_at: String,
    pub downloaded_at: Option<String>,
    pub source_ip: Option<String>,
    pub destination_ip: Option<String>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct AuditLogEntry {
    pub id: i64,
    pub transfer_id: Option<String>,
    pub action: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub details: Option<String>,
    pub created_at: String,
}

// ─── Request DTOs ───

#[derive(Debug, Deserialize)]
pub struct InitiateTransferRequest {
    /// Base64-encoded encrypted payload (client-side encrypted keypair)
    pub encrypted_payload: String,
    /// Base64-encoded nonce used for AES-256-GCM encryption
    pub nonce: String,
    /// Base64-encoded salt used for Argon2id key derivation
    pub salt: String,
    /// Optional: validator public key for verification
    pub source_pubkey: Option<String>,
    /// Optional: custom expiry in minutes (max 60, default from config)
    pub expiry_minutes: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct ServerSideEncryptRequest {
    /// Raw keypair bytes as JSON array (e.g. [1,2,3,...,64])
    pub keypair_bytes: Vec<u8>,
    /// Passphrase to encrypt the keypair
    pub passphrase: String,
    /// Optional: validator public key for verification
    pub source_pubkey: Option<String>,
    /// Optional: custom expiry in minutes
    pub expiry_minutes: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyKeypairRequest {
    /// The expected public key (base58)
    pub expected_pubkey: String,
    /// The keypair bytes to verify
    pub keypair_bytes: Vec<u8>,
}

// ─── Response DTOs ───

#[derive(Debug, Serialize)]
pub struct InitiateTransferResponse {
    pub transfer_id: String,
    pub token: String,
    pub expires_at: String,
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct DownloadTransferResponse {
    pub encrypted_payload: String,
    pub nonce: String,
    pub salt: String,
    pub source_pubkey: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct TransferStatusResponse {
    pub transfer_id: String,
    pub status: String,
    pub created_at: String,
    pub expires_at: String,
    pub downloaded_at: Option<String>,
    pub source_pubkey: Option<String>,
    pub is_expired: bool,
}

#[derive(Debug, Serialize)]
pub struct ValidatorInfoResponse {
    pub pubkey: String,
    pub vote_pubkey: Option<String>,
    pub stake: Option<u64>,
    pub commission: Option<u8>,
    pub last_vote: Option<u64>,
    pub activated_stake: Option<u64>,
    pub is_delinquent: bool,
    pub version: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct VerifyKeypairResponse {
    pub valid: bool,
    pub pubkey: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub database: String,
    pub solana_rpc: String,
}

#[derive(Debug, Serialize)]
pub struct DeleteTransferResponse {
    pub success: bool,
    pub message: String,
}

// ─── Transfer Status Constants ───

pub const STATUS_PENDING: &str = "pending";
pub const STATUS_DOWNLOADED: &str = "downloaded";
pub const STATUS_EXPIRED: &str = "expired";
pub const STATUS_REVOKED: &str = "revoked";

// ─── Audit Actions ───

pub const ACTION_TRANSFER_INITIATED: &str = "transfer_initiated";
pub const ACTION_TRANSFER_DOWNLOADED: &str = "transfer_downloaded";
pub const ACTION_TRANSFER_REVOKED: &str = "transfer_revoked";
pub const ACTION_TRANSFER_EXPIRED: &str = "transfer_expired";
pub const ACTION_VALIDATOR_LOOKUP: &str = "validator_lookup";
pub const ACTION_KEYPAIR_VERIFIED: &str = "keypair_verified";
