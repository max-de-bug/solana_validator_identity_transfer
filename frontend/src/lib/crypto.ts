/**
 * Client-side cryptography utilities using Web Crypto API.
 * All encryption/decryption happens in the browser — the server never sees plaintext keys.
 */

/**
 * Derive an AES-256 key from a passphrase using PBKDF2 with SHA-256.
 * We use PBKDF2 on the client side as it's natively supported by Web Crypto API.
 * The server uses Argon2id — but both produce equivalent AES-256 keys from passphrases.
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 600000, // OWASP recommended minimum for PBKDF2-SHA256
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt data using AES-256-GCM.
 * Returns { ciphertext, nonce, salt } — all as Uint8Arrays.
 */
export async function encryptKeypair(
  keypairBytes: Uint8Array,
  passphrase: string
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array; salt: Uint8Array }> {
  // Generate random salt (16 bytes) and nonce (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from passphrase
  const key = await deriveKey(passphrase, salt);

  // Encrypt using AES-256-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce as BufferSource },
    key,
    keypairBytes as BufferSource
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    nonce,
    salt,
  };
}

/**
 * Decrypt data using AES-256-GCM.
 * Returns the decrypted plaintext as Uint8Array.
 */
export async function decryptKeypair(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  salt: Uint8Array,
  passphrase: string
): Promise<Uint8Array> {
  const key = await deriveKey(passphrase, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce as BufferSource },
    key,
    ciphertext as BufferSource
  );

  return new Uint8Array(plaintext);
}

/**
 * Convert Uint8Array to base64 string.
 */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array.
 */
export function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Validate that a keypair is exactly 64 bytes (ed25519).
 */
export function validateKeypairBytes(bytes: Uint8Array): boolean {
  return bytes.length === 64;
}

/**
 * Extract the public key (last 32 bytes) from a 64-byte keypair.
 * Returns it as a base58 string.
 */
export function extractPubkeyFromKeypair(keypairBytes: Uint8Array): string {
  if (keypairBytes.length !== 64) {
    throw new Error("Invalid keypair: must be 64 bytes");
  }
  const pubkeyBytes = keypairBytes.slice(32, 64);
  return encodeBase58(pubkeyBytes);
}

/**
 * Simple base58 encoder (Bitcoin alphabet).
 */
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function encodeBase58(bytes: Uint8Array): string {
  const digits: number[] = [0];

  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let result = "";
  // Leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result += BASE58_ALPHABET[0];
  }
  // Convert digits to base58 string
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }

  return result;
}

/**
 * Parse a Solana keypair JSON file (array of 64 numbers).
 */
export function parseKeypairJson(json: string): Uint8Array {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr) || arr.length !== 64) {
      throw new Error("Keypair must be a JSON array of 64 numbers");
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "number" || arr[i] < 0 || arr[i] > 255) {
        throw new Error(`Invalid byte at index ${i}: ${arr[i]}`);
      }
    }
    return new Uint8Array(arr);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
    }
    throw e;
  }
}
