"use client";

import { Shield, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-7 h-7 text-[#6366f1]" />
              <span className="text-lg font-bold gradient-text">
                ValidatorShift
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md leading-relaxed">
              Securely transfer your Solana validator identity between servers
              using military-grade AES-256-GCM encryption. Built with zero-knowledge
              architecture — your keys never touch our servers in plaintext.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>by</span>
              <a
                href="https://superteam.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-text-solana font-semibold hover:opacity-80 transition-opacity"
              >
                Superteam Ukraine
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Transfer
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/transfer/send"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Send Identity
                </Link>
              </li>
              <li>
                <Link
                  href="/transfer/receive"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Receive Identity
                </Link>
              </li>
              <li>
                <Link
                  href="/transfer/status"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Check Status
                </Link>
              </li>
              <li>
                <Link
                  href="/validator/info"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Validator Lookup
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.solanalabs.com/operations/guides/validator-start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Solana Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Source Code
                </a>
              </li>
              <li>
                <a
                  href="https://superteam.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Superteam
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} ValidatorShift. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4">
            <span className="badge badge-downloaded text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-dot inline-block" />
              Mainnet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
