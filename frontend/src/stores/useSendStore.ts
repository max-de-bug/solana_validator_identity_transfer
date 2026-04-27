import { create } from "zustand";
import {
  encryptKeypair,
  toBase64,
  parseKeypairJson,
  extractPubkeyFromKeypair,
} from "@/lib/crypto";
import { sendPassphraseSchema, keypairBytesSchema } from "@/lib/schemas";
import api from "@/lib/api";

export type SendStep = "upload" | "passphrase" | "encrypting" | "success";

interface SendState {
  // Wizard step
  step: SendStep;

  // Keypair data (cleared after encryption)
  keypairBytes: Uint8Array | null;
  fileName: string;
  pubkey: string;

  // Passphrase form
  passphrase: string;
  confirmPassphrase: string;
  showPass: boolean;
  expiryMinutes: number;

  // Upload UI
  pasteMode: boolean;
  pasteContent: string;
  isDragging: boolean;

  // Result
  transferToken: string;
  transferId: string;
  expiresAt: string;

  // Ephemeral UI
  error: string;
  copied: boolean;

  // Actions
  setStep: (step: SendStep) => void;
  setError: (error: string) => void;
  setPassphrase: (value: string) => void;
  setConfirmPassphrase: (value: string) => void;
  setShowPass: (value: boolean) => void;
  setExpiryMinutes: (value: number) => void;
  setPasteMode: (value: boolean) => void;
  setPasteContent: (value: string) => void;
  setIsDragging: (value: boolean) => void;

  loadKeypairFromContent: (content: string, fileName: string) => void;
  encryptAndSend: () => Promise<void>;
  copyToken: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: "upload" as SendStep,
  keypairBytes: null as Uint8Array | null,
  fileName: "",
  pubkey: "",
  passphrase: "",
  confirmPassphrase: "",
  showPass: false,
  expiryMinutes: 15,
  pasteMode: false,
  pasteContent: "",
  isDragging: false,
  transferToken: "",
  transferId: "",
  expiresAt: "",
  error: "",
  copied: false,
};

export const useSendStore = create<SendState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setPassphrase: (passphrase) => set({ passphrase }),
  setConfirmPassphrase: (confirmPassphrase) => set({ confirmPassphrase }),
  setShowPass: (showPass) => set({ showPass }),
  setExpiryMinutes: (expiryMinutes) => set({ expiryMinutes }),
  setPasteMode: (pasteMode) => set({ pasteMode }),
  setPasteContent: (pasteContent) => set({ pasteContent }),
  setIsDragging: (isDragging) => set({ isDragging }),

  loadKeypairFromContent: (content, fileName) => {
    try {
      const bytes = parseKeypairJson(content);
      const result = keypairBytesSchema.safeParse(Array.from(bytes));
      if (!result.success) {
        set({ error: result.error.issues[0].message });
        return;
      }
      const pubkey = extractPubkeyFromKeypair(bytes);
      set({ keypairBytes: bytes, fileName, pubkey, error: "", step: "passphrase" });
    } catch (err: any) {
      set({ error: err.message || "Failed to parse keypair" });
    }
  },

  encryptAndSend: async () => {
    const { passphrase, confirmPassphrase, expiryMinutes, keypairBytes, pubkey } = get();

    // Validate with Zod
    const validation = sendPassphraseSchema.safeParse({
      passphrase,
      confirmPassphrase,
      expiryMinutes,
    });
    if (!validation.success) {
      set({ error: validation.error.issues[0].message });
      return;
    }
    if (!keypairBytes) {
      set({ error: "No keypair loaded" });
      return;
    }

    set({ step: "encrypting", error: "" });

    try {
      const { ciphertext, nonce, salt } = await encryptKeypair(keypairBytes, passphrase);
      const response = await api.initiateTransfer({
        encrypted_payload: toBase64(ciphertext),
        nonce: toBase64(nonce),
        salt: toBase64(salt),
        source_pubkey: pubkey || undefined,
        expiry_minutes: expiryMinutes,
      });

      set({
        transferToken: response.token,
        transferId: response.transfer_id,
        expiresAt: response.expires_at,
        // Wipe sensitive data
        passphrase: "",
        confirmPassphrase: "",
        keypairBytes: null,
        step: "success",
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to initiate transfer", step: "passphrase" });
    }
  },

  copyToken: async () => {
    const { transferToken } = get();
    await navigator.clipboard.writeText(transferToken);
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2000);
  },

  reset: () => set({ ...initialState }),
}));
