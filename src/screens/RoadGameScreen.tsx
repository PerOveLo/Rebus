import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { builtinRebuses } from '../config/rebuses';
import { Confetti } from '../components/Confetti';
import { games } from '../games';
import type { GameResult } from '../games/types';
import { teamStore } from '../services/storage';

// Underveis-spill: et digitalt minispill (fra innendørsrebusen) som den
// voksne får varsel om på kartet, på vei mot en post. Gir bonuspoeng.
export function RoadGameScreen() {
  const navigate = useNavigate();
  const { num } = useParams();
  const progress = teamStore.useStore();
  const destination = Number(num);
  const [finished, setFinished] = useState<number | null>(null);
  const doneRef = useRef(false);

  const gamePostNumber = progress?.setup.roadGames?.[destination];
  const gamePost = builtinRebuses.lydia.posts.find((p) => p.number === gamePostNumber);
  const alreadyPlayed = progress?.roadResults?.[destination] != null;

  // Stabil onComplete-identitet (samme mønster som PostScreen).
  const handleDoneRef = useRef<(result: GameResult) => void>(() => {});
  const stableDone = useCallback((result: GameResult) => {
    handleDoneRef.current(result);
  }, []);

  handleDoneRef.current = (result: GameResult) => {
    if (doneRef.current || !gamePost) return;
    doneRef.current = true;
    const score = Math.max(0, Math.min(gamePost.points.main, Math.round(result.score)));
    teamStore.update((p) =>
      p
        ? { ...p, roadResults: { ...(p.roadResults ?? {}), [destination]: score } }
        : p,
    );
    setFinished(score);
  };

  if (!progress || !gamePost || (alreadyPlayed && finished == null)) {
    return (
      <div className="screen center stack">
        <p>Ingen underveis-oppgave her. Følg kartet videre!</p>
        <button className="btn" onClick={() => navigate('/play')}>Til kartet</button>
      </div>
    );
  }

  if (finished != null) {
    return (
      <div className="screen center stack">
        <Confetti count={50} />
        <span className="big-emoji" aria-hidden="true">🎒</span>
        <h1>+{finished} bonuspoeng!</h1>
        <p className="muted center">Underveis-oppgaven er i boks – videre mot post {destination}!</p>
        <button className="btn btn-primary btn-big" onClick={() => navigate('/play')}>
          Tilbake til kartet 🗺️
        </button>
      </div>
    );
  }

  const Game = games[gamePost.gameType];

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn btn-small btn-ghost" onClick={() => navigate('/play')}>
          🗺️ Kart
        </button>
        <span className="badge">🎒 Underveis-oppgave</span>
      </div>
      <div className="card center">
        <span className="big-emoji" aria-hidden="true">{gamePost.symbol}</span>
        <h1>{gamePost.title}</h1>
        <p className="muted small">{gamePost.gameIntro}</p>
      </div>
      <div className="card stack">
        <Game post={gamePost} onComplete={stableDone} />
      </div>
      <p className="small muted center">
        Bonuspoeng på veien mot post {destination} – se dere for mens dere går!
      </p>
    </div>
  );
}
