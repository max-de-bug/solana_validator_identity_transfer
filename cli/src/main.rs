mod api;
mod commands;
mod crypto;

use crate::api::ApiClient;
use anyhow::Result;
use clap::{Parser, Subcommand};
use std::path::PathBuf;

/// ValidatorShift CLI - Securely transfer Solana validator identities
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// URL of the ValidatorShift backend API
    #[arg(
        short,
        long,
        env = "VALIDATOR_SHIFT_API_URL",
        default_value = "http://localhost:8080/api/v1"
    )]
    api_url: String,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Encrypt and send a validator keypair to generate a transfer token
    Send {
        /// Path to the validator-keypair.json file
        #[arg(short, long, default_value = "./validator-keypair.json")]
        file: PathBuf,

        /// Expiry time in minutes
        #[arg(short, long, default_value = "15")]
        expiry_minutes: u32,
    },
    /// Download and decrypt a validator keypair using a transfer token
    Receive {
        /// The transfer token
        #[arg(short, long)]
        token: String,

        /// Path to save the decrypted validator-keypair.json file
        #[arg(short, long, default_value = "./validator-keypair.json")]
        output: PathBuf,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let api_client = ApiClient::new(cli.api_url);

    match cli.command {
        Commands::Send {
            file,
            expiry_minutes,
        } => {
            commands::send::execute(&api_client, file, expiry_minutes).await?;
        }
        Commands::Receive { token, output } => {
            commands::receive::execute(&api_client, token, output).await?;
        }
    }

    Ok(())
}
