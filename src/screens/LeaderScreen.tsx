import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameConfig, isValidCode } from '../config/gameConfig';
import { leaderStore } from '../services/storage';
import { ParticipantsTab } from './leader/ParticipantsTab';
import { TeamsTab } from './leader/TeamsTab';
import { MapTab } from './leader/MapTab';
import { SettingsTab } from './leader/SettingsTab';
import { ResultsTab } from './leader/ResultsTab';

type Tab = 'people' | 'teams' | 'map' | 'settings' | 'results';

const TABS: { id: Tab; label: string }[] = [
  { id: 'people', label: '👥 Deltakere' },
  { id: 'teams', label: '🚩 Lag' },
  { id: 'map', label: '🗺️ Kart' },
  { id: 'results', label: '🏆 Resultater' },
  { id: 'settings', label: '⚙️ Oppsett' },
];

export function LeaderScreen() {
  const navigate = useNavigate();
  const state = leaderStore.useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState<Tab>('people');

  if (!unlocked) {
    return (
      <div className="screen">
        <h1 className="center">🧑‍✈️ Spillleder</h1>
        <div className="card stack center">
          <p className="muted small">
            Tast den firesifrede spilllederkoden. (Standard: den står i gameConfig.ts – og på
            lappen i lomma di.)
          </p>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Spilllederkode"
            value={pinEntry}
            maxLength={4}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              setPinEntry(v);
              setPinError(false);
              if (v.length === 4) {
                // Skulle en ugyldig PIN ha sneket seg inn i lagringen,
                // gjelder standardkoden – spillleder skal aldri låses ute.
                const effectivePin = isValidCode(state.settings.pin)
                  ? state.settings.pin
                  : gameConfig.defaultLeaderPin;
                if (v === effectivePin) setUnlocked(true);
                else setPinError(true);
              }
            }}
            style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.4em' }}
          />
          {pinError && <p className="small" style={{ color: 'var(--coral)' }}>Feil kode. Prøv igjen!</p>}
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Tilbake</button>
      </div>
    );
  }

  return (
    <div className="screen" style={{ maxWidth: 640 }}>
      <div className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>🧑‍✈️ Spillleder</h1>
        <button className="btn btn-small btn-ghost" onClick={() => navigate('/')}>
          Til forsiden
        </button>
      </div>
      <div className="row-wrap" role="tablist" aria-label="Spilllederfaner">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`chip chip-btn ${tab === t.id ? 'chip-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'people' && <ParticipantsTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'map' && <MapTab />}
      {tab === 'settings' && <SettingsTab />}
      {tab === 'results' && <ResultsTab />}
    </div>
  );
}
