"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="max-w-wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center font-semibold text-zinc-900 mb-4">
              <span className="text-lg">validator</span>
              <span className="text-lg gradient-text">shift.</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mt-3">
              Securely transfer your Solana validator identity between servers
              using military-grade AES-256-GCM encryption. Your private keys
              never touch our servers.
            </p>
            <p className="text-xs text-zinc-400 mt-4">
              Built by{" "}
              <a
                href="https://x.com/CryptoMax_07"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Connor
              </a>
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-4">Transfer</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/transfer/send" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  Send Identity
                </Link>
              </li>
              <li>
                <Link href="/transfer/receive" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  Receive Identity
                </Link>
              </li>
              <li>
                <Link href="/transfer/status" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  Check Status
                </Link>
              </li>
              <li>
                <Link href="/validator/info" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  Validator Lookup
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://docs.solanalabs.com/operations/guides/validator-start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Solana Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/max-de-bug/solana_validator_identity_transfer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Source Code
                </a>
              </li>
              <li>
                <a
                  href="https://superteam.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Superteam
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} ValidatorShift. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
