import type { Team, TeamCreations } from '../types';

// Digitalt øy-pass for et lag. Vises ved lagopprettelse, i spillet og i finalen.
export function TeamPass({
  team,
  creations,
  stamped = false,
}: {
  team: Team;
  creations?: TeamCreations;
  stamped?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(160deg, #fff 60%, var(--sun-soft))',
        border: '3px dashed var(--sea)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="small muted" style={{ letterSpacing: '0.12em', fontWeight: 800 }}>
          ØYPASS · SKYLLEVIGA
        </div>
        <span aria-hidden="true">🛂</span>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <span style={{ fontSize: '2.6rem' }} aria-hidden="true">
          {team.icon}
        </span>
        <div>
          <h2 style={{ marginBottom: 2 }}>{team.name}</h2>
          <div className="small muted">
            {team.members.map((m) => m.name).join(', ') || 'Uten mannskap'}
          </div>
        </div>
      </div>
      {creations?.passTitle && (
        <div className="badge" style={{ marginTop: 10 }}>
          {creations.passTitle}
        </div>
      )}
      {creations && (creations.passAnimal || creations.passTransport || creations.passPower || creations.passSnack) && (
        <div className="small muted" style={{ marginTop: 8, display: 'grid', gap: 2 }}>
          {creations.passAnimal && <span>Øydyr: {creations.passAnimal}</span>}
          {creations.passTransport && <span>Transport: {creations.passTransport}</span>}
          {creations.passPower && <span>Superkraft: {creations.passPower}</span>}
          {creations.passSnack && <span>Hemmelig snacks: {creations.passSnack}</span>}
        </div>
      )}
      {stamped && (
        <div
          className="pop-in"
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            transform: 'rotate(-14deg)',
            border: '4px solid var(--ok)',
            color: 'var(--ok)',
            borderRadius: 12,
            padding: '6px 10px',
            fontWeight: 900,
            fontSize: '0.95rem',
            background: 'rgba(255,255,255,0.85)',
          }}
        >
          GODKJENT ÆRESØYBOER
        </div>
      )}
    </div>
  );
}
