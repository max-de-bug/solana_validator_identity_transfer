"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/transfer/send", label: "Send" },
  { href: "/transfer/receive", label: "Receive" },
  { href: "/transfer/status", label: "Status" },
  { href: "/validator/info", label: "Validator Lookup" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/75 backdrop-blur-lg transition-all">
      <div className="max-w-wrapper">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center z-40 font-semibold text-zinc-900">
            <span className="text-lg">validator</span>
            <span className="text-lg gradient-text">shift.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="btn-ghost text-sm">
                {link.label}
              </Link>
            ))}
            <div className="w-px h-6 bg-zinc-200 mx-2" />
            <Link
              href="/transfer/send"
              className="btn-primary text-sm"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/transfer/send"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              Get started →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
