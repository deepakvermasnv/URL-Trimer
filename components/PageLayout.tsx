import React from 'react';
import Footer from './Footer';
import { motion } from 'motion/react';

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
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[5%] left-[5%] w-64 h-64 bg-blue-400/10 rounded-full blur-[60px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0],
              y: [0, 60, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-400/10 rounded-full blur-[80px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, 20, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] right-[50%] w-32 h-32 bg-sky-300/10 rounded-full blur-[40px]" 
          />
          
          {/* Extra depth Blobs */}
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] w-48 h-48 bg-purple-400/10 rounded-full blur-[50px] mix-blend-multiply" 
          />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20 relative z-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
