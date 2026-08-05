import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Animert bursdagsforside: hus med vimpler, ballonger som svever og en
// kake i sentrum. (Og et lite uferdig hjørne – huset blir jo aldri helt
// ferdig.) Statisk ved redusert bevegelse.
export function BirthdayIntro({ messages }: { messages: string[] }) {
  const reduced = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 2600);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="stack center" style={{ alignItems: 'center' }}>
      <svg
        viewBox="0 0 300 150"
        style={{ width: '100%', maxWidth: 380 }}
        role="img"
        aria-label="Et pyntet bursdagshus med ballonger og kake"
      >
        {/* festlig himmel */}
        <rect width="300" height="150" rx="20" fill="#fdeff7" />
        <circle cx="252" cy="28" r="14" fill="#ffc94d" />
        {/* konfettiprikker */}
        <circle cx="30" cy="26" r="3" fill="#f4553f" />
        <circle cx="70" cy="14" r="3" fill="#38bdf8" />
        <circle cx="120" cy="30" r="3" fill="#3f8f33" />
        <circle cx="180" cy="16" r="3" fill="#ff8fab" />
        <circle cx="220" cy="34" r="3" fill="#0e7490" />
        {/* hus */}
        <rect x="90" y="70" width="120" height="60" rx="4" fill="#fff" />
        <path d="M82 72 L 150 34 L 218 72 Z" fill="#f4553f" />
        <rect x="140" y="98" width="24" height="32" rx="3" fill="#8a5a33" />
        <rect x="102" y="82" width="22" height="18" rx="2" fill="#bfe7fa" />
        <rect x="178" y="82" width="22" height="18" rx="2" fill="#bfe7fa" />
        {/* det uferdige hjørnet + stige (pappas prosjekt) */}
        <path d="M210 70 V 130 H 190 L 210 110 Z" fill="#e8e2d6" />
        <line x1="222" y1="130" x2="238" y2="88" stroke="#8a5a33" strokeWidth="4" strokeLinecap="round" />
        <line x1="230" y1="130" x2="246" y2="88" stroke="#8a5a33" strokeWidth="4" strokeLinecap="round" />
        <line x1="225" y1="118" x2="241" y2="118" stroke="#8a5a33" strokeWidth="3" />
        <line x1="228" y1="106" x2="244" y2="106" stroke="#8a5a33" strokeWidth="3" />
        {/* vimpler */}
        <path d="M60 44 Q 150 66 240 44" stroke="#0e7490" strokeWidth="2" fill="none" />
        {[70, 100, 130, 160, 190, 220].map((x, i) => (
          <path
            key={x}
            d={`M${x} ${50 + (i % 2) * 3} l 5 10 l 5 -10 Z`}
            fill={['#f4553f', '#ffc94d', '#38bdf8', '#3f8f33', '#ff8fab'][i % 5]}
          />
        ))}
        {/* gress */}
        <rect x="0" y="128" width="300" height="12" fill="#9fd08c" />
        {/* ballonger som svever */}
        <g className={reduced ? '' : 'floaty'}>
          <text x="44" y="92" fontSize="26">🎈</text>
        </g>
        <g className={reduced ? '' : 'floaty'} style={{ animationDelay: '0.8s' }}>
          <text x="258" y="66" fontSize="22">🎈</text>
        </g>
        {/* kaka og gjestene */}
        <text x="136" y="70" fontSize="20">🎂</text>
        <text x="60" y="126" fontSize="16">🧸</text>
        <text x="242" y="126" fontSize="16">🏎️</text>
      </svg>
      <div className="small muted" role="status" aria-live="polite" style={{ minHeight: '1.4em' }}>
        {messages[msgIndex] ?? ''}
      </div>
    </div>
  );
}
