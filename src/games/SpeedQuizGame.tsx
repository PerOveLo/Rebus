import { useEffect, useRef, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { useFamilyEvents } from '../components/FamilyEvents';
import type { FamilyEvent } from '../components/FamilyEvents';
import type { GameProps } from './types';

interface SpeedQuizData {
  seconds?: number;
  questions: { q: string; options: string[]; answerIndex: number }[];
  events?: FamilyEvent[];
}

// Hurtigrunden: så mange lynspørsmål som mulig før tiden går ut.
// Feil svar går bare videre – farten er halve moroa.
export function SpeedQuizGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as SpeedQuizData;
  const questions = data.questions ?? [];
  const totalSeconds = data.seconds ?? 30;
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { trigger, overlay } = useFamilyEvents(data.events);

  useEffect(() => {
    if (phase !== 'run') return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 0.1)), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'run' && timeLeft <= 0) setPhase('done');
  }, [phase, timeLeft]);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    // Raus poengsum: andelen riktige – med gulv for innsatsen.
    const share = questions.length > 0 ? correct / questions.length : 1;
    const score = Math.max(Math.round(post.points.main * share), correct > 0 ? 24 : 12);
    onCompleteRef.current({ score: Math.min(post.points.main, score) });
  }

  if (questions.length === 0) {
    return (
      <div className="stack center">
        <p className="muted">Lynspørsmålene kortsluttet! Dere får full pott likevel. ⚡</p>
        <button
          className="btn btn-primary btn-big"
          onClick={() => {
            if (doneRef.current) return;
            doneRef.current = true;
            onCompleteRef.current({ score: post.points.main });
          }}
        >
          Videre!
        </button>
      </div>
    );
  }

  function answer(i: number) {
    if (phase !== 'run') return;
    const q = questions[index];
    const right = i === q.answerIndex;
    if (right) setCorrect((c) => c + 1);
    else if (Math.random() < 0.4) trigger();
    setFlash(right ? 'right' : 'wrong');
    setTimeout(() => setFlash(null), 250);
    setAnswered((a) => a + 1);
    if (index + 1 < questions.length) setIndex(index + 1);
    else setPhase('done');
  }

  if (phase === 'intro') {
    return (
      <div className="stack center">
        <span className="big-emoji" aria-hidden="true">⚡</span>
        <h3>Klar for hurtigrunden?</h3>
        <p className="muted">
          {questions.length} lynspørsmål på {totalSeconds} sekunder. Ikke tenk – trykk! Feil svar
          går bare videre.
        </p>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('run')}>
          3 … 2 … 1 … KJØR! 🏁
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="stack center pop-in">
        <Confetti count={50} />
        <span className="big-emoji" aria-hidden="true">🏆</span>
        <h3>{correct === questions.length ? 'ALLE riktige!' : 'Puuh, for en fart!'}</h3>
        <p className="muted">
          {correct} riktige av {answered} besvarte på {totalSeconds} sekunder!
        </p>
        <button className="btn btn-primary btn-big" onClick={finish}>
          Videre! 🎉
        </button>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="stack">
      {overlay}
      <div className="spread">
        <div className="badge">⚡ {index + 1}/{questions.length}</div>
        <div className="badge" aria-label={`${Math.ceil(timeLeft)} sekunder igjen`}>
          ⏱️ {Math.ceil(timeLeft)}s
        </div>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${(timeLeft / totalSeconds) * 100}%`, transition: 'width 0.1s linear' }}
        />
      </div>
      <h3
        style={{
          minHeight: '2.4em',
          color: flash === 'wrong' ? 'var(--coral-dark)' : flash === 'right' ? 'var(--grass)' : undefined,
        }}
      >
        {q.q}
      </h3>
      <div className="option-grid" style={{ gridTemplateColumns: q.options.length === 2 ? '1fr 1fr' : '1fr' }}>
        {q.options.map((opt, i) => (
          <button key={`${index}-${i}`} className="option-btn" onClick={() => answer(i)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
