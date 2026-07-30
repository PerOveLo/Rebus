import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findPost } from '../config/gameConfig';
import { games } from '../games';
import type { GameResult } from '../games/types';
import { teamStore } from '../services/storage';
import { Confetti } from '../components/Confetti';
import type { TeamProgress } from '../types';

// Stegene på en post:
// 0 klart-til-start (ledetråd/ankomst) -> 1 hovedoppgave -> 2 lagoppgave
// -> 3 voksenbonus -> 4 symbol + forklaring
const STAGE_GAME = 1;
const STAGE_TEAM = 2;
const STAGE_BONUS = 3;
const STAGE_DONE = 4;

export function PostScreen() {
  const navigate = useNavigate();
  const { num } = useParams();
  const progress = teamStore.useStore();
  const postNumber = Number(num);
  const [hintOpen, setHintOpen] = useState(false);

  const partial =
    progress?.partial && progress.partial.postNumber === postNumber ? progress.partial : null;
  const stage = partial?.stage ?? STAGE_GAME;

  useEffect(() => {
    // Sørg for at delvis fremdrift finnes for denne posten.
    if (!progress) return;
    if (progress.results[postNumber]) return;
    if (!progress.partial || progress.partial.postNumber !== postNumber) {
      teamStore.update((p) =>
        p
          ? {
              ...p,
              startedAt: p.startedAt ?? Date.now(),
              partial: { postNumber, stage: STAGE_GAME, mainScore: 0, teamScore: 0, hintUsed: false },
            }
          : p,
      );
    }
  }, [progress, postNumber]);

  // Stabil onComplete-identitet: minispillene rydder fullførings-timere i
  // effekt-cleanup når prop-identiteten endres, så identiteten må aldri
  // endres midt i et spill. Logikken leses fersk via ref-en.
  const handleGameDoneRef = useRef<(result: GameResult) => void>(() => {});
  const stableGameDone = useCallback((result: GameResult) => {
    handleGameDoneRef.current(result);
  }, []);

  const maybePost = Number.isNaN(postNumber) ? undefined : findPost(postNumber);

  if (!progress || !maybePost) {
    return (
      <div className="screen center">
        <p>Fant ikke denne posten. Gå til forsiden for å starte.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  const post = maybePost;
  const alreadyDone = Boolean(progress.results[postNumber]);
  const Game = games[post.gameType];

  function setPartial(patch: Partial<NonNullable<TeamProgress['partial']>>) {
    teamStore.update((p) =>
      p && p.partial
        ? { ...p, partial: { ...p.partial, ...patch } }
        : p,
    );
  }

  handleGameDoneRef.current = (result: GameResult) => {
    teamStore.update((p) => {
      if (!p || !p.partial || p.partial.postNumber !== postNumber) return p;
      const penalty = p.partial.hintUsed ? post.points.hintPenalty : 0;
      const mainScore = Math.max(0, Math.min(post.points.main, result.score) - penalty);
      return {
        ...p,
        creations: { ...p.creations, ...(result.creations ?? {}) },
        partial: { ...p.partial, stage: STAGE_TEAM, mainScore },
      };
    });
  };

  function handleTeamDone(scoreRatio: number) {
    setPartial({ stage: STAGE_BONUS, teamScore: Math.round(post.points.team * scoreRatio) });
  }

  function handleBonusDone(judgeIndex: number) {
    // Alle dommervalg gir poeng – det morsomste svaret er ofte «feil».
    const bonusScore = [post.points.bonus, Math.round(post.points.bonus * 0.75), Math.round(post.points.bonus * 0.75)][
      Math.min(judgeIndex, 2)
    ];
    teamStore.update((p) => {
      if (!p || !p.partial) return p;
      const results = {
        ...p.results,
        [postNumber]: {
          postNumber,
          mainScore: p.partial.mainScore,
          teamScore: p.partial.teamScore,
          bonusScore,
          hintUsed: p.partial.hintUsed,
          completedAt: Date.now(),
        },
      };
      const isFinale = post.gameType === 'finale-code';
      return {
        ...p,
        results,
        collectedSymbols: p.collectedSymbols.includes(post.islandSymbol.id)
          ? p.collectedSymbols
          : [...p.collectedSymbols, post.islandSymbol.id],
        partial: { ...p.partial, stage: STAGE_DONE },
        finishedAt: isFinale ? Date.now() : p.finishedAt,
      };
    });
  }

  function goNext() {
    teamStore.update((p) => {
      if (!p) return p;
      const idx = p.setup.order.indexOf(postNumber);
      // Spol aldri bakover (tilbakeknapp til gammel post), og ikke kast
      // delvis fremdrift som tilhører en annen post.
      const nextIndex =
        idx === -1
          ? p.currentOrderIndex
          : Math.max(p.currentOrderIndex, Math.min(idx + 1, p.setup.order.length - 1));
      const keepPartial =
        p.partial && p.partial.postNumber !== postNumber ? p.partial : undefined;
      return {
        ...p,
        currentOrderIndex: nextIndex,
        partial: keepPartial,
      };
    });
    if (post.gameType === 'finale-code') {
      navigate('/celebration');
    } else {
      navigate('/play');
    }
  }

  function useHint() {
    setHintOpen(true);
    setPartial({ hintUsed: true });
  }

  const totalHere = (partial?.mainScore ?? 0) + (partial?.teamScore ?? 0);
  const orderPos = progress.setup.order.indexOf(postNumber);
  const bonusOptions = (post.data as { bonusOptions?: string[] } | undefined)?.bonusOptions;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn btn-small btn-ghost" onClick={() => navigate('/play')}>
          🗺️ Kart
        </button>
        <span className="badge">
          Etappe {orderPos >= 0 ? orderPos + 1 : '?'} av {progress.setup.order.length}
        </span>
      </div>

      <div className="card center">
        <span className="big-emoji" aria-hidden="true">{post.symbol}</span>
        <h1>{post.title}</h1>
        {stage === STAGE_GAME && <p className="muted small">{post.gameIntro}</p>}
      </div>

      {alreadyDone && stage !== STAGE_DONE ? (
        <div className="card center stack">
          <p>Denne posten er allerede fullført! 🎉</p>
          <button className="btn btn-primary btn-big" onClick={goNext}>
            Videre til kartet
          </button>
        </div>
      ) : (
        <>
          {stage === STAGE_GAME && (
            <div className="card stack">
              <Game post={post} onComplete={stableGameDone} />
              <div className="center">
                {!hintOpen ? (
                  <button className="btn btn-small btn-sun" onClick={useHint}>
                    💡 Hint (−{post.points.hintPenalty} poeng)
                  </button>
                ) : (
                  <div className="card card-soft small pop-in">{post.hint}</div>
                )}
              </div>
            </div>
          )}

          {stage === STAGE_TEAM && (
            <div className="card stack pop-in">
              <h2>🤸 Lagoppgave</h2>
              <p>{post.physicalTask}</p>
              <p className="small muted">Gjør oppgaven sammen – og vær ærlige!</p>
              <button className="btn btn-grass btn-big" onClick={() => handleTeamDone(1)}>
                Vi klarte det! (+{post.points.team}p)
              </button>
              <button className="btn btn-ghost" onClick={() => handleTeamDone(0.5)}>
                Vi prøvde så godt vi kunne (+{Math.round(post.points.team / 2)}p)
              </button>
            </div>
          )}

          {stage === STAGE_BONUS && (
            <div className="card stack pop-in">
              <h2>🧑‍⚖️ Voksenbonus – barna er dommere</h2>
              <p>{post.adultBonus}</p>
              {bonusOptions && bonusOptions.length > 0 && (
                <div className="card card-soft small stack" style={{ gap: 6 }}>
                  {bonusOptions.map((s) => (
                    <p key={s} style={{ margin: 0 }}>{s}</p>
                  ))}
                </div>
              )}
              <p className="small muted">Barna velger dommen. Alle dommer gir poeng!</p>
              {post.adultBonusJudgeOptions.map((opt, i) => (
                <button key={opt} className="btn btn-sun" onClick={() => handleBonusDone(i)}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {stage === STAGE_DONE && (
            <div className="card stack center pop-in">
              <Confetti count={30} />
              <span className="big-emoji glow" aria-hidden="true">
                {post.islandSymbol.emoji}
              </span>
              <h2>Dere har samlet: {post.islandSymbol.name}!</h2>
              <div className="badge">
                +{(progress.results[postNumber]
                  ? progress.results[postNumber].mainScore +
                    progress.results[postNumber].teamScore +
                    progress.results[postNumber].bonusScore
                  : totalHere)}{' '}
                poeng
              </div>
              <p className="small muted" style={{ marginTop: 8 }}>{post.funFact}</p>
              <button className="btn btn-primary btn-big" onClick={goNext}>
                {post.gameType === 'finale-code' ? 'Til seiersfesten! 🎉' : 'Videre på kartet 🗺️'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
