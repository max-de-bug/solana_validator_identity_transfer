"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Server, AlertTriangle, Loader2, X,
  Shield, Coins, Hash, Activity, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api, { ValidatorInfoResponse } from "@/lib/api";

export default function ValidatorInfoPage() {
  const [pubkey, setPubkey] = useState("");
  const [info, setInfo] = useState<ValidatorInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupValidator = async () => {
    if (!pubkey.trim()) { setError("Enter a validator public key"); return; }
    setError(""); setLoading(true); setInfo(null);
    try {
      const data = await api.getValidatorInfo(pubkey.trim());
      setInfo(data);
    } catch (err: any) { setError(err.message || "Failed to lookup validator"); }
    finally { setLoading(false); }
  };

  const formatSol = (lamports: number | null) => {
    if (lamports === null) return "—";
    return (lamports / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL";
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 grainy">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Validator Lookup
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500">
              Look up validator information on the Solana network
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-indigo-500" /> Validator Public Key
            </h2>
            <div className="flex gap-3">
              <input className="input-field font-mono text-sm flex-1" placeholder="Enter validator identity pubkey (base58)" value={pubkey} onChange={(e) => setPubkey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookupValidator()} />
              <button onClick={lookupValidator} disabled={loading} className="btn-primary shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Lookup
              </button>
            </div>
          </div>

          {/* Results */}
          <AnimatePresence>
            {info && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-500" /> Validator Info
                    </h2>
                    {info.is_delinquent ? (
                      <span className="badge badge-expired"><AlertCircle className="w-3.5 h-3.5" /> Delinquent</span>
                    ) : info.vote_pubkey ? (
                      <span className="badge badge-downloaded"><Activity className="w-3.5 h-3.5" /> Active</span>
                    ) : (
                      <span className="badge badge-pending"><Hash className="w-3.5 h-3.5" /> Account Found</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 sm:col-span-2">
                      <p className="text-xs text-zinc-400 mb-1">Identity Pubkey</p>
                      <p className="text-sm font-mono text-indigo-600 break-all">{info.pubkey}</p>
                    </div>

                    {info.vote_pubkey && (
                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 sm:col-span-2">
                        <p className="text-xs text-zinc-400 mb-1">Vote Account</p>
                        <p className="text-sm font-mono text-zinc-600 break-all">{info.vote_pubkey}</p>
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-2"><Coins className="w-4 h-4 text-amber-500" /><p className="text-xs text-zinc-400">Activated Stake</p></div>
                      <p className="text-lg font-bold text-zinc-900">{formatSol(info.activated_stake)}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-2"><Hash className="w-4 h-4 text-indigo-500" /><p className="text-xs text-zinc-400">Commission</p></div>
                      <p className="text-lg font-bold text-zinc-900">{info.commission !== null ? `${info.commission}%` : "—"}</p>
                    </div>

                    {info.last_vote !== null && (
                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 sm:col-span-2">
                        <p className="text-xs text-zinc-400 mb-1">Last Vote Slot</p>
                        <p className="text-sm font-mono text-zinc-600">{info.last_vote?.toLocaleString()}</p>
                      </div>
                    )}
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
