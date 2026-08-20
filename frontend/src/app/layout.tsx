import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DocAI - AI Document Intelligence",
  description: "Cognitive AI document intelligence, semantic search, and copilot reasoning.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" type="image/svg+xml" href="/icon.svg" />
          <link rel="apple-touch-icon" href="/logo.svg" />
        </head>
        <body className={`${inter.variable} font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
