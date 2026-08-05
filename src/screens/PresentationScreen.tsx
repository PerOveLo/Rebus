import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '../components/Confetti';
import { leaderConfig } from '../services/personalize';
import { leaderStore } from '../services/storage';
import { computeAwards } from '../services/scoring';

// Presentasjonsmodus for TV/stor skjerm: trykk hvor som helst for neste side.
export function PresentationScreen() {
  const navigate = useNavigate();
  const state = leaderStore.useStore();
  const [slide, setSlide] = useState(0);

  const cfg = leaderConfig(state);
  const awards = useMemo(() => computeAwards(state.importedResults, cfg), [state.importedResults, cfg]);
  const sorted = useMemo(
    () => [...state.importedResults].sort((a, b) => b.total - a.total),
    [state.importedResults],
  );

  // Lysbilder: velkomst -> hver tittel -> full resultatliste -> takk
  const totalSlides = 1 + awards.length + 1 + 1;

  function next() {
    if (slide < totalSlides - 1) setSlide(slide + 1);
    else navigate('/leader');
  }

  const wrapper = (content: React.ReactNode, withConfetti = false) => (
    <button
      onClick={next}
      style={{
        border: 'none',
        cursor: 'pointer',
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 32,
        background: 'linear-gradient(180deg, #0b5666 0%, #123044 100%)',
        color: '#fff7e6',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
      aria-label="Neste side"
    >
      {withConfetti && <Confetti count={70} />}
      {content}
      <span style={{ position: 'fixed', bottom: 18, fontSize: '0.85rem', opacity: 0.6 }}>
        Trykk for å gå videre ({slide + 1}/{totalSlides})
      </span>
    </button>
  );

  if (slide === 0) {
    return wrapper(
      <>
        <div style={{ fontSize: '4rem' }} aria-hidden="true">
          {cfg.home.theme === 'birthday' ? '🎂' : '🏝️'}
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>{cfg.home.kicker}</h1>
        <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.8rem)', opacity: 0.85 }}>
          {cfg.home.title} – resultatene!
        </p>
      </>,
      true,
    );
  }

  if (slide <= awards.length) {
    const award = awards[slide - 1];
    return wrapper(
      <>
        <div style={{ fontSize: '3.6rem' }} aria-hidden="true">🏅</div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 3.2rem)', color: 'var(--sun)' }}>{award.title}</h1>
        <p style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.6rem)', fontWeight: 800 }}>
          {award.teamNames.join(' · ')}
        </p>
        <p style={{ opacity: 0.75 }}>{award.detail}</p>
      </>,
      true,
    );
  }

  if (slide === awards.length + 1) {
    return wrapper(
      <>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 3rem)' }}>Resultatliste</h1>
        <div style={{ display: 'grid', gap: 12, width: 'min(90vw, 640px)' }}>
          {sorted.map((r, i) => (
            <div
              key={r.teamId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '12px 20px',
                fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                fontWeight: 700,
              }}
            >
              <span>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {r.icon} {r.teamName}
              </span>
              <span>{r.total}p</span>
            </div>
          ))}
          {sorted.length === 0 && <p>Ingen resultater registrert ennå.</p>}
        </div>
      </>,
    );
  }

  return wrapper(
    <>
      <div style={{ fontSize: '4rem' }} aria-hidden="true">
        {cfg.home.theme === 'birthday' ? '🎁🎂' : '🗝️🏡'}
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.4rem)' }}>{cfg.finale.presentationOutro}</h1>
      <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', opacity: 0.85 }}>
        {cfg.finale.presentationJoke}
      </p>
    </>,
    true,
  );
}
