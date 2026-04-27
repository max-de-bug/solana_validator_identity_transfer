use actix_web::{web, HttpRequest, HttpResponse};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::{Duration, Utc};
use sqlx::{Pool, Sqlite};
use tracing::info;
use uuid::Uuid;

use crate::config::AppConfig;
use crate::crypto;
use crate::db;
use crate::error::AppError;
use crate::models::*;

/// Configure all API routes.
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route("/health", web::get().to(health_check))
            .route("/transfers/initiate", web::post().to(initiate_transfer))
            .route(
                "/transfers/initiate-encrypted",
                web::post().to(initiate_server_encrypted_transfer),
            )
            .route(
                "/transfers/{token}/download",
                web::get().to(download_transfer),
            )
            .route(
                "/transfers/{token}/status",
                web::get().to(transfer_status),
            )
            .route("/transfers/{token}", web::delete().to(revoke_transfer))
            .route("/validator/{pubkey}/info", web::get().to(validator_info))
            .route("/validator/verify", web::post().to(verify_keypair)),
    );
}

// ─── Health Check ───

async fn health_check(
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
) -> Result<HttpResponse, AppError> {
    // Check database
    let db_status = match sqlx::query("SELECT 1").execute(pool.get_ref()).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    // Check Solana RPC (lightweight)
    let rpc_status = match tokio::task::spawn_blocking({
        let rpc_url = config.solana_rpc_url.clone();
        move || {
            let client = solana_client::rpc_client::RpcClient::new(rpc_url);
            client.get_slot()
        }
    })
    .await
    {
        Ok(Ok(_)) => "connected",
        _ => "unreachable",
    };

    Ok(HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: 0, // Could track with a start timestamp
        database: db_status.to_string(),
        solana_rpc: rpc_status.to_string(),
    }))
}

// ─── Transfer: Initiate (Client-Side Encrypted) ───

/// Accepts a pre-encrypted payload from the client.
/// The server never sees the plaintext keypair.
async fn initiate_transfer(
    req: HttpRequest,
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    body: web::Json<InitiateTransferRequest>,
) -> Result<HttpResponse, AppError> {
    info!("Transfer initiation requested");

    // Decode and validate the payload
    let encrypted_payload = BASE64
        .decode(&body.encrypted_payload)
        .map_err(|e| AppError::BadRequest(format!("Invalid base64 encrypted_payload: {}", e)))?;

    let nonce = BASE64
        .decode(&body.nonce)
        .map_err(|e| AppError::BadRequest(format!("Invalid base64 nonce: {}", e)))?;

    let salt = BASE64
        .decode(&body.salt)
        .map_err(|e| AppError::BadRequest(format!("Invalid base64 salt: {}", e)))?;

    if encrypted_payload.len() > config.max_payload_size_bytes {
        return Err(AppError::PayloadTooLarge);
    }

    if nonce.len() != 12 {
        return Err(AppError::BadRequest("Nonce must be 12 bytes".to_string()));
    }

    if salt.len() < 8 {
        return Err(AppError::BadRequest(
            "Salt must be at least 8 bytes".to_string(),
        ));
    }

    // Generate transfer ID and token
    let transfer_id = Uuid::new_v4().to_string();
    let token = Uuid::new_v4().to_string();
    let token_hash = crypto::hmac_token(&token, &config.hmac_secret)?;

    // Calculate expiry
    let expiry_minutes = body
        .expiry_minutes
        .unwrap_or(config.transfer_expiry_minutes)
        .min(60); // Max 60 minutes

    let now = Utc::now();
    let expires_at = now + Duration::minutes(expiry_minutes as i64);

    let source_ip = extract_ip(&req);

    // Store the transfer
    let transfer = Transfer {
        id: transfer_id.clone(),
        token_hash,
        encrypted_payload,
        nonce,
        salt,
        source_pubkey: body.source_pubkey.clone(),
        status: STATUS_PENDING.to_string(),
        created_at: now.to_rfc3339(),
        expires_at: expires_at.to_rfc3339(),
        downloaded_at: None,
        source_ip: Some(source_ip.clone()),
        destination_ip: None,
    };

    db::insert_transfer(pool.get_ref(), &transfer).await?;

    // Audit log
    db::insert_audit_log(
        pool.get_ref(),
        Some(&transfer_id),
        ACTION_TRANSFER_INITIATED,
        Some(&source_ip),
        req.headers()
            .get("user-agent")
            .and_then(|v| v.to_str().ok()),
        Some(&format!("Expiry: {} minutes", expiry_minutes)),
    )
    .await?;

    info!(
        transfer_id = %transfer_id,
        expiry_minutes = expiry_minutes,
        "Transfer initiated successfully"
    );

    Ok(HttpResponse::Created().json(InitiateTransferResponse {
        transfer_id,
        token,
        expires_at: expires_at.to_rfc3339(),
        status: STATUS_PENDING.to_string(),
    }))
}

// ─── Transfer: Initiate (Server-Side Encrypted) ───

/// Accepts raw keypair bytes and a passphrase.
/// The server encrypts and stores the payload.
/// NOTE: This is less secure than client-side encryption since the
/// plaintext key briefly exists in server memory.
async fn initiate_server_encrypted_transfer(
    req: HttpRequest,
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    body: web::Json<ServerSideEncryptRequest>,
) -> Result<HttpResponse, AppError> {
    info!("Server-side encrypted transfer initiation requested");

    if body.keypair_bytes.len() != 64 {
        return Err(AppError::BadRequest(
            "Keypair must be exactly 64 bytes".to_string(),
        ));
    }

    if body.passphrase.len() < 8 {
        return Err(AppError::BadRequest(
            "Passphrase must be at least 8 characters".to_string(),
        ));
    }

    // Generate salt and derive key
    let salt = crypto::generate_salt();
    let key = crypto::derive_key_from_passphrase(&body.passphrase, &salt)?;

    // Encrypt the keypair
    let (encrypted_payload, nonce) = crypto::encrypt_aes256gcm(&key, &body.keypair_bytes)?;

    if encrypted_payload.len() > config.max_payload_size_bytes {
        return Err(AppError::PayloadTooLarge);
    }

    // Generate transfer ID and token
    let transfer_id = Uuid::new_v4().to_string();
    let token = Uuid::new_v4().to_string();
    let token_hash = crypto::hmac_token(&token, &config.hmac_secret)?;

    let expiry_minutes = body
        .expiry_minutes
        .unwrap_or(config.transfer_expiry_minutes)
        .min(60);

    let now = Utc::now();
    let expires_at = now + Duration::minutes(expiry_minutes as i64);

    let source_ip = extract_ip(&req);

    let transfer = Transfer {
        id: transfer_id.clone(),
        token_hash,
        encrypted_payload,
        nonce: nonce.to_vec(),
        salt: salt.to_vec(),
        source_pubkey: body.source_pubkey.clone(),
        status: STATUS_PENDING.to_string(),
        created_at: now.to_rfc3339(),
        expires_at: expires_at.to_rfc3339(),
        downloaded_at: None,
        source_ip: Some(source_ip.clone()),
        destination_ip: None,
    };

    db::insert_transfer(pool.get_ref(), &transfer).await?;

    db::insert_audit_log(
        pool.get_ref(),
        Some(&transfer_id),
        ACTION_TRANSFER_INITIATED,
        Some(&source_ip),
        req.headers()
            .get("user-agent")
            .and_then(|v| v.to_str().ok()),
        Some("Server-side encryption used"),
    )
    .await?;

    info!(
        transfer_id = %transfer_id,
        "Server-encrypted transfer initiated successfully"
    );

    Ok(HttpResponse::Created().json(InitiateTransferResponse {
        transfer_id,
        token,
        expires_at: expires_at.to_rfc3339(),
        status: STATUS_PENDING.to_string(),
    }))
}

// ─── Transfer: Download (Single-Use) ───

async fn download_transfer(
    req: HttpRequest,
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let token = path.into_inner();
    let token_hash = crypto::hmac_token(&token, &config.hmac_secret)?;

    let transfer = db::find_transfer_by_token_hash(pool.get_ref(), &token_hash)
        .await?
        .ok_or_else(|| AppError::NotFound("Transfer not found or invalid token".to_string()))?;

    // Check status
    match transfer.status.as_str() {
        STATUS_DOWNLOADED => return Err(AppError::TransferAlreadyDownloaded),
        STATUS_REVOKED => return Err(AppError::TransferRevoked),
        STATUS_EXPIRED => return Err(AppError::TransferExpired),
        _ => {}
    }

    // Check expiry
    let expires_at = chrono::DateTime::parse_from_rfc3339(&transfer.expires_at)
        .map_err(|e| AppError::InternalError(format!("Invalid expiry date: {}", e)))?;

    if Utc::now() > expires_at {
        return Err(AppError::TransferExpired);
    }

    let destination_ip = extract_ip(&req);
    let now = Utc::now().to_rfc3339();

    // Mark as downloaded (single-use)
    db::mark_transfer_downloaded(pool.get_ref(), &transfer.id, &destination_ip, &now).await?;

    // Audit log
    db::insert_audit_log(
        pool.get_ref(),
        Some(&transfer.id),
        ACTION_TRANSFER_DOWNLOADED,
        Some(&destination_ip),
        req.headers()
            .get("user-agent")
            .and_then(|v| v.to_str().ok()),
        None,
    )
    .await?;

    info!(
        transfer_id = %transfer.id,
        "Transfer downloaded successfully"
    );

    Ok(HttpResponse::Ok().json(DownloadTransferResponse {
        encrypted_payload: BASE64.encode(&transfer.encrypted_payload),
        nonce: BASE64.encode(&transfer.nonce),
        salt: BASE64.encode(&transfer.salt),
        source_pubkey: transfer.source_pubkey,
        created_at: transfer.created_at,
    }))
}

// ─── Transfer: Status ───

async fn transfer_status(
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let token = path.into_inner();
    let token_hash = crypto::hmac_token(&token, &config.hmac_secret)?;

    let transfer = db::find_transfer_by_token_hash(pool.get_ref(), &token_hash)
        .await?
        .ok_or_else(|| AppError::NotFound("Transfer not found".to_string()))?;

    let expires_at = chrono::DateTime::parse_from_rfc3339(&transfer.expires_at)
        .map_err(|e| AppError::InternalError(format!("Invalid expiry date: {}", e)))?;

    let is_expired = Utc::now() > expires_at && transfer.status == STATUS_PENDING;

    Ok(HttpResponse::Ok().json(TransferStatusResponse {
        transfer_id: transfer.id,
        status: if is_expired {
            STATUS_EXPIRED.to_string()
        } else {
            transfer.status
        },
        created_at: transfer.created_at,
        expires_at: transfer.expires_at,
        downloaded_at: transfer.downloaded_at,
        source_pubkey: transfer.source_pubkey,
        is_expired,
    }))
}

// ─── Transfer: Revoke ───

async fn revoke_transfer(
    req: HttpRequest,
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let token = path.into_inner();
    let token_hash = crypto::hmac_token(&token, &config.hmac_secret)?;

    let transfer = db::find_transfer_by_token_hash(pool.get_ref(), &token_hash)
        .await?
        .ok_or_else(|| AppError::NotFound("Transfer not found".to_string()))?;

    if transfer.status != STATUS_PENDING {
        return Err(AppError::BadRequest(format!(
            "Cannot revoke transfer with status: {}",
            transfer.status
        )));
    }

    db::revoke_transfer(pool.get_ref(), &transfer.id).await?;

    let source_ip = extract_ip(&req);
    db::insert_audit_log(
        pool.get_ref(),
        Some(&transfer.id),
        ACTION_TRANSFER_REVOKED,
        Some(&source_ip),
        req.headers()
            .get("user-agent")
            .and_then(|v| v.to_str().ok()),
        None,
    )
    .await?;

    info!(transfer_id = %transfer.id, "Transfer revoked");

    Ok(HttpResponse::Ok().json(DeleteTransferResponse {
        success: true,
        message: "Transfer revoked successfully".to_string(),
    }))
}

// ─── Validator: Info ───

async fn validator_info(
    req: HttpRequest,
    config: web::Data<AppConfig>,
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let pubkey = path.into_inner();

    let rpc_url = config.solana_rpc_url.clone();
    let pubkey_clone = pubkey.clone();

    let info = tokio::task::spawn_blocking(move || {
        crate::solana_rpc::get_validator_info(&rpc_url, &pubkey_clone)
    })
    .await
    .map_err(|e| AppError::InternalError(format!("Task join error: {}", e)))??;

    // Audit log
    let source_ip = extract_ip(&req);
    db::insert_audit_log(
        pool.get_ref(),
        None,
        ACTION_VALIDATOR_LOOKUP,
        Some(&source_ip),
        None,
        Some(&format!("Looked up: {}", pubkey)),
    )
    .await?;

    Ok(HttpResponse::Ok().json(info))
}

// ─── Validator: Verify Keypair ───

async fn verify_keypair(
    req: HttpRequest,
    pool: web::Data<Pool<Sqlite>>,
    body: web::Json<VerifyKeypairRequest>,
) -> Result<HttpResponse, AppError> {
    let matches =
        crate::solana_rpc::verify_keypair_matches_pubkey(&body.keypair_bytes, &body.expected_pubkey)?;

    let source_ip = extract_ip(&req);
    db::insert_audit_log(
        pool.get_ref(),
        None,
        ACTION_KEYPAIR_VERIFIED,
        Some(&source_ip),
        None,
        Some(&format!(
            "Verified {} — match: {}",
            body.expected_pubkey, matches
        )),
    )
    .await?;

    Ok(HttpResponse::Ok().json(VerifyKeypairResponse {
        valid: matches,
        pubkey: body.expected_pubkey.clone(),
        message: if matches {
            "Keypair matches the expected public key".to_string()
        } else {
            "Keypair does NOT match the expected public key".to_string()
        },
    }))
}

// ─── Helpers ───

fn extract_ip(req: &HttpRequest) -> String {
    req.connection_info()
        .realip_remote_addr()
        .unwrap_or("unknown")
        .to_string()
}
