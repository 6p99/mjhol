import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MJHOL | 6p99 — Developer Profile",
  description: "Personal profile of MJHOL (6p99) — curious about everything, programming the possible and the impossible.",
  keywords: ["6p99", "MJHOL", "developer", "programmer", "profile", "portfolio"],
  authors: [{ name: "MJHOL" }],
  icons: {
    icon: "https://avatars.githubusercontent.com/u/252145943?v=4",
  },
  openGraph: {
    title: "MJHOL | 6p99",
    description: "Curious about everything — programming the possible and the impossible.",
    images: ["https://avatars.githubusercontent.com/u/252145943?v=4"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MJHOL | 6p99",
    description: "Curious about everything — programming the possible and the impossible.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
