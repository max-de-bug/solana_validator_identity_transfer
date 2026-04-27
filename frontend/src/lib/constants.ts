import {
  Lock, Eye, Clock, Shield, Server, Zap,
  Upload, ArrowRightLeft, Download, Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface StepItem {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: FeatureItem[] = [
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

export const STEPS: StepItem[] = [
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
