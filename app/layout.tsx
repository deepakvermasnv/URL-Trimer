import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ScrollToTop } from '../components/ScrollToTop';
import { SITE_CONFIG, SEO_METADATA, getCanonical } from '../lib/metadata';
import './globals.css';
import { SidebarProvider } from '@/lib/SidebarContext';
import { ContentWrapper } from '@/components/ContentWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: SEO_METADATA.home.title,
  description: SEO_METADATA.home.description,
  keywords: ['bulk url cleaner', 'strip url parameters online', 'url domain extractor tool', 'remove tracking parameters from url', 'clean url list free', 'bulk link trimmer'],
  authors: [{ name: 'Trimmer Labs' }],
  alternates: {
    canonical: getCanonical(SEO_METADATA.home.canonical),
  },
  openGraph: {
    title: 'Bulk URL Cleaner — Free Domain Stripper Tool',
    description: 'Clean thousands of URLs instantly. Strip tracking params, paths & queries — 100% browser-based, no signup.',
    type: 'website',
    locale: 'en_US',
    siteName: SITE_CONFIG.siteName,
    url: `${SITE_CONFIG.baseUrl}/`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk URL Cleaner — Free Domain Stripper Tool',
    description: 'Clean thousands of URLs instantly. Strip tracking params, paths & queries — 100% browser-based, no signup.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://i.postimg.cc/5209g15c/favicon-32x32.png',
    apple: 'https://i.postimg.cc/5209g15c/favicon-32x32.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": SITE_CONFIG.siteName,
    "url": `${SITE_CONFIG.baseUrl}/`,
    "description": "Free bulk URL cleaner tool to strip tracking parameters and extract clean domains.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "featureList": ["Bulk URL cleaning","Domain extraction","Duplicate removal","Custom TLD support"]
  };

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SidebarProvider>
          <script
            id="ld-json"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // 1. Guard window.fetch against read-only property errors
                  try {
                    const originalFetch = window.fetch;
                    if (originalFetch) {
                      Object.defineProperty(window, 'fetch', {
                        get: function() { return originalFetch; },
                        set: function(v) { console.warn('Blocked attempt to override window.fetch'); },
                        configurable: true,
                        enumerable: true
                      });
                    }
                  } catch (e) {
                    // If it's already non-configurable, we can't do much, but we shouldn't throw here anyway
                  }

                  // 2. Circular structure guard for JSON.stringify
                  const originalStringify = JSON.stringify;
                  JSON.stringify = function(obj, replacer, space) {
                    try {
                      return originalStringify(obj, replacer, space);
                    } catch (e) {
                      if (e && e.message && e.message.includes('circular structure')) return '"[Circular]"';
                      throw e;
                    }
                  };
                })();
              `
            }}
          />
          {/* Google Analytics 4 */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-0JPT186X09"
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-0JPT186X09');
              } catch (e) {
                console.warn('Analytics initialization failed:', e);
              }
            `}
          </Script>
          <Navbar />
          <Sidebar />
          <ContentWrapper>
            {children}
          </ContentWrapper>
          <ScrollToTop />
        </SidebarProvider>
      </body>
    </html>
  );
}

