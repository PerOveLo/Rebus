import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

interface BalloonData {
  rounds?: number;
}

// Generisk «tør du mer?»: pump ballongen så stor som mulig og sikre
// poengene FØR den sprekker. Flaks, mot og høylytt lagdiskusjon.
export function BalloonPumpGame({ post, onComplete }: GameProps) {
  const rounds = ((post.data ?? {}) as BalloonData).rounds ?? 3;
  const [round, setRound] = useState(1);
  const [size, setSize] = useState(0); // pumpetrykk i denne runden
  const [banked, setBanked] = useState(0);
  const [popped, setPopped] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'roundEnd' | 'done'>('playing');
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      // 3 runder à maks ~12 pumpetrykk. Raus skala: 20+ banket = full pott.
      const score = Math.max(30, Math.min(post.points.main, 30 + Math.round(banked * 1.5)));
      const t = setTimeout(() => onCompleteRef.current({ score }), 1900);
      return () => clearTimeout(t);
    }
  }, [phase, banked, post.points.main]);

  function pump() {
    if (phase !== 'playing') return;
    // Sprekkrisiko øker med størrelsen
    const risk = Math.max(0, (size - 3) * 0.09);
    if (Math.random() < risk) {
      setPopped(true);
      setPhase('roundEnd');
    } else {
      setSize((s) => s + 1);
    }
  }

  function bank() {
    if (phase !== 'playing' || size === 0) return;
    setBanked((b) => b + size);
    setPopped(false);
    setPhase('roundEnd');
  }

  function nextRound() {
    if (round >= rounds) {
      setPhase('done');
      return;
    }
    setRound((r) => r + 1);
    setSize(0);
    setPopped(false);
    setPhase('playing');
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">🎈</span>
        <h3>{banked >= 20 ? 'Iskalde nerver!' : 'Puh, det gikk bra!'}</h3>
        <p className="muted small">Dere sikret {banked} pumpetrykk totalt.</p>
      </div>
    );
  }

  const balloonScale = 1 + size * 0.18;

  return (
    <div className="stack center">
      <div className="spread" style={{ width: '100%' }}>
        <span className="badge">Runde {round}/{rounds}</span>
        <span className="badge">💰 Sikret: {banked}</span>
      </div>

      <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {phase === 'roundEnd' && popped ? (
          <span className="big-emoji pop-in" aria-hidden="true">💥</span>
        ) : (
          <span
            aria-hidden="true"
            style={{
              fontSize: '3rem',
              display: 'inline-block',
              transform: `scale(${balloonScale})`,
              transition: 'transform 0.2s ease',
            }}
          >
            🎈
          </span>
        )}
      </div>

      {phase === 'playing' ? (
        <>
          <p className="small muted" aria-live="polite">
            {size === 0
              ? 'Pump i vei – men jo større, jo farligere …'
              : `Trykk: ${size} · ${size > 6 ? 'DEN SKJELVER! 😱' : size > 3 ? 'Den strammer seg …' : 'Trygt … foreløpig.'}`}
          </p>
          <div className="row" style={{ width: '100%' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={pump}>
              💨 Pump!
            </button>
            <button className="btn btn-grass" style={{ flex: 1 }} onClick={bank} disabled={size === 0}>
              💰 Sikre {size > 0 ? `+${size}` : ''}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="small muted">
            {popped ? 'PANG! Runden ga 0 – men latteren var gratis.' : `Smart! ${size} trykk i banken.`}
          </p>
          <button className="btn btn-big" onClick={nextRound}>
            {round >= rounds ? 'Se resultatet 🎉' : 'Neste runde 🎈'}
          </button>
        </>
      )}
    </div>
  );
}
