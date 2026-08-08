import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalNavigation from "@/components/layout/global-nav";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { WebVitals } from "@/components/analytics/web-vitals";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "MRez — Reza Mousavi",
  description:
    "Reza Mousavi — full-stack developer building Laravel packages and modern web apps. Blog notes, mini tools, and open-source projects.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    siteName: "MRez",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "MRez",
      url: APP_URL,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: `${APP_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      name: "Reza Mousavi",
      url: `${APP_URL}/portfolio`,
      jobTitle: "Full-stack Developer",
      knowsAbout: ["Laravel", "PHP", "Next.js", "TypeScript", "React", "Web APIs"],
      sameAs: ["https://github.com/mrezdev"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalNavigation />

          {children}

          <AnalyticsProvider />
          <WebVitals />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}
