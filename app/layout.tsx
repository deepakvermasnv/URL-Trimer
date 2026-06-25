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
import { HydrationGuard } from '@/components/HydrationGuard';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '600'],
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
    images: [
      {
        url: 'https://i.postimg.cc/85z1DkS0/urltrim-og.png',
        width: 1200,
        height: 630,
        alt: 'URL Trim — Bulk URL Cleaner & Browser Utility Suite',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk URL Cleaner — Free Domain Stripper Tool',
    description: 'Clean thousands of URLs instantly. Strip tracking params, paths & queries — 100% browser-based, no signup.',
    images: ['https://i.postimg.cc/85z1DkS0/urltrim-og.png'],
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
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": SITE_CONFIG.siteName,
      "url": `${SITE_CONFIG.baseUrl}/`,
      "description": "Free bulk URL cleaner tool to strip tracking parameters and extract clean domains.",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": [
        "Bulk URL cleaning",
        "Domain extraction",
        "Duplicate removal",
        "Custom TLD support",
        "URL Slug Generator",
        "Title Case Converter"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is URL Trim completely free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, URL Trim is completely free to use with no limits on the number of URLs you can process."
          }
        },
        {
          "@type": "Question",
          "name": "What is the URL limit for cleaning?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our optimized browser chunking engine handles 10,000+ URLs simultaneously without blocking your browser's main thread."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use it on mobile?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, URL Trim works on all modern mobile browsers including iOS and Android with full feature parity."
          }
        },
        {
          "@type": "Question",
          "name": "What about IDNs (International Domain Names)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our high-precision engine correctly handles international domain names and punycode-encoded URLs with extreme accuracy."
          }
        }
      ]
    }
  ];

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
                  // Safe fetch patch to prevent "Cannot set property fetch of #<Window> which has only a getter"
                  try {
                    let currentFetch = window.fetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() {
                        return currentFetch;
                      },
                      set: function(val) {
                        currentFetch = val;
                      },
                      configurable: true,
                      enumerable: true
                    });
                  } catch (e) {
                    console.warn('window.fetch safety patch failed:', e);
                  }

                  // Circular structure guard for JSON.stringify
                  try {
                    const originalStringify = JSON.stringify;
                    JSON.stringify = function(obj, replacer, space) {
                      try {
                        return originalStringify(obj, replacer, space);
                      } catch (e) {
                        if (e && e.message && e.message.includes('circular structure')) return '"[Circular]"';
                        throw e;
                      }
                    };
                  } catch (e) {
                    console.warn('JSON.stringify patch failed:', e);
                  }
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
            <HydrationGuard>
              {children}
            </HydrationGuard>
          </ContentWrapper>
          <ScrollToTop />
        </SidebarProvider>
      </body>
    </html>
  );
}

