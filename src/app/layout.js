import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "GrimZone Tournaments - Free Fire Tournament Platform",
    template: "%s | GrimZone Tournaments",
  },
  description: "Pakistan's premier Free Fire tournament platform. Compete, win prizes, and dominate the battlefield.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://grimzone.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GrimZone Tournaments",
    title: "GrimZone Tournaments - Free Fire Tournament Platform",
    description: "Pakistan's premier Free Fire tournament platform. Compete, win prizes, and dominate the battlefield.",
    url: "https://grimzone.vercel.app",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "GrimZone Tournaments" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrimZone Tournaments - Free Fire Tournament Platform",
    description: "Pakistan's premier Free Fire tournament platform. Compete, win prizes, and dominate the battlefield.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  other: {
    "google-site-verification": "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GrimZone Tournaments",
  url: "https://grimzone.vercel.app",
  description: "Pakistan's premier Free Fire tournament platform. Compete, win prizes, and dominate the battlefield.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://grimzone.vercel.app/tournaments?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link" aria-label="Skip to main content">Skip to main content</a>
        <Navbar />
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
