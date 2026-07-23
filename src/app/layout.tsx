import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "6p99 — MJ",
  description: "MJ (6p99) — Discord bot developer. Node.js / discord.js / Python.",
  keywords: ["6p99", "MJHOL", "developer", "Discord bot", "programmer", "profile"],
  authors: [{ name: "MJHOL" }],
  icons: {
    icon: "https://cdn.discordapp.com/avatars/803662340465229855/a_1c9e97d2f9ff510fc8181566bd3868d9.gif?size=128",
  },
  openGraph: {
    title: "6p99 — MJ",
    description: "Discord bot developer based in Amman, Jordan.",
    images: ["https://cdn.discordapp.com/avatars/803662340465229855/a_1c9e97d2f9ff510fc8181566bd3868d9.gif?size=128"],
  },
  twitter: {
    card: "summary_large_image",
    title: "6p99 — MJ",
    description: "Discord bot developer based in Amman, Jordan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-lang="en" data-theme="dark" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
