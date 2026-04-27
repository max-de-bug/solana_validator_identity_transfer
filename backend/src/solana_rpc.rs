use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

use crate::error::AppError;
use crate::models::ValidatorInfoResponse;

/// Fetch validator information from the Solana network.
pub fn get_validator_info(rpc_url: &str, pubkey_str: &str) -> Result<ValidatorInfoResponse, AppError> {
    let pubkey = Pubkey::from_str(pubkey_str)
        .map_err(|e| AppError::BadRequest(format!("Invalid public key: {}", e)))?;

    let client = RpcClient::new(rpc_url.to_string());

    // Get vote accounts to find validator info
    let vote_accounts = client
        .get_vote_accounts()
        .map_err(|e| AppError::SolanaError(format!("Failed to fetch vote accounts: {}", e)))?;

    // Check current validators
    for va in &vote_accounts.current {
        if va.node_pubkey == pubkey_str {
            return Ok(ValidatorInfoResponse {
                pubkey: pubkey_str.to_string(),
                vote_pubkey: Some(va.vote_pubkey.clone()),
                stake: Some(va.activated_stake),
                commission: Some(va.commission),
                last_vote: Some(va.last_vote),
                activated_stake: Some(va.activated_stake),
                is_delinquent: false,
                version: None,
            });
        }
    }

    // Check delinquent validators
    for va in &vote_accounts.delinquent {
        if va.node_pubkey == pubkey_str {
            return Ok(ValidatorInfoResponse {
                pubkey: pubkey_str.to_string(),
                vote_pubkey: Some(va.vote_pubkey.clone()),
                stake: Some(va.activated_stake),
                commission: Some(va.commission),
                last_vote: Some(va.last_vote),
                activated_stake: Some(va.activated_stake),
                is_delinquent: true,
                version: None,
            });
        }
    }

    // Validator not found in vote accounts — still return basic info
    // Check if the account exists at all
    let _account = client
        .get_account(&pubkey)
        .map_err(|_| AppError::NotFound(format!("Account {} not found on Solana", pubkey_str)))?;

    Ok(ValidatorInfoResponse {
        pubkey: pubkey_str.to_string(),
        vote_pubkey: None,
        stake: None,
        commission: None,
        last_vote: None,
        activated_stake: None,
        is_delinquent: false,
        version: None,
    })
}

/// Verify that a keypair's public key matches the expected value.
pub fn verify_keypair_matches_pubkey(
    keypair_bytes: &[u8],
    expected_pubkey: &str,
) -> Result<bool, AppError> {
    if keypair_bytes.len() != 64 {
        return Err(AppError::BadRequest(
            "Keypair must be exactly 64 bytes (32-byte secret + 32-byte public key)".to_string(),
        ));
    }

    let expected = Pubkey::from_str(expected_pubkey)
        .map_err(|e| AppError::BadRequest(format!("Invalid public key: {}", e)))?;

    // The public key is the last 32 bytes of the 64-byte keypair
    let pubkey_bytes = &keypair_bytes[32..64];
    let derived_pubkey = Pubkey::from(<[u8; 32]>::try_from(pubkey_bytes)
        .map_err(|_| AppError::BadRequest("Invalid keypair format".to_string()))?);

    Ok(derived_pubkey == expected)
}
