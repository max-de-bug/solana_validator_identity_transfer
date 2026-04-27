"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Lock, Clock, Zap, FileKey, ShieldCheck,
  ArrowRight, Upload, Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SectionHeader, StepCard, FeatureCard } from "@/components/landing/Sections";
import { FEATURES, STEPS } from "@/lib/constants";

/* ─── Background Orbs ─── */
const ORBS = [
  { cls: "top-1/4 left-1/4 w-96 h-96", color: "99,102,241", opacity: 0.08, delay: "0s" },
  { cls: "bottom-1/4 right-1/4 w-80 h-80", color: "153,69,255", opacity: 0.06, delay: "2s" },
  { cls: "top-1/2 right-1/3 w-64 h-64", color: "20,241,149", opacity: 0.04, delay: "4s" },
];

const TRUST_BADGES = [
  { icon: Lock, label: "AES-256-GCM", color: "#6366f1" },
  { icon: Shield, label: "Zero-Knowledge", color: "#9945ff" },
  { icon: Clock, label: "Single-Use Tokens", color: "#14f195" },
  { icon: Zap, label: "Open Source", color: "#f59e0b" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {ORBS.map((orb, i) => (
            <div
              key={i}
              className={`absolute ${orb.cls} rounded-full animate-float`}
              style={{
                background: `radial-gradient(circle, rgba(${orb.color},${orb.opacity}) 0%, transparent 70%)`,
                animationDelay: orb.delay,
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#14f195]" />
            <span className="text-[var(--color-text-secondary)]">
              Powered by Solana • Built by Superteam Ukraine
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            <span className="text-[var(--color-text-primary)]">Secure Validator</span>
            <br />
            <span className="gradient-text">Identity Transfer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Migrate your Solana validator identity between servers with
            end-to-end encrypted transfers. Zero-knowledge architecture ensures
            your private key never touches our servers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/transfer/send" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              <FileKey className="w-5 h-5" />
              Start Transfer
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/transfer/receive" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <Download className="w-5 h-5" />
              Receive Identity
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]"
          >
            {TRUST_BADGES.map((badge, i) => (
              <div key={badge.label} className="flex items-center gap-2">
                {i > 0 && <div className="w-1 h-1 rounded-full bg-[var(--color-border)] -ml-4 mr-2" />}
                <badge.icon className="w-3.5 h-3.5" style={{ color: badge.color }} />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="How It Works"
            subtitle="Four simple steps to securely migrate your validator identity. The entire process takes under a minute."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <StepCard key={step.step} step={step} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Security First"
            subtitle="Every layer of ValidatorShift is designed with security as the primary concern. Your keys are yours — always."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="gradient-border p-8 sm:p-12">
              <div className="bg-[var(--color-bg-card)] rounded-[14px] p-8 sm:p-12">
                <Shield className="w-12 h-12 text-[#6366f1] mx-auto mb-6 animate-shield" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transfer?</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                  Start a secure validator identity transfer now. It takes less than 60 seconds from start to finish.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/transfer/send" className="btn-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Send Identity
                  </Link>
                  <Link href="/transfer/receive" className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" /> Receive Identity
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
