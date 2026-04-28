"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileKey, Lock, Eye, EyeOff, Copy, Check,
  AlertTriangle, Shield, Clock, ArrowRight,
  Loader2, CheckCircle2, Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { useSendStore } from "@/stores/useSendStore";
import { getPassphraseStrength } from "@/lib/schemas";

/** Resolves step position for progress indicator logic. */
const STEP_ORDER = ["upload", "passphrase", "encrypting", "success"] as const;
const stepIndex = (s: string) => STEP_ORDER.indexOf(s as typeof STEP_ORDER[number]);

export default function SendPage() {
  const store = useSendStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        store.loadKeypairFromContent(content, file.name);
      };
      reader.readAsText(file);
    },
    [store]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      store.setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, store]
  );

  const handlePaste = useCallback(() => {
    store.loadKeypairFromContent(store.pasteContent, "pasted-keypair");
  }, [store]);

  const strength = getPassphraseStrength(store.passphrase);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 grainy">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            title="Send Validator Identity"
            subtitle="Encrypt and upload your validator keypair for secure transfer"
          />

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {["upload", "passphrase", "success"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`step-indicator ${
                    store.step === s ||
                    (store.step === "encrypting" && s === "passphrase")
                      ? "step-active"
                      : stepIndex(store.step) > stepIndex(s)
                      ? "step-complete"
                      : "step-inactive"
                  }`}
                >
                  {stepIndex(store.step) > stepIndex(s) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className="w-12 sm:w-20 h-0.5 rounded"
                    style={{
                      background:
                        stepIndex(store.step) > i
                          ? "linear-gradient(90deg, #4f46e5, #7c3aed)"
                          : "#e4e4e7",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <ErrorBanner error={store.error} onDismiss={() => store.setError("")} />

          <AnimatePresence mode="wait">
            {/* ── UPLOAD STEP ── */}
            {store.step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                      <FileKey className="w-5 h-5 text-indigo-500" /> Load Validator Keypair
                    </h2>
                    <button
                      onClick={() => store.setPasteMode(!store.pasteMode)}
                      className="text-xs text-zinc-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                      {store.pasteMode ? "Upload file" : "Paste JSON"}
                    </button>
                  </div>

                  {store.pasteMode ? (
                    <div>
                      <textarea
                        className="textarea-field"
                        placeholder="[12, 34, 56, ...]"
                        value={store.pasteContent}
                        onChange={(e) => store.setPasteContent(e.target.value)}
                        rows={6}
                      />
                      <button
                        onClick={handlePaste}
                        disabled={!store.pasteContent.trim()}
                        className="btn-primary w-full mt-4 justify-center"
                      >
                        Parse & Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`drop-zone ${store.isDragging ? "active" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); store.setIsDragging(true); }}
                        onDragLeave={() => store.setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                        <p className="text-sm text-zinc-600 mb-1">
                          Drag & drop{" "}
                          <span className="text-zinc-900 font-medium">
                            validator-keypair.json
                          </span>
                        </p>
                        <p className="text-xs text-zinc-400">or click to browse</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        className="hidden"
                      />
                    </>
                  )}

                  <div className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700">
                      Your keypair is encrypted in-browser. We never see your private key.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PASSPHRASE STEP ── */}
            {store.step === "passphrase" && (
              <motion.div key="passphrase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-indigo-500" /> Set Encryption Passphrase
                  </h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    You&apos;ll need this same passphrase to decrypt on the destination.
                  </p>

                  {store.pubkey && (
                    <div className="mb-6 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-zinc-500">Validator Public Key</span>
                      </div>
                      <p className="text-sm font-mono text-zinc-900 break-all">{store.pubkey}</p>
                      <p className="text-xs text-zinc-400 mt-1">File: {store.fileName}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Passphrase</label>
                      <div className="relative">
                        <input
                          type={store.showPass ? "text" : "password"}
                          className="input-field pr-10"
                          placeholder="Min 8 characters"
                          value={store.passphrase}
                          onChange={(e) => store.setPassphrase(e.target.value)}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => store.setShowPass(!store.showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {store.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Confirm Passphrase</label>
                      <input
                        type={store.showPass ? "text" : "password"}
                        className="input-field"
                        placeholder="Re-enter passphrase"
                        value={store.confirmPassphrase}
                        onChange={(e) => store.setConfirmPassphrase(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Token Expiry</label>
                      <select
                        className="input-field"
                        value={store.expiryMinutes}
                        onChange={(e) => store.setExpiryMinutes(Number(e.target.value))}
                      >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes (recommended)</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                  </div>

                  {store.passphrase && (
                    <div className="mt-4">
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${strength.percent}%` }} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {strength.label} — {store.passphrase.length} chars
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={store.reset} className="btn-secondary flex-1 justify-center">Back</button>
                    <button
                      onClick={store.encryptAndSend}
                      disabled={store.passphrase.length < 8 || store.passphrase !== store.confirmPassphrase}
                      className="btn-primary flex-1 justify-center"
                    >
                      <Lock className="w-4 h-4" /> Encrypt & Send
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ENCRYPTING STEP ── */}
            {store.step === "encrypting" && (
              <motion.div key="encrypting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card text-center py-16">
                  <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-6 animate-spin" />
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2">Encrypting & Uploading</h2>
                  <p className="text-sm text-zinc-500">
                    Deriving key with PBKDF2 (600k iterations)...
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS STEP ── */}
            {store.step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900 mb-2">Transfer Created!</h2>
                    <p className="text-sm text-zinc-500">
                      Share the token below with the destination operator.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 mb-4">
                    <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-medium">
                      Transfer Token (Single-Use)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-indigo-600 break-all">
                        {store.transferToken}
                      </code>
                      <button onClick={store.copyToken} className="p-2 rounded-lg hover:bg-zinc-100 shrink-0 transition-colors">
                        {store.copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <p className="text-xs text-zinc-400 mb-1">Transfer ID</p>
                      <p className="text-xs font-mono text-zinc-600 truncate">{store.transferId}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expires
                      </p>
                      <p className="text-xs font-mono text-zinc-600">
                        {store.expiresAt ? new Date(store.expiresAt).toLocaleTimeString() : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        This token works <strong>once</strong>. After download, it&apos;s permanently deleted.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <Lock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-700">
                        The recipient needs the <strong>same passphrase</strong> to decrypt.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={store.reset} className="btn-secondary flex-1 justify-center">New Transfer</button>
                    <a
                      href={`/transfer/status?token=${encodeURIComponent(store.transferToken)}`}
                      className="btn-primary flex-1 justify-center"
                    >
                      Check Status <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
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
