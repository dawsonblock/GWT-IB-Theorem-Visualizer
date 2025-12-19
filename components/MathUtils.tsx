import React from 'react';

// Simple component to render math-like text consistently
export const M: React.FC<{ children: React.ReactNode, block?: boolean }> = ({ children, block = false }) => {
  if (block) {
    return (
      <div className="font-mono text-center my-4 p-3 bg-black/20 rounded border border-white/10 overflow-x-auto text-sm md:text-base">
        {children}
      </div>
    );
  }
  return <span className="font-mono bg-white/5 px-1 rounded text-primary-200 text-sm">{children}</span>;
};

export const MathSymbol: React.FC<{ s: string }> = ({ s }) => (
  <span className="font-serif italic mr-0.5">{s}</span>
);