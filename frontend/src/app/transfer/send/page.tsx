"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileKey, Lock, Eye, EyeOff, Copy, Check,
  AlertTriangle, Shield, Clock, ArrowRight, X,
  Loader2, CheckCircle2, Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  encryptKeypair, toBase64, parseKeypairJson,
  extractPubkeyFromKeypair, validateKeypairBytes,
} from "@/lib/crypto";
import api from "@/lib/api";

type Step = "upload" | "passphrase" | "encrypting" | "success";

export default function SendPage() {
  const [step, setStep] = useState<Step>("upload");
  const [keypairBytes, setKeypairBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState("");
  const [pubkey, setPubkey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(15);
  const [error, setError] = useState("");
  const [transferToken, setTransferToken] = useState("");
  const [transferId, setTransferId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const bytes = parseKeypairJson(content);
        if (!validateKeypairBytes(bytes)) { setError("Invalid keypair: must be exactly 64 bytes"); return; }
        setPubkey(extractPubkeyFromKeypair(bytes));
        setKeypairBytes(bytes); setFileName(file.name); setStep("passphrase");
      } catch (err: any) { setError(err.message || "Failed to parse keypair file"); }
    };
    reader.readAsText(file);
  }, []);

  const handlePasteSubmit = useCallback(() => {
    setError("");
    try {
      const bytes = parseKeypairJson(pasteContent);
      if (!validateKeypairBytes(bytes)) { setError("Invalid keypair"); return; }
      setPubkey(extractPubkeyFromKeypair(bytes));
      setKeypairBytes(bytes); setFileName("pasted-keypair"); setStep("passphrase");
    } catch (err: any) { setError(err.message); }
  }, [pasteContent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleEncryptAndSend = async () => {
    setError("");
    if (passphrase.length < 8) { setError("Passphrase must be at least 8 characters"); return; }
    if (passphrase !== confirmPassphrase) { setError("Passphrases do not match"); return; }
    if (!keypairBytes) { setError("No keypair loaded"); return; }
    setStep("encrypting");
    try {
      const { ciphertext, nonce, salt } = await encryptKeypair(keypairBytes, passphrase);
      const response = await api.initiateTransfer({
        encrypted_payload: toBase64(ciphertext), nonce: toBase64(nonce),
        salt: toBase64(salt), source_pubkey: pubkey || undefined, expiry_minutes: expiryMinutes,
      });
      setTransferToken(response.token); setTransferId(response.transfer_id);
      setExpiresAt(response.expires_at);
      setPassphrase(""); setConfirmPassphrase(""); setKeypairBytes(null); setStep("success");
    } catch (err: any) { setError(err.message || "Failed to initiate transfer"); setStep("passphrase"); }
  };

  const copyToken = async () => { await navigator.clipboard.writeText(transferToken); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const resetForm = () => { setStep("upload"); setKeypairBytes(null); setFileName(""); setPubkey(""); setPassphrase(""); setConfirmPassphrase(""); setError(""); setTransferToken(""); setPasteMode(false); setPasteContent(""); };

  const stepIndex = (s: string) => ["upload","passphrase","encrypting","success"].indexOf(s);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="gradient-text">Send Validator Identity</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[var(--color-text-secondary)]">
              Encrypt and upload your validator keypair for secure transfer
            </motion.p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {["upload","passphrase","success"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`step-indicator ${step === s || (step === "encrypting" && s === "passphrase") ? "step-active" : stepIndex(step) > stepIndex(s) ? "step-complete" : "step-inactive"}`}>
                  {stepIndex(step) > stepIndex(s) ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className="w-12 sm:w-20 h-0.5 rounded" style={{ background: stepIndex(step) > i ? "linear-gradient(90deg, #10b981, #14f195)" : "var(--color-border)" }} />}
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 flex-1">{error}</p>
                  <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* UPLOAD STEP */}
            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><FileKey className="w-5 h-5 text-[#6366f1]" /> Load Validator Keypair</h2>
                    <button onClick={() => setPasteMode(!pasteMode)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">{pasteMode ? "Upload file" : "Paste JSON"}</button>
                  </div>
                  {pasteMode ? (
                    <div>
                      <textarea className="textarea-field font-mono text-xs" placeholder='[12, 34, 56, ...]' value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} rows={6} />
                      <button onClick={handlePasteSubmit} disabled={!pasteContent.trim()} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">Parse & Continue <ArrowRight className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div className={`drop-zone ${isDragging ? "active" : ""}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Drag & drop <span className="text-[var(--color-text-primary)] font-medium">validator-keypair.json</span></p>
                        <p className="text-xs text-[var(--color-text-muted)]">or click to browse</p>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".json" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
                    </>
                  )}
                  <div className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)]">
                    <Info className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--color-text-secondary)]">Your keypair is encrypted in-browser. We never see your private key.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASSPHRASE STEP */}
            {step === "passphrase" && (
              <motion.div key="passphrase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><Lock className="w-5 h-5 text-[#6366f1]" /> Set Encryption Passphrase</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6">You&apos;ll need this same passphrase to decrypt on the destination.</p>
                  {pubkey && (
                    <div className="mb-6 p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-1"><Shield className="w-3.5 h-3.5 text-[#14f195]" /><span className="text-xs text-[var(--color-text-muted)]">Validator Public Key</span></div>
                      <p className="text-sm font-mono text-[var(--color-text-primary)] break-all">{pubkey}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">File: {fileName}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Passphrase</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} className="input-field pr-10" placeholder="Min 8 characters" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} autoComplete="off" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Confirm Passphrase</label>
                      <input type={showPass ? "text" : "password"} className="input-field" placeholder="Re-enter passphrase" value={confirmPassphrase} onChange={(e) => setConfirmPassphrase(e.target.value)} autoComplete="off" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Token Expiry</label>
                      <select className="input-field" value={expiryMinutes} onChange={(e) => setExpiryMinutes(Number(e.target.value))}>
                        <option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={15}>15 minutes (recommended)</option><option value={30}>30 minutes</option><option value={60}>60 minutes</option>
                      </select>
                    </div>
                  </div>
                  {passphrase && (
                    <div className="mt-4">
                      <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${Math.min(100, (passphrase.length / 20) * 100)}%` }} /></div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{passphrase.length < 8 ? "Too short" : passphrase.length < 12 ? "Fair" : passphrase.length < 16 ? "Good" : "Strong"} — {passphrase.length} chars</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button onClick={resetForm} className="btn-secondary flex-1">Back</button>
                    <button onClick={handleEncryptAndSend} disabled={passphrase.length < 8 || passphrase !== confirmPassphrase} className="btn-primary flex-1 flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Encrypt & Send</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ENCRYPTING STEP */}
            {step === "encrypting" && (
              <motion.div key="encrypting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card text-center py-16">
                  <Loader2 className="w-12 h-12 text-[#6366f1] mx-auto mb-6 animate-spin" />
                  <h2 className="text-xl font-semibold mb-2">Encrypting & Uploading</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">Deriving key with PBKDF2 (600k iterations)...</p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-[#10b981]" /></div>
                    <h2 className="text-xl font-semibold mb-2">Transfer Created!</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">Share the token below with the destination operator.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] mb-4">
                    <label className="block text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wider font-medium">Transfer Token (Single-Use)</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-[#14f195] break-all">{transferToken}</code>
                      <button onClick={copyToken} className="p-2 rounded-lg hover:bg-[rgba(99,102,241,0.1)] shrink-0">{copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Transfer ID</p>
                      <p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{transferId}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Expires</p>
                      <p className="text-xs font-mono text-[var(--color-text-secondary)]">{expiresAt ? new Date(expiresAt).toLocaleTimeString() : "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/80">This token works <strong>once</strong>. After download, it&apos;s permanently deleted.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)]">
                      <Lock className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                      <p className="text-xs text-[var(--color-text-secondary)]">The recipient needs the <strong>same passphrase</strong> to decrypt.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={resetForm} className="btn-secondary flex-1">New Transfer</button>
                    <a href={`/transfer/status?token=${encodeURIComponent(transferToken)}`} className="btn-primary flex-1 flex items-center justify-center gap-2">Check Status <ArrowRight className="w-4 h-4" /></a>
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
