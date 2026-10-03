import React, { useState, useEffect } from 'react';

/**
 * Temporary Breakpoint Debugger (Requirement 2)
 * Displays current window.innerWidth and active breakpoint in bottom-left corner
 */
export const BreakpointDebugger: React.FC = () => {
  const [width, setWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 390;
  });

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Initial sync
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const getBreakpoint = (w: number): 'MOBILE' | 'TABLET' | 'DESKTOP' => {
    if (w < 640) return 'MOBILE';
    if (w < 1024) return 'TABLET';
    return 'DESKTOP';
  };

  const bp = getBreakpoint(width);

  return (
    <aside 
      aria-label="Responsive Breakpoint Debugger"
      className="fixed bottom-2.5 left-2.5 z-50 bg-black/90 text-white border border-emerald-500/70 font-mono text-[11px] leading-tight px-3 py-2 rounded-xl shadow-2xl pointer-events-none backdrop-blur-md no-print border-l-4 border-l-emerald-400"
    >
      <div className="flex items-center gap-1.5 text-slate-300">
        <span>Viewport:</span>
        <span className="text-emerald-400 font-bold text-xs">{width}px</span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5 text-slate-300">
        <span>Breakpoint:</span>
        <span
          className={`font-bold text-xs ${
            bp === 'MOBILE'
              ? 'text-amber-400'
              : bp === 'TABLET'
              ? 'text-cyan-400'
              : 'text-emerald-400'
          }`}
        >
          {bp}
        </span>
      </div>
    </aside>
  );
};
