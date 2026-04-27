use actix_web::{HttpResponse, ResponseError};
use serde::Serialize;


#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Transfer expired")]
    TransferExpired,

    #[error("Transfer already downloaded")]
    TransferAlreadyDownloaded,

    #[error("Transfer revoked")]
    TransferRevoked,

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Solana RPC error: {0}")]
    SolanaError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Payload too large")]
    PayloadTooLarge,

    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        let (status, error_type) = match self {
            AppError::NotFound(_) => (actix_web::http::StatusCode::NOT_FOUND, "NOT_FOUND"),
            AppError::BadRequest(_) => (actix_web::http::StatusCode::BAD_REQUEST, "BAD_REQUEST"),
            AppError::Unauthorized(_) => {
                (actix_web::http::StatusCode::UNAUTHORIZED, "UNAUTHORIZED")
            }
            AppError::TransferExpired => (actix_web::http::StatusCode::GONE, "TRANSFER_EXPIRED"),
            AppError::TransferAlreadyDownloaded => {
                (actix_web::http::StatusCode::GONE, "TRANSFER_ALREADY_DOWNLOADED")
            }
            AppError::TransferRevoked => (actix_web::http::StatusCode::GONE, "TRANSFER_REVOKED"),
            AppError::EncryptionError(_) => (
                actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
                "ENCRYPTION_ERROR",
            ),
            AppError::SolanaError(_) => (
                actix_web::http::StatusCode::BAD_GATEWAY,
                "SOLANA_RPC_ERROR",
            ),
            AppError::DatabaseError(_) => (
                actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
                "DATABASE_ERROR",
            ),
            AppError::RateLimitExceeded => (
                actix_web::http::StatusCode::TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
            ),
            AppError::PayloadTooLarge => (
                actix_web::http::StatusCode::PAYLOAD_TOO_LARGE,
                "PAYLOAD_TOO_LARGE",
            ),
            AppError::InternalError(_) => (
                actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
            ),
        };

        HttpResponse::build(status).json(ErrorResponse {
            error: error_type.to_string(),
            message: self.to_string(),
            details: None,
        })
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);
        AppError::DatabaseError(err.to_string())
    }
}
