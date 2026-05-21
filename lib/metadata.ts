export const SITE_CONFIG = {
  baseUrl: 'https://www.urltrim.online',
  siteName: 'URL Trim',
  twitterHandle: '@urltrim',
};

export const SEO_METADATA = {
  home: {
    canonical: '/',
    title: 'Free Bulk URL Cleaner — Strip Paths, Queries & Tracking | URL Trim',
    description: 'The world\'s fastest bulk URL cleaner. Strip tracking parameters, remove paths, and extract clean domains from thousands of URLs instantly in your browser.',
  },
  tools: {
    canonical: '/tools',
    title: 'Web Utilities Library — Professional Browser Tools | URL Trim',
    description: 'A curated collection of professional-grade web tools, built for performance and absolute privacy. No data ever leaves your device.',
  },
  wordCounter: {
    canonical: '/tools/word-counter',
    title: 'Word Counter — Professional Text Analysis | URL Trim',
    description: 'Count words, characters, and sentences from your text instantly with local analysis.',
  },
  imageCompressor: {
    canonical: '/tools/image-compressor',
    title: 'Image Compressor — Shrink Images Locally | URL Trim',
    description: 'Reduce image file size while maintaining visual quality locally in your browser.',
  },
  imageConverter: {
    canonical: '/tools/image-converter',
    title: 'Image Converter — Local Format Transformer | URL Trim',
    description: 'Convert images between different formats instantly without server uploads.',
  },
  pdfConverter: {
    canonical: '/tools/pdf-converter',
    title: 'Free PDF Converter — Professional Document to PDF | URL Trim',
    description: 'Convert images, Word docx, and PowerPoint pptx files into professional PDF documents locally in your browser.',
  },
  about: {
    canonical: '/about',
    title: 'About Our Protocol | URL Trim Mission',
    description: 'Learn about the technology and mission behind URL Trim. We build privacy-first, client-side web utilities.',
  },
  contact: {
    canonical: '/contact',
    title: 'Contact Support | URL Trim Technical Help',
    description: 'Get in touch with the Trimmer Labs team for technical assistance, feature requests, or partnership inquiries.',
  },
  privacy: {
    canonical: '/privacy',
    title: 'Privacy Policy | URL Trim Data Security',
    description: 'Your data never leaves your device. Read about our zero-server privacy protocol and how we ensure your links stay private.',
  },
  terms: {
    canonical: '/terms',
    title: 'Terms of Service | URL Trim Usage Rights',
    description: 'Official usage terms and conditions for Trimmer link cleaning services and our web utility library.',
  },
  disclaimer: {
    canonical: '/disclaimer',
    title: 'Legal Disclaimer | URL Trim Information',
    description: 'Official disclaimer regarding the usage, warranty, and liability limits of URL Trim browser-based services.',
  },
  blog: {
    canonical: '/blog',
    title: 'Engineering Blog | URL Trim Technical Insights',
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
