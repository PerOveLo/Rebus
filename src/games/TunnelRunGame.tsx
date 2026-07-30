import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface Obstacle {
  id: number;
  lane: number;
  y: number; // 0 (langt unna) -> 100 (ved bilen)
  emoji: string;
  label: string;
}

interface TunnelData {
  obstacles: { emoji: string; label: string }[];
  secondsToSurvive: number;
}

// Post 1: Trykk på felt for å bytte fil og unngå hindringene i tunnelen.
export function TunnelRunGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as TunnelData;
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'crashed' | 'done'>('ready');
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [progress, setProgress] = useState(0);
  const [crashes, setCrashes] = useState(0);
  const [crashLabel, setCrashLabel] = useState('');

  const laneRef = useRef(lane);
  laneRef.current = lane;
  const stateRef = useRef({ obstacles: [] as Obstacle[], time: 0, nextSpawn: 1200, idSeq: 1 });
  const doneRef = useRef(false);

  const totalMs = (data.secondsToSurvive ?? 20) * 1000;

  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    let last = performance.now();
    const speed = reduced ? 0.045 : 0.06; // % per ms

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const s = stateRef.current;
      s.time += dt;
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        const o = data.obstacles[Math.floor(Math.random() * data.obstacles.length)];
        s.obstacles.push({
          id: s.idSeq++,
          lane: Math.floor(Math.random() * 3),
          y: -8,
          emoji: o.emoji,
          label: o.label,
        });
        s.nextSpawn = 900 + Math.random() * 800;
      }
      s.obstacles = s.obstacles.filter((o) => o.y < 108);
      let crashed: Obstacle | null = null;
      for (const o of s.obstacles) {
        o.y += speed * dt;
        if (o.y > 78 && o.y < 96 && o.lane === laneRef.current) crashed = o;
      }
      if (crashed) {
        setCrashLabel(crashed.label);
        setCrashes((c) => c + 1);
        setPhase('crashed');
        return;
      }
      setObstacles([...s.obstacles]);
      setProgress(Math.min(100, (s.time / totalMs) * 100));
      if (s.time >= totalMs) {
        setPhase('done');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, data.obstacles, totalMs, reduced]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      // Raust: full pott ved 0-1 krasj, litt mindre ved flere. Aldri under 30.
      const score = Math.max(30, post.points.main - Math.max(0, crashes - 1) * 10);
      const t = setTimeout(() => onComplete({ score }), 1800);
      return () => clearTimeout(t);
    }
  }, [phase, crashes, onComplete, post.points.main]);

  function start() {
    stateRef.current = { obstacles: [], time: 0, nextSpawn: 900, idSeq: 1 };
    setObstacles([]);
    setProgress(0);
    setPhase('playing');
  }

  if (phase === 'ready' || phase === 'crashed') {
    return (
      <div className="stack center">
        {phase === 'crashed' && (
          <div className="card card-soft pop-in">
            <span className="big-emoji" aria-hidden="true">💥</span>
            <p style={{ marginTop: 6 }}>
              Oi! Dere traff {crashLabel}. Ingen skade skjedd – prøv igjen!
            </p>
          </div>
        )}
        <p className="muted">
          Trykk på feltet du vil svinge til. Kom dere gjennom tunnelen uten å treffe noe!
        </p>
        <button className="btn btn-primary btn-big" onClick={start}>
          {phase === 'crashed' ? 'Prøv igjen 🚗' : 'Start motoren 🚗'}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">🎉</span>
        <h3>Dere kom dere gjennom tunnelen!</h3>
        <p className="muted small">Øyrådet noterer: kjørestil «forsiktig byfolk».</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="progress-track" aria-label="Fremdrift i tunnelen">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="tap-zone"
        style={{
          position: 'relative',
          height: 340,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #123044 0%, #2b4257 100%)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
        }}
      >
        {[0, 1, 2].map((l) => (
          <button
            key={l}
            onClick={() => setLane(l)}
            aria-label={`Bytt til felt ${l + 1}`}
            style={{
              border: 'none',
              background: 'transparent',
              borderLeft: l > 0 ? '3px dashed rgba(255,255,255,0.25)' : 'none',
              position: 'relative',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {lane === l && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-90deg)',
                  fontSize: '2.2rem',
                }}
              >
                🚗
              </span>
            )}
          </button>
        ))}
        {obstacles.map((o) => (
          <span
            key={o.id}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${o.lane * 33.33 + 16.6}%`,
              top: `${o.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: '2rem',
              pointerEvents: 'none',
            }}
          >
            {o.emoji}
          </span>
        ))}
        <span
          aria-hidden="true"
          style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', color: '#ffe9b0', fontSize: '0.8rem', fontWeight: 700, pointerEvents: 'none' }}
        >
          TUNNELEN TIL FLEKKERØYA
        </span>
      </div>
      <p className="small muted center">Trykk på et felt for å svinge dit.</p>
    </div>
  );
}
