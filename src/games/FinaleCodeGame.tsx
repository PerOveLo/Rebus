import { useMemo, useState } from 'react';
import { gameConfig, getPost } from '../config/gameConfig';
import { teamStore } from '../services/storage';
import { Confetti } from '../components/Confetti';
import type { GameProps } from './types';

// Post 15: Metagåten. Fire av de samlede øysymbolene lyser opp og viser
// hvert sitt siffer. Koden kommer fra lagets oppsett (kan endres av
// spillleder, standard i gameConfig.defaultFinalCode).
export function FinaleCodeGame({ post, onComplete }: GameProps) {
  const progress = teamStore.useStore();
  const code = progress?.setup.finalCode ?? gameConfig.defaultFinalCode;
  const [entry, setEntry] = useState('');
  const [wrongCount, setWrongCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);

  const glowPosts = useMemo(() => {
    const nums = gameConfig.finaleSymbolPosts.slice(0, code.length);
    return nums.map((n, i) => ({ post: getPost(n), digit: code[i] }));
  }, [code]);

  const collected = progress ? new Set(progress.collectedSymbols) : new Set<string>();

  function press(d: string) {
    if (solved) return;
    const next = (entry + d).slice(0, code.length);
    setEntry(next);
    if (next.length === code.length) {
      if (next === code) {
        setSolved(true);
        setTimeout(() => onComplete({ score: Math.max(30, post.points.main - wrongCount * 5) }), 2600);
      } else {
        setWrongCount((w) => w + 1);
        setShake(true);
        setTimeout(() => {
          setEntry('');
          setShake(false);
        }, 600);
      }
    }
  }

  if (solved) {
    return (
      <div className="stack center pop-in">
        <Confetti />
        <span className="big-emoji" aria-hidden="true">🏡✨</span>
        <h3>Huset lyser opp! Tunnelen åpner seg!</h3>
        <p className="muted">Nøkkelen til Skylleviga er deres!</p>
        <div style={{ fontSize: '3rem' }} aria-hidden="true" className="glow">🗝️</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="muted center small">
        Fire av symbolene deres lyser! Hvert av dem gjemmer et siffer – tast koden i riktig
        rekkefølge (etter postnummer).
      </p>

      <div className="row-wrap" style={{ justifyContent: 'center' }}>
        {glowPosts.map(({ post: p, digit }) => (
          <div
            key={p.number}
            className={collected.has(p.islandSymbol.id) ? 'symbol-tile glow' : 'symbol-tile'}
            style={{ width: 84, position: 'relative' }}
          >
            <span className="big" aria-hidden="true">{p.islandSymbol.emoji}</span>
            <span>{p.islandSymbol.name}</span>
            <span
              className="badge"
              style={{ position: 'absolute', top: -8, right: -6 }}
              aria-label={`Post ${p.number} viser tallet ${digit}`}
            >
              {digit}
            </span>
            <span className="small muted">Post {p.number}</span>
          </div>
        ))}
      </div>

      <div
        className="center"
        style={{
          fontSize: '2.4rem',
          fontWeight: 900,
          letterSpacing: '0.35em',
          minHeight: '1.4em',
          animation: shake ? 'wiggle 0.15s ease-in-out 3' : undefined,
          color: shake ? 'var(--coral)' : 'var(--ink)',
        }}
        aria-live="polite"
        aria-label={`Kode så langt: ${entry || 'tom'}`}
      >
        {entry.padEnd(code.length, '·')}
      </div>

      <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
          <button key={d} className="option-btn" style={{ fontSize: '1.4rem' }} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button className="option-btn" onClick={() => setEntry('')}>
          Tøm
        </button>
      </div>
      {wrongCount > 0 && (
        <p className="small muted center">Ikke helt … Se på tallene i symbolene og prøv igjen!</p>
      )}
    </div>
  );
}
