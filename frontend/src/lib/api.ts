/**
 * API client for the Rust backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface InitiateTransferRequest {
  encrypted_payload: string;
  nonce: string;
  salt: string;
  source_pubkey?: string;
  expiry_minutes?: number;
}

export interface InitiateTransferResponse {
  transfer_id: string;
  token: string;
  expires_at: string;
  status: string;
}

export interface DownloadTransferResponse {
  encrypted_payload: string;
  nonce: string;
  salt: string;
  source_pubkey: string | null;
  created_at: string;
}

export interface TransferStatusResponse {
  transfer_id: string;
  status: string;
  created_at: string;
  expires_at: string;
  downloaded_at: string | null;
  source_pubkey: string | null;
  is_expired: boolean;
}

export interface ValidatorInfoResponse {
  pubkey: string;
  vote_pubkey: string | null;
  stake: number | null;
  commission: number | null;
  last_vote: number | null;
  activated_stake: number | null;
  is_delinquent: boolean;
  version: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
  database: string;
  solana_rpc: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  /** Health check */
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  /** Initiate a transfer with client-side encrypted payload */
  async initiateTransfer(
    data: InitiateTransferRequest
  ): Promise<InitiateTransferResponse> {
    return this.request<InitiateTransferResponse>("/transfers/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** Download an encrypted transfer bundle */
  async downloadTransfer(token: string): Promise<DownloadTransferResponse> {
    return this.request<DownloadTransferResponse>(
      `/transfers/${encodeURIComponent(token)}/download`
    );
  }

  /** Check transfer status */
  async getTransferStatus(token: string): Promise<TransferStatusResponse> {
    return this.request<TransferStatusResponse>(
      `/transfers/${encodeURIComponent(token)}/status`
    );
  }

  /** Revoke a pending transfer */
  async revokeTransfer(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/transfers/${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
  }

  /** Get validator info from Solana */
  async getValidatorInfo(pubkey: string): Promise<ValidatorInfoResponse> {
    return this.request<ValidatorInfoResponse>(
      `/validator/${encodeURIComponent(pubkey)}/info`
    );
  }
}

export const api = new ApiClient();
export default api;
