"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Lock, Eye, EyeOff, AlertTriangle,
  Loader2, CheckCircle2, FileKey, Copy, Check, Save, Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { useReceiveStore } from "@/stores/useReceiveStore";

export default function ReceivePage() {
  const store = useReceiveStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            title="Receive Validator Identity"
            subtitle="Enter the transfer token and passphrase to download your encrypted keypair"
          />

          <ErrorBanner error={store.error} onDismiss={() => store.setError("")} />

          <AnimatePresence mode="wait">
            {/* ── INPUT STEP ── */}
            {store.step === "input" && (
              <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <Download className="w-5 h-5 text-[#6366f1]" /> Download & Decrypt
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Transfer Token
                      </label>
                      <input
                        className="input-field font-mono text-sm"
                        placeholder="Paste your transfer token (UUID)"
                        value={store.token}
                        onChange={(e) => store.setToken(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Decryption Passphrase
                      </label>
                      <div className="relative">
                        <input
                          type={store.showPass ? "text" : "password"}
                          className="input-field pr-10"
                          placeholder="Enter the passphrase used during encryption"
                          value={store.passphrase}
                          onChange={(e) => store.setPassphrase(e.target.value)}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => store.setShowPass(!store.showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        >
                          {store.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={store.downloadAndDecrypt}
                    disabled={!store.token.trim() || store.passphrase.length < 8}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Download & Decrypt
                  </button>
                  <div className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)]">
                    <Info className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Decryption happens entirely in your browser. The server only delivers the encrypted bundle.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DOWNLOADING STEP ── */}
            {store.step === "downloading" && (
              <motion.div key="downloading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card text-center py-16">
                  <Loader2 className="w-12 h-12 text-[#6366f1] mx-auto mb-6 animate-spin" />
                  <h2 className="text-xl font-semibold mb-2">Downloading & Decrypting</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Fetching encrypted bundle and deriving decryption key...
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── DECRYPTED STEP ── */}
            {store.step === "decrypted" && store.decryptedKeypair && (
              <motion.div key="decrypted" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Keypair Decrypted!</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Your validator keypair has been successfully decrypted.
                    </p>
                  </div>

                  {store.sourcePubkey && (
                    <div className="mb-4 p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-1">
                        <FileKey className="w-3.5 h-3.5 text-[#14f195]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Source Validator</span>
                      </div>
                      <p className="text-sm font-mono text-[var(--color-text-primary)] break-all">
                        {store.sourcePubkey}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] mb-4">
                    <label className="block text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wider font-medium">
                      Keypair (64 bytes)
                    </label>
                    <code className="text-xs font-mono text-[var(--color-text-secondary)] break-all block max-h-24 overflow-y-auto">
                      [{Array.from(store.decryptedKeypair).join(", ")}]
                    </code>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={store.saveKeypairFile}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Save as JSON
                    </button>
                    <button
                      onClick={store.copyKeypair}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      {store.copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
                      {store.copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/80">
                      Save this keypair securely. The transfer token has been burned and cannot be reused.
                    </p>
                  </div>

                  <button onClick={store.reset} className="btn-secondary w-full mt-4">
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
