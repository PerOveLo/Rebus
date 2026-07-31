import { useRef, useState } from 'react';
import { games } from './index';
import type { GameType } from '../types';
import type { GameProps, GameResult } from './types';

export interface QuizComboData {
  question: {
    q: string;
    options: string[];
    answerIndex: number;
    funny: string; // morsom forklaring etter svaret
  };
  mini: GameType;
  miniData: Record<string, unknown>;
}

// Egen-rebus-poster: først et personlig quizspørsmål (generert fra
// spillleders svar), deretter et generisk minispill. Maks 60 poeng totalt.
export function QuizComboGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as QuizComboData;
  const [stage, setStage] = useState<'quiz' | 'reveal' | 'mini'>('quiz');
  const [picked, setPicked] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const q = data.question;
  const Mini = games[data.mini];
  const miniPost = { ...post, gameType: data.mini, data: data.miniData };

  function pick(i: number) {
    if (stage !== 'quiz') return;
    setPicked(i);
    if (i === q.answerIndex) {
      // 30p ved første forsøk, litt mindre etterpå – aldri null
      setQuizScore([30, 22, 15][Math.min(attempts, 2)]);
      setStage('reveal');
    } else {
      setAttempts((a) => a + 1);
      setTimeout(() => setPicked(null), 700);
    }
  }

  function handleMiniDone(result: GameResult) {
    if (doneRef.current) return;
    doneRef.current = true;
    const miniScore = Math.round(Math.min(post.points.main, Math.max(0, result.score)) / 2);
    onCompleteRef.current({
      score: Math.min(post.points.main, quizScore + miniScore),
      creations: result.creations,
    });
  }

  if (stage === 'quiz') {
    return (
      <div className="stack">
        <div className="badge">Del 1: Kjenner dere hverandre? (30p)</div>
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
          <p className="small muted center">Hehe, ikke helt – diskuter i laget og prøv igjen!</p>
        )}
      </div>
    );
  }

  if (stage === 'reveal') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">🎯</span>
        <h3>Riktig!</h3>
        <p className="muted">{q.funny}</p>
        <button className="btn btn-primary btn-big" onClick={() => setStage('mini')}>
          Del 2: Minispillet! (30p) 🎮
        </button>
      </div>
    );
  }

  return <Mini post={miniPost} onComplete={handleMiniDone} />;
}
