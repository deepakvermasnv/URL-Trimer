import { useState, useEffect } from 'react';

export function useAnimationsEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const checkMotion = () => {
      if (motionQuery.matches) {
        return false;
      }
      return true;
    };

    // Check connection speed
    const checkConnection = () => {
      const conn = (navigator as any).connection;
      if (conn) {
        // saveData mode is enabled or connection is slow
        if (conn.saveData) return false;
        const speed = conn.effectiveType; // 'slow-2g', '2g', '3g', '4g'
        if (speed === 'slow-2g' || speed === '2g' || speed === '3g') {
          return false;
        }
      }
      return true;
    };

    const updateStatus = () => {
      const isMotionOk = checkMotion();
      const isConnectionOk = checkConnection();
      setEnabled(isMotionOk && isConnectionOk);
    };

    updateStatus();

    // Event listener for subsequent changes
    motionQuery.addEventListener('change', updateStatus);
    
    const conn = (navigator as any).connection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', updateStatus);
    }

    return () => {
      motionQuery.removeEventListener('change', updateStatus);
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return enabled;
}
