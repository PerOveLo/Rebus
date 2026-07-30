import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface PassportData {
  animals: string[];
  transports: string[];
  powers: string[];
  snacks: string[];
  titles: string[];
}

type ChoiceKey = 'animal' | 'transport' | 'power' | 'snack';

interface Step {
  key: ChoiceKey;
  icon: string;
  heading: string;
  sub: string;
  options: string[];
}

// Post 2: Laget lager sitt offisielle øypass i fire steg og får det stemplet.
export function PassportGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as PassportData;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'choose' | 'stamping' | 'pass' | 'done'>('choose');
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<ChoiceKey, string>>({
    animal: '',
    transport: '',
    power: '',
    snack: '',
  });
  const [title, setTitle] = useState('');
  const [rerolled, setRerolled] = useState(false);
  const doneRef = useRef(false);

  const steps: Step[] = [
    {
      key: 'animal',
      icon: '🐾',
      heading: 'Velg lagets øydyr',
      sub: 'Hvilket dyr skal representere dere i all offentlig sammenheng?',
      options: data.animals,
    },
    {
      key: 'transport',
      icon: '🧭',
      heading: 'Velg favoritttransport',
      sub: 'Slik kommer laget seg rundt på øya. Med stil.',
      options: data.transports,
    },
    {
      key: 'power',
      icon: '⚡',
      heading: 'Velg superkraft',
      sub: 'Alle lag må oppgi minst én imponerende evne.',
      options: data.powers,
    },
    {
      key: 'snack',
      icon: '🤫',
      heading: 'Velg hemmelig øysnacks',
      sub: 'Strengt konfidensielt. Passkontoret sladrer aldri.',
      options: data.snacks,
    },
  ];

  // Stempel-animasjon: kort ventetid, så trekkes tittelen.
  useEffect(() => {
    if (phase !== 'stamping') return;
    const t = setTimeout(
      () => {
        setTitle(data.titles[Math.floor(Math.random() * data.titles.length)]);
        setPhase('pass');
      },
      reduced ? 400 : 1500
    );
    return () => clearTimeout(t);
  }, [phase, data.titles, reduced]);

  function choose(value: string) {
    const key = steps[step].key;
    setChoices((c) => ({ ...c, [key]: value }));
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setPhase('stamping');
    }
  }

  function rerollTitle() {
    if (rerolled) return;
    setRerolled(true);
    const others = data.titles.filter((t) => t !== title);
    const pool = others.length > 0 ? others : data.titles;
    setTitle(pool[Math.floor(Math.random() * pool.length)]);
  }

  function restart() {
    setStep(0);
    setPhase('choose');
    setTitle('');
    setRerolled(false);
  }

  function stampFinal() {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('done');
    // Ingen gale svar på et passkontor: alltid full pott.
    window.setTimeout(
      () =>
        onComplete({
          score: post.points.main,
          creations: {
            passAnimal: choices.animal,
            passTransport: choices.transport,
            passPower: choices.power,
            passSnack: choices.snack,
            passTitle: title,
          },
        }),
      reduced ? 600 : 1800
    );
  }

  if (phase === 'choose') {
    const current = steps[step];
    return (
      <div className="stack">
        <div className="progress-track" aria-label="Fremdrift i passøknaden">
          <div className="progress-fill" style={{ width: `${(step / steps.length) * 100}%` }} />
        </div>
        <div className="spread">
          <span className="badge">
            {current.icon} Steg {step + 1} av {steps.length}
          </span>
          {step > 0 && (
            <button className="btn btn-ghost btn-small" onClick={() => setStep(step - 1)}>
              ← Tilbake
            </button>
          )}
        </div>
        <div>
          <h3>{current.heading}</h3>
          <p className="muted small">{current.sub}</p>
        </div>
        <div className="option-grid">
          {current.options.map((opt) => (
            <button
              key={opt}
              className={`option-btn${choices[current.key] === opt ? ' option-selected' : ''}`}
              onClick={() => choose(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="small muted center">Passkontoret godtar alt. Velg med hjertet!</p>
      </div>
    );
  }

  if (phase === 'stamping') {
    return (
      <div className="stack center pop-in">
        <span className={`big-emoji${reduced ? '' : ' wiggle'}`} aria-hidden="true">
          🛂
        </span>
        <h3>Passkontoret vurderer søknaden …</h3>
        <p className="muted small">Øyrådet tar en rask kaffepause. Som alltid.</p>
      </div>
    );
  }

  // phase 'pass' eller 'done': vis det ferdige passet.
  const fields: { label: string; value: string }[] = [
    { label: 'Øydyr', value: choices.animal },
    { label: 'Transport', value: choices.transport },
    { label: 'Superkraft', value: choices.power },
    { label: 'Hemmelig snacks', value: choices.snack },
  ];

  return (
    <div className="stack">
      <div
        className="card pop-in"
        style={{
          background: 'linear-gradient(160deg, #fff 60%, var(--sun-soft))',
          border: '3px dashed var(--sea)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="small muted" style={{ letterSpacing: '0.12em', fontWeight: 800 }}>
          ØYPASS · SKYLLEVIGA
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <span aria-hidden="true" style={{ fontSize: '2.2rem' }}>
            📮
          </span>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={{ marginTop: 10 }}>
          {fields.map((f) => (
            <div
              key={f.label}
              className="spread small"
              style={{ borderTop: '1px dashed rgba(14, 116, 144, 0.35)', padding: '7px 0' }}
            >
              <span className="muted">{f.label}</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>{f.value}</span>
            </div>
          ))}
        </div>
        <div
          className="small muted"
          style={{ borderTop: '1px dashed rgba(14, 116, 144, 0.35)', paddingTop: 7 }}
        >
          Gyldig for all evighet – eller til softisen er tom.
        </div>
        {phase === 'done' && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              transform: 'rotate(-14deg)',
            }}
          >
            <div
              className="pop-in"
              style={{
                border: '4px solid var(--coral)',
                color: 'var(--coral)',
                borderRadius: 12,
                padding: '6px 12px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              GODKJENT
            </div>
          </div>
        )}
      </div>

      {phase === 'pass' ? (
        <div className="stack">
          {!rerolled && (
            <button className="btn btn-sun" onClick={rerollTitle}>
              Trekk ny tittel 🎲
            </button>
          )}
          <button className="btn btn-primary btn-big" onClick={stampFinal}>
            Stemple passet! 🛂
          </button>
          <button className="btn btn-ghost btn-small" onClick={restart}>
            Endre valgene
          </button>
        </div>
      ) : (
        <div className="stack center pop-in">
          <span className="big-emoji" aria-hidden="true">
            🎉
          </span>
          <p className="muted small">Passet er stemplet! Velkommen til øya – nesten som ekte øyboere.</p>
        </div>
      )}
    </div>
  );
}
