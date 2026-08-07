import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { builtinRebus, builtinRebuses } from '../config/rebuses';
import { leaderBuiltinId } from '../services/personalize';
import { leaderStore, teamStore, uid } from '../services/storage';
import { randomTeamIcon, randomTeamName } from '../services/teams';
import type { BuiltinRebusId, Participant, TeamLinkPayload } from '../types';

// «Start rebusen»: enten har laget fått en lenke/QR fra spillleder,
// eller så spilles alt på denne ene telefonen («Kun denne telefonen»).
export function StartScreen() {
  const navigate = useNavigate();
  const leader = leaderStore.get();
  const [mode, setMode] = useState<'choose' | 'solo'>('choose');
  // Forvalgt rebus følger spillleders valg på denne telefonen.
  const [rebusId, setRebusId] = useState<BuiltinRebusId>(() => leaderBuiltinId(leader));
  const cfg = builtinRebus(rebusId);
  const [names, setNames] = useState('');
  const [teamName, setTeamName] = useState(() => randomTeamName([], builtinRebus(leaderBuiltinId(leader))));
  const [icon, setIcon] = useState(() => randomTeamIcon([], builtinRebus(leaderBuiltinId(leader))));

  const rebusOptions = useMemo(
    () =>
      (Object.keys(builtinRebuses) as BuiltinRebusId[])
        .filter((id) => id !== 'standard')
        .map((id) => ({
          id,
          label: `${builtinRebuses[id].map.homeEmoji} ${builtinRebuses[id].shortName}`,
        })),
    [],
  );

  function chooseRebus(id: BuiltinRebusId) {
    if (id === rebusId) return;
    setRebusId(id);
    const next = builtinRebus(id);
    setTeamName(randomTeamName([], next));
    setIcon(randomTeamIcon([], next));
  }

  function startSolo() {
    const members: Participant[] = names
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: uid(), name: n, isAdult: false }));
    const roadGames = Object.fromEntries(
      (cfg.roadSlots ?? []).filter((s) => s.default > 0).map((s) => [s.before, s.default]),
    );
    // Spillleders omskrevne posttekster på denne telefonen følger med.
    const postTexts = leaderStore.get().postTexts?.[rebusId];
    const payload: TeamLinkPayload = {
      v: 1,
      kind: 'team',
      eventName: cfg.eventName,
      team: { id: uid(), name: teamName.trim() || 'Rebuslaget', icon, members },
      order: [...cfg.posts.map((p) => p.number)],
      finalCode: cfg.defaultFinalCode,
      builtin: rebusId !== 'standard' ? rebusId : undefined,
      roadGames: Object.keys(roadGames).length > 0 ? roadGames : undefined,
      postTexts: postTexts && Object.keys(postTexts).length > 0 ? postTexts : undefined,
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
            Spill hele rebusen på én telefon – perfekt for én familie eller for å teste spillet.
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
        <label className="small"><strong>Hvilken rebus?</strong></label>
        <div className="row-wrap">
          {rebusOptions.map((o) => (
            <button
              key={o.id}
              className={`chip chip-btn ${rebusId === o.id ? 'chip-active' : ''}`}
              onClick={() => chooseRebus(o.id)}
              aria-pressed={rebusId === o.id}
            >
              {o.label}
            </button>
          ))}
        </div>
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
            onClick={() => setTeamName(randomTeamName([teamName], cfg))}
            aria-label="Trekk nytt lagnavn"
          >
            🎲
          </button>
        </div>
        <label className="small"><strong>Lagikon</strong></label>
        <div className="row-wrap">
          {cfg.teamIcons.map((i) => (
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
          placeholder={cfg.home.namesPlaceholder}
        />
        <button className="btn btn-primary btn-big" onClick={startSolo}>
          Til sikkerhetssjekken ✅
        </button>
      </div>
      <button className="btn btn-ghost" onClick={() => setMode('choose')}>Tilbake</button>
    </div>
  );
}
