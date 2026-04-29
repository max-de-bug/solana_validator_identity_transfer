import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Validator Identity Transfer | Secure Key Migration",
  description:
    "Securely transfer your Solana validator identity between servers with AES-256-GCM encryption, single-use tokens, and zero-knowledge architecture. Built by Superteam Ukraine.",
  keywords: [
    "Solana",
    "Validator",
    "Identity Transfer",
    "Key Migration",
    "Secure",
    "Encrypted",
    "Superteam Ukraine",
  ],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Solana Validator Identity Transfer",
    description:
      "Secure, encrypted validator identity migration for Solana operators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
