import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

type Mode = 'choose' | 'motion' | 'finger';
type Phase = 'idle' | 'running' | 'failed' | 'done';

// Post 7: Hold telefonen (eller fingeren) helt stille i åtte sekunder.
// DeviceMotion brukes KUN etter aktivt samtykke; fingermetoden er
// alltid tilgjengelig og likeverdig.
export function StillnessGame({ post, onComplete }: GameProps) {
  const seconds = ((post.data as { seconds?: number } | undefined)?.seconds ?? 8);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>('choose');
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [circlePos, setCirclePos] = useState({ x: 50, y: 50 });
  const doneRef = useRef(false);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const fail = () => {
    if (phaseRef.current !== 'running') return;
    setAttempts((a) => a + 1);
    setPhase('failed');
  };

  // --- Bevegelsessensor-modus ---
  useEffect(() => {
    if (mode !== 'motion' || phase !== 'running') return;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      // ~9.81 i ro. Utslag utover terskel = bevegelse.
      if (Math.abs(mag - 9.81) > 1.6) fail();
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [mode, phase]);

  // --- Tidtaking ---
  useEffect(() => {
    if (phase !== 'running') return;
    const startTime = performance.now();
    const t = setInterval(() => {
      const el = (performance.now() - startTime) / 1000;
      setElapsed(el);
      if (el >= seconds) {
        clearInterval(t);
        setPhase('done');
      }
    }, 100);
    return () => clearInterval(t);
  }, [phase, seconds]);

  // --- Sakte bevegelig sirkel i fingermodus ---
  useEffect(() => {
    if (mode !== 'finger' || phase !== 'running') return;
    if (reduced) return; // sirkelen står stille ved redusert bevegelse
    const t = setInterval(() => {
      setCirclePos({
        x: 50 + Math.sin(performance.now() / 1900) * 22,
        y: 50 + Math.cos(performance.now() / 2300) * 18,
      });
    }, 90);
    return () => clearInterval(t);
  }, [mode, phase, reduced]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const score = Math.max(35, post.points.main - Math.max(0, attempts - 1) * 8);
      const t = setTimeout(() => onComplete({ score }), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, attempts, onComplete, post.points.main]);

  async function chooseMotion() {
    try {
      const DM = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DM.requestPermission === 'function') {
        const res = await DM.requestPermission();
        if (res !== 'granted') {
          setMode('finger');
          return;
        }
      }
      setMode('motion');
    } catch {
      setMode('finger');
    }
  }

  function fingerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (mode !== 'finger' || phase !== 'running') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const dist = Math.hypot(x - circlePos.x, y - circlePos.y);
    if (dist > 16) fail();
  }

  if (mode === 'choose') {
    return (
      <div className="stack">
        <p className="muted center">Hvordan vil dere holde dere stille? Begge er like fine.</p>
        <button className="btn btn-big" onClick={chooseMotion}>
          📱 Bruk bevegelsessensor (valgfritt)
        </button>
        <button className="btn btn-grass btn-big" onClick={() => setMode('finger')}>
          👆 Bruk fingermetoden
        </button>
        <p className="small muted center">Sensoren brukes bare her og nå – ingenting lagres.</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">😴</span>
        <h3>Sshh … Jenny sover fortsatt!</h3>
        <p className="muted small">Verdensmesteren snorker videre. Godt jobbet.</p>
      </div>
    );
  }

  const secondsLeft = Math.max(0, Math.ceil(seconds - elapsed));

  return (
    <div className="stack center">
      {phase === 'failed' && (
        <div className="card card-soft pop-in">
          <span className="big-emoji" aria-hidden="true">🙈</span>
          <p style={{ marginTop: 6 }}>Å nei. Jenny snudde seg. Prøv igjen.</p>
        </div>
      )}

      {mode === 'motion' ? (
        <>
          <div
            className="card"
            style={{ background: '#123044', color: '#ffe9b0', padding: 28 }}
            aria-live="polite"
          >
            <span className="big-emoji" aria-hidden="true">🌙</span>
            <div style={{ fontSize: '2.6rem', fontWeight: 900 }}>
              {phase === 'running' ? secondsLeft : seconds}
            </div>
            <div className="small">
              {phase === 'running' ? 'Helt … stille …' : 'Hold telefonen med begge hender'}
            </div>
          </div>
          {phase !== 'running' && (
            <button className="btn btn-primary btn-big" onClick={() => { setElapsed(0); setPhase('running'); }}>
              {phase === 'failed' ? 'Prøv igjen 🤫' : 'Vi er klare 🤫'}
            </button>
          )}
        </>
      ) : (
        <>
          <div
            onPointerMove={fingerMove}
            onPointerLeave={() => fail()}
            onPointerUp={() => fail()}
            onPointerDown={() => {
              if (phase !== 'running') {
                setElapsed(0);
                setPhase('running');
              }
            }}
            className="tap-zone"
            style={{
              position: 'relative',
              height: 300,
              borderRadius: 20,
              background: 'linear-gradient(180deg, #123044, #2b4257)',
              overflow: 'hidden',
            }}
            aria-label="Hold fingeren inne i den lyse sirkelen"
          >
            <div
              style={{
                position: 'absolute',
                left: `${circlePos.x}%`,
                top: `${circlePos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 110,
                height: 110,
                borderRadius: '50%',
                border: '4px dashed var(--sun)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffe9b0',
                fontSize: '1.6rem',
                fontWeight: 900,
              }}
            >
              {phase === 'running' ? secondsLeft : '🌙'}
            </div>
            {phase !== 'running' && (
              <div
                style={{ position: 'absolute', bottom: 14, width: '100%', textAlign: 'center', color: '#ffe9b0' }}
                className="small"
              >
                Sett fingeren i sirkelen og hold den der …
              </div>
            )}
          </div>
          <p className="small muted">Sirkelen sniker seg sakte rundt – følg med!</p>
        </>
      )}
    </div>
  );
}
