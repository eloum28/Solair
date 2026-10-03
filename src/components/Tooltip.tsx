import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  term?: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, term, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1 group cursor-help">
      {children ? (
        <span
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          tabIndex={0}
          className="border-b border-dotted border-slate-400/60 dark:border-slate-500 hover:border-emerald-400 transition-colors"
        >
          {children}
        </span>
      ) : term ? (
        <span
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          tabIndex={0}
          className="border-b border-dotted border-slate-400/60 dark:border-slate-500 hover:border-emerald-400 transition-colors"
        >
          {term}
        </span>
      ) : null}

      <button
        type="button"
        aria-label="More information"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-slate-400 hover:text-emerald-400 dark:text-slate-500 dark:hover:text-emerald-300 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5 inline-block" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 dark:bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700/80 pointer-events-none leading-relaxed transition-opacity"
        >
          {term && <div className="font-semibold text-emerald-400 mb-0.5">{term}</div>}
          <div>{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
};
