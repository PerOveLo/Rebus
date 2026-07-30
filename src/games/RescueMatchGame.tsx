import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface Incident {
  emoji: string;
  text: string;
  helperId: string;
}

interface Helper {
  id: string;
  emoji: string;
  name: string;
}

interface RescueData {
  incidents: Incident[];
  helpers: Helper[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wrongMessage(h: Helper): string {
  switch (h.id) {
    case 'sniffer':
      return `${h.name} snuste seg gjennom hele hagen ... og fant bare en tom kaffekopp. Feil oppdrag!`;
    case 'ladder':
      return `${h.name} kom med full sirene og hevet stigen mot himmelen ... men her hjalp den ingenting.`;
    case 'boat':
      return `${h.name} la fra kai i full fart ... men dette oppdraget var visst på helt tørt land!`;
    case 'ice':
      return `${h.name} delte ut is til alle i nærheten. Kjempekoselig – men oppdraget er fortsatt uløst!`;
    case 'tractor':
      return `${h.name} tøffet av gårde i førstegir ... og er fremme cirka i overmorgen. Prøv en annen!`;
    default:
      return `${h.name} rykket ut, klødde seg i hodet og rykket inn igjen. Prøv en annen hjelper!`;
  }
}

// Post 6: Isaks Redningssentral – match hvert alarmoppdrag med riktig redningshelt.
export function RescueMatchGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as RescueData;
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'dispatch' | 'done'>('ready');
  const [queue, setQueue] = useState<Incident[]>([]);
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [activeHelper, setActiveHelper] = useState<Helper | null>(null);
  const doneRef = useRef(false);

  // Utrykningen er ferdig -> neste oppdrag eller oppsummering.
  useEffect(() => {
    if (phase !== 'dispatch') return;
    const t = setTimeout(() => {
      if (idx + 1 >= queue.length) {
        setPhase('done');
      } else {
        setIdx(idx + 1);
        setPhase('playing');
      }
    }, reduced ? 1200 : 1700);
    return () => clearTimeout(t);
  }, [phase, idx, queue.length, reduced]);

  // Ferdig: raus poengsum og nøyaktig ett onComplete-kall.
  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const score = Math.max(35, post.points.main - Math.max(0, mistakes - 1) * 4);
      const t = setTimeout(() => onComplete({ score }), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, mistakes, onComplete, post.points.main]);

  function start() {
    const q = shuffle(data.incidents ?? []);
    setQueue(q);
    setIdx(0);
    setMistakes(0);
    setWrongMsg(null);
    setWrongId(null);
    setPhase(q.length === 0 ? 'done' : 'playing');
  }

  function choose(h: Helper) {
    const current = queue[idx];
    if (phase !== 'playing' || !current) return;
    if (h.id === current.helperId) {
      setWrongMsg(null);
      setWrongId(null);
      setActiveHelper(h);
      setPhase('dispatch');
    } else {
      setMistakes((m) => m + 1);
      setWrongId(h.id);
      setWrongMsg(wrongMessage(h));
    }
  }

  if (phase === 'ready') {
    return (
      <div className="stack center">
        <span className={reduced ? 'big-emoji' : 'big-emoji floaty'} aria-hidden="true">
          🐕‍🦺
        </span>
        <p className="muted">
          Alarmen går på Redningssentralen! Les oppdraget og trykk på hjelperen som passer best.
          Feil hjelper? Ingen fare – de kjører bare hjem igjen, og dere prøver på nytt.
        </p>
        <button className="btn btn-primary btn-big" onClick={start}>
          Start vakten 🚨
        </button>
      </div>
    );
  }

  if (phase === 'dispatch' && activeHelper) {
    return (
      <div className="stack center">
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            height: 110,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, var(--sky-soft) 0%, #cdead3 75%, #b7dcbe 100%)',
          }}
        >
          <span style={{ position: 'absolute', top: 8, right: 14, fontSize: '1.4rem' }}>☀️</span>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 16,
              background: '#8a949b',
            }}
          />
          {reduced ? (
            <span
              style={{
                position: 'absolute',
                left: '50%',
                top: 34,
                marginLeft: '-1.3rem',
                fontSize: '2.6rem',
              }}
            >
              {activeHelper.emoji}
            </span>
          ) : (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 34,
                fontSize: '2.6rem',
                animation: 'drive 1.5s ease-in forwards',
              }}
            >
              {activeHelper.emoji}
            </span>
          )}
        </div>
        <h3 className="pop-in">🚨 {activeHelper.name} rykker ut!</h3>
        <p className="muted">Oppdrag løst! ✅</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">
          🎖️
        </span>
        <h3>Alle oppdrag løst!</h3>
        <div className="card" style={{ textAlign: 'left' }}>
          <div className="stack" style={{ gap: 8 }}>
            {queue.map((inc) => {
              const h = data.helpers.find((x) => x.id === inc.helperId);
              return (
                <div key={inc.helperId} className="row small">
                  <span aria-hidden="true">{inc.emoji}</span>
                  <span className="muted" style={{ flex: 1 }}>
                    {inc.text}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {h ? h.emoji : ''} ✅
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="muted small">
          {mistakes <= 1
            ? 'Redningssentralen jubler: nesten helt uten feilutrykninger!'
            : 'Noen omveier, men alle ble reddet. Det er det som teller!'}
        </p>
      </div>
    );
  }

  const current = queue[idx];
  if (!current) return null;

  return (
    <div className="stack">
      <div className="spread">
        <span className="badge">
          Oppdrag {idx + 1} av {queue.length}
        </span>
        <span aria-hidden="true">🐕‍🦺</span>
      </div>
      <div className="progress-track" aria-label="Fremdrift på vakten">
        <div className="progress-fill" style={{ width: `${(idx / queue.length) * 100}%` }} />
      </div>
      <div
        className="card pop-in"
        style={{ background: '#ffe8e4', border: '3px solid var(--coral)' }}
      >
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className={reduced ? '' : 'wiggle'} aria-hidden="true" style={{ fontSize: '1.5rem' }}>
            🚨
          </span>
          <h3 style={{ margin: 0, color: 'var(--coral-dark)' }}>ALARM!</h3>
          <span className={reduced ? '' : 'wiggle'} aria-hidden="true" style={{ fontSize: '1.5rem' }}>
            🚨
          </span>
        </div>
        <div className="center" style={{ marginTop: 8 }}>
          <span className="big-emoji" aria-hidden="true">
            {current.emoji}
          </span>
          <p style={{ fontWeight: 700, margin: '8px 0 0' }}>{current.text}</p>
        </div>
      </div>
      {wrongMsg && (
        <div className="card card-soft pop-in">
          <p className="small" style={{ margin: 0 }}>
            😅 {wrongMsg}
          </p>
        </div>
      )}
      <p className="small muted center" style={{ margin: 0 }}>
        Hvem sender dere ut?
      </p>
      <div className="option-grid tap-zone">
        {data.helpers.map((h) => (
          <button
            key={h.id}
            className={wrongId === h.id ? 'option-btn option-wrong' : 'option-btn'}
            onClick={() => choose(h)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minHeight: 80,
            }}
          >
            <span style={{ fontSize: '2rem' }} aria-hidden="true">
              {h.emoji}
            </span>
            <span className="small">{h.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
