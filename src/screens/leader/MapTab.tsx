import { useState } from 'react';
import { customMapKey } from '../../config/rebuses';
import { MapView } from '../../components/MapView';
import { GeoMap } from '../../components/GeoMap';
import { leaderBuiltinId, leaderConfig, leaderEnabledPosts, leaderPosts } from '../../services/personalize';
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
// - Bildekart: rebusens eget kartbilde med prosentkoordinater.
// - GPS-kart: ekte kart med GPS-posisjoner, adressesøk og dra-og-slipp.

// Skaler ned og lagre opplastet kartbilde lokalt (maks ~1600px, JPEG).
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function MapTab() {
  const state = leaderStore.useStore();
  const [editing, setEditing] = useState(false);
  const [mapVersion, setMapVersion] = useState(0);
  const [viewCenter, setViewCenter] = useState<GeoPos | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Kart og poster følger rebusen spillleder har valgt.
  const cfg = leaderConfig(state);
  const posts = leaderPosts(state);
  const mapKey = customMapKey(leaderBuiltinId(state));
  // Leses på nytt hver render – setMapVersion tvinger frem oppdatering.
  const customImg = localStorage.getItem(mapKey);
  const hasCustomMap = customImg != null;
  const mapSrc = customImg ?? `${import.meta.env.BASE_URL}${cfg.map.image}`;

  async function uploadMap(file: File | null) {
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      localStorage.setItem(mapKey, dataUrl);
      setMapVersion((v) => v + 1);
    } catch {
      setUploadError('Klarte ikke å lese bildet. Prøv et JPG- eller PNG-bilde.');
    }
  }

  function removeCustomMap() {
    localStorage.removeItem(mapKey);
    setMapVersion((v) => v + 1);
  }
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
  for (const p of posts) positions[p.number] = { ...p.mapPos };
  for (const [num, pos] of Object.entries(state.mapOverrides)) positions[Number(num)] = pos;
  const postSymbols: Record<number, string> = Object.fromEntries(
    posts.map((p) => [p.number, p.symbol]),
  );

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
    // Plasser postene rundt der spillleder faktisk ser på kartet nå.
    leaderStore.update((s) => {
      const c = viewCenter ?? s.geoCenter ?? DEFAULT_CENTER;
      return {
        ...s,
        geoCenter: c,
        geoOverrides: {
          ...scatterPosts(c, leaderEnabledPosts(s)),
          // behold poster som allerede er plassert manuelt
          ...Object.fromEntries(
            Object.entries(s.geoOverrides ?? {}).filter(([n]) =>
              leaderEnabledPosts(s).includes(Number(n)),
            ),
          ),
        },
      };
    });
  }

  function moveGeo(postNumber: number, pos: GeoPos) {
    leaderStore.update((s) => ({
      ...s,
      geoOverrides: { ...(s.geoOverrides ?? {}), [postNumber]: pos },
    }));
  }

  // ✨ Automatisk plassering: når to poster er satt nøyaktig på GPS-kartet,
  // regnes resten ut fra bildekart-posisjonene (skala + rotasjon).
  function autoPlaceRest() {
    const byNumber = new Map(posts.map((p) => [p.number, p.mapPos]));
    // Velg de to plasserte postene som ligger lengst fra hverandre i bildet.
    let a = manuallyPlaced[0];
    let b = manuallyPlaced[1];
    let best = -1;
    for (let i = 0; i < manuallyPlaced.length; i++) {
      for (let j = i + 1; j < manuallyPlaced.length; j++) {
        const pi = byNumber.get(manuallyPlaced[i]);
        const pj = byNumber.get(manuallyPlaced[j]);
        if (!pi || !pj) continue;
        const d = Math.hypot(pj.x - pi.x, pj.y - pi.y);
        if (d > best) {
          best = d;
          a = manuallyPlaced[i];
          b = manuallyPlaced[j];
        }
      }
    }
    const A = byNumber.get(a);
    const B = byNumber.get(b);
    const GA = geoOverrides[a];
    const GB = geoOverrides[b];
    if (!A || !B || !GA || !GB || best < 3) return;

    const mPerLat = 110540;
    const mPerLng = 111320 * Math.cos((GA.lat * Math.PI) / 180);
    // Vektorer i meter (nord-opp): bildets y peker sørover.
    const vGeo = { x: (GB.lng - GA.lng) * mPerLng, y: (GB.lat - GA.lat) * mPerLat };
    const vImg = { x: B.x - A.x, y: -(B.y - A.y) };
    const den = vImg.x * vImg.x + vImg.y * vImg.y;
    if (den < 1e-9) return;
    // Kompleks divisjon gir skala + rotasjon i én operasjon.
    const sRe = (vGeo.x * vImg.x + vGeo.y * vImg.y) / den;
    const sIm = (vGeo.y * vImg.x - vGeo.x * vImg.y) / den;

    const updates: Record<number, GeoPos> = {};
    for (const n of enabled) {
      if (n === a || n === b) continue;
      const P = byNumber.get(n);
      if (!P) continue;
      const w = { x: P.x - A.x, y: -(P.y - A.y) };
      const m = { x: sRe * w.x - sIm * w.y, y: sIm * w.x + sRe * w.y };
      updates[n] = { lat: GA.lat + m.y / mPerLat, lng: GA.lng + m.x / mPerLng };
    }
    leaderStore.update((s) => ({
      ...s,
      geoCenter: { lat: (GA.lat + GB.lat) / 2, lng: (GA.lng + GB.lng) / 2 },
      geoOverrides: { ...(s.geoOverrides ?? {}), ...updates },
    }));
  }

  function resetGeo() {
    leaderStore.update((s) => ({ ...s, geoOverrides: {}, geoCenter: undefined }));
  }

  function resetImageMap() {
    leaderStore.update((s) => ({ ...s, mapOverrides: {} }));
  }

  const enabled = leaderEnabledPosts(state);
  const placedCount = enabled.filter((n) => geoOverrides[n]).length;
  const manuallyPlaced = enabled.filter((n) => geoOverrides[n]);
  const canAutoPlace = manuallyPlaced.length >= 2;
  const geoPosts = enabled
    .filter((n) => geoOverrides[n])
    .map((n) => ({
      number: n,
      symbol: posts.find((p) => p.number === n)?.symbol ?? '📍',
      pos: geoOverrides[n],
    }));

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
        <p className="small" style={{ margin: 0, fontWeight: 700 }}>
          ⚠️ Valget gjelder bare NYE laglenker. Lag som allerede har fått lenke/QR beholder
          kartet sitt – del ut nye lenker etter at du har byttet. (Et lag med GPS-kart kan
          også selv trykke «🛋️ Vanlig modus» for å få bildekartet.)
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
          <div className="card stack">
            <h3>Eget kartbilde</h3>
            <p className="small muted">
              Last opp ditt eget kart, plantegning eller flyfoto (skjermbilde funker fint). Bildet
              lagres kun på denne telefonen – lag som skal se det samme må bruke GPS-kartet,
              eller så legges bildet i <code>public/{cfg.map.image}</code> i repoet.
            </p>
            <input
              type="file"
              accept="image/*"
              aria-label="Last opp kartbilde"
              onChange={(e) => uploadMap(e.target.files?.[0] ?? null)}
            />
            {hasCustomMap && (
              <button className="btn btn-small btn-ghost" onClick={removeCustomMap}>
                🗑️ Fjern eget kartbilde
              </button>
            )}
            {uploadError && <p className="small" style={{ color: 'var(--coral-dark)' }}>{uploadError}</p>}
          </div>
          <MapView
            key={`${mapKey}-${mapVersion}`}
            positions={positions}
            visiblePosts={posts.map((p) => p.number)}
            symbols={postSymbols}
            mapImage={mapSrc}
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
                🎯 Plasser postene her i utsnittet
              </button>
              <button
                className={`btn btn-small ${editing ? 'btn-grass' : ''}`}
                onClick={() => setEditing((e) => !e)}
              >
                {editing ? '✅ Ferdig' : '✏️ Dra poster'}
              </button>
            </div>
            <div className="card card-soft stack" style={{ gap: 6 }}>
              <strong className="small">✨ Slipp å dra alle postene:</strong>
              <p className="small muted" style={{ margin: 0 }}>
                Dra bare TO poster nøyaktig på plass (gjerne den første og den lengst unna) – så
                regner appen ut resten fra posisjonene på bildekartet.
              </p>
              <button className="btn btn-small btn-grass" onClick={autoPlaceRest} disabled={!canAutoPlace}>
                ✨ Plasser resten automatisk ({manuallyPlaced.length}/2 poster satt)
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
          <p className="small muted">
            Panorer/zoom kartet dit festen er, og trykk «Plasser postene her i utsnittet» – så
            havner alle postene midt i det du ser. Dra dem deretter på plass.
          </p>
          <GeoMap
            center={center}
            posts={geoPosts}
            editable={editing}
            onMove={moveGeo}
            onViewChange={setViewCenter}
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
