"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Shield, Lock, Clock, Zap, Upload, Download } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function HeroSection() {
  return (
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
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-600 shadow-sm">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Powered by Solana • Zero-Knowledge Architecture</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 custom={1} variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Secure Validator{" "}
            <span className="gradient-text">Identity Transfer.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p custom={2} variants={fadeUp} className="mt-6 text-lg leading-8 text-zinc-600 max-w-2xl mx-auto">
            Migrate your Solana validator identity between servers with end-to-end
            encrypted transfers. Your private key{" "}
            <span className="font-semibold text-zinc-900">never touches our servers.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </motion.div>

          {/* Trust indicators */}
          <motion.div custom={4} variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
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
          </motion.div>
        </motion.div>
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
  );
}
