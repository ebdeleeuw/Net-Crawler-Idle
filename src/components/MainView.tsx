import React from 'react';

export const MainView: React.FC<{ era: number }> = ({ era }) => {
  return (
    <div className="w-full h-64 border border-[#33ff00]/30 rounded bg-[#051005] flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(51,255,0,0.15)]">
      {era === 1 && <Era1SVG />}
      {era === 2 && <Era2SVG />}
      {era === 3 && <Era3SVG />}
      {era === 4 && <Era4SVG />}
      
      <div className="absolute top-2 left-2 text-xs opacity-50">
        UPLINK: {era >= 2 ? 'ESTABLISHED' : 'LOCAL ONLY'}
      </div>
      <div className="absolute top-2 right-2 text-xs opacity-50">
        ERA: 0{era}
      </div>
    </div>
  );
};

const Era1SVG = () => (
  <svg viewBox="0 0 200 150" className="w-full h-full max-w-xs opacity-80 drop-shadow-[0_0_8px_rgba(51,255,0,0.5)]">
    {/* Desk */}
    <rect x="20" y="130" width="160" height="5" fill="#33ff00" opacity="0.3" />
    {/* Monitor Base */}
    <rect x="80" y="110" width="40" height="20" fill="none" stroke="#33ff00" strokeWidth="2" />
    <path d="M70 130 L130 130" stroke="#33ff00" strokeWidth="2" />
    {/* Monitor Body */}
    <rect x="40" y="20" width="120" height="90" rx="5" fill="#051005" stroke="#33ff00" strokeWidth="2" />
    {/* Screen */}
    <rect x="50" y="30" width="100" height="70" rx="2" fill="#1a4d1a" stroke="#33ff00" strokeWidth="1" />
    {/* Screen Glare/Lines */}
    <line x1="55" y1="40" x2="90" y2="40" stroke="#33ff00" strokeWidth="2" opacity="0.8" />
    <line x1="55" y1="50" x2="110" y2="50" stroke="#33ff00" strokeWidth="2" opacity="0.6" />
    <line x1="55" y1="60" x2="80" y2="60" stroke="#33ff00" strokeWidth="2" opacity="0.9" />
    {/* Blinking cursor */}
    <rect x="85" y="55" width="6" height="8" fill="#33ff00">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const Era2SVG = () => (
  <svg viewBox="0 0 300 150" className="w-full h-full max-w-md opacity-80 drop-shadow-[0_0_8px_rgba(51,255,0,0.5)]">
    {/* Desk */}
    <rect x="10" y="130" width="280" height="5" fill="#33ff00" opacity="0.3" />
    
    {/* PC 1 (Left) */}
    <rect x="30" y="60" width="40" height="70" fill="#051005" stroke="#33ff00" strokeWidth="2" />
    <line x1="40" y1="70" x2="60" y2="70" stroke="#33ff00" strokeWidth="1" />
    <line x1="40" y1="75" x2="60" y2="75" stroke="#33ff00" strokeWidth="1" />
    <circle cx="50" cy="110" r="3" fill="#33ff00">
      <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
    </circle>

    {/* Monitor 1 (Center Left) */}
    <rect x="90" y="110" width="20" height="20" fill="none" stroke="#33ff00" strokeWidth="2" />
    <rect x="75" y="40" width="50" height="70" rx="3" fill="#051005" stroke="#33ff00" strokeWidth="2" />
    <rect x="80" y="45" width="40" height="50" fill="#1a4d1a" stroke="#33ff00" strokeWidth="1" />
    <line x1="85" y1="55" x2="105" y2="55" stroke="#33ff00" strokeWidth="1.5" />
    
    {/* Monitor 2 (Center Right) */}
    <rect x="160" y="110" width="20" height="20" fill="none" stroke="#33ff00" strokeWidth="2" />
    <rect x="145" y="30" width="60" height="80" rx="3" fill="#051005" stroke="#33ff00" strokeWidth="2" />
    <rect x="150" y="35" width="50" height="60" fill="#1a4d1a" stroke="#33ff00" strokeWidth="1" />
    <line x1="155" y1="45" x2="185" y2="45" stroke="#33ff00" strokeWidth="1.5" />
    <line x1="155" y1="55" x2="190" y2="55" stroke="#33ff00" strokeWidth="1.5" />
    
    {/* PC 2 (Right) */}
    <rect x="220" y="50" width="50" height="80" fill="#051005" stroke="#33ff00" strokeWidth="2" />
    <line x1="230" y1="60" x2="260" y2="60" stroke="#33ff00" strokeWidth="1" />
    <circle cx="245" cy="110" r="3" fill="#33ff00">
      <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" />
    </circle>
    
    {/* Cables */}
    <path d="M70 120 Q80 130 90 120" fill="none" stroke="#33ff00" strokeWidth="1" opacity="0.5" />
    <path d="M125 120 Q135 130 145 120" fill="none" stroke="#33ff00" strokeWidth="1" opacity="0.5" />
    <path d="M205 120 Q215 130 220 120" fill="none" stroke="#33ff00" strokeWidth="1" opacity="0.5" />
  </svg>
);

const Era3SVG = () => (
  <div className="text-center">
    <div className="text-2xl mb-2">ERA 3: CORPORATE BACKBONE</div>
    <div className="text-sm opacity-50">[ ENCRYPTED - UNAVAILABLE IN V1 ]</div>
  </div>
);

const Era4SVG = () => (
  <div className="text-center">
    <div className="text-2xl mb-2">ERA 4: GLOBAL OVERRIDE</div>
    <div className="text-sm opacity-50">[ ENCRYPTED - UNAVAILABLE IN V1 ]</div>
  </div>
);
