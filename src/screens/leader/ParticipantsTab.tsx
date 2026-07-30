import { useState } from 'react';
import { leaderStore, uid } from '../../services/storage';

const TEST_PARTICIPANTS: { name: string; isAdult: boolean }[] = [
  { name: 'Sjur', isAdult: true },
  { name: 'Ida', isAdult: true },
  { name: 'Emil', isAdult: false },
  { name: 'Isak', isAdult: false },
  { name: 'Jenny', isAdult: false },
  { name: 'Tante Turid', isAdult: true },
  { name: 'Onkel Odd', isAdult: true },
  { name: 'Kusine Kaja', isAdult: false },
];

export function ParticipantsTab() {
  const state = leaderStore.useStore();
  const [name, setName] = useState('');
  const [isAdult, setIsAdult] = useState(false);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    leaderStore.update((s) => ({
      ...s,
      participants: [...s.participants, { id: uid(), name: trimmed, isAdult }],
    }));
    setName('');
  }

  function remove(id: string) {
    leaderStore.update((s) => ({
      ...s,
      participants: s.participants.filter((p) => p.id !== id),
      teams: s.teams.map((t) => ({ ...t, members: t.members.filter((m) => m.id !== id) })),
    }));
  }

  function toggleAdult(id: string) {
    leaderStore.update((s) => ({
      ...s,
      participants: s.participants.map((p) => (p.id === id ? { ...p, isAdult: !p.isAdult } : p)),
    }));
  }

  function fillTestData() {
    leaderStore.update((s) => ({
      ...s,
      participants: [
        ...s.participants,
        ...TEST_PARTICIPANTS.filter(
          (t) => !s.participants.some((p) => p.name === t.name),
        ).map((t) => ({ id: uid(), ...t })),
      ],
    }));
  }

  const adults = state.participants.filter((p) => p.isAdult).length;
  const kids = state.participants.length - adults;

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Hvem er med på festen?</h2>
        <div className="row">
          <input
            type="text"
            placeholder="Navn"
            value={name}
            aria-label="Navn på deltaker"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
        </div>
        <div className="row">
          <button
            className={`chip chip-btn ${!isAdult ? 'chip-active' : ''}`}
            onClick={() => setIsAdult(false)}
            aria-pressed={!isAdult}
          >
            🧒 Barn
          </button>
          <button
            className={`chip chip-btn ${isAdult ? 'chip-active' : ''}`}
            onClick={() => setIsAdult(true)}
            aria-pressed={isAdult}
          >
            🧑 Voksen
          </button>
          <button className="btn btn-small btn-primary" onClick={add} disabled={!name.trim()}>
            Legg til
          </button>
        </div>
      </div>

      <div className="card stack">
        <div className="spread">
          <h3 style={{ margin: 0 }}>
            {state.participants.length} deltakere ({kids} barn, {adults} voksne)
          </h3>
          <button className="btn btn-small btn-sun" onClick={fillTestData}>
            🧪 Testdeltakere
          </button>
        </div>
        {state.participants.length === 0 && (
          <p className="muted small">Ingen ennå. Legg til gjestene – eller trykk på testknappen.</p>
        )}
        {state.participants.map((p) => (
          <div key={p.id} className="spread" style={{ borderBottom: '1px solid #eef3f6', paddingBottom: 6 }}>
            <span>
              {p.isAdult ? '🧑' : '🧒'} {p.name}
            </span>
            <span className="row">
              <button className="btn btn-small btn-ghost" onClick={() => toggleAdult(p.id)}>
                Bytt til {p.isAdult ? 'barn' : 'voksen'}
              </button>
              <button className="btn btn-small btn-ghost" onClick={() => remove(p.id)} aria-label={`Fjern ${p.name}`}>
                🗑️
              </button>
            </span>
          </div>
        ))}
      </div>
      <p className="small muted">
        Tips: 3–6 personer per lag og minst én voksen per lag når barn deltar.
      </p>
    </div>
  );
}
