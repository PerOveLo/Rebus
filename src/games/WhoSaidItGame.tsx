import { useRef, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { useFamilyEvents } from '../components/FamilyEvents';
import type { FamilyEvent } from '../components/FamilyEvents';
import type { GameProps } from './types';

interface WhoSaidItData {
  people: { name: string; emoji: string }[];
  quotes: { quote: string; answer: string; reaction: string }[];
  events?: FamilyEvent[];
}

// «Hvem sa det?»: et sitat vises i en snakkeboble – laget gjetter hvem i
// familien som kunne sagt det. Les høyt med innlevelse!
export function WhoSaidItGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as WhoSaidItData;
  const quotes = data.quotes ?? [];
  const people = data.people ?? [];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<'ask' | 'reveal' | 'done'>('ask');
  const [score, setScore] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { trigger, overlay } = useFamilyEvents(data.events);

  function finish(total: number) {
    if (doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current({ score: Math.min(post.points.main, total) });
  }

  if (quotes.length === 0 || people.length === 0) {
    return (
      <div className="stack center">
        <p className="muted">Sitatene har stukket av! Dere får full pott likevel. 🎉</p>
        <button className="btn btn-primary btn-big" onClick={() => finish(post.points.main)}>
          Videre!
        </button>
      </div>
    );
  }

  const current = quotes[index];
  const perQ = post.points.main / quotes.length;

  function pick(name: string) {
    if (phase !== 'ask' || picked != null) return;
    setPicked(name);
    if (name === current.answer) {
      const gained = Math.round(perQ * [1, 0.75, 0.55][Math.min(attempts, 2)]);
      setScore((s) => s + gained);
      setPhase('reveal');
    } else {
      trigger();
      setAttempts((a) => a + 1);
      setTimeout(() => setPicked(null), 750);
    }
  }

  function next() {
    if (index + 1 < quotes.length) {
      setIndex(index + 1);
      setPicked(null);
      setAttempts(0);
      setPhase('ask');
    } else {
      setPhase('done');
    }
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <Confetti count={50} />
        <span className="big-emoji" aria-hidden="true">🗣️</span>
        <h3>Dere kjenner stemmene!</h3>
        <p className="muted">Alle {quotes.length} sitatene plassert hos riktig person!</p>
        <button className="btn btn-primary btn-big" onClick={() => finish(score)}>
          Videre! 🎉
        </button>
      </div>
    );
  }

  if (phase === 'reveal') {
    return (
      <div className="stack center pop-in">
        <Confetti count={24} />
        <span className="big-emoji" aria-hidden="true">
          {people.find((p) => p.name === current.answer)?.emoji ?? '🎯'}
        </span>
        <h3>Riktig!</h3>
        <p className="muted">{current.reaction}</p>
        <button className="btn btn-primary btn-big" onClick={next}>
          {index + 1 < quotes.length ? 'Neste sitat ➡️' : 'Se resultatet! 🗣️'}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      {overlay}
      <div className="badge">Sitat {index + 1} av {quotes.length}</div>
      <div className="card card-soft center" style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
        💬 «{current.quote}»
      </div>
      <p className="small muted center">Hvem sa det? Les høyt med innlevelse først!</p>
      <div className="option-grid option-grid-1">
        {people.map((p) => (
          <button
            key={p.name}
            className={`option-btn ${picked === p.name ? (p.name === current.answer ? 'option-correct' : 'option-wrong') : ''}`}
            onClick={() => pick(p.name)}
          >
            <span aria-hidden="true" style={{ marginRight: 8 }}>{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>
      {attempts > 0 && picked == null && (
        <p className="small muted center">Hmm, hvem PLEIER å si sånt? Prøv igjen!</p>
      )}
    </div>
  );
}
