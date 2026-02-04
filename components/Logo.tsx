
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <div className="font-bold text-2xl tracking-tighter flex items-center">
        <span className="text-slate-900 font-extrabold">RANY</span>
        <span className="text-emerald-500 font-bold">FRESH</span>
      </div>
    </div>
  );
};

export default Logo;
