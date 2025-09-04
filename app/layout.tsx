import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Web3Providers } from "./components/providers/web3-providers";
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
  description:
    "Friends of Sapien Airdrop - Claim your SAPIEN tokens. Rewarding early supporters and contributors to the Sapien ecosystem.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  title: "Friends of Sapien Airdrop | Sablier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-50`}
      >
        <Web3Providers>
          {children}
          <Toaster />
        </Web3Providers>
      </body>
    </html>
  );
}
