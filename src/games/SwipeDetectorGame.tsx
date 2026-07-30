import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

type Answer = 'by' | 'oy' | 'begge';

interface DetectorItem {
  emoji: string;
  text: string;
  answer: Answer;
}

interface DetectorData {
  items: DetectorItem[];
}

const LABELS: Record<Answer, string> = {
  by: '🏙️ Mistenkelig byfolk',
  oy: '🏝️ Øygodkjent',
  begge: '🤷 Kan være begge',
};

const CORRECT_MSGS = [
  'PLING! Detektoren lyser grønt og nikker fornøyd.',
  'PLING-PLONG! Perfekt kalibrert utslag.',
  'PIP-PIP-HURRA! Detektoren er mektig imponert.',
];

const WRONG_MSGS = [
  'BZZZT…? Detektoren piper forvirret og klør seg i antenna.',
  'PIIIP-boop-piip! Der måtte detektoren tenke seg om litt.',
  'BLIP-BLOP? Detektoren snurret en runde, men ingen fare.',
];

function pickDirection(dx: number, dy: number, threshold: number): Answer | null {
  if (dy < -threshold && Math.abs(dy) > Math.abs(dx)) return 'begge';
  if (dx < -threshold && Math.abs(dx) >= Math.abs(dy)) return 'by';
  if (dx > threshold && Math.abs(dx) >= Math.abs(dy)) return 'oy';
  return null;
}

// Post 14: Sveip (eller trykk) hver gjenstand til riktig kategori og
// kalibrer Byfolkdetektoren. Alle slipper inn til slutt.
export function SwipeDetectorGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as DetectorData;
  const items = data.items ?? [];
  const total = items.length;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'ready' | 'card' | 'feedback' | 'done'>('ready');
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastChoice, setLastChoice] = useState<Answer>('begge');
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [exit, setExit] = useState<{ x: number; y: number; rot: number } | null>(null);

  const startRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const answeredRef = useRef(false);
  const doneRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const main = post.points.main;
      const base = Math.floor(main / 2); // 30 av 60 – gjennomført gir alltid minst dette
      const ratio = total > 0 ? correctCount / total : 1;
      const score = Math.min(main, base + Math.ceil((main - base) * ratio));
      const t = setTimeout(() => onComplete({ score }), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, correctCount, total, onComplete, post.points.main]);

  const item = items[index];

  function answer(choice: Answer) {
    if (answeredRef.current || !item) return;
    answeredRef.current = true;
    setLastChoice(choice);
    if (choice === item.answer) setCorrectCount((c) => c + 1);
    setPhase('feedback');
  }

  function next() {
    answeredRef.current = false;
    setDrag(null);
    setExit(null);
    if (index + 1 >= total) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setPhase('card');
    }
  }

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== 'card' || exit || answeredRef.current) return;
    startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ dx: 0, dy: 0 });
  }

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = startRef.current;
    if (!s || s.id !== e.pointerId) return;
    setDrag({ dx: e.clientX - s.x, dy: e.clientY - s.y });
  }

  function onUp(e: ReactPointerEvent<HTMLDivElement>) {
    const s = startRef.current;
    if (!s || s.id !== e.pointerId) return;
    startRef.current = null;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const choice = pickDirection(dx, dy, 70);
    if (!choice) {
      setDrag(null); // ikke langt nok – kortet glir tilbake
      return;
    }
    if (reduced) {
      setDrag(null);
      answer(choice);
      return;
    }
    const vec =
      choice === 'by'
        ? { x: -420, y: dy, rot: -18 }
        : choice === 'oy'
          ? { x: 420, y: dy, rot: 18 }
          : { x: dx, y: -520, rot: 0 };
    setExit(vec);
    setDrag(null);
    exitTimerRef.current = window.setTimeout(() => answer(choice), 230);
  }

  function onCancel() {
    startRef.current = null;
    setDrag(null);
  }

  if (phase === 'ready') {
    return (
      <div className="stack center">
        <span className={`big-emoji${reduced ? '' : ' floaty'}`} aria-hidden="true">📟</span>
        <p className="muted">
          Detektoren viser én gjenstand om gangen. Sveip kortet mot riktig kategori – eller
          bruk knappene. Detektoren tar aldri feil. Bortsett fra når den gjør det.
        </p>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('card')}>
          Slå på detektoren 📟
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">🎉</span>
        <h3>Detektoren er ferdig kalibrert!</h3>
        <p>
          {correctCount} av {total} utslag helt riktige – resten var «kreativt kalibrert».
        </p>
        <p className="muted small">{post.funFact}</p>
      </div>
    );
  }

  if (phase === 'feedback' && item) {
    const correct = lastChoice === item.answer;
    const msg = correct
      ? CORRECT_MSGS[index % CORRECT_MSGS.length]
      : WRONG_MSGS[index % WRONG_MSGS.length];
    return (
      <div className="stack">
        <div className={`card card-soft center${reduced ? '' : ' pop-in'}`}>
          <span
            className={`big-emoji${!correct && !reduced ? ' wiggle' : ''}`}
            aria-hidden="true"
          >
            📟
          </span>
          <p style={{ marginTop: 6, fontWeight: 700 }}>{msg}</p>
          <p style={{ marginBottom: 4 }}>
            <span aria-hidden="true">{item.emoji}</span> {item.text}
          </p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            Dere svarte: {LABELS[lastChoice]}
            <br />
            Fasit: {LABELS[item.answer]}
          </p>
        </div>
        <button className="btn btn-primary btn-big" onClick={next}>
          {index + 1 >= total ? 'Se resultatet 🎉' : 'Neste gjenstand 📟'}
        </button>
      </div>
    );
  }

  if (!item) {
    // Skulle dataene mangle: aldri stå fast.
    return (
      <div className="stack center">
        <p className="muted">Detektoren fant ingen flere gjenstander.</p>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('done')}>
          Fullfør kalibreringen 📟
        </button>
      </div>
    );
  }

  const hint = drag ? pickDirection(drag.dx, drag.dy, 40) : null;

  const cardTransform = reduced
    ? undefined
    : exit
      ? `translate(${exit.x}px, ${exit.y}px) rotate(${exit.rot}deg)`
      : drag
        ? `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx * 0.08}deg)`
        : 'translate(0px, 0px) rotate(0deg)';

  const zoneStyle = (zone: Answer): CSSProperties => ({
    borderRadius: 14,
    border: `3px solid ${hint === zone ? 'var(--coral)' : 'transparent'}`,
    background: hint === zone ? 'var(--sun-soft)' : 'rgba(255,255,255,0.7)',
    padding: '6px 4px',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--ink-soft)',
    textAlign: 'center',
    lineHeight: 1.2,
  });

  return (
    <div className="stack">
      <div className="spread">
        <span className="badge">
          📟 {index + 1} / {total}
        </span>
        <span className="small muted">Riktige utslag: {correctCount}</span>
      </div>
      <div className="progress-track" aria-label="Fremdrift i kalibreringen">
        <div className="progress-fill" style={{ width: `${(index / Math.max(1, total)) * 100}%` }} />
      </div>

      <div style={zoneStyle('begge')} aria-hidden="true">
        <span style={{ fontSize: '1.2rem' }}>🤷</span>
        <br />
        Sveip opp: kan være begge
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px 1fr 56px',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={zoneStyle('by')} aria-hidden="true">
          <span style={{ fontSize: '1.2rem' }}>🏙️</span>
          <br />
          Byfolk
        </div>

        <div
          className="tap-zone"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
          style={{
            touchAction: 'none',
            userSelect: 'none',
            background: 'var(--paper)',
            borderRadius: 20,
            boxShadow: 'var(--shadow)',
            padding: '22px 14px',
            minHeight: 190,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textAlign: 'center',
            cursor: 'grab',
            transform: cardTransform,
            transition: reduced
              ? undefined
              : exit
                ? 'transform 0.25s ease, opacity 0.25s ease'
                : drag
                  ? 'none'
                  : 'transform 0.2s ease',
            opacity: exit ? 0.3 : 1,
          }}
        >
          <span style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden="true">
            {item.emoji}
          </span>
          <span style={{ fontWeight: 700 }}>{item.text}</span>
        </div>

        <div style={zoneStyle('oy')} aria-hidden="true">
          <span style={{ fontSize: '1.2rem' }}>🏝️</span>
          <br />
          Øygodkjent
        </div>
      </div>

      <p className="small muted center" style={{ marginBottom: 0 }}>
        Sveip kortet – eller trykk på en knapp:
      </p>
      <div className="stack" style={{ gap: 8 }}>
        <button className="btn" onClick={() => answer('by')}>
          {LABELS.by}
        </button>
        <button className="btn btn-grass" onClick={() => answer('oy')}>
          {LABELS.oy}
        </button>
        <button className="btn btn-sun" onClick={() => answer('begge')}>
          {LABELS.begge}
        </button>
      </div>
    </div>
  );
}
