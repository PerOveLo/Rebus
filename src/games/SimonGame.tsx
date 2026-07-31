import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface SimonData {
  emojis?: string[];
  targetLength?: number;
}

const COLORS = ['#0e7490', '#d43a25', '#337428', '#b8860b'];

// Generisk «Simon sier»: se sekvensen, gjenta den. Vokser hver runde.
export function SimonGame({ post, onComplete }: GameProps) {
  const data = (post.data ?? {}) as SimonData;
  const emojis = data.emojis ?? ['🌊', '🔥', '🌿', '⭐'];
  const target = data.targetLength ?? 5;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'intro' | 'watch' | 'repeat' | 'oops' | 'done'>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [inputPos, setInputPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  function extendAndWatch(seq: number[]) {
    const next = [...seq, Math.floor(Math.random() * emojis.length)];
    setSequence(next);
    setInputPos(0);
    setPhase('watch');
  }

  // Spill av sekvensen
  useEffect(() => {
    if (phase !== 'watch') return;
    let i = 0;
    const speed = reduced ? 900 : 650;
    const t = setInterval(() => {
      if (i < sequence.length) {
        setShowIndex(sequence[i]);
        setTimeout(() => setShowIndex(-1), speed * 0.6);
        i += 1;
      } else {
        clearInterval(t);
        setPhase('repeat');
      }
    }, speed);
    return () => clearInterval(t);
  }, [phase, sequence, reduced]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const score = Math.max(35, post.points.main - mistakes * 5);
      const t = setTimeout(() => onCompleteRef.current({ score }), 1800);
      return () => clearTimeout(t);
    }
  }, [phase, mistakes, post.points.main]);

  function press(idx: number) {
    if (phase !== 'repeat') return;
    if (idx === sequence[inputPos]) {
      const nextPos = inputPos + 1;
      if (nextPos === sequence.length) {
        if (sequence.length >= target) setPhase('done');
        else extendAndWatch(sequence);
      } else {
        setInputPos(nextPos);
      }
    } else {
      setMistakes((m) => m + 1);
      setPhase('oops');
    }
  }

  if (phase === 'intro' || phase === 'oops') {
    return (
      <div className="stack center">
        {phase === 'oops' && (
          <div className="card card-soft pop-in">
            <span className="big-emoji" aria-hidden="true">🙈</span>
            <p style={{ marginTop: 6 }}>Oi, feil rekkefølge! Se nøye og prøv igjen.</p>
          </div>
        )}
        <p className="muted">
          Se hvilke symboler som lyser opp – og trykk dem tilbake i samme rekkefølge. Sekvensen
          vokser for hver runde, helt til {target}!
        </p>
        <button className="btn btn-primary btn-big" onClick={() => extendAndWatch([])}>
          {phase === 'oops' ? 'Prøv igjen 👀' : 'Start 👀'}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">🧠</span>
        <h3>Perfekt hukommelse!</h3>
        <p className="muted small">Hele sekvensen på {target} satt som et skudd.</p>
      </div>
    );
  }

  return (
    <div className="stack center">
      <div className="badge">
        Runde {sequence.length} av {target} {phase === 'watch' ? '· Se nøye …' : '· Deres tur!'}
      </div>
      <div className="option-grid">
        {emojis.map((e, i) => (
          <button
            key={i}
            className="option-btn tap-zone"
            onClick={() => press(i)}
            disabled={phase === 'watch'}
            style={{
              fontSize: '2.4rem',
              minHeight: 90,
              background: showIndex === i ? COLORS[i % COLORS.length] : undefined,
              transition: 'background 0.15s',
            }}
            aria-label={`Symbol ${i + 1}`}
          >
            {e}
          </button>
        ))}
      </div>
      {phase === 'repeat' && (
        <p className="small muted">Trykk symbolene i samme rekkefølge ({inputPos}/{sequence.length})</p>
      )}
    </div>
  );
}
