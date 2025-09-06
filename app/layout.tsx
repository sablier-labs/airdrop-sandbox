import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NetworkGuard } from "@/components/network-guard";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  description: "Claim your Sablier airdrop tokens with real-time streaming",
  keywords: ["Sablier", "airdrop", "token", "streaming", "DeFi", "Ethereum"],
  openGraph: {
    description: "Claim your Sablier airdrop tokens with real-time streaming",
    title: "Sablier Airdrop - Claim Your Tokens",
    type: "website",
  },
  title: "Sablier Airdrop - Claim Your Tokens",
  twitter: {
    card: "summary_large_image",
    description: "Claim your Sablier airdrop tokens with real-time streaming",
    title: "Sablier Airdrop - Claim Your Tokens",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <NetworkGuard>{children}</NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}
