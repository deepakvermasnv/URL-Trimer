'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

interface FAQ {
  q: string;
  a: string;
}

interface FAQSectionProps {
  pageId: string;
  title?: string;
  faqs: FAQ[];
  className?: string;
}

export default function FAQSection({ pageId, title = "Frequently Asked Questions", faqs, className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section className={cn("space-y-12 max-w-4xl mx-auto px-4 sm:px-6 mt-32", className)} id={`${pageId}-faqs`}>
      <Script id={`${pageId}-faq-schema`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Got questions? We have answers.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/[0.02] overflow-hidden transition-all duration-300 hover:shadow-slate-900/[0.04]"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full text-left p-6 sm:p-8 flex items-center justify-between gap-6 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 transition-colors duration-300",
                    isOpen ? "bg-blue-50 text-blue-600" : "text-slate-400"
                  )}>
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </h3>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center shrink-0 transition-all duration-300 text-slate-400 bg-white",
                  isOpen && "rotate-180 border-blue-100 text-blue-600 bg-blue-50/50"
                )}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pl-16 sm:pl-20 border-t border-slate-50 pt-4">
                      <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
