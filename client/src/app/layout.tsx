import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MiniKitClientProvider from "@/components/MiniKitClientProvider";
import ClientVerificationGate from "@/components/ClientVerificationGate";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orbital - Decentralized Campaign Platform",
  description: "Launch and manage decentralized campaigns with World ID authentication and blockchain-powered funding.",
  keywords: "blockchain, campaigns, World ID, decentralized, funding, crypto",
  authors: [{ name: "Orbital Team" }],
  robots: "index, follow",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Orbital - Decentralized Campaign Platform",
    description: "Launch and manage decentralized campaigns with World ID authentication",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Orbital Logo",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <MiniKitClientProvider>
              <ClientVerificationGate>
                {children}
              </ClientVerificationGate>
            </MiniKitClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}