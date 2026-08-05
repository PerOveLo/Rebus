import { useRef, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { useFamilyEvents } from '../components/FamilyEvents';
import type { FamilyEvent } from '../components/FamilyEvents';
import type { GameProps } from './types';

interface TrueFalseData {
  statements: { text: string; isTrue: boolean; punchline: string }[];
  events?: FamilyEvent[];
}

// Sant eller tull: én sjanse per påstand – men feil svar gir også poeng
// (og en punchline). Ingen skal føle seg dum på bursdag.
export function TrueFalseGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as TrueFalseData;
  const statements = data.statements ?? [];
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ask' | 'reveal' | 'done'>('ask');
  const [wasRight, setWasRight] = useState(false);
  const [rightCount, setRightCount] = useState(0);
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

  if (statements.length === 0) {
    return (
      <div className="stack center">
        <p className="muted">Påstandene forsvant! Dere får full pott likevel. 🎉</p>
        <button className="btn btn-primary btn-big" onClick={() => finish(post.points.main)}>
          Videre!
        </button>
      </div>
    );
  }

  const current = statements[index];
  const perQ = post.points.main / statements.length;

  function answer(saidTrue: boolean) {
    if (phase !== 'ask') return;
    const right = saidTrue === current.isTrue;
    setWasRight(right);
    if (right) {
      setRightCount((c) => c + 1);
      setScore((s) => s + perQ);
    } else {
      setScore((s) => s + perQ * 0.4);
      trigger();
    }
    setPhase('reveal');
  }

  function next() {
    if (index + 1 < statements.length) {
      setIndex(index + 1);
      setPhase('ask');
    } else {
      setPhase('done');
    }
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <Confetti count={50} />
        <span className="big-emoji" aria-hidden="true">🕵️</span>
        <h3>Sannhetsdetektiver!</h3>
        <p className="muted">
          {rightCount} av {statements.length} riktige – familien har ingen hemmeligheter for dere.
        </p>
        <button className="btn btn-primary btn-big" onClick={() => finish(Math.round(score))}>
          Videre! 🎉
        </button>
      </div>
    );
  }

  if (phase === 'reveal') {
    return (
      <div className="stack center pop-in">
        {overlay}
        {wasRight && <Confetti count={24} />}
        <span className="big-emoji" aria-hidden="true">{wasRight ? '🎯' : '😅'}</span>
        <h3>{wasRight ? 'Riktig!' : 'Neeei, ikke helt!'}</h3>
        <p className="muted">{current.punchline}</p>
        <button className="btn btn-primary btn-big" onClick={next}>
          {index + 1 < statements.length ? 'Neste påstand ➡️' : 'Se resultatet! 🕵️'}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      {overlay}
      <div className="badge">Påstand {index + 1} av {statements.length}</div>
      <div className="card card-soft center" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
        {current.text}
      </div>
      <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button className="option-btn" style={{ fontSize: '1.1rem' }} onClick={() => answer(true)}>
          ✅ SANT!
        </button>
        <button className="option-btn" style={{ fontSize: '1.1rem' }} onClick={() => answer(false)}>
          ❌ TULL!
        </button>
      </div>
      <p className="small muted center">Diskuter i laget – én sjanse per påstand!</p>
    </div>
  );
}
