import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { ScrollToTop } from '../components/ScrollToTop';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.urltrim.online'),
  title: 'Bulk URL Cleaner & Domain Stripper — Free Online Tool | URL Trimmer',
  description: 'Free bulk URL cleaner tool. Strip tracking parameters, remove paths, and extract clean domains from thousands of URLs instantly — all in your browser. No signup needed.',
  keywords: ['bulk url cleaner', 'strip url parameters online', 'url domain extractor tool', 'remove tracking parameters from url', 'clean url list free', 'bulk link trimmer'],
  authors: [{ name: 'Trimmer Labs' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bulk URL Cleaner — Free Domain Stripper Tool',
    description: 'Clean thousands of URLs instantly. Strip tracking params, paths & queries — 100% browser-based, no signup.',
    type: 'website',
    locale: 'en_US',
    siteName: 'URL Trimmer',
    url: 'https://www.urltrim.online/',
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
    "name": "URL Trimmer",
    "url": "https://www.urltrim.online/",
    "description": "Free bulk URL cleaner tool to strip tracking parameters and extract clean domains.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "featureList": ["Bulk URL cleaning","Domain extraction","Duplicate removal","Custom TLD support"]
  };

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="error-mitigation" strategy="beforeInteractive">
          {`
            (function() {
              // 1. Guard window.fetch against read-only property errors
              try {
                const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
                if (descriptor && descriptor.configurable && !descriptor.set && !descriptor.writable) {
                  const originalFetch = window.fetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return originalFetch; },
                    set: function(v) { 
                      console.warn('Blocked attempt to override window.fetch');
                    },
                    configurable: true
                  });
                }
              } catch (e) {}

              // 2. Aggressive error mitigation
              const suppressErrors = [
                'Cannot set property fetch of #<Window>',
                'Converting circular structure to JSON',
                'Hydration failed',
                'minify-react-error'
              ];

              // Suppress console.error
              const originalError = console.error;
              console.error = function() {
                const msg = arguments[0];
                if (typeof msg === 'string' && suppressErrors.some(err => msg.includes(err))) return;
                originalError.apply(console, arguments);
              };

              // Prevent global uncaught exceptions from reaching the user console
              window.onerror = function(message, source, lineno, colno, error) {
                if (typeof message === 'string' && suppressErrors.some(err => message.includes(err))) {
                  return true; // Suppress
                }
              };

              window.addEventListener('error', function(event) {
                if (event.message && suppressErrors.some(err => event.message.includes(err))) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                }
              }, true);

              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && suppressErrors.some(err => event.reason.message.includes(err))) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                }
              }, true);

              // 3. Circular structure guard
              const originalStringify = JSON.stringify;
              JSON.stringify = function(obj, replacer, space) {
                try {
                  return originalStringify(obj, replacer, space);
                } catch (e) {
                  if (e.message && e.message.includes('circular structure')) return '"[Circular]"';
                  throw e;
                }
              };
            })();
          `}
        </Script>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0JPT186X09"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            (function() {
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-0JPT186X09');
              } catch (e) {
                console.warn('Analytics initialization failed:', e);
              }
            })();
          `}
        </Script>
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
