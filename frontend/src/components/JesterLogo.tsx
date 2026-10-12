import React from 'react';

interface JesterLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

export const JesterLogo: React.FC<JesterLogoProps> = ({
  size = 'md',
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
    >
      {/* Glow aura */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-rose-600/20 blur-md pointer-events-none transform scale-110" />
      )}

      {/* Vector cybernetic jester mask matching the user's uploaded logo */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
      >
        <defs>
          <linearGradient id="jesterRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3366" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          <linearGradient id="jesterDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer concentric cyber circuit rings */}
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="#475569"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="#f43f5e"
          strokeWidth="1.2"
          strokeDasharray="16 8 4 8"
          opacity="0.7"
        />

        {/* Outer circuit bus lines & nodes */}
        <path d="M 20 100 L 40 100 L 48 90" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
        <circle cx="20" cy="100" r="2.5" fill="#f43f5e" />
        <path d="M 180 100 L 160 100 L 152 90" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
        <circle cx="180" cy="100" r="2.5" fill="#f43f5e" />
        <path d="M 100 180 L 100 162 L 92 154" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
        <circle cx="100" cy="180" r="2.5" fill="#f43f5e" />

        {/* Circuit tracks in background */}
        <path d="M 46 130 L 60 130 L 70 142" stroke="#e11d48" strokeWidth="1" opacity="0.4" />
        <path d="M 154 130 L 140 130 L 130 142" stroke="#e11d48" strokeWidth="1" opacity="0.4" />
        <circle cx="46" cy="130" r="2" fill="#e11d48" opacity="0.6" />
        <circle cx="154" cy="130" r="2" fill="#e11d48" opacity="0.6" />

        {/* Central Crown Horn (Top) */}
        <path
          d="M 100 24 L 116 68 L 100 78 L 84 68 Z"
          fill="url(#jesterDark)"
          stroke="url(#jesterRed)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 100 24 L 100 78"
          stroke="#ff3366"
          strokeWidth="2"
        />
        {/* Central horn facets */}
        <path d="M 94 48 L 100 42 L 106 48" stroke="#ff3366" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="24" r="3.5" fill="#ff3366" />

        {/* Left Jester Horn (Curved down-left) */}
        <path
          d="M 84 68 L 52 44 L 28 80 L 42 118 L 62 82 Z"
          fill="url(#jesterDark)"
          stroke="url(#jesterRed)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 52 44 L 46 86 L 42 118"
          stroke="#ff3366"
          strokeWidth="1.8"
        />
        <path d="M 38 64 L 52 74 L 56 60" stroke="#f43f5e" strokeWidth="1.2" fill="none" />
        <circle cx="42" cy="118" r="4.5" fill="#ff3366" />
        <circle cx="42" cy="118" r="2" fill="#ffffff" />

        {/* Right Jester Horn (Curved down-right) */}
        <path
          d="M 116 68 L 148 44 L 172 80 L 158 118 L 138 82 Z"
          fill="url(#jesterDark)"
          stroke="url(#jesterRed)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 148 44 L 154 86 L 158 118"
          stroke="#ff3366"
          strokeWidth="1.8"
        />
        <path d="M 162 64 L 148 74 L 144 60" stroke="#f43f5e" strokeWidth="1.2" fill="none" />
        <circle cx="158" cy="118" r="4.5" fill="#ff3366" />
        <circle cx="158" cy="118" r="2" fill="#ffffff" />

        {/* Mask Forehead and Crest Base */}
        <path
          d="M 68 84 L 100 98 L 132 84 L 124 74 L 100 80 L 76 74 Z"
          fill="#1e293b"
          stroke="#f43f5e"
          strokeWidth="2"
        />
        <circle cx="100" cy="80" r="3.5" fill="#ff3366" />

        {/* Main Face Contour (Geometric Cybernetic Mask) */}
        <path
          d="M 66 86 L 60 118 L 68 144 L 86 168 L 100 178 L 114 168 L 132 144 L 140 118 L 134 86 L 100 100 Z"
          fill="url(#jesterDark)"
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cheekbones & Face Plates */}
        <path
          d="M 64 116 L 82 126 L 86 148 L 70 142 Z"
          fill="#0f172a"
          stroke="#e11d48"
          strokeWidth="1.5"
        />
        <path
          d="M 136 116 L 118 126 L 114 148 L 130 142 Z"
          fill="#0f172a"
          stroke="#e11d48"
          strokeWidth="1.5"
        />

        {/* Sinister Angular Eye Sockets */}
        <polygon
          points="74,106 88,102 92,112 78,118"
          fill="#020617"
          stroke="#ff3366"
          strokeWidth="2"
        />
        <polygon
          points="126,106 112,102 108,112 122,118"
          fill="#020617"
          stroke="#ff3366"
          strokeWidth="2"
        />
        {/* Glowing Circuit Node Eyes */}
        <circle cx="84" cy="110" r="2.5" fill="#ff3366" />
        <circle cx="84" cy="110" r="1" fill="#fff" />
        <circle cx="116" cy="110" r="2.5" fill="#ff3366" />
        <circle cx="116" cy="110" r="1" fill="#fff" />

        {/* Cyber Nose / Bridge */}
        <path
          d="M 100 102 L 95 124 L 100 132 L 105 124 Z"
          fill="#1e293b"
          stroke="#f43f5e"
          strokeWidth="1.5"
        />

        {/* Signature Sinister Jester Grin (Cyber smile) */}
        <path
          d="M 72 136 Q 100 164 128 136 Q 100 152 72 136 Z"
          fill="#020617"
          stroke="#ff3366"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cyber Teeth / Grin Fissures */}
        <path d="M 82 140 L 84 148" stroke="#ff3366" strokeWidth="1.5" />
        <path d="M 92 143 L 93 152" stroke="#ff3366" strokeWidth="1.5" />
        <path d="M 100 144 L 100 153" stroke="#ff3366" strokeWidth="1.5" />
        <path d="M 108 143 L 107 152" stroke="#ff3366" strokeWidth="1.5" />
        <path d="M 118 140 L 116 148" stroke="#ff3366" strokeWidth="1.5" />

        {/* Angular Chin Plate */}
        <path
          d="M 90 162 L 100 174 L 110 162 Z"
          fill="#1e293b"
          stroke="#f43f5e"
          strokeWidth="1.5"
        />

        {/* Circuit Nodes on Face Contours */}
        <circle cx="74" cy="106" r="2" fill="#ff3366" />
        <circle cx="126" cy="106" r="2" fill="#ff3366" />
        <circle cx="86" cy="148" r="2" fill="#ff3366" />
        <circle cx="114" cy="148" r="2" fill="#ff3366" />
      </svg>
    </div>
  );
};
