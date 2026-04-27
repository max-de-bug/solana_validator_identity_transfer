import { z } from "zod";

/**
 * Schema for the passphrase form on the Send page.
 * Validates passphrase strength, confirmation match, and expiry selection.
 */
export const sendPassphraseSchema = z
  .object({
    passphrase: z
      .string()
      .min(8, "Passphrase must be at least 8 characters")
      .max(256, "Passphrase must be at most 256 characters"),
    confirmPassphrase: z.string(),
    expiryMinutes: z
      .number()
      .int()
      .min(1, "Expiry must be at least 1 minute")
      .max(60, "Expiry must be at most 60 minutes"),
  })
  .refine((data) => data.passphrase === data.confirmPassphrase, {
    message: "Passphrases do not match",
    path: ["confirmPassphrase"],
  });

export type SendPassphraseInput = z.infer<typeof sendPassphraseSchema>;

/**
 * Schema for the Receive page form.
 * Validates token format and passphrase requirements.
 */
export const receiveFormSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Transfer token is required")
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Token must be a valid UUID"
    ),
  passphrase: z
    .string()
    .min(8, "Passphrase must be at least 8 characters"),
});

export type ReceiveFormInput = z.infer<typeof receiveFormSchema>;

/**
 * Schema for keypair byte validation.
 * Ensures the parsed JSON array is exactly 64 bytes with valid byte values.
 */
export const keypairBytesSchema = z
  .array(z.number().int().min(0).max(255))
  .length(64, "Keypair must be exactly 64 bytes");

/**
 * Utility: compute passphrase strength label and percentage.
 */
export function getPassphraseStrength(passphrase: string) {
  const length = passphrase.length;
  if (length === 0) return { label: "", percent: 0 };
  if (length < 8) return { label: "Too short", percent: (length / 20) * 100 };
  if (length < 12) return { label: "Fair", percent: (length / 20) * 100 };
  if (length < 16) return { label: "Good", percent: (length / 20) * 100 };
  return { label: "Strong", percent: Math.min(100, (length / 20) * 100) };
}
