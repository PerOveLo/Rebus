import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidCode } from '../../config/gameConfig';
import { builtinRebus } from '../../config/rebuses';
import { leaderConfig, leaderCustomRebus, leaderPosts } from '../../services/personalize';
import { defaultLeaderState, leaderStore, teamStore, uid } from '../../services/storage';
import type { LeaderState, TeamLinkPayload } from '../../types';

export function SettingsTab() {
  const state = leaderStore.useStore();
  const navigate = useNavigate();
  // Poster og korte spill følger rebusen som er valgt under 🎪 Rebus.
  const cfg = leaderConfig(state);
  const posts = leaderPosts(state);
  const isCustom = leaderCustomRebus(state) != null;
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonMsg, setJsonMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  // Kodene holdes i lokale utkast og lagres først når de er komplette
  // (4 siffer) – ellers kan en halvskrevet PIN låse spillleder ute.
  const [finalDraft, setFinalDraft] = useState(state.settings.finalCode);
  const [pinDraft, setPinDraft] = useState(state.settings.pin);

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
    setSetting('enabledPosts', [...cfg.shortGamePosts]);
  }

  function applyFullGame() {
    setSetting('enabledPosts', posts.map((p) => p.number));
  }

  // Lag et testlag på denne telefonen og hopp rett til valgt post.
  function testPost(num: number) {
    const custom = leaderCustomRebus(state);
    const payload: TeamLinkPayload = {
      v: 1,
      kind: 'team',
      eventName: custom?.name ?? cfg.eventName,
      team: {
        id: uid(),
        name: 'Testlaget',
        icon: '🧪',
        members: [{ id: uid(), name: 'Spillleder', isAdult: true }],
      },
      order: [...state.settings.enabledPosts],
      finalCode: isValidCode(state.settings.finalCode)
        ? state.settings.finalCode
        : cfg.defaultFinalCode,
      custom,
      builtin: !custom && cfg.id !== 'standard' ? cfg.id : undefined,
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
      const defaults = defaultLeaderState();
      const merged = { ...defaults, ...parsed, settings: { ...defaults.settings, ...parsed.settings } };
      // Saner ugyldige verdier så importen aldri kan gi hvit skjerm.
      if (
        merged.settings.activeRebus != null &&
        !(merged.settings.activeRebus === 'custom'
          ? merged.customRebus != null
          : builtinRebus(merged.settings.activeRebus).id === merged.settings.activeRebus)
      ) {
        merged.settings.activeRebus = 'standard';
      }
      const importedPosts =
        merged.settings.activeRebus === 'custom' && merged.customRebus
          ? merged.customRebus.posts
          : builtinRebus(merged.settings.activeRebus).posts;
      const validNumbers = new Set(importedPosts.map((p) => p.number));
      const enabled = Array.isArray(merged.settings.enabledPosts)
        ? merged.settings.enabledPosts.filter((n): n is number => typeof n === 'number' && validNumbers.has(n))
        : defaults.settings.enabledPosts;
      merged.settings.enabledPosts = (enabled.includes(15) ? enabled : [...enabled, 15]).sort((a, b) => a - b);
      if (!isValidCode(merged.settings.finalCode)) merged.settings.finalCode = defaults.settings.finalCode;
      if (!isValidCode(merged.settings.pin)) merged.settings.pin = defaults.settings.pin;
      leaderStore.set(merged);
      setFinalDraft(merged.settings.finalCode);
      setPinDraft(merged.settings.pin);
      setJsonMsg('✅ Oppsettet er lastet inn!');
    } catch {
      setJsonMsg('Det der lignet ikke på et gyldig oppsett. Sjekk teksten og prøv igjen.');
    }
  }

  function resetAll() {
    leaderStore.reset();
    teamStore.set(null);
    const defaults = defaultLeaderState();
    setFinalDraft(defaults.settings.finalCode);
    setPinDraft(defaults.settings.pin);
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
          value={finalDraft}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            setFinalDraft(v);
            if (v.length === 4) setSetting('finalCode', v);
          }}
        />
        <label className="small" htmlFor="leaderpin"><strong>Spilllederkode (4 siffer)</strong></label>
        <input
          id="leaderpin"
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={pinDraft}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            setPinDraft(v);
            if (v.length === 4) setSetting('pin', v);
          }}
        />
        <p className="small muted">
          Kodene lagres når alle fire sifrene er tastet – og bare lokalt på denne telefonen.
        </p>
      </div>

      <div className="card stack">
        <h2>Poster</h2>
        <div className="row">
          {!isCustom && (
            <button className="btn btn-small btn-sun" onClick={applyShortGame}>
              ⏱️ Kort spill ({cfg.shortGamePosts.length} poster)
            </button>
          )}
          <button className="btn btn-small btn-ghost" onClick={applyFullGame}>
            Alle {posts.length}
          </button>
        </div>
        <div className="row-wrap">
          {posts.map((p) => {
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
