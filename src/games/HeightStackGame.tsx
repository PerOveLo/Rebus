import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface StackItem {
  emoji: string;
  label: string;
  cm: number;
}

interface HeightStackData {
  items: StackItem[];
  targetMin: number;
  targetMax: number;
}

const MAX_ITEMS = 8;

// Post 3: Stable ting fra lageret til tårnet er omtrent like høyt som Sjur.
export function HeightStackGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as HeightStackData;
  const reduced = useReducedMotion();
  const [tower, setTower] = useState<number[]>([]); // indekser inn i data.items, [0] er nederst
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'low' | 'high'>('none');
  const [measuredCm, setMeasuredCm] = useState(0);
  const [phase, setPhase] = useState<'building' | 'success'>('building');
  const [cheat, setCheat] = useState(false);
  const doneRef = useRef(false);

  const total = tower.reduce((sum, i) => sum + data.items[i].cm, 0);
  const towerFull = tower.length >= MAX_ITEMS;

  useEffect(() => {
    if (phase !== 'success' || doneRef.current) return;
    doneRef.current = true;
    // Raust: full pott på 1.-2. forsøk, deretter -5 per ekstra. Aldri under 30.
    const score =
      attempts <= 2
        ? post.points.main
        : Math.max(30, post.points.main - (attempts - 2) * 5);
    const t = setTimeout(() => onComplete({ score }), 1900);
    return () => clearTimeout(t);
  }, [phase, attempts, onComplete, post.points.main]);

  function addItem(i: number) {
    if (phase !== 'building' || towerFull) return;
    setFeedback('none');
    setTower((t) => [...t, i]);
  }

  function removeAt(pos: number) {
    if (phase !== 'building') return;
    setFeedback('none');
    setTower((t) => t.filter((_, idx) => idx !== pos));
  }

  function measure() {
    if (phase !== 'building' || tower.length === 0) return;
    setMeasuredCm(total);
    setAttempts((a) => a + 1);
    if (total >= data.targetMin && total <= data.targetMax) {
      setCheat(tower.length === 1);
      setPhase('success');
    } else {
      setFeedback(total < data.targetMin ? 'low' : 'high');
    }
  }

  if (phase === 'success') {
    const topItem = data.items[tower[0]];
    return (
      <div className={`stack center ${reduced ? '' : 'pop-in'}`}>
        <span className={`big-emoji ${reduced ? '' : 'wiggle'}`} aria-hidden="true">
          📏
        </span>
        <h3>Akkurat Sjur-høyde!</h3>
        <p>
          Tårnet ble {measuredCm} cm – Øyrådet erklærer det herved for nøyaktig én
          hel Sjur! 🎉
        </p>
        {cheat ? (
          <p className="muted small">
            Vent litt … dere målte Sjur med bare én {topItem.label.toLowerCase()}?
            Det er teknisk sett litt juks – men også helt riktig. Godkjent, med et
            flir fra dommerbordet.
          </p>
        ) : (
          <p className="muted small">
            Alt annet på øya kan nå måles i brøkdeler av dette tårnet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      {feedback !== 'none' && (
        <div className={`card card-soft center ${reduced ? '' : 'pop-in'}`}>
          <span className="big-emoji" aria-hidden="true">
            {feedback === 'low' ? '👀' : '🗼'}
          </span>
          <p style={{ marginTop: 6, marginBottom: 0 }}>
            {feedback === 'low'
              ? `${measuredCm} cm? For lavt – Sjur ser over tårnet!`
              : `${measuredCm} cm? For høyt – nå måler dere en fyrlykt!`}{' '}
            Bygg om og mål igjen!
          </p>
        </div>
      )}

      {/* Tårnet */}
      <div className="card center">
        <div className="row" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <span className="badge">📏 Tårnet: {total} cm</span>
          {attempts > 0 && <span className="chip">Forsøk: {attempts}</span>}
        </div>
        <div
          className="tap-zone"
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            minHeight: 130,
          }}
        >
          {tower.length === 0 && (
            <p className="muted small" style={{ margin: 'auto' }}>
              Tomt tårn! Trykk på ting i lageret for å stable dem her.
            </p>
          )}
          {tower.map((itemIndex, pos) => {
            const item = data.items[itemIndex];
            return (
              <button
                key={pos}
                onClick={() => removeAt(pos)}
                aria-label={`Ta bort ${item.label} fra tårnet`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: 48,
                  minWidth: 120,
                  fontSize: `${Math.min(2.6, 1.1 + item.cm / 120)}rem`,
                  lineHeight: 1.1,
                  fontFamily: 'inherit',
                  touchAction: 'manipulation',
                }}
              >
                {item.emoji}
              </button>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          style={{
            borderTop: '4px solid var(--grass)',
            marginTop: 4,
            paddingTop: 2,
            fontSize: '0.9rem',
          }}
        >
          🌱🌾🌱🌾🌱
        </div>
        <p className="muted small" style={{ marginTop: 6, marginBottom: 0 }}>
          {towerFull
            ? 'Høyere tør ikke lageret å love! Ta bort noe hvis dere vil bytte.'
            : 'Trykk på noe i tårnet for å ta det bort igjen.'}
        </p>
      </div>

      {/* Lageret */}
      <p className="small muted center" style={{ marginBottom: 0 }}>
        Lageret (samme ting kan brukes flere ganger):
      </p>
      <div className="option-grid">
        {data.items.map((item, i) => (
          <button
            key={i}
            className="option-btn"
            onClick={() => addItem(i)}
            disabled={towerFull}
            aria-label={`Legg ${item.label} øverst i tårnet`}
          >
            <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
              {item.emoji}
            </span>
            <br />
            {item.label}
            <br />
            <span className="muted small">{item.cm} cm</span>
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary btn-big"
        onClick={measure}
        disabled={tower.length === 0}
      >
        Mål tårnet! 📏
      </button>
    </div>
  );
}
