import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { decodeTeamLink } from '../services/share';
import { teamStore } from '../services/storage';
import { TeamPass } from '../components/TeamPass';
import type { TeamLinkPayload } from '../types';

// Åpnes fra laglenken/QR-koden spillleder deler ut.
export function JoinScreen() {
  const navigate = useNavigate();
  const { data } = useParams();
  const [payload, setPayload] = useState<TeamLinkPayload | null>(null);
  const [invalid, setInvalid] = useState(false);
  const existing = teamStore.get();

  useEffect(() => {
    const decoded = data ? decodeTeamLink(data) : null;
    if (decoded) setPayload(decoded);
    else setInvalid(true);
  }, [data]);

  if (invalid) {
    return (
      <div className="screen center stack">
        <span className="big-emoji" aria-hidden="true">🤔</span>
        <p>Denne lenken så rar ut. Be spillleder om en ny QR-kode eller lenke.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  if (!payload) return <div className="screen center">Åpner laget …</div>;

  const hasOtherTeam =
    existing != null && existing.setup.team.id !== payload.team.id && !existing.finishedAt;

  function accept() {
    if (!payload) return;
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

  return (
    <div className="screen">
      <h1 className="center">Velkommen, lag!</h1>
      <p className="small muted center" style={{ marginTop: -8, fontWeight: 700 }}>
        🎪 {payload.eventName}
      </p>
      <TeamPass team={payload.team} />
      <div className="card stack">
        <p className="small muted">
          Dere starter på post {payload.order[0]} og skal gjennom {payload.order.length} poster.
          Fremdriften lagres kun på denne telefonen.
        </p>
        {hasOtherTeam && (
          <div className="card card-soft small">
            ⚠️ Telefonen har allerede et lag i gang ({existing?.setup.team.name}). Starter dere
            dette laget, forsvinner den gamle fremdriften.
          </div>
        )}
        <button className="btn btn-primary btn-big" onClick={accept}>
          Dette er oss! ✅
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Avbryt</button>
      </div>
    </div>
  );
}
