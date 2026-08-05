import { useEffect, useRef, useState } from 'react';
import { leaderConfig, leaderEnabledPosts } from '../../services/personalize';
import { leaderStore } from '../../services/storage';
import { autoSplitTeams, bestTeamUrl, buildPostOrder, randomTeamIcon, randomTeamName } from '../../services/teams';
import { QRView } from '../../components/QRView';
import { TeamPass } from '../../components/TeamPass';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Team } from '../../types';

// Lagfordeling som en liten trekningsseremoni: navnene «flyr» inn i lagene.
export function TeamsTab() {
  const state = leaderStore.useStore();
  const reduced = useReducedMotion();
  const [drawing, setDrawing] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [qrTeam, setQrTeam] = useState<Team | null>(null);
  const [passTeam, setPassTeam] = useState<Team | null>(null);
  const [moveMember, setMoveMember] = useState<{ memberId: string; fromTeam: string } | null>(null);
  // Hvilket lag som nettopp fikk lenken sin kopiert – per lag, ellers
  // ser det ut som alle knappene kopierer samme lenke.
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalMembers = state.teams.reduce((n, t) => n + t.members.length, 0);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  function distribute() {
    const teams = autoSplitTeams(state.participants, state.settings.teamCount, leaderConfig(state));
    leaderStore.update((s) => ({ ...s, teams }));
    if (reduced) {
      setRevealCount(Number.MAX_SAFE_INTEGER);
      return;
    }
    setDrawing(true);
    setRevealCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRevealCount((c) => {
        if (c + 1 >= state.participants.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDrawing(false);
        }
        return c + 1;
      });
    }, 350);
  }

  function renameTeam(teamId: string, name: string) {
    leaderStore.update((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, name } : t)),
    }));
  }

  function rerollTeam(teamId: string) {
    leaderStore.update((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              name: randomTeamName(s.teams.map((x) => x.name), leaderConfig(s)),
              icon: randomTeamIcon(s.teams.map((x) => x.icon), leaderConfig(s)),
            }
          : t,
      ),
    }));
  }

  function doMove(toTeamId: string) {
    if (!moveMember) return;
    leaderStore.update((s) => {
      const member = s.teams
        .find((t) => t.id === moveMember.fromTeam)
        ?.members.find((m) => m.id === moveMember.memberId);
      if (!member) return s;
      return {
        ...s,
        teams: s.teams.map((t) => {
          if (t.id === moveMember.fromTeam)
            return { ...t, members: t.members.filter((m) => m.id !== moveMember.memberId) };
          if (t.id === toTeamId) return { ...t, members: [...t.members, member] };
          return t;
        }),
      };
    });
    setMoveMember(null);
  }

  async function copyLink(team: Team, index: number) {
    const url = bestTeamUrl(state, team, index);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTeamId(team.id);
      setTimeout(() => setCopiedTeamId(null), 2200);
    } catch {
      prompt('Kopier lenken manuelt:', url);
    }
  }

  let revealed = 0;

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Fordel lagene</h2>
        <div className="row">
          <label className="small" htmlFor="teamcount" style={{ whiteSpace: 'nowrap' }}>
            Antall lag:
          </label>
          <select
            id="teamcount"
            value={state.settings.teamCount}
            onChange={(e) =>
              leaderStore.update((s) => ({
                ...s,
                settings: { ...s.settings, teamCount: Number(e.target.value) },
              }))
            }
            style={{ width: 90 }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={distribute}
            disabled={state.participants.length === 0 || drawing}
            style={{ flex: 1 }}
          >
            🎲 Fordel oss!
          </button>
        </div>
        <p className="small muted">
          Voksne fordeles jevnt. Du kan flytte folk manuelt etterpå – og lagene kan bytte navn og
          ikon selv.
        </p>
      </div>

      {state.teams.map((team, index) => (
        <div className="card stack" key={team.id}>
          <div className="row">
            <button
              className="btn btn-small btn-sun"
              onClick={() => rerollTeam(team.id)}
              aria-label={`Trekk nytt navn og ikon for ${team.name}`}
            >
              {team.icon} 🎲
            </button>
            <input
              type="text"
              value={team.name}
              onChange={(e) => renameTeam(team.id, e.target.value)}
              aria-label="Lagnavn"
            />
          </div>
          <div className="row-wrap">
            {team.members.map((m) => {
              revealed += 1;
              const show = revealCount >= revealed || !drawing;
              return (
                <button
                  key={m.id}
                  className={`chip chip-btn ${show ? 'pop-in' : ''} ${
                    moveMember?.memberId === m.id ? 'chip-active' : ''
                  }`}
                  style={{ visibility: show ? 'visible' : 'hidden' }}
                  onClick={() =>
                    setMoveMember(
                      moveMember?.memberId === m.id ? null : { memberId: m.id, fromTeam: team.id },
                    )
                  }
                >
                  {m.isAdult ? '🧑' : '🧒'} {m.name}
                </button>
              );
            })}
            {team.members.length === 0 && <span className="small muted">Tomt lag</span>}
          </div>
          {moveMember && moveMember.fromTeam !== team.id && (
            <button className="btn btn-small btn-grass" onClick={() => doMove(team.id)}>
              Flytt hit 👋
            </button>
          )}
          <div className="row">
            <button className="btn btn-small" onClick={() => setQrTeam(team)}>
              📱 QR / lenke
            </button>
            <button className="btn btn-small btn-ghost" onClick={() => setPassTeam(team)}>
              🛂 Øypass
            </button>
            <button
              className="btn btn-small btn-ghost"
              onClick={() => copyLink(team, index)}
            >
              {copiedTeamId === team.id ? '✅ Kopiert!' : '🔗 Kopier lenke'}
            </button>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            Starter på post{' '}
            {buildPostOrder(leaderEnabledPosts(state), index, state.settings.rotateStarts)[0]} ·
            egen lenke og QR for dette laget
          </p>
        </div>
      ))}

      {state.teams.length > 0 && totalMembers !== state.participants.length && (
        <p className="small muted">
          Obs: {state.participants.length - totalMembers} deltaker(e) står utenfor lag. Trykk
          «Fordel oss» på nytt for å ta med alle.
        </p>
      )}

      {qrTeam && (
        <div className="modal-backdrop" onClick={() => setQrTeam(null)}>
          <div className="modal stack" onClick={(e) => e.stopPropagation()}>
            <h2 className="center">
              {qrTeam.icon} {qrTeam.name}
            </h2>
            <QRView
              text={bestTeamUrl(state, qrTeam, state.teams.findIndex((t) => t.id === qrTeam.id))}
              label="Laget skanner denne med kameraet sitt"
              shareable
              filename={`lag-${qrTeam.name.replace(/[^a-zA-Z0-9æøåÆØÅ]+/g, '-').toLowerCase()}.png`}
            />
            <p className="small muted center">
              Last ned eller kopier QR-bildet og send det i Messenger-gruppa – laget trykker på
              bildet og skanner det (eller bruk «Kopier lenke»).
            </p>
            <p className="small muted center">
              Ingen server, ingen innlogging – innholdet ligger i appen, lenken er bare lagets
              billett. Ett lag = én telefon.
            </p>
            <button className="btn" onClick={() => setQrTeam(null)}>
              Lukk
            </button>
          </div>
        </div>
      )}

      {passTeam && (
        <div className="modal-backdrop" onClick={() => setPassTeam(null)}>
          <div className="modal stack" onClick={(e) => e.stopPropagation()}>
            <TeamPass team={passTeam} />
            <button className="btn" onClick={() => setPassTeam(null)}>
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
