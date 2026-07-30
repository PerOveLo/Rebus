import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface Animal {
  emoji: string;
  name: string;
  size: number;
}

interface AnimalMemoryData {
  animals: Animal[];
  boatCapacity: number;
}

// Post 12: Fase 1 – finn dyreparene (minnespill). Fase 2 – last båten to og to
// uten at den ligger for dypt i vannet.
export function AnimalMemoryGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as AnimalMemoryData;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'memory' | 'boat' | 'done'>('memory');
  const [flipped, setFlipped] = useState<number[]>([]); // kort-indekser som er snudd (maks 2)
  const [matched, setMatched] = useState<number[]>([]); // dyre-indekser som er funnet
  const [attempts, setAttempts] = useState(0);
  const [lock, setLock] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([]); // dyre-indekser lastet i båten

  const doneRef = useRef(false);
  const flipTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  // Stokk kortstokken én gang: 6 dyr × 2 kort = 12 kort i 3×4-rutenett.
  const [deck] = useState<number[]>(() => {
    const d = data.animals.flatMap((_, i) => [i, i]);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  });

  const pairSizes = data.animals.map((a) => a.size * 2);
  const usedSpace = loaded.reduce((sum, i) => sum + pairSizes[i], 0);
  const over = usedSpace > data.boatCapacity;
  const allFound = matched.length === data.animals.length;

  // Beste mulige antall par innenfor kapasiteten (liten brute force, 2^6).
  let maxPairs = 0;
  for (let mask = 0; mask < 1 << pairSizes.length; mask++) {
    let total = 0;
    let count = 0;
    for (let i = 0; i < pairSizes.length; i++) {
      if (mask & (1 << i)) {
        total += pairSizes[i];
        count++;
      }
    }
    if (total <= data.boatCapacity && count > maxPairs) maxPairs = count;
  }

  useEffect(() => {
    if (phase !== 'done' || doneRef.current) return;
    doneRef.current = true;
    // Raust: minnespillet gir 30, minus 1 per forsøk over 10, aldri under 15.
    const memoryScore = Math.max(15, 30 - Math.max(0, attempts - 10));
    // Båten: 30 ved maks antall par, 25 ved nest best, ellers 20.
    const boatScore =
      loaded.length >= maxPairs ? 30 : loaded.length === maxPairs - 1 ? 25 : 20;
    const score = Math.min(post.points.main, memoryScore + boatScore);
    const t = window.setTimeout(() => onComplete({ score }), 1800);
    return () => window.clearTimeout(t);
  }, [phase, attempts, loaded, maxPairs, onComplete, post.points.main]);

  function flipCard(cardIdx: number) {
    if (phase !== 'memory' || lock) return;
    if (flipped.includes(cardIdx) || matched.includes(deck[cardIdx])) return;
    if (flipped.length === 0) {
      setFlipped([cardIdx]);
      return;
    }
    if (flipped.length !== 1) return;
    const first = flipped[0];
    setAttempts((a) => a + 1);
    if (deck[first] === deck[cardIdx]) {
      setMatched((m) => [...m, deck[cardIdx]]);
      setFlipped([]);
    } else {
      setFlipped([first, cardIdx]);
      setLock(true);
      flipTimer.current = window.setTimeout(
        () => {
          setFlipped([]);
          setLock(false);
        },
        reduced ? 600 : 900
      );
    }
  }

  function togglePair(animalIdx: number) {
    setLoaded((prev) =>
      prev.includes(animalIdx)
        ? prev.filter((x) => x !== animalIdx)
        : [...prev, animalIdx]
    );
  }

  const faceStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    borderRadius: 14,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className={reduced ? 'big-emoji' : 'big-emoji floaty'} aria-hidden="true">
          🌈
        </span>
        <h3>Vel blåst, øylogistikere!</h3>
        <p>
          {loaded.length} par seiler trygt avgårde – to og to, akkurat passe
          lastet. Og der, over Skylleviga: en regnbue! God planlegging og plass
          til alle som skal med – det er fortsatt oppskriften.
        </p>
      </div>
    );
  }

  if (phase === 'boat') {
    return (
      <div className="stack">
        <p>
          Nå skal dyrene i båten – to og to! Men båten har bare plass til{' '}
          <strong>{data.boatCapacity} lasteruter</strong>.
        </p>

        <div
          className={`card card-soft center${over && !reduced ? ' wiggle' : ''}`}
        >
          <span style={{ fontSize: '2.6rem' }} aria-hidden="true">
            ⛵
          </span>
          {loaded.length > 0 && (
            <div aria-hidden="true" style={{ fontSize: '1.3rem', marginTop: 2 }}>
              {loaded.map((i) => (
                <span key={i} style={{ marginRight: 4 }}>
                  {data.animals[i].emoji}
                  {data.animals[i].emoji}
                </span>
              ))}
            </div>
          )}
          <div
            className="row-wrap"
            style={{ justifyContent: 'center', marginTop: 8 }}
            aria-label={`${usedSpace} av ${data.boatCapacity} lasteruter i bruk`}
          >
            {Array.from(
              { length: Math.max(data.boatCapacity, usedSpace) },
              (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    border:
                      i < data.boatCapacity
                        ? '2px solid var(--sea-dark)'
                        : '2px dashed var(--coral)',
                    background:
                      i < usedSpace
                        ? i < data.boatCapacity
                          ? 'var(--sun)'
                          : 'var(--coral)'
                        : 'rgba(255,255,255,0.7)',
                  }}
                />
              )
            )}
          </div>
          <p className="small muted" style={{ margin: '6px 0 0' }}>
            {usedSpace} av {data.boatCapacity} ruter fylt
          </p>
          {over && (
            <p className="small" style={{ color: 'var(--coral-dark)', margin: '4px 0 0', fontWeight: 700 }}>
              Oi! Båten ligger dypt – ta ut noen.
            </p>
          )}
        </div>

        <div className="option-grid">
          {data.animals.map((a, i) => {
            const inBoat = loaded.includes(i);
            return (
              <button
                key={i}
                className={`option-btn${inBoat ? ' option-selected' : ''}`}
                onClick={() => togglePair(i)}
                aria-pressed={inBoat}
              >
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                  {a.emoji}
                  {a.emoji}
                </span>
                <br />
                {a.name}
                <br />
                <span className="small muted">
                  {a.size} × 2 = {pairSizes[i]} ruter
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-primary btn-big"
          disabled={loaded.length < 2 || over}
          onClick={() => setPhase('done')}
        >
          Seil avgårde! ⛵
        </button>
        {loaded.length < 2 && (
          <p className="small muted center" style={{ margin: 0 }}>
            Minst to par må være med før dere kan kaste loss.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="spread">
        <span className="badge">Forsøk: {attempts}</span>
        <span className="badge">
          Par: {matched.length}/{data.animals.length}
        </span>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Snu to kort om gangen og finn dyreparene. To og to hører de sammen!
      </p>
      <div
        className="tap-zone"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {deck.map((animalIdx, cardIdx) => {
          const isMatched = matched.includes(animalIdx);
          const faceUp = isMatched || flipped.includes(cardIdx);
          const animal = data.animals[animalIdx];
          return (
            <button
              key={cardIdx}
              onClick={() => flipCard(cardIdx)}
              disabled={isMatched}
              aria-label={faceUp ? animal.name : 'Skjult kort'}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                height: 84,
                perspective: '600px',
                cursor: faceUp ? 'default' : 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: reduced ? 'none' : 'transform 0.4s ease',
                  transform: faceUp ? 'rotateY(180deg)' : 'none',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    ...faceStyle,
                    background:
                      'linear-gradient(180deg, var(--sea) 0%, var(--sea-dark) 100%)',
                    border: '3px solid var(--sea-dark)',
                  }}
                >
                  🌊
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    ...faceStyle,
                    transform: 'rotateY(180deg)',
                    background: 'var(--paper)',
                    border: isMatched
                      ? '3px solid var(--ok)'
                      : '3px solid #c8dbe4',
                  }}
                >
                  <span className={isMatched && !reduced ? 'pop-in' : undefined}>
                    {animal.emoji}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {allFound && (
        <div className="card card-soft center pop-in">
          <span className="big-emoji" aria-hidden="true">🎉</span>
          <p style={{ marginTop: 6 }}>
            Alle parene funnet på {attempts} forsøk! Nå venter båten nede ved
            bryggekanten.
          </p>
          <button
            className="btn btn-grass btn-big"
            onClick={() => setPhase('boat')}
          >
            Til båten! ⛵
          </button>
        </div>
      )}
    </div>
  );
}
