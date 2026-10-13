import React from 'react';

interface JesterLogoProps {
  className?: string;
  size?: number;
}

export const JesterLogo: React.FC<JesterLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_12px_rgba(239,68,68,0.45)] ${className}`}
    >
      <circle
        cx="100"
        cy="100"
        r="92"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      <circle
        cx="100"
        cy="100"
        r="82"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="74"
        stroke="#ef4444"
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      <path
        d="M28 100 L44 100 M156 100 L172 100 M100 28 L100 44 M100 156 L100 172"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M100 22 L116 54 L100 66 L84 54 Z"
        fill="#1e1b2e"
        stroke="#ef4444"
        strokeWidth="2"
      />
      <path
        d="M100 22 L100 66"
        stroke="#f87171"
        strokeWidth="1.5"
      />

      <path
        d="M84 54 L46 44 L32 78 L42 114 L58 102 L64 74 Z"
        fill="#131926"
        stroke="#dc2626"
        strokeWidth="2"
      />
      <path
        d="M48 60 L40 82 L48 100"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="42" cy="116" r="3.5" fill="#ef4444" />

      <path
        d="M116 54 L154 44 L168 78 L158 114 L142 102 L136 74 Z"
        fill="#131926"
        stroke="#dc2626"
        strokeWidth="2"
      />
      <path
        d="M152 60 L160 82 L152 100"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="158" cy="116" r="3.5" fill="#ef4444" />

      <path
        d="M68 72 L100 86 L132 72 L144 112 L100 168 L56 112 Z"
        fill="#090d16"
        stroke="#ef4444"
        strokeWidth="2.2"
      />

      <path
        d="M68 72 L100 106 L132 72"
        stroke="#dc2626"
        strokeWidth="1.5"
      />
      <path
        d="M100 106 L100 138"
        stroke="#dc2626"
        strokeWidth="1.5"
      />

      <path
        d="M74 104 L88 96 L94 108 L80 114 Z"
        fill="#05080e"
        stroke="#f87171"
        strokeWidth="1.8"
      />
      <path
        d="M126 104 L112 96 L106 108 L120 114 Z"
        fill="#05080e"
        stroke="#f87171"
        strokeWidth="1.8"
      />

      <path
        d="M96 114 L100 126 L104 114"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M72 134 C80 156 120 156 128 134 C116 142 84 142 72 134 Z"
        fill="#1c070b"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M80 137 L80 144 M90 139 L90 147 M100 140 L100 148 M110 139 L110 147 M120 137 L120 144"
        stroke="#dc2626"
        strokeWidth="1"
      />

      <path
        d="M64 122 L76 128 M136 122 L124 128 M100 148 L100 164"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="76" cy="128" r="2" fill="#38bdf8" />
      <circle cx="124" cy="128" r="2" fill="#38bdf8" />
      <circle cx="100" cy="164" r="2.5" fill="#ef4444" />
      <circle cx="100" cy="86" r="3" fill="#f87171" />
    </svg>
  );
};
