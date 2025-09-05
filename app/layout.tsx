import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
