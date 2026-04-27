"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Lock,
  ArrowRightLeft,
  Zap,
  Eye,
  Server,
  ChevronRight,
  ArrowRight,
  Clock,
  FileKey,
  ShieldCheck,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const FEATURES = [
  {
    icon: Lock,
    title: "AES-256-GCM Encryption",
    description:
      "Military-grade authenticated encryption ensures your keypair is protected during transit and at rest.",
    color: "#6366f1",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description:
      "All encryption happens client-side. Our server never sees your plaintext private key — ever.",
    color: "#9945ff",
  },
  {
    icon: Clock,
    title: "Single-Use Tokens",
    description:
      "Transfer tokens expire after 15 minutes and are burned after a single download. No second chances for attackers.",
    color: "#14f195",
  },
  {
    icon: Shield,
    title: "PBKDF2 Key Derivation",
    description:
      "600,000 iteration PBKDF2-SHA256 key derivation makes brute-force attacks computationally infeasible.",
    color: "#f59e0b",
  },
  {
    icon: Server,
    title: "Full Audit Trail",
    description:
      "Every transfer action is logged with timestamps, IPs, and status changes for complete accountability.",
    color: "#ef4444",
  },
  {
    icon: Zap,
    title: "Instant Transfer",
    description:
      "Upload, share the token, download. The entire process takes less than 30 seconds end-to-end.",
    color: "#10b981",
  },
];

const STEPS = [
  {
    step: 1,
    icon: Upload,
    title: "Upload & Encrypt",
    description:
      "Load your validator-keypair.json on the source server. Choose a strong passphrase. Encryption happens entirely in your browser.",
  },
  {
    step: 2,
    icon: ArrowRightLeft,
    title: "Share Token",
    description:
      "Receive a one-time transfer token. Share it securely with the destination server operator (or yourself).",
  },
  {
    step: 3,
    icon: Download,
    title: "Download & Decrypt",
    description:
      "On the destination server, enter the token and passphrase. The encrypted bundle downloads and decrypts client-side.",
  },
  {
    step: 4,
    icon: Trash2,
    title: "Auto-Cleanup",
    description:
      "The transfer record is burned after download. Tokens expire automatically. No trace remains on our servers.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-float"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-float"
            style={{
              background:
                "radial-gradient(circle, rgba(153,69,255,0.06) 0%, transparent 70%)",
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full animate-float"
            style={{
              background:
                "radial-gradient(circle, rgba(20,241,149,0.04) 0%, transparent 70%)",
              animationDelay: "4s",
            }}
          />
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
            <span className="text-[var(--color-text-primary)]">
              Secure Validator
            </span>
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

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#6366f1]" />
              AES-256-GCM
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#9945ff]" />
              Zero-Knowledge
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#14f195]" />
              Single-Use Tokens
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
              Open Source
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-[var(--color-text-secondary)] max-w-lg mx-auto"
            >
              Four simple steps to securely migrate your validator identity.
              The entire process takes under a minute.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i + 2}
                className="relative"
              >
                <div className="card h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="step-indicator step-active">
                      {step.step}
                    </div>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] hidden lg:block absolute -right-3 top-8" />
                    )}
                  </div>
                  <step.icon className="w-8 h-8 text-[#6366f1] mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Security First
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-[var(--color-text-secondary)] max-w-lg mx-auto"
            >
              Every layer of ValidatorShift is designed with security as the
              primary concern. Your keys are yours — always.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="card group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} custom={0} className="gradient-border p-8 sm:p-12">
              <div className="bg-[var(--color-bg-card)] rounded-[14px] p-8 sm:p-12">
                <Shield className="w-12 h-12 text-[#6366f1] mx-auto mb-6 animate-shield" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Transfer?
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                  Start a secure validator identity transfer now. It takes less
                  than 60 seconds from start to finish.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/transfer/send"
                    className="btn-primary flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Send Identity
                  </Link>
                  <Link
                    href="/transfer/receive"
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Receive Identity
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
