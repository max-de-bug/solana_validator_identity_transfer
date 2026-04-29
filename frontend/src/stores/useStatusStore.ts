import { create } from "zustand";
import api, { TransferStatusResponse } from "@/lib/api";
import { statusTokenSchema } from "@/lib/schemas";

interface StatusState {
  token: string;
  status: TransferStatusResponse | null;
  loading: boolean;
  error: string;
  revoking: boolean;

  setToken: (token: string) => void;
  setError: (error: string) => void;
  checkStatus: (t?: string) => Promise<void>;
  revokeTransfer: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  token: "",
  status: null as TransferStatusResponse | null,
  loading: false,
  error: "",
  revoking: false,
};

export const useStatusStore = create<StatusState>((set, get) => ({
  ...initialState,

  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),

  checkStatus: async (t?: string) => {
    const { token } = get();
    const tokenVal = (t || token).trim();
    
    const validation = statusTokenSchema.safeParse({ token: tokenVal });
    if (!validation.success) {
      set({ error: validation.error.issues[0].message });
      return;
    }

    set({ error: "", loading: true, token: tokenVal });
    try {
      const data = await api.getTransferStatus(tokenVal);
      set({ status: data });
    } catch (err: any) {
      set({ error: err.message || "Failed to check status", status: null });
    } finally {
      set({ loading: false });
    }
  },

  revokeTransfer: async () => {
    const { token, checkStatus } = get();
    if (!token.trim()) return;

    set({ revoking: true, error: "" });
    try {
      await api.revokeTransfer(token.trim());
      await checkStatus();
    } catch (err: any) {
      set({ error: err.message || "Failed to revoke transfer" });
    } finally {
      set({ revoking: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
