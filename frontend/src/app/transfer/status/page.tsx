"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Shield, Trash2, X, RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api, { TransferStatusResponse } from "@/lib/api";

function StatusContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [status, setStatus] = useState<TransferStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t && !status) { setToken(t); checkStatus(t); }
  }, [searchParams]);

  const checkStatus = async (t?: string) => {
    const tokenVal = (t || token).trim();
    if (!tokenVal) { setError("Please enter a transfer token"); return; }
    setError(""); setLoading(true);
    try {
      const data = await api.getTransferStatus(tokenVal);
      setStatus(data);
    } catch (err: any) { setError(err.message || "Failed to check status"); }
    finally { setLoading(false); }
  };

  const revokeTransfer = async () => {
    if (!token.trim() || !confirm("Are you sure? This cannot be undone.")) return;
    setRevoking(true); setError("");
    try {
      await api.revokeTransfer(token.trim());
      await checkStatus();
    } catch (err: any) { setError(err.message); }
    finally { setRevoking(false); }
  };

  const getStatusBadge = (s: string, expired: boolean) => {
    if (expired || s === "expired") return { class: "badge-expired", label: "Expired", icon: XCircle };
    if (s === "downloaded") return { class: "badge-downloaded", label: "Downloaded", icon: CheckCircle2 };
    if (s === "revoked") return { class: "badge-revoked", label: "Revoked", icon: XCircle };
    return { class: "badge-pending", label: "Pending", icon: Clock };
  };

  return (
    <main className="flex-1 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">Transfer Status</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[var(--color-text-secondary)]">
            Check the status of a transfer using the token
          </motion.p>
        </div>

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

        {/* Search */}
        <div className="card mb-6">
          <div className="flex gap-3">
            <input className="input-field font-mono text-sm flex-1" placeholder="Enter transfer token" value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkStatus()} />
            <button onClick={() => checkStatus()} disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Check
            </button>
          </div>
        </div>

        {/* Status Result */}
        <AnimatePresence>
          {status && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card">
                {(() => {
                  const badge = getStatusBadge(status.status, status.is_expired);
                  const BadgeIcon = badge.icon;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#6366f1]" /> Transfer Details
                        </h2>
                        <span className={`badge ${badge.class}`}>
                          <BadgeIcon className="w-3.5 h-3.5" /> {badge.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Transfer ID</p>
                          <p className="text-xs font-mono text-[var(--color-text-secondary)] break-all">{status.transfer_id}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p>
                          <p className="text-sm font-semibold capitalize">{status.is_expired ? "expired" : status.status}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Created</p>
                          <p className="text-xs font-mono text-[var(--color-text-secondary)]">{new Date(status.created_at).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Expires</p>
                          <p className="text-xs font-mono text-[var(--color-text-secondary)]">{new Date(status.expires_at).toLocaleString()}</p>
                        </div>
                        {status.source_pubkey && (
                          <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] sm:col-span-2">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Validator Pubkey</p>
                            <p className="text-xs font-mono text-[#14f195] break-all">{status.source_pubkey}</p>
                          </div>
                        )}
                        {status.downloaded_at && (
                          <div className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] sm:col-span-2">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Downloaded At</p>
                            <p className="text-xs font-mono text-[var(--color-text-secondary)]">{new Date(status.downloaded_at).toLocaleString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => checkStatus()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        {status.status === "pending" && !status.is_expired && (
                          <button onClick={revokeTransfer} disabled={revoking} className="btn-danger flex-1 flex items-center justify-center gap-2">
                            {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Revoke
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function StatusPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 pt-24 pb-16 px-4 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" /></div>}>
        <StatusContent />
      </Suspense>
      <Footer />
    </div>
  );
}
