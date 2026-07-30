import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface StartupData {
  customers: string[];
  problems: string[];
  technologies: string[];
}

const MAX_SPINS = 3;

const NAME_START = [
  'Sau', 'Sokke', 'Tunnel', 'Plen', 'Drone', 'Øy', 'Robo', 'Fest',
  'Krabbe', 'Måke', 'Skjærgårds', 'Bade', 'Latter', 'Søvn',
];
const NAME_MID = ['Tech', 'Labs', 'ify', 'X', 'matic', 'Hub', 'zilla', 'Snap', 'Boost', 'Fiks'];
const NAME_END = [' AS', ' Norge', ' & Sønner', ' Deluxe', ' 3000', '', '', ''];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sillyName(): string {
  return `${pick(NAME_START)}${pick(NAME_MID)}${pick(NAME_END)}`;
}

// «en drone» -> «En drone», «kunstig intelligens» -> «Kunstig intelligens»,
// «Sauer» -> «sauer» – så setningen blir naturlig norsk.
function composeIdea(tech: string, customer: string, problem: string): string {
  const t = tech.charAt(0).toUpperCase() + tech.slice(1);
  const c = customer.charAt(0).toLowerCase() + customer.slice(1);
  return `${t} som hjelper ${c} som ${problem}.`;
}

function safeWords(words: string[] | undefined): string[] {
  return words && words.length > 0 ? words : ['???'];
}

// Post 10: Snurr tre idéhjul, døp bedriften og gå rett på børs.
export function StartupWheelGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as StartupData;
  const reduced = useReducedMotion();

  const wheels = [
    { label: 'Teknologi', emoji: '🛠️', words: safeWords(data.technologies) },
    { label: 'Kunde', emoji: '🙋', words: safeWords(data.customers) },
    { label: 'Problem', emoji: '🧦', words: safeWords(data.problems) },
  ];

  const [phase, setPhase] = useState<'spin' | 'brand' | 'done'>('spin');
  const [indices, setIndices] = useState<number[]>([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');

  const timersRef = useRef<number[]>([]);
  const doneRef = useRef(false);
  const resultRef = useRef<{ startupIdea: string; startupName: string; startupSlogan?: string } | null>(null);

  // Rydd opp alle hjul-timere hvis komponenten forsvinner midt i en snurr.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(
        () => onComplete({ score: post.points.main, creations: resultRef.current ?? {} }),
        1900,
      );
      return () => clearTimeout(t);
    }
  }, [phase, onComplete, post.points.main]);

  const spinsLeft = MAX_SPINS - spinsUsed;
  const idea = composeIdea(
    wheels[0].words[indices[0] % wheels[0].words.length],
    wheels[1].words[indices[1] % wheels[1].words.length],
    wheels[2].words[indices[2] % wheels[2].words.length],
  );

  function spin() {
    if (spinning || spinsLeft <= 0) return;
    setSpinsUsed((s) => s + 1);

    if (reduced) {
      // Redusert bevegelse: hopp rett til resultatet, ingen rulling.
      setIndices(wheels.map((w) => Math.floor(Math.random() * w.words.length)));
      setHasResult(true);
      return;
    }

    setSpinning(true);
    setHasResult(false);
    let wheelsLeft = wheels.length;

    wheels.forEach((wheel, w) => {
      const len = wheel.words.length;
      const fastSteps = 8 + w * 3 + Math.floor(Math.random() * 3);
      const slowDelays = [120, 180, 260, 380];
      const totalSteps = fastSteps + slowDelays.length;
      let delay = 0;
      for (let step = 0; step < totalSteps; step++) {
        delay += step < fastSteps ? 70 : slowDelays[step - fastSteps];
        const isLast = step === totalSteps - 1;
        const id = window.setTimeout(() => {
          setIndices((prev) => {
            const next = [...prev];
            next[w] = (next[w] + 1) % len;
            return next;
          });
          if (isLast) {
            wheelsLeft -= 1;
            if (wheelsLeft === 0) {
              setSpinning(false);
              setHasResult(true);
            }
          }
        }, delay);
        timersRef.current.push(id);
      }
    });
  }

  function register() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const trimmedSlogan = slogan.trim();
    resultRef.current = {
      startupIdea: idea,
      startupName: trimmedName,
      ...(trimmedSlogan ? { startupSlogan: trimmedSlogan } : {}),
    };
    setPhase('done');
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">📈</span>
        <h3>BØRSNOTERT! 🔔</h3>
        <p>
          <strong>{resultRef.current?.startupName}</strong> er nå på Flekkerøy-børsen!
        </p>
        <p className="muted small">Aksjekursen peker rett til himmels. Investorene jubler i hagen.</p>
        <span
          className={reduced ? undefined : 'floaty'}
          style={{ fontSize: '2rem' }}
          aria-hidden="true"
        >
          🚀💰🎉
        </span>
      </div>
    );
  }

  if (phase === 'brand') {
    return (
      <div className="stack">
        <div className="card card-soft">
          <p style={{ margin: 0 }}>
            💡 <strong>{idea}</strong>
          </p>
        </div>
        <label className="small muted" htmlFor="startup-name">
          Firmanavn
        </label>
        <div className="row">
          <input
            id="startup-name"
            type="text"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="F.eks. SokkeTech AS"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-sun"
            onClick={() => setName(sillyName())}
            aria-label="Foreslå et firmanavn"
          >
            ✨ Foreslå
          </button>
        </div>
        <label className="small muted" htmlFor="startup-slogan">
          Slagord
        </label>
        <input
          id="startup-slogan"
          type="text"
          maxLength={60}
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="F.eks. «Aldri mer én og én sokk»"
        />
        <button
          className="btn btn-primary btn-big"
          onClick={register}
          disabled={!name.trim()}
        >
          📈 Registrer bedriften!
        </button>
        {!name.trim() && (
          <p className="small muted center">
            Bedriften trenger et navn – skriv selv eller trykk ✨ Foreslå.
          </p>
        )}
        <button className="btn btn-ghost" onClick={() => setPhase('spin')}>
          ⬅️ Tilbake til hjulene
        </button>
      </div>
    );
  }

  const started = spinning || hasResult;

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 8 }}>
        {wheels.map((wheel, w) => {
          const len = wheel.words.length;
          const i = indices[w] % len;
          return (
            <div
              key={wheel.label}
              style={{
                background: 'var(--paper)',
                border: '3px solid var(--sea)',
                borderRadius: 16,
                padding: '8px 12px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div className="small muted">
                {wheel.emoji} {wheel.label}
              </div>
              <div
                aria-live={spinning ? 'off' : 'polite'}
                style={{ height: 72, overflow: 'hidden', textAlign: 'center' }}
              >
                {started ? (
                  <>
                    <div style={{ opacity: 0.25, fontSize: '0.8rem' }} aria-hidden="true">
                      {wheel.words[(i - 1 + len) % len]}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{wheel.words[i]}</div>
                    <div style={{ opacity: 0.25, fontSize: '0.8rem' }} aria-hidden="true">
                      {wheel.words[(i + 1) % len]}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '1.8rem', lineHeight: '72px' }} aria-hidden="true">
                    ❓
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasResult && !spinning && (
        <div className="card card-soft pop-in center">
          💡 <strong>{idea}</strong>
        </div>
      )}

      {spinsLeft > 0 && (
        <button className="btn btn-primary btn-big" onClick={spin} disabled={spinning}>
          {spinning ? 'Hjulene ruller… 🌀' : hasResult ? `🎰 Snurr igjen (${spinsLeft} igjen)` : '🎰 SNURR!'}
        </button>
      )}

      {hasResult && !spinning && (
        <button className="btn btn-grass btn-big" onClick={() => setPhase('brand')}>
          Denne er genial – gå videre ✅
        </button>
      )}

      <p className="small muted center">
        {spinsUsed} av {MAX_SPINS} snurr brukt · Gründere pivoterer, men ikke for ofte 😄
      </p>
    </div>
  );
}
