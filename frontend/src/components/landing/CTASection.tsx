"use client";

import Link from "next/link";
import { ArrowRight, FileKey, Upload, Download } from "lucide-react";

export default function CTASection() {
  return (
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
  );
}
