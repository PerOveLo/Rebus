import { useState } from 'react';
import { gameConfig } from '../../config/gameConfig';
import { MapView } from '../../components/MapView';
import { GeoMap } from '../../components/GeoMap';
import { leaderStore } from '../../services/storage';
import {
  DEFAULT_ADDRESS,
  DEFAULT_CENTER,
  geocodeAddress,
  scatterPosts,
} from '../../services/geo';
import type { GeocodeHit } from '../../services/geo';
import type { GeoPos, MapPos } from '../../types';

// Kartfanen har to moduser:
// - Bildekart: eget kartbilde (public/skylleviga-kart.jpg) med prosentkoordinater.
// - GPS-kart: ekte kart med GPS-posisjoner, adressesøk og dra-og-slipp.
export function MapTab() {
  const state = leaderStore.useStore();
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [hits, setHits] = useState<GeocodeHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const useGeo = state.settings.useGeoMap ?? false;
  const center = state.geoCenter ?? DEFAULT_CENTER;
  const geoOverrides = state.geoOverrides ?? {};

  function setUseGeo(on: boolean) {
    leaderStore.update((s) => ({ ...s, settings: { ...s.settings, useGeoMap: on } }));
  }

  // --- Bildekart ---
  const positions: Record<number, MapPos> = {};
  for (const p of gameConfig.posts) positions[p.number] = { ...p.mapPos };
  for (const [num, pos] of Object.entries(state.mapOverrides)) positions[Number(num)] = pos;

  function moveImage(postNumber: number, pos: MapPos) {
    leaderStore.update((s) => ({
      ...s,
      mapOverrides: { ...s.mapOverrides, [postNumber]: pos },
    }));
  }

  // --- GPS-kart ---
  async function search() {
    setSearching(true);
    setSearchError(null);
    setHits(null);
    try {
      const found = await geocodeAddress(address);
      if (found.length === 0) setSearchError('Fant ikke adressen. Prøv med gatenavn og sted.');
      else if (found.length === 1) applyCenter(found[0].pos);
      else setHits(found);
    } catch {
      setSearchError('Adressesøket feilet (trenger nett). Du kan også dra i kartet og postene manuelt.');
    } finally {
      setSearching(false);
    }
  }

  function applyCenter(pos: GeoPos) {
    setHits(null);
    leaderStore.update((s) => ({ ...s, geoCenter: pos }));
  }

  function scatter() {
    leaderStore.update((s) => ({
      ...s,
      geoOverrides: {
        ...scatterPosts(s.geoCenter ?? DEFAULT_CENTER, s.settings.enabledPosts),
        // behold poster som allerede er plassert manuelt
        ...Object.fromEntries(
          Object.entries(s.geoOverrides ?? {}).filter(([n]) =>
            s.settings.enabledPosts.includes(Number(n)),
          ),
        ),
      },
    }));
  }

  function moveGeo(postNumber: number, pos: GeoPos) {
    leaderStore.update((s) => ({
      ...s,
      geoOverrides: { ...(s.geoOverrides ?? {}), [postNumber]: pos },
    }));
  }

  function resetGeo() {
    leaderStore.update((s) => ({ ...s, geoOverrides: {}, geoCenter: undefined }));
  }

  function resetImageMap() {
    leaderStore.update((s) => ({ ...s, mapOverrides: {} }));
  }

  const enabled = state.settings.enabledPosts;
  const placedCount = enabled.filter((n) => geoOverrides[n]).length;
  const geoPosts = enabled
    .filter((n) => geoOverrides[n])
    .map((n) => {
      const post = gameConfig.posts.find((p) => p.number === n)!;
      return { number: n, symbol: post.symbol, pos: geoOverrides[n] };
    });

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Kartmodus</h2>
        <div className="row">
          <button
            className={`chip chip-btn ${!useGeo ? 'chip-active' : ''}`}
            onClick={() => setUseGeo(false)}
            aria-pressed={!useGeo}
          >
            🖼️ Bildekart
          </button>
          <button
            className={`chip chip-btn ${useGeo ? 'chip-active' : ''}`}
            onClick={() => setUseGeo(true)}
            aria-pressed={useGeo}
          >
            🛰️ GPS-kart
          </button>
        </div>
        <p className="small muted">
          {useGeo
            ? 'Ekte kart med GPS: søk opp adressen, spre postene og dra dem dit de skal. Lagene kan se sin egen posisjon (valgfritt, kun lokalt på telefonen).'
            : 'Eget kartbilde med prosentkoordinater – fungerer helt uten nett og GPS.'}
        </p>
      </div>

      {!useGeo ? (
        <>
          <div className="card stack">
            <div className="row">
              <button
                className={`btn btn-small ${editing ? 'btn-grass' : ''}`}
                onClick={() => setEditing((e) => !e)}
              >
                {editing ? '✅ Ferdig å redigere' : '✏️ Rediger kartet'}
              </button>
              <button
                className="btn btn-small btn-ghost"
                onClick={resetImageMap}
                disabled={Object.keys(state.mapOverrides).length === 0}
              >
                ↩️ Nullstill
              </button>
            </div>
          </div>
          <MapView
            positions={positions}
            visiblePosts={gameConfig.posts.map((p) => p.number)}
            editable={editing}
            onMove={moveImage}
          />
        </>
      ) : (
        <>
          <div className="card stack">
            <label className="small" htmlFor="adresse"><strong>Hvor er festen?</strong></label>
            <div className="row">
              <input
                id="adresse"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Adresse, sted"
              />
              <button className="btn btn-small" onClick={search} disabled={searching || !address.trim()}>
                {searching ? '…' : '🔎 Søk'}
              </button>
            </div>
            {searchError && <p className="small" style={{ color: 'var(--coral-dark)' }}>{searchError}</p>}
            {hits && (
              <div className="stack pop-in">
                {hits.map((h) => (
                  <button key={h.label} className="btn btn-small btn-ghost" onClick={() => applyCenter(h.pos)} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                    📌 {h.label}
                  </button>
                ))}
              </div>
            )}
            <div className="row">
              <button className="btn btn-small btn-sun" onClick={scatter}>
                🎯 Plasser postene rundt sentrum
              </button>
              <button
                className={`btn btn-small ${editing ? 'btn-grass' : ''}`}
                onClick={() => setEditing((e) => !e)}
              >
                {editing ? '✅ Ferdig' : '✏️ Dra poster'}
              </button>
            </div>
            <div className="spread">
              <span className="small muted">{placedCount} av {enabled.length} poster plassert</span>
              <button className="btn btn-small btn-ghost" onClick={resetGeo} disabled={placedCount === 0 && !state.geoCenter}>
                ↩️ Nullstill
              </button>
            </div>
            {placedCount < enabled.length && placedCount > 0 && (
              <p className="small muted">
                Laglenker bruker GPS-kartet først når alle aktive poster er plassert.
              </p>
            )}
          </div>
          <GeoMap
            center={center}
            posts={geoPosts}
            editable={editing}
            onMove={moveGeo}
          />
          <p className="small muted">
            Kartfliser fra Esri/OpenStreetMap (gratis, uten nøkler). Posisjoner lagres lokalt og
            bakes inn i laglenkene.
          </p>
        </>
      )}
    </div>
  );
}
