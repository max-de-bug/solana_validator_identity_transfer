import { create } from "zustand";
import { decryptKeypair, fromBase64 } from "@/lib/crypto";
import { receiveFormSchema } from "@/lib/schemas";
import api from "@/lib/api";

export type ReceiveStep = "input" | "downloading" | "decrypted";

interface ReceiveState {
  // Wizard step
  step: ReceiveStep;

  // Form fields
  token: string;
  passphrase: string;
  showPass: boolean;

  // Result
  decryptedKeypair: Uint8Array | null;
  sourcePubkey: string | null;

  // Ephemeral UI
  error: string;
  copied: boolean;

  // Actions
  setToken: (token: string) => void;
  setPassphrase: (passphrase: string) => void;
  setShowPass: (showPass: boolean) => void;
  setError: (error: string) => void;

  downloadAndDecrypt: () => Promise<void>;
  saveKeypairFile: () => void;
  copyKeypair: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: "input" as ReceiveStep,
  token: "",
  passphrase: "",
  showPass: false,
  decryptedKeypair: null as Uint8Array | null,
  sourcePubkey: null as string | null,
  error: "",
  copied: false,
};

export const useReceiveStore = create<ReceiveState>((set, get) => ({
  ...initialState,

  setToken: (token) => set({ token }),
  setPassphrase: (passphrase) => set({ passphrase }),
  setShowPass: (showPass) => set({ showPass }),
  setError: (error) => set({ error }),

  downloadAndDecrypt: async () => {
    const { token, passphrase } = get();

    // Validate with Zod
    const validation = receiveFormSchema.safeParse({ token, passphrase });
    if (!validation.success) {
      set({ error: validation.error.issues[0].message });
      return;
    }

    set({ step: "downloading", error: "" });

    try {
      const data = await api.downloadTransfer(token.trim());
      const ciphertext = fromBase64(data.encrypted_payload);
      const nonce = fromBase64(data.nonce);
      const salt = fromBase64(data.salt);
      const keypairBytes = await decryptKeypair(ciphertext, nonce, salt, passphrase);

      if (keypairBytes.length !== 64) {
        throw new Error("Decrypted data is not a valid 64-byte keypair");
      }

      set({
        decryptedKeypair: keypairBytes,
        sourcePubkey: data.source_pubkey,
        passphrase: "", // wipe from memory
        step: "decrypted",
      });
    } catch (err: any) {
      const msg = err.message || "Failed to download or decrypt";
      const friendlyError =
        msg.includes("Decryption failed") || msg.includes("OperationError")
          ? "Decryption failed — wrong passphrase or corrupted data"
          : msg;
      set({ error: friendlyError, step: "input" });
    }
  },

  saveKeypairFile: () => {
    const { decryptedKeypair } = get();
    if (!decryptedKeypair) return;

    const jsonArray = JSON.stringify(Array.from(decryptedKeypair));
    const blob = new Blob([jsonArray], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validator-keypair.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  copyKeypair: async () => {
    const { decryptedKeypair } = get();
    if (!decryptedKeypair) return;
    await navigator.clipboard.writeText(
      JSON.stringify(Array.from(decryptedKeypair))
    );
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2000);
  },

  reset: () => set({ ...initialState }),
}));
