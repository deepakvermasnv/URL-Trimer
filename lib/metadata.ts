export const SITE_CONFIG = {
  baseUrl: 'https://www.urltrim.online',
  siteName: 'URL Trimmer',
  twitterHandle: '@urltrimmer',
};

export const SEO_METADATA = {
  home: {
    canonical: '/',
    title: 'Bulk URL Cleaner & Domain Stripper — Free Online Tool | URL Trimmer',
    description: 'Free bulk URL cleaner tool. Strip tracking parameters, remove paths, and extract clean domains from thousands of URLs instantly — all in your browser.',
  },
  tools: {
    canonical: '/tools',
    title: 'Web Utilities Library — Free Local Browser Tools | URL Trimmer',
    description: 'A curated collection of professional-grade web tools, built for performance and absolute privacy. No data ever leaves your device.',
  },
  wordCounter: {
    canonical: '/tools/word-counter',
    title: 'Privacy-First Word Counter — Secure Text Analysis | URL Trimmer',
    description: 'Count words, characters, and sentences locally. Analyze readability and text density without uploading your content to any server.',
  },
  imageCompressor: {
    canonical: '/tools/image-compressor',
    title: 'Offline Image Compressor — Shrink Images Locally | URL Trimmer',
    description: 'Reduce image file size without losing quality. All processing happens in your browser for maximum privacy and speed.',
  },
  imageConverter: {
    canonical: '/tools/image-converter',
    title: 'Local Image Converter — PNG, JPG, WebP Converter | URL Trimmer',
    description: 'Convert between popular image formats instantly. Secure, high-fidelity conversion entirely on your device.',
  },
  about: {
    canonical: '/about',
    title: 'About Our Protocol | URL Trimmer mission',
    description: 'Learn about the technology and mission behind URL Trimmer. We build privacy-first, client-side web utilities for SEO professionals.',
  },
  contact: {
    canonical: '/contact',
    title: 'Contact Support | URL Trimmer Technical Help',
    description: 'Get in touch with the Trimmer Labs team for technical assistance, feature requests, or partnership inquiries.',
  },
  privacy: {
    canonical: '/privacy',
    title: 'Privacy Policy | URL Trimmer Data Security',
    description: 'Your data never leaves your device. Read about our zero-server privacy protocol and how we ensure your links stay private.',
  },
  terms: {
    canonical: '/terms',
    title: 'Terms of Service | URL Trimmer Usage Rights',
    description: 'Official usage terms and conditions for Trimmer link cleaning services and our web utility library.',
  },
  disclaimer: {
    canonical: '/disclaimer',
    title: 'Legal Disclaimer | URL Trimmer Information',
    description: 'Official disclaimer regarding the usage, warranty, and liability limits of URL Trimmer browser-based services.',
  },
  blog: {
    canonical: '/blog',
    title: 'Engineering Blog | URL Trimmer Technical Insights',
    description: 'Technical insights, SEO best practices, and updates from the engineering team behind the world\'s fastest bulk URL cleaner.',
  },
};

/**
 * Returns the absolute canonical URL for a given path.
 * Ensures the path starts with a slash and is appended to the base URL.
 */
export function getCanonical(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.baseUrl}${normalizedPath}`;
}
