import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1329] text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-6 space-y-4">
            <BrandLogo darkText={true} />
            <p className="max-w-sm text-xs text-slate-400 leading-relaxed font-normal">
              A collection of fast, free online tools to clean, convert and manage your URLs and text data. All processing happens in your browser.
            </p>
            <p className="text-xs text-slate-500 pt-2 font-medium">
              &copy; {currentYear} URL Trim. All rights reserved.
            </p>
          </div>

          {/* Tools */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Tools</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/word-counter" className="hover:text-blue-400 transition-colors">Word Counter</Link>
              </li>
              <li>
                <Link href="/tools/ai-image" className="hover:text-blue-400 transition-colors">AI Text-to-Image</Link>
              </li>
              <li>
                <Link href="/tools/pdf-converter" className="hover:text-blue-400 transition-colors">PDF Converter</Link>
              </li>
              <li>
                <Link href="/tools/image-compressor" className="hover:text-blue-400 transition-colors">Image Compressor</Link>
              </li>
              <li>
                <Link href="/tools/image-converter" className="hover:text-blue-400 transition-colors">Image Converter</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How it works</a>
              </li>
              <li>
                <a href="#homepage-faqs" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

