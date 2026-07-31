import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

interface WhackData {
  target?: string;
  targetLabel?: string;
  decoys?: string[];
  seconds?: number;
  goal?: number;
}

// Generisk «fang den!»: riktig emoji dukker opp i rutenettet – tapp den,
// men ikke lurebildene!
export function WhackMoleGame({ post, onComplete }: GameProps) {
  const data = (post.data ?? {}) as WhackData;
  const target = data.target ?? '🧇';
  const targetLabel = data.targetLabel ?? 'vaffelen';
  const decoys = data.decoys ?? ['🐌', '🧦', '🥌'];
  const seconds = data.seconds ?? 20;
  const goal = data.goal ?? 10;

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [cells, setCells] = useState<(string | null)[]>(Array(9).fill(null));
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (phase !== 'playing') return;
    const spawn = setInterval(() => {
      setCells(() => {
        const next: (string | null)[] = Array(9).fill(null);
        const spot = Math.floor(Math.random() * 9);
        next[spot] = Math.random() < 0.65 ? target : decoys[Math.floor(Math.random() * decoys.length)];
        // av og til to samtidig
        if (Math.random() < 0.35) {
          const spot2 = (spot + 1 + Math.floor(Math.random() * 7)) % 9;
          next[spot2] = Math.random() < 0.5 ? target : decoys[Math.floor(Math.random() * decoys.length)];
        }
        return next;
      });
    }, 850);
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [phase, target, decoys]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const ratio = Math.min(1, hits / goal);
      const score = Math.max(30, Math.round(30 + 30 * ratio - Math.min(10, misses * 2)));
      const t = setTimeout(() => onCompleteRef.current({ score }), 1900);
      return () => clearTimeout(t);
    }
  }, [phase, hits, misses, goal]);

  function tap(i: number) {
    const v = cells[i];
    if (!v) return;
    if (v === target) setHits((h) => h + 1);
    else setMisses((m) => m + 1);
    setCells((c) => c.map((x, idx) => (idx === i ? null : x)));
  }

  if (phase === 'intro') {
    return (
      <div className="stack center">
        <p className="muted">
          Fang {targetLabel} {target} hver gang den dukker opp – men ikke rør {decoys.join(' ')}!
          Klarer dere {goal} på {seconds} sekunder?
        </p>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('playing')}>
          Start jakten! {target}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">{hits >= goal ? '🏆' : target}</span>
        <h3>{hits >= goal ? 'Mesterfangst!' : 'God innsats!'}</h3>
        <p className="muted small">
          {hits} fanget{misses > 0 ? ` (og ${misses} bomskudd på lurebildene)` : ' – helt uten bom!'}
        </p>
      </div>
    );
  }

  return (
    <div className="stack center">
      <div className="spread" style={{ width: '100%' }}>
        <span className="badge">{target} {hits}/{goal}</span>
        <span className="badge">⏱️ {timeLeft}s</span>
      </div>
      <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', width: '100%' }}>
        {cells.map((v, i) => (
          <button
            key={i}
            className="option-btn tap-zone"
            onClick={() => tap(i)}
            style={{ fontSize: '2.2rem', minHeight: 84 }}
            aria-label={v ? `Rute ${i + 1}: ${v}` : `Tom rute ${i + 1}`}
          >
            {v && <span className="pop-in" style={{ display: 'inline-block' }}>{v}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
