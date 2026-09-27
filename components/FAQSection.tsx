'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Circle } from 'lucide-react';
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
    <section className={cn("max-w-6xl mx-auto px-4 sm:px-6 my-20", className)} id={`${pageId}-faqs`}>
      <Script id={`${pageId}-faq-schema`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Section Header with Accent Bar */}
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-1 items-start">
          <span>Frequently Asked Questions</span>
          <span className="w-12 h-1 bg-[#0066FF] rounded-full"></span>
        </h2>
      </div>

      {/* 2 Independent Column FAQ Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column Stack */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            if (index % 2 !== 0) return null;
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100 h-auto"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-[#0066FF]"
                  )} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pl-11 border-t border-slate-50 pt-3">
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
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

        {/* Right Column Stack */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            if (index % 2 === 0) return null;
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100 h-auto"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-[#0066FF]"
                  )} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pl-11 border-t border-slate-50 pt-3">
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
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
      </div>
    </section>
  );
}

