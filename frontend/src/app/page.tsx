"use client";

import Link from "next/link";
import {
  ArrowRight, Shield, Lock, Clock, Zap,
  Upload, Download, FileKey,
} from "lucide-react";
import { FEATURES, STEPS } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative isolate">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-purple-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="max-w-wrapper pt-28 pb-20 sm:pt-40 sm:pb-28">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-600 shadow-sm">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Powered by Solana • Zero-Knowledge Architecture</span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
              Secure Validator{" "}
              <span className="gradient-text">Identity Transfer.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg leading-8 text-zinc-600 max-w-2xl mx-auto">
              Migrate your Solana validator identity between servers with end-to-end
              encrypted transfers. Your private key{" "}
              <span className="font-semibold text-zinc-900">never touches our servers.</span>
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/transfer/send"
                className="btn-primary text-base px-8 py-3"
              >
                <Upload className="w-5 h-5" />
                Start Transfer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/transfer/receive"
                className="btn-secondary text-base px-8 py-3"
              >
                <Download className="w-5 h-5" />
                Receive Identity
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
              {[
                { icon: Lock, label: "AES-256-GCM" },
                { icon: Shield, label: "Zero-Knowledge" },
                { icon: Clock, label: "Single-Use Tokens" },
                { icon: Zap, label: "Open Source" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-indigo-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom decorative gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-200 to-indigo-200 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 grainy">
        <div className="max-w-wrapper">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Transfer in 4 simple steps
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              The entire process takes under a minute. Your keypair is encrypted in your browser before it ever leaves your machine.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <li key={step.step} className="relative">
                <div className="card h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                      {step.step}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      Step {step.step}
                    </span>
                  </div>
                  <step.icon className="w-7 h-7 text-indigo-500 mb-3" />
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-4 text-zinc-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-zinc-200 py-20">
        <div className="max-w-wrapper">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Security First
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Every layer of ValidatorShift is designed with security as the primary concern.
              Your keys are yours — always.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card group">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: `${feature.color}15`,
                  }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 grainy">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FileKey className="w-12 h-12 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Ready to transfer your validator identity?
          </h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Start a secure identity transfer in under 60 seconds. End-to-end encrypted.
            Zero knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/transfer/send" className="btn-primary text-base px-8 py-3">
              <Upload className="w-5 h-5" />
              Send Identity
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/transfer/receive" className="btn-secondary text-base px-8 py-3">
              <Download className="w-5 h-5" />
              Receive Identity
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
