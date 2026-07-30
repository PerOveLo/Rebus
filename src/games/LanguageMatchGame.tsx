import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface LanguagePair {
  word: string;
  meaning: string;
}

interface LanguageData {
  pairs: LanguagePair[];
  officeSentences: string[];
}

// Post 13: Koble oppdiktede skyllevigske uttrykk til riktig betydning (tap-tap).
export function LanguageMatchGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as LanguageData;
  const reduced = useReducedMotion();

  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Betydningene vises i tilfeldig rekkefølge (stokkes én gang).
  const [order] = useState<number[]>(() => {
    const idx = data.pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });

  const [officeSentence] = useState(() => {
    const s = data.officeSentences ?? [];
    return s.length > 0 ? s[Math.floor(Math.random() * s.length)] : '';
  });

  const doneRef = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const total = data.pairs.length;
  const allMatched = matched.length === total;

  function flash(text: string, wrong: number | null) {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setMessage(text);
    setWrongIdx(wrong);
    flashTimer.current = setTimeout(() => {
      setWrongIdx(null);
      setMessage(null);
    }, 1600);
  }

  function tapWord(pairIdx: number) {
    if (matched.includes(pairIdx)) return;
    setSelected((s) => (s === pairIdx ? null : pairIdx));
    setMessage(null);
    setWrongIdx(null);
  }

  function tapMeaning(pairIdx: number) {
    if (matched.includes(pairIdx)) return;
    if (selected === null) {
      flash('Velg et uttrykk øverst først! ☝️', null);
      return;
    }
    if (selected === pairIdx) {
      setMatched((m) => [...m, pairIdx]);
      setSelected(null);
      flash('✅ Helt riktig! Ekte øyspråk!', null);
    } else {
      setErrors((e) => e + 1);
      flash('Hmm, spør en ekte øyboer! 🧐 Prøv igjen!', pairIdx);
    }
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    // Raust: 0-2 feil gir full pott, deretter -4 per ekstra feil. Aldri under 35.
    const score = Math.min(
      post.points.main,
      Math.max(35, post.points.main - Math.max(0, errors - 2) * 4),
    );
    onComplete({ score });
  }

  if (allMatched) {
    return (
      <div className={`stack center ${reduced ? '' : 'pop-in'}`}>
        <span className="big-emoji" aria-hidden="true">🎓</span>
        <h3>Språkprøve bestått!</h3>
        <p>Dere snakker nå flytende Skyllevigsk 🎓</p>
        <p className="muted small">
          {errors === 0
            ? 'Null feil – Øyrådet mistenker at dere har øyblod i årene!'
            : errors <= 2
              ? 'Nesten uten å blunke – godkjent med glans!'
              : 'Litt famling i starten, men slik lærer man språk!'}
        </p>
        {officeSentence !== '' && (
          <div className="card card-soft">
            <p className="small muted">PS: Til voksenbonusen – oversett gjerne denne:</p>
            <p style={{ fontWeight: 700, marginTop: 6 }}>{officeSentence}</p>
          </div>
        )}
        <button className="btn btn-primary btn-big" onClick={finish}>
          Videre i rebusen 🏝️
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="small center" style={{ fontWeight: 700 }}>
        🤫 Topphemmelig og 100 % oppdiktet øyspråk!
      </p>
      <p className="muted small center">
        Trykk først på et uttrykk – trykk så på betydningen som passer.
      </p>

      <div className="progress-track" aria-label="Antall koblede uttrykk">
        <div
          className="progress-fill"
          style={{ width: `${(matched.length / total) * 100}%` }}
        />
      </div>
      <p className="muted small center">
        {matched.length} av {total} uttrykk koblet
      </p>

      <div className="card card-soft">
        <div className="row-wrap" style={{ justifyContent: 'center' }}>
          {data.pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            return (
              <button
                key={p.word}
                className={`chip chip-btn ${selected === i ? 'chip-active' : ''}`}
                onClick={() => tapWord(i)}
                disabled={isMatched}
                style={{
                  minHeight: 48,
                  touchAction: 'manipulation',
                  ...(isMatched
                    ? { background: '#e2f5e6', borderColor: 'var(--grass)' }
                    : {}),
                }}
              >
                {isMatched ? '✅ ' : ''}
                {p.word}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-live="polite"
        className="small center"
        style={{ minHeight: 22, fontWeight: 700, color: 'var(--ink)' }}
      >
        {message ?? (selected !== null ? `Hva betyr «${data.pairs[selected].word}»?` : ' ')}
      </div>

      <div className="option-grid option-grid-1">
        {order.map((pairIdx) => {
          const p = data.pairs[pairIdx];
          const isMatched = matched.includes(pairIdx);
          const isWrong = wrongIdx === pairIdx;
          return (
            <button
              key={p.meaning}
              className={`option-btn ${isMatched ? 'option-correct' : ''} ${
                isWrong ? `option-wrong ${reduced ? '' : 'wiggle'}` : ''
              }`}
              onClick={() => tapMeaning(pairIdx)}
              disabled={isMatched}
              style={{ textAlign: 'left', touchAction: 'manipulation' }}
            >
              {isMatched ? `✅ ${p.word}: ` : ''}
              {p.meaning}
            </button>
          );
        })}
      </div>
    </div>
  );
}
