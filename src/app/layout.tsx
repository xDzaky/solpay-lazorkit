// =============================================================================
// ROOT LAYOUT
// =============================================================================
// Main layout wrapper for the entire application.
// Sets up providers, fonts, and metadata.
// =============================================================================

// Import polyfills FIRST before anything else
import "@/lib/polyfills";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import { APP_CONFIG } from "@/lib/constants";
import { MockModeIndicator } from "@/components/MockModeIndicator";
import "./globals.css";

// =============================================================================
// FONTS
// =============================================================================

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} - Passkey Subscription Payments on Solana`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: [
    "Solana",
    "Lazorkit",
    "Passkey",
    "WebAuthn",
    "Smart Wallet",
    "Gasless",
    "Subscription",
    "USDC",
    "Crypto Payments",
  ],
  authors: [{ name: "SolPay Team" }],
  creator: "SolPay",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// =============================================================================
// LAYOUT COMPONENT
// =============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900`}>

        {/* Ambient Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[20%] w-[35rem] h-[35rem] bg-teal-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-[20%] left-[50%] w-[40rem] h-[40rem] bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2"></div>
        </div>

        <Providers>
          <MockModeIndicator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
