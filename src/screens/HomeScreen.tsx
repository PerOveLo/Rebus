import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeConfig, activeCustomRebus, activeStory } from '../services/personalize';
import { TunnelIntro } from '../components/TunnelIntro';
import { BirthdayIntro } from '../components/BirthdayIntro';
import { leaderStore, teamStore } from '../services/storage';

// Forsiden tilpasser seg den aktive rebusen: Skylleviga, Lydias bursdag
// eller en egen generert rebus.
export function HomeScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  leaderStore.useStore(); // re-render når spillleder bytter rebus
  const [storyOpen, setStoryOpen] = useState(false);

  const cfg = activeConfig();
  const custom = activeCustomRebus();
  const kicker = custom ? 'FAMILIEREBUS' : cfg.home.kicker;
  const title = custom?.name ?? cfg.home.title;

  const hasActiveTeam = progress != null && progress.safetyConfirmed;

  return (
    <div className="screen">
      <div className="center" style={{ marginTop: 8 }}>
        <div className="small muted" style={{ letterSpacing: '0.14em', fontWeight: 700 }}>
          {kicker}
        </div>
        <h1 style={{ fontSize: '2rem' }}>{title}</h1>
      </div>

      {cfg.home.theme === 'birthday' ? (
        <BirthdayIntro messages={cfg.intro.loadingMessages} />
      ) : (
        <TunnelIntro />
      )}

      {hasActiveTeam ? (
        <div className="card stack center">
          <p>
            <span aria-hidden="true">{progress.setup.team.icon}</span>{' '}
            <strong>{progress.setup.team.name}</strong> er allerede i gang!
          </p>
          <button className="btn btn-primary btn-big" onClick={() => navigate('/play')}>
            {cfg.home.continueLabel}
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-big" onClick={() => navigate('/start')}>
          {cfg.home.startLabel}
        </button>
      )}

      <button className="btn btn-ghost btn-big" onClick={() => navigate('/leader')}>
        Jeg er spillleder 🧑‍✈️
      </button>

      <button className="btn btn-small btn-ghost" onClick={() => setStoryOpen((o) => !o)} style={{ alignSelf: 'center' }}>
        {storyOpen ? 'Skjul historien' : 'Hva er dette? 📜'}
      </button>
      {storyOpen && (
        <div className="card card-soft pop-in" style={{ whiteSpace: 'pre-line' }}>
          {activeStory()}
        </div>
      )}
    </div>
  );
}
