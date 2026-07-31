import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeConfig } from '../services/personalize';
import { TunnelIntro } from '../components/TunnelIntro';
import { teamStore } from '../services/storage';

export function HomeScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  const [storyOpen, setStoryOpen] = useState(false);

  const hasActiveTeam = progress != null && progress.safetyConfirmed;

  return (
    <div className="screen">
      <div className="center" style={{ marginTop: 8 }}>
        <div className="small muted" style={{ letterSpacing: '0.14em', fontWeight: 700 }}>
          OPERASJON SKYLLEVIGA
        </div>
        <h1 style={{ fontSize: '2rem' }}>Den store øyprøven</h1>
      </div>

      <TunnelIntro />

      {hasActiveTeam ? (
        <div className="card stack center">
          <p>
            <span aria-hidden="true">{progress.setup.team.icon}</span>{' '}
            <strong>{progress.setup.team.name}</strong> er allerede i gang!
          </p>
          <button className="btn btn-primary btn-big" onClick={() => navigate('/play')}>
            Fortsett øyprøven 🏝️
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-big" onClick={() => navigate('/start')}>
          Start øyprøven 🏝️
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
          {activeConfig().intro.story}
        </div>
      )}
    </div>
  );
}
