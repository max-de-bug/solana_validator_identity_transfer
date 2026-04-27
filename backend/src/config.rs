use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub transfer_expiry_minutes: u64,
    pub max_payload_size_bytes: usize,
    pub solana_rpc_url: String,
    pub hmac_secret: String,
    pub rate_limit_per_minute: u64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a valid number"),
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:./data/transfers.db?mode=rwc".to_string()),
            transfer_expiry_minutes: env::var("TRANSFER_EXPIRY_MINUTES")
                .unwrap_or_else(|_| "15".to_string())
                .parse()
                .expect("TRANSFER_EXPIRY_MINUTES must be a valid number"),
            max_payload_size_bytes: env::var("MAX_PAYLOAD_SIZE_BYTES")
                .unwrap_or_else(|_| "10240".to_string()) // 10KB max
                .parse()
                .expect("MAX_PAYLOAD_SIZE_BYTES must be a valid number"),
            solana_rpc_url: env::var("SOLANA_RPC_URL")
                .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string()),
            hmac_secret: env::var("HMAC_SECRET")
                .unwrap_or_else(|_| {
                    // Generate a random secret if not provided
                    use rand::Rng;
                    let secret: [u8; 32] = rand::thread_rng().gen();
                    hex::encode(secret)
                }),
            rate_limit_per_minute: env::var("RATE_LIMIT_PER_MINUTE")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .expect("RATE_LIMIT_PER_MINUTE must be a valid number"),
        }
    }
}
