import { useState } from 'react';
import { gameConfig } from '../../config/gameConfig';
import { MapView } from '../../components/MapView';
import { leaderStore } from '../../services/storage';
import type { MapPos } from '../../types';

// Skjult kartredigering: dra postene dit de faktisk skal være.
// Justeringene bakes inn i laglenkene når de lages.
export function MapTab() {
  const state = leaderStore.useStore();
  const [editing, setEditing] = useState(false);

  const positions: Record<number, MapPos> = {};
  for (const p of gameConfig.posts) positions[p.number] = { ...p.mapPos };
  for (const [num, pos] of Object.entries(state.mapOverrides)) positions[Number(num)] = pos;

  function move(postNumber: number, pos: MapPos) {
    leaderStore.update((s) => ({
      ...s,
      mapOverrides: { ...s.mapOverrides, [postNumber]: pos },
    }));
  }

  function resetMap() {
    leaderStore.update((s) => ({ ...s, mapOverrides: {} }));
  }

  const overrideCount = Object.keys(state.mapOverrides).length;

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Postenes plassering</h2>
        <p className="small muted">
          {editing
            ? 'Dra postene dit de skal være. Endringene lagres automatisk og følger med i laglenkene.'
            : 'Trykk på rediger for å dra postene til riktig sted på kartet.'}
        </p>
        <div className="row">
          <button
            className={`btn btn-small ${editing ? 'btn-grass' : ''}`}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? '✅ Ferdig å redigere' : '✏️ Rediger kartet'}
          </button>
          <button className="btn btn-small btn-ghost" onClick={resetMap} disabled={overrideCount === 0}>
            ↩️ Nullstill kartet
          </button>
        </div>
        {overrideCount > 0 && (
          <p className="small muted">{overrideCount} post(er) er flyttet fra standardposisjon.</p>
        )}
      </div>
      <MapView
        positions={positions}
        visiblePosts={gameConfig.posts.map((p) => p.number)}
        editable={editing}
        onMove={move}
      />
      <p className="small muted">
        Standardposisjonene endres i <code>src/config/gameConfig.ts</code> (prosent fra venstre og
        topp).
      </p>
    </div>
  );
}
