import { useEffect, useState } from 'react';
import { gameConfig } from '../config/gameConfig';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Animert forside: en liten bil kjører gjennom tunnelen og Skylleviga
// dukker opp på andre siden. Statisk ved redusert bevegelse.
export function TunnelIntro() {
  const reduced = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = gameConfig.intro.loadingMessages;

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 2600);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="stack center" style={{ alignItems: 'center' }}>
      <svg viewBox="0 0 300 150" style={{ width: '100%', maxWidth: 380 }} role="img" aria-label="En bil kjører gjennom tunnelen til Skylleviga">
        {/* himmel og sol */}
        <rect width="300" height="150" rx="20" fill="#dbf1fd" />
        <circle cx="250" cy="30" r="16" fill="#ffc94d" />
        {/* sjø */}
        <path d="M0 118 Q 20 112 40 118 T 80 118 T 120 118 T 160 118 T 200 118 T 240 118 T 280 118 L 300 118 V 150 H 0 Z" fill="#38bdf8" opacity="0.7" />
        {/* øy med hus og fyr */}
        <ellipse cx="225" cy="118" rx="70" ry="16" fill="#3f8f33" />
        <rect x="205" y="86" width="26" height="20" rx="3" fill="#fff" />
        <path d="M202 88 L 218 74 L 234 88 Z" fill="#f4553f" />
        <rect x="255" y="80" width="8" height="26" rx="2" fill="#fff" />
        <rect x="253" y="76" width="12" height="6" rx="2" fill="#f4553f" />
        {/* sau på øya */}
        <text x="185" y="112" fontSize="12">🐑</text>
        {/* fjell og tunnel */}
        <path d="M0 130 L 0 60 Q 30 26 75 34 Q 110 40 118 130 Z" fill="#5b7a68" />
        <path d="M28 130 V 92 A 26 26 0 0 1 80 92 V 130 Z" fill="#123044" />
        <path d="M34 130 V 94 A 20 20 0 0 1 74 94 V 130 Z" fill="#2b4257" />
        {/* vei */}
        <rect x="0" y="126" width="300" height="10" fill="#c9b48a" />
        {/* bil som kjører */}
        <g style={reduced ? { transform: 'translateX(150px)' } : { animation: 'drive 5s linear infinite' }}>
          <text y="126" fontSize="20">🚗</text>
        </g>
      </svg>
      <div className="small muted" role="status" aria-live="polite" style={{ minHeight: '1.4em' }}>
        {messages[msgIndex]}
      </div>
    </div>
  );
}
