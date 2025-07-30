import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "富山ブログ",
  description: "富山の魅力を発信するブログサイトです",
  metadataBase: new URL('https://sasakiyoshimasa.com'),
  alternates: {
    canonical: 'https://sasakiyoshimasa.com',
  },
  openGraph: {
    title: "富山ブログ",
    description: "富山の魅力を発信するブログサイトです",
    url: 'https://sasakiyoshimasa.com',
    siteName: '富山ブログ',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "富山ブログ",
    description: "富山の魅力を発信するブログサイトです",
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
        <Analytics />
        {children}
      </body>
    </html>
  );
}
