import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameConfig } from '../config/gameConfig';
import { teamStore, uid } from '../services/storage';
import { randomTeamIcon, randomTeamName } from '../services/teams';
import type { Participant, TeamLinkPayload } from '../types';

// «Start øyprøven»: enten har laget fått en lenke/QR fra spillleder,
// eller så spilles alt på denne ene telefonen («Kun denne telefonen»).
export function StartScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'solo'>('choose');
  const [names, setNames] = useState('');
  const [teamName, setTeamName] = useState(() => randomTeamName());
  const [icon, setIcon] = useState(() => randomTeamIcon());

  function startSolo() {
    const members: Participant[] = names
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: uid(), name: n, isAdult: false }));
    const payload: TeamLinkPayload = {
      v: 1,
      kind: 'team',
      eventName: gameConfig.eventName,
      team: { id: uid(), name: teamName.trim() || 'Øyprøvelaget', icon, members },
      order: [...gameConfig.posts.map((p) => p.number)],
      finalCode: gameConfig.defaultFinalCode,
    };
    teamStore.set({
      setup: payload,
      startedAt: null,
      finishedAt: null,
      safetyConfirmed: false,
      currentOrderIndex: 0,
      results: {},
      collectedSymbols: [],
      creations: {},
    });
    navigate('/safety');
  }

  if (mode === 'choose') {
    return (
      <div className="screen">
        <h1 className="center">Hvordan vil dere spille?</h1>
        <div className="card stack">
          <h2>📲 Vi har fått en laglenke</h2>
          <p className="small muted">
            Spillleder har laget en QR-kode eller lenke til laget deres. Skann den med kameraet
            eller åpne lenken – så starter spillet av seg selv.
          </p>
        </div>
        <div className="card stack">
          <h2>📱 Kun denne telefonen</h2>
          <p className="small muted">
            Spill hele øyprøven på én telefon – perfekt for én familie eller for å teste spillet.
          </p>
          <button className="btn btn-primary btn-big" onClick={() => setMode('solo')}>
            Lag et lag nå 🎉
          </button>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Tilbake</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="center">Lag laget deres</h1>
      <div className="card stack">
        <label className="small" htmlFor="teamname"><strong>Lagnavn</strong></label>
        <div className="row">
          <input
            id="teamname"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={40}
          />
          <button
            className="btn btn-small btn-sun"
            onClick={() => setTeamName(randomTeamName([teamName]))}
            aria-label="Trekk nytt lagnavn"
          >
            🎲
          </button>
        </div>
        <label className="small"><strong>Lagikon</strong></label>
        <div className="row-wrap">
          {gameConfig.teamIcons.map((i) => (
            <button
              key={i}
              className={`chip chip-btn ${icon === i ? 'chip-active' : ''}`}
              onClick={() => setIcon(i)}
              aria-pressed={icon === i}
            >
              <span style={{ fontSize: '1.3rem' }}>{i}</span>
            </button>
          ))}
        </div>
        <label className="small" htmlFor="names"><strong>Hvem er med?</strong> (valgfritt, ett navn per linje)</label>
        <textarea
          id="names"
          rows={3}
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder={'Emil\nIsak\nJenny'}
        />
        <button className="btn btn-primary btn-big" onClick={startSolo}>
          Til sikkerhetssjekken ✅
        </button>
      </div>
      <button className="btn btn-ghost" onClick={() => setMode('choose')}>Tilbake</button>
    </div>
  );
}
