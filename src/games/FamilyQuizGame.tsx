import { useRef, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { useFamilyEvents } from '../components/FamilyEvents';
import type { FamilyEvent } from '../components/FamilyEvents';
import type { GameProps } from './types';

interface FamilyQuizData {
  questions: { q: string; options: string[]; answerIndex: number; funny: string }[];
  events?: FamilyEvent[];
}

// Familiequiz: flere spørsmål med tullete svaralternativer. Riktig svar gir
// konfetti – feil svar utløser gjerne en «familiehendelse» over skjermen.
export function FamilyQuizGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as FamilyQuizData;
  const questions = data.questions ?? [];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
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

  // Tomt innhold skal aldri låse posten.
  if (questions.length === 0) {
    return (
      <div className="stack center">
        <p className="muted">Spørsmålene har rømt! Dere får full pott likevel. 🎉</p>
        <button className="btn btn-primary btn-big" onClick={() => finish(post.points.main)}>
          Videre!
        </button>
      </div>
    );
  }

  const q = questions[index];
  const perQ = post.points.main / questions.length;

  function pick(i: number) {
    if (phase !== 'ask' || picked != null) return;
    setPicked(i);
    if (i === q.answerIndex) {
      // Full pott på første forsøk, litt mindre etterpå – aldri null.
      const gained = Math.round(perQ * [1, 0.75, 0.55][Math.min(attempts, 2)]);
      setScore((s) => s + gained);
      if (Math.random() < 0.3) trigger();
      setPhase('reveal');
    } else {
      trigger();
      setAttempts((a) => a + 1);
      setTimeout(() => setPicked(null), 750);
    }
  }

  function next() {
    if (index + 1 < questions.length) {
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
        <span className="big-emoji" aria-hidden="true">🏅</span>
        <h3>Familieeksperter!</h3>
        <p className="muted">
          {questions.length} av {questions.length} spørsmål løst – for en gjeng!
        </p>
        <button className="btn btn-primary btn-big" onClick={() => finish(score)}>
          Videre! 🎉
        </button>
      </div>
    );
  }

  if (phase === 'reveal') {
    return (
      <div className="stack center pop-in">
        {overlay}
        <Confetti count={24} />
        <span className="big-emoji" aria-hidden="true">🎯</span>
        <h3>Riktig!</h3>
        <p className="muted">{q.funny}</p>
        <button className="btn btn-primary btn-big" onClick={next}>
          {index + 1 < questions.length ? 'Neste spørsmål ➡️' : 'Se resultatet! 🏅'}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      {overlay}
      <div className="badge">Spørsmål {index + 1} av {questions.length}</div>
      <h3>{q.q}</h3>
      <div className="option-grid option-grid-1">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${picked === i ? (i === q.answerIndex ? 'option-correct' : 'option-wrong') : ''}`}
            onClick={() => pick(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      {attempts > 0 && picked == null && (
        <p className="small muted center">Hihi, ikke helt – diskuter i laget og prøv igjen!</p>
      )}
    </div>
  );
}
