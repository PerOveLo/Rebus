import { useState } from 'react';
import { leaderStore } from '../../services/storage';
import { CUSTOM_POST_COUNTS, generateFromTemplate, generateWithClaude } from '../../services/rebusBuilder';
import type { RebusAnswers } from '../../types';

const API_KEY_STORAGE = 'skylleviga:anthropic-key';

interface Question {
  key: keyof RebusAnswers;
  label: string;
  placeholder: string;
  multiline?: boolean;
}

const QUESTIONS: Question[] = [
  { key: 'place', label: 'Hvor er festen?', placeholder: 'F.eks. Søm' },
  { key: 'groupName', label: 'Hva kaller dere gjengen?', placeholder: 'F.eks. Familien på Søm' },
  { key: 'people', label: 'Hvem er med? (navn, kommaseparert)', placeholder: 'Per, Kari, Ola …' },
  {
    key: 'funFacts',
    label: 'Fortell noe morsomt om folkene',
    placeholder: 'Per synger alltid i dusjen, Kari vinner alt i kort …',
    multiline: true,
  },
  { key: 'knownFor', label: 'Hva er gjengen kjent for?', placeholder: 'Taco hver fredag, høylytte quizkvelder …', multiline: true },
  { key: 'insideJoke', label: 'En intern vits eller noe alle ler av?', placeholder: 'Den gangen teltet blåste på sjøen …', multiline: true },
  { key: 'food', label: 'Hva spiser eller drikker dere alltid sammen?', placeholder: 'Vafler og kakao' },
  { key: 'placeFact', label: 'Noe spesielt ved stedet?', placeholder: 'Verdens beste badeplass rett nedenfor', multiline: true },
];

const EMPTY: RebusAnswers = {
  place: '', groupName: '', people: '', funFacts: '', knownFor: '', insideJoke: '', food: '', placeFact: '',
};

// «Lag ny rebus»: Skylleviga-rebusen består urørt – her bygger spillleder
// en helt egen rebus for sin egen gjeng, generert fra svarene under.
export function PersonalizeTab() {
  const state = leaderStore.useStore();
  const [answers, setAnswers] = useState<RebusAnswers>(state.rebusAnswers ?? EMPTY);
  const [postCount, setPostCount] = useState(10);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const custom = state.customRebus;
  const isActive = state.settings.activeRebus === 'custom' && custom != null;

  function setField(key: keyof RebusAnswers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  const filled = answers.place.trim() && answers.people.trim();

  async function generate(useAi: boolean) {
    setError(null);
    setBusy(true);
    try {
      if (useAi) localStorage.setItem(API_KEY_STORAGE, apiKey);
      const rebus = useAi
        ? await generateWithClaude(answers, postCount, apiKey.trim())
        : generateFromTemplate(answers, postCount);
      leaderStore.update((s) => ({ ...s, customRebus: rebus, rebusAnswers: answers }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Noe gikk galt. Prøv igjen.');
    } finally {
      setBusy(false);
    }
  }

  function activate() {
    leaderStore.update((s) =>
      s.customRebus
        ? {
            ...s,
            settings: {
              ...s.settings,
              activeRebus: 'custom',
              enabledPosts: s.customRebus.posts.map((p) => p.number),
            },
          }
        : s,
    );
  }

  function deactivate() {
    leaderStore.update((s) => ({
      ...s,
      settings: {
        ...s.settings,
        activeRebus: 'standard',
        enabledPosts: Array.from({ length: 15 }, (_, i) => i + 1),
      },
    }));
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>🪄 Lag ny rebus</h2>
        <p className="small muted">
          Skylleviga-rebusen består som den er. Her lager du en helt egen rebus for din gjeng –
          alle spørsmål og oppgaver skrives ut fra svarene dine. Minispillene er de samme gøyale
          som i originalen, og hver post har voksenbonus der barna dømmer.
        </p>
        {QUESTIONS.map((q) => (
          <div key={q.key} className="stack" style={{ gap: 4 }}>
            <label className="small" htmlFor={`q-${q.key}`}><strong>{q.label}</strong></label>
            {q.multiline ? (
              <textarea
                id={`q-${q.key}`}
                rows={2}
                placeholder={q.placeholder}
                value={answers[q.key]}
                onChange={(e) => setField(q.key, e.target.value)}
              />
            ) : (
              <input
                id={`q-${q.key}`}
                type="text"
                placeholder={q.placeholder}
                value={answers[q.key]}
                onChange={(e) => setField(q.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="row">
          <label className="small" htmlFor="postcount" style={{ whiteSpace: 'nowrap' }}>
            <strong>Antall poster:</strong>
          </label>
          <select
            id="postcount"
            value={postCount}
            onChange={(e) => setPostCount(Number(e.target.value))}
            style={{ width: 90 }}
          >
            {CUSTOM_POST_COUNTS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card stack">
        <h3>🤖 Generer med Claude (anbefalt)</h3>
        <p className="small muted">
          Med en Anthropic API-nøkkel skriver Claude 15–20 skreddersydde spørsmål og oppgaver av
          svarene dine. Nøkkelen lagres kun i denne nettleseren, og kallet går direkte fra
          telefonen til Anthropic. (Skulle et kall avvises, prøves en annen Claude-modell
          automatisk.)
        </p>
        <input
          type="password"
          placeholder="sk-ant-…"
          aria-label="Anthropic API-nøkkel"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />
        <button
          className="btn btn-primary"
          onClick={() => generate(true)}
          disabled={busy || !filled || !apiKey.trim()}
        >
          {busy ? '🪄 Skriver rebusen … (kan ta et minutt)' : '🪄 Generer med Claude'}
        </button>
        <button className="btn btn-ghost btn-small" onClick={() => generate(false)} disabled={busy || !filled}>
          Eller: lag en enkel versjon uten API-nøkkel
        </button>
        {!filled && <p className="small muted">Fyll inn minst sted og hvem som er med.</p>}
        {error && <p className="small" style={{ color: 'var(--coral-dark)' }}>{error}</p>}
      </div>

      {custom && (
        <div className="card stack">
          <div className="spread">
            <h3 style={{ margin: 0 }}>«{custom.name}»</h3>
            {isActive ? <span className="badge">✅ Aktiv</span> : <span className="chip">Klar</span>}
          </div>
          <p className="small" style={{ whiteSpace: 'pre-line' }}>{custom.story}</p>
          <div className="row-wrap">
            {custom.posts.map((p) => (
              <span key={p.number} className="chip" title={p.clue}>
                {p.number}. {p.symbol} {p.title}
              </span>
            ))}
          </div>
          {!isActive ? (
            <button className="btn btn-grass btn-big" onClick={activate}>
              Bruk denne rebusen 🚀
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={deactivate}>
              Bytt tilbake til Skylleviga-rebusen
            </button>
          )}
          <p className="small muted">
            Når rebusen er aktiv, får nye laglenker denne i stedet for Skylleviga-versjonen.
            Plasser postene under 🗺️ Kart (GPS-kartet fungerer perfekt til dette).
          </p>
        </div>
      )}
    </div>
  );
}
