import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameConfig } from '../config/gameConfig';
import { teamStore } from '../services/storage';

// Sikkerhetssjekk før start – alle punkter må hukes av.
export function SafetyScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  const items = gameConfig.safetyChecklist;
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  if (!progress) {
    return (
      <div className="screen center stack">
        <p>Ingen lag å starte. Gå til forsiden.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  const allChecked = checked.every(Boolean);

  function start() {
    teamStore.update((p) =>
      p ? { ...p, safetyConfirmed: true, startedAt: p.startedAt ?? Date.now() } : p,
    );
    navigate('/play');
  }

  return (
    <div className="screen">
      <h1 className="center">🦺 Før dere starter</h1>
      <div className="card stack">
        {items.map((item, i) => (
          <label key={i} className="row" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => {
                const next = [...checked];
                next[i] = e.target.checked;
                setChecked(next);
              }}
              style={{ width: 26, height: 26, marginTop: 2, accentColor: 'var(--grass)' }}
            />
            <span>{item}</span>
          </label>
        ))}
        <button className="btn btn-small btn-ghost" onClick={() => setChecked(items.map(() => true))}>
          Huk av alle
        </button>
      </div>
      <button className="btn btn-primary btn-big" disabled={!allChecked} onClick={start}>
        Vi lover! Start øyprøven 🚀
      </button>
    </div>
  );
}
