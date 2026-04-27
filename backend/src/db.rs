use sqlx::{Pool, Sqlite};
use tracing::info;

use crate::error::AppError;
use crate::models::{AuditLogEntry, Transfer};

/// Run database migrations — creates tables if they don't exist.
pub async fn run_migrations(pool: &Pool<Sqlite>) {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS transfers (
            id TEXT PRIMARY KEY,
            token_hash TEXT UNIQUE NOT NULL,
            encrypted_payload BLOB NOT NULL,
            nonce BLOB NOT NULL,
            salt BLOB NOT NULL,
            source_pubkey TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            downloaded_at TEXT,
            source_ip TEXT,
            destination_ip TEXT
        )
        "#,
    )
    .execute(pool)
    .await
    .expect("Failed to create transfers table");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transfer_id TEXT,
            action TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            details TEXT,
            created_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .expect("Failed to create audit_log table");

    // Create indexes for performance
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_transfers_token_hash ON transfers(token_hash)")
        .execute(pool)
        .await
        .ok();

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)")
        .execute(pool)
        .await
        .ok();

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_audit_transfer_id ON audit_log(transfer_id)")
        .execute(pool)
        .await
        .ok();

    info!("Database migrations completed successfully");
}

/// Insert a new transfer record.
pub async fn insert_transfer(pool: &Pool<Sqlite>, transfer: &Transfer) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO transfers (id, token_hash, encrypted_payload, nonce, salt, source_pubkey, status, created_at, expires_at, source_ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&transfer.id)
    .bind(&transfer.token_hash)
    .bind(&transfer.encrypted_payload)
    .bind(&transfer.nonce)
    .bind(&transfer.salt)
    .bind(&transfer.source_pubkey)
    .bind(&transfer.status)
    .bind(&transfer.created_at)
    .bind(&transfer.expires_at)
    .bind(&transfer.source_ip)
    .execute(pool)
    .await?;

    Ok(())
}

/// Find a transfer by its token hash.
pub async fn find_transfer_by_token_hash(
    pool: &Pool<Sqlite>,
    token_hash: &str,
) -> Result<Option<Transfer>, AppError> {
    let transfer = sqlx::query_as::<_, Transfer>(
        "SELECT * FROM transfers WHERE token_hash = ?",
    )
    .bind(token_hash)
    .fetch_optional(pool)
    .await?;

    Ok(transfer)
}

/// Update transfer status to 'downloaded' and record destination IP.
pub async fn mark_transfer_downloaded(
    pool: &Pool<Sqlite>,
    id: &str,
    destination_ip: &str,
    downloaded_at: &str,
) -> Result<(), AppError> {
    sqlx::query(
        "UPDATE transfers SET status = 'downloaded', destination_ip = ?, downloaded_at = ? WHERE id = ?",
    )
    .bind(destination_ip)
    .bind(downloaded_at)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

/// Revoke a transfer (set status to 'revoked').
pub async fn revoke_transfer(pool: &Pool<Sqlite>, id: &str) -> Result<(), AppError> {
    sqlx::query("UPDATE transfers SET status = 'revoked' WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}

/// Delete expired transfers and their encrypted payloads.
pub async fn cleanup_expired_transfers(pool: &Pool<Sqlite>) -> Result<u64, AppError> {
    let now = chrono::Utc::now().to_rfc3339();
    let result = sqlx::query(
        "DELETE FROM transfers WHERE expires_at < ? AND status = 'pending'",
    )
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}

/// Insert an audit log entry.
pub async fn insert_audit_log(
    pool: &Pool<Sqlite>,
    transfer_id: Option<&str>,
    action: &str,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
    details: Option<&str>,
) -> Result<(), AppError> {
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        INSERT INTO audit_log (transfer_id, action, ip_address, user_agent, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(transfer_id)
    .bind(action)
    .bind(ip_address)
    .bind(user_agent)
    .bind(details)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}

/// Get audit logs for a specific transfer.
pub async fn get_audit_logs_for_transfer(
    pool: &Pool<Sqlite>,
    transfer_id: &str,
) -> Result<Vec<AuditLogEntry>, AppError> {
    let logs = sqlx::query_as::<_, AuditLogEntry>(
        "SELECT * FROM audit_log WHERE transfer_id = ? ORDER BY created_at DESC",
    )
    .bind(transfer_id)
    .fetch_all(pool)
    .await?;

    Ok(logs)
}
