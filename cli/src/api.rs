use anyhow::{anyhow, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct InitiateTransferRequest {
    pub encrypted_payload: String,
    pub nonce: String,
    pub salt: String,
    pub source_pubkey: Option<String>,
    pub expiry_minutes: Option<u32>,
}

#[derive(Deserialize)]
pub struct InitiateTransferResponse {
    pub transfer_id: String,
    pub token: String,
    pub expires_at: String,
    pub status: String,
}

#[derive(Deserialize)]
pub struct DownloadTransferResponse {
    pub encrypted_payload: String,
    pub nonce: String,
    pub salt: String,
    pub source_pubkey: Option<String>,
    pub created_at: String,
}

pub struct ApiClient {
    pub base_url: String,
    client: Client,
}

impl ApiClient {
    pub fn new(base_url: String) -> Self {
        Self {
            base_url,
            client: Client::new(),
        }
    }

    pub async fn upload_keypair(&self, req: &InitiateTransferRequest) -> Result<InitiateTransferResponse> {
        let url = format!("{}/transfers/initiate", self.base_url);
        let res = self.client.post(&url).json(req).send().await?;

        if !res.status().is_success() {
            let status = res.status();
            let text = res.text().await.unwrap_or_default();
            return Err(anyhow!("Upload failed: {} - {}", status, text));
        }

        let data: InitiateTransferResponse = res.json().await?;
        Ok(data)
    }

    pub async fn download_keypair(&self, token: &str) -> Result<DownloadTransferResponse> {
        let url = format!("{}/transfers/{}/download", self.base_url, token);
        let res = self.client.get(&url).send().await?;

        if !res.status().is_success() {
            let status = res.status();
            let text = res.text().await.unwrap_or_default();
            return Err(anyhow!("Download failed: {} - {}", status, text));
        }

        let data: DownloadTransferResponse = res.json().await?;
        Ok(data)
    }
}
