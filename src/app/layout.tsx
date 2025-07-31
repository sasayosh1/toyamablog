import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOYAMA BLOG",
  description: "TOYAMA BLOG",
  metadataBase: new URL('https://sasakiyoshimasa.com'),
  alternates: {
    canonical: 'https://sasakiyoshimasa.com',
  },
  openGraph: {
    title: "TOYAMA BLOG",
    description: "TOYAMA BLOG",
    url: 'https://sasakiyoshimasa.com',
    siteName: 'TOYAMA BLOG',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TOYAMA BLOG",
    description: "TOYAMA BLOG",
  },
  verification: {
    google: "NocI3MMwDMlZ9xW66Er1NNBu4KIfUhL71SWYQpGysfE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
