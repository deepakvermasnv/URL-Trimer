import React from 'react';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBlobs?: boolean;
}

export default function PageLayout({ children, className, showBlobs = true }: PageLayoutProps) {
  return (
    <div className={`min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden ${className}`}>
      {showBlobs && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[5%] left-[5%] w-64 h-64 bg-blue-400/5 rounded-full blur-[60px]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-400/5 rounded-full blur-[80px]" />
          <div className="absolute top-[40%] right-[50%] w-32 h-32 bg-sky-300/5 rounded-full blur-[40px]" />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20 relative z-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
