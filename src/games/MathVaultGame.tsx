import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface VaultQuestion {
  q: string;
  options: string[];
  answer: string;
}

type LevelId = 'small' | 'medium' | 'adult';

interface MathVaultData {
  levels: Record<LevelId, VaultQuestion[]>;
}

const LEVELS: { id: LevelId; label: string; btnClass: string }[] = [
  { id: 'small', label: '🐣 4–7 år', btnClass: 'btn btn-big btn-sun' },
  { id: 'medium', label: '🧮 8–13 år', btnClass: 'btn btn-big btn-grass' },
  { id: 'adult', label: '🧠 Voksen (Emil-nivå)', btnClass: 'btn btn-big' },
];

const WRONG_MESSAGES = [
  'Nesten! Emil klør seg i hodet – prøv igjen!',
  'Hvelvet sier «pip pip» – men gir seg ikke helt ennå. Ny sjanse!',
  'Tett på! Regn en gang til – hele laget kan hjelpe!',
  'Emil hvisker: «Del oppgaven i småbiter.» Prøv igjen!',
];

// Post 5: Emils Mattehvelv – tre riktige svar åpner hvelvets tre låser.
export function MathVaultGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as MathVaultData;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'pick' | 'quiz' | 'open'>('pick');
  const [level, setLevel] = useState<LevelId>('small');
  const [qIndex, setQIndex] = useState<Record<LevelId, number>>({ small: 0, medium: 0, adult: 0 });
  const [solved, setSolved] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [wrongMsg, setWrongMsg] = useState('');
  const [locking, setLocking] = useState(false);

  const doneRef = useRef(false);
  const timerRef = useRef(0);

  // Rydd opp i ventende «lås åpner seg»-timer hvis spillet lukkes.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (phase !== 'open' || doneRef.current) return;
    doneRef.current = true;
    // Raust: 60 ved 0–1 feilforsøk, -5 per ekstra, aldri under 35.
    const score = Math.max(35, post.points.main - Math.max(0, wrong - 1) * 5);
    const t = setTimeout(() => onComplete({ score }), 1800);
    return () => clearTimeout(t);
  }, [phase, wrong, onComplete, post.points.main]);

  const questions = data.levels?.[level] ?? [];
  const question = questions.length > 0 ? questions[qIndex[level] % questions.length] : null;

  function pickLevel(id: LevelId) {
    setLevel(id);
    setWrongPicks([]);
    setWrongMsg('');
    setPhase('quiz');
  }

  function backToLevels() {
    if (locking) return;
    setWrongPicks([]);
    setWrongMsg('');
    setPhase('pick');
  }

  function choose(option: string) {
    if (locking || !question) return;
    if (option === question.answer) {
      setLocking(true);
      setWrongMsg('');
      const nextSolved = solved + 1;
      const lvl = level;
      timerRef.current = window.setTimeout(() => {
        setSolved(nextSolved);
        setQIndex((m) => ({ ...m, [lvl]: m[lvl] + 1 }));
        setWrongPicks([]);
        setLocking(false);
        if (nextSolved >= 3) setPhase('open');
      }, 1000);
    } else {
      setWrong((w) => w + 1);
      setWrongPicks((p) => (p.includes(option) ? p : [...p, option]));
      setWrongMsg(WRONG_MESSAGES[wrong % WRONG_MESSAGES.length]);
    }
  }

  const locks = (
    <div className="row" style={{ justifyContent: 'center', gap: 12 }} aria-label={`${solved} av 3 låser åpnet`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i === solved - 1 && !reduced ? 'pop-in' : undefined}
          style={{
            fontSize: '1.9rem',
            lineHeight: 1,
            padding: '8px 12px',
            borderRadius: 14,
            background: i < solved ? '#e2f5e6' : 'rgba(18, 48, 68, 0.08)',
            border: i < solved ? '3px solid var(--ok)' : '3px solid transparent',
          }}
        >
          {i < solved ? '🔓' : '🔒'}
        </span>
      ))}
    </div>
  );

  if (phase === 'open') {
    return (
      <div className={`stack center${reduced ? '' : ' pop-in'}`}>
        <span className={`big-emoji${reduced ? '' : ' wiggle'}`} aria-hidden="true" style={{ fontSize: '4rem' }}>
          💰
        </span>
        <h3>KLIKK-KLIKK-KLIKK! Hvelvet er åpent!</h3>
        <p aria-hidden="true" style={{ fontSize: '1.6rem', margin: 0 }}>🔐 ➡️ 💰</p>
        <p className="muted small">
          {wrong <= 1
            ? 'Emil nikker imponert: «Dere regner nesten like fort som meg.»'
            : 'Emil nikker fornøyd: «Litt kluss på veien, men hvelvet åpnet seg!»'}
        </p>
      </div>
    );
  }

  if (phase === 'pick' || !question) {
    return (
      <div className="stack">
        <div className="card card-soft center">
          <span className={`big-emoji${reduced ? '' : ' floaty'}`} aria-hidden="true">🔐</span>
          <p style={{ marginTop: 6 }}>
            Hvelvet har tre låser – tre riktige svar åpner det. Velg nivå, og bytt så ofte dere vil!
          </p>
        </div>
        {locks}
        <div className="stack">
          {LEVELS.map((l) => (
            <button key={l.id} className={l.btnClass} onClick={() => pickLevel(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="spread">
        {locks}
        <button className="btn btn-ghost btn-small" onClick={backToLevels} disabled={locking}>
          Bytt nivå 🔁
        </button>
      </div>
      <div className="card">
        <p className="small muted" style={{ marginBottom: 4 }}>
          Lås {Math.min(solved + 1, 3)} av 3 · {LEVELS.find((l) => l.id === level)?.label}
        </p>
        <p style={{ fontWeight: 700, fontSize: '1.15rem' }}>{question.q}</p>
        <div className="option-grid option-grid-1">
          {question.options.map((option) => {
            let cls = 'option-btn';
            if (locking && option === question.answer) cls += ' option-correct';
            else if (wrongPicks.includes(option)) cls += ' option-wrong';
            return (
              <button key={option} className={cls} onClick={() => choose(option)} disabled={locking}>
                {option}
              </button>
            );
          })}
        </div>
      </div>
      {locking && (
        <div className={`card card-soft center${reduced ? '' : ' pop-in'}`}>
          <p style={{ margin: 0, fontWeight: 700 }}>KLIKK! En lås åpner seg! 🔓</p>
        </div>
      )}
      {!locking && wrongMsg && (
        <div className="card card-soft center pop-in">
          <p style={{ margin: 0 }}>🙈 {wrongMsg}</p>
        </div>
      )}
    </div>
  );
}
