import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameConfig } from '../../config/gameConfig';
import { defaultLeaderState, leaderStore, teamStore, uid } from '../../services/storage';
import type { LeaderState, TeamLinkPayload } from '../../types';

export function SettingsTab() {
  const state = leaderStore.useStore();
  const navigate = useNavigate();
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonMsg, setJsonMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function setSetting<K extends keyof LeaderState['settings']>(key: K, value: LeaderState['settings'][K]) {
    leaderStore.update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  }

  function togglePost(num: number) {
    if (num === 15) return; // finalen er alltid med
    leaderStore.update((s) => {
      const on = s.settings.enabledPosts.includes(num);
      const enabledPosts = on
        ? s.settings.enabledPosts.filter((n) => n !== num)
        : [...s.settings.enabledPosts, num].sort((a, b) => a - b);
      return { ...s, settings: { ...s.settings, enabledPosts } };
    });
  }

  function applyShortGame() {
    setSetting('enabledPosts', [...gameConfig.shortGamePosts]);
  }

  function applyFullGame() {
    setSetting('enabledPosts', gameConfig.posts.map((p) => p.number));
  }

  // Lag et testlag på denne telefonen og hopp rett til valgt post.
  function testPost(num: number) {
    const payload: TeamLinkPayload = {
      v: 1,
      kind: 'team',
      eventName: gameConfig.eventName,
      team: {
        id: uid(),
        name: 'Testlaget',
        icon: '🧪',
        members: [{ id: uid(), name: 'Spillleder', isAdult: true }],
      },
      order: [...state.settings.enabledPosts],
      finalCode: state.settings.finalCode,
      mapOverrides: Object.keys(state.mapOverrides).length > 0 ? state.mapOverrides : undefined,
    };
    teamStore.set({
      setup: payload,
      startedAt: Date.now(),
      finishedAt: null,
      safetyConfirmed: true,
      currentOrderIndex: Math.max(0, payload.order.indexOf(num)),
      results: {},
      collectedSymbols: [],
      creations: {},
    });
    navigate(`/post/${num}`);
  }

  function exportJson() {
    setJsonText(JSON.stringify(state, null, 2));
    setShowJson(true);
    setJsonMsg('Kopier teksten under og ta vare på den.');
  }

  function importJson() {
    try {
      const parsed = JSON.parse(jsonText) as LeaderState;
      if (!parsed.settings || !Array.isArray(parsed.participants)) throw new Error('ugyldig');
      leaderStore.set({ ...defaultLeaderState(), ...parsed, settings: { ...defaultLeaderState().settings, ...parsed.settings } });
      setJsonMsg('✅ Oppsettet er lastet inn!');
    } catch {
      setJsonMsg('Det der lignet ikke på et gyldig oppsett. Sjekk teksten og prøv igjen.');
    }
  }

  function resetAll() {
    leaderStore.reset();
    teamStore.set(null);
    setConfirmReset(false);
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Koder</h2>
        <label className="small" htmlFor="finalcode"><strong>Finalekode (4 siffer)</strong></label>
        <input
          id="finalcode"
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={state.settings.finalCode}
          onChange={(e) => setSetting('finalCode', e.target.value.replace(/\D/g, ''))}
        />
        <label className="small" htmlFor="leaderpin"><strong>Spilllederkode (4 siffer)</strong></label>
        <input
          id="leaderpin"
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={state.settings.pin}
          onChange={(e) => setSetting('pin', e.target.value.replace(/\D/g, ''))}
        />
        <p className="small muted">Kodene lagres bare lokalt på denne telefonen.</p>
      </div>

      <div className="card stack">
        <h2>Poster</h2>
        <div className="row">
          <button className="btn btn-small btn-sun" onClick={applyShortGame}>
            ⏱️ Kort spill ({gameConfig.shortGamePosts.length} poster)
          </button>
          <button className="btn btn-small btn-ghost" onClick={applyFullGame}>
            Alle 15
          </button>
        </div>
        <div className="row-wrap">
          {gameConfig.posts.map((p) => {
            const on = state.settings.enabledPosts.includes(p.number);
            return (
              <button
                key={p.number}
                className={`chip chip-btn ${on ? 'chip-active' : ''}`}
                onClick={() => togglePost(p.number)}
                aria-pressed={on}
                disabled={p.number === 15}
                title={p.title}
              >
                {p.number} {p.symbol}
              </button>
            );
          })}
        </div>
        <label className="row" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.settings.rotateStarts}
            onChange={(e) => setSetting('rotateStarts', e.target.checked)}
            style={{ width: 24, height: 24, accentColor: 'var(--grass)' }}
          />
          <span>Lagene starter på forskjellige poster (unngår kø)</span>
        </label>
      </div>

      <div className="card stack">
        <h2>🧪 Test en post</h2>
        <p className="small muted">
          Lager et testlag på denne telefonen og hopper rett til posten. (Overskriver eventuelt
          aktivt lag på telefonen.)
        </p>
        <div className="row-wrap">
          {state.settings.enabledPosts.map((n) => (
            <button key={n} className="chip chip-btn" onClick={() => testPost(n)}>
              Post {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h2>Oppsett som JSON</h2>
        <div className="row">
          <button className="btn btn-small" onClick={exportJson}>
            ⬆️ Eksporter
          </button>
          <button className="btn btn-small btn-ghost" onClick={() => { setShowJson(true); setJsonText(''); setJsonMsg('Lim inn oppsettet under og trykk importer.'); }}>
            ⬇️ Importer
          </button>
        </div>
        {showJson && (
          <>
            {jsonMsg && <p className="small muted">{jsonMsg}</p>}
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              aria-label="Oppsett som JSON"
              style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
            <button className="btn btn-small btn-grass" onClick={importJson}>
              Importer denne teksten
            </button>
          </>
        )}
      </div>

      <div className="card stack">
        <h2>Nullstill</h2>
        {!confirmReset ? (
          <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
            🧨 Tilbakestill hele spillet …
          </button>
        ) : (
          <>
            <p className="small">
              Dette sletter deltakere, lag, resultater og fremdrift på denne telefonen. Sikker?
            </p>
            <div className="row">
              <button className="btn btn-primary" onClick={resetAll}>
                Ja, nullstill alt
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Avbryt
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
