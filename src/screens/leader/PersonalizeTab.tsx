import { useState } from 'react';
import { builtinRebuses } from '../../config/rebuses';
import { leaderBuiltinId, leaderCustomRebus, leaderPosts, postImageKey } from '../../services/personalize';
import { leaderStore, teamStore } from '../../services/storage';
import { CUSTOM_POST_COUNTS, generateFromTemplate, generateWithClaude } from '../../services/rebusBuilder';
import type { BuiltinRebusId, RebusAnswers } from '../../types';

// Skaler ned og lagre opplastet postbilde lokalt (maks ~1200px, JPEG).
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

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

// Rebus-fanen: velg hvilken rebus festen skal bruke (Skylleviga, Lydias
// bursdag eller en egen generert), og lag nye rebuser med Claude.
export function PersonalizeTab() {
  const state = leaderStore.useStore();
  const [answers, setAnswers] = useState<RebusAnswers>(state.rebusAnswers ?? EMPTY);
  const [postCount, setPostCount] = useState(10);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const custom = state.customRebus;
  const isActive = state.settings.activeRebus === 'custom' && custom != null;
  const activeId = state.settings.activeRebus ?? 'standard';

  // Bytt aktiv rebus: postene følger med, og finalekoden byttes bare hvis
  // spillleder ikke har satt en egen.
  function selectRebus(id: BuiltinRebusId | 'custom') {
    leaderStore.update((s) => {
      if (id === 'custom' && !s.customRebus) return s;
      const posts = id === 'custom' ? s.customRebus!.posts : builtinRebuses[id].posts;
      const defaultCodes = Object.values(builtinRebuses).map((c) => c.defaultFinalCode);
      const finalCode =
        id !== 'custom' && defaultCodes.includes(s.settings.finalCode)
          ? builtinRebuses[id].defaultFinalCode
          : s.settings.finalCode;
      return {
        ...s,
        settings: {
          ...s.settings,
          activeRebus: id,
          finalCode,
          enabledPosts: posts.map((p) => p.number),
        },
      };
    });
    // Rydd bort spillleders eget testlag, så forsiden følger den nye
    // rebusen. Ekte lag røres aldri.
    const t = teamStore.get();
    if (t && t.setup.team.name === 'Testlaget' && t.setup.team.icon === '🧪') {
      teamStore.set(null);
    }
  }

  // Slett den genererte rebusen helt – da kan den ikke lenger havne i
  // nye laglenker ved et uhell. Faller tilbake til Skylleviga.
  function deleteCustom() {
    leaderStore.update((s) => ({
      ...s,
      customRebus: undefined,
      settings:
        s.settings.activeRebus === 'custom'
          ? {
              ...s.settings,
              activeRebus: 'ute',
              enabledPosts: builtinRebuses.ute.posts.map((p) => p.number),
            }
          : s.settings,
    }));
    setConfirmDelete(false);
  }

  function setField(key: keyof RebusAnswers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  const filled = answers.place.trim() && answers.people.trim();

  const builtinChoices = (Object.keys(builtinRebuses) as BuiltinRebusId[])
    .filter((id) => id !== 'standard')
    .map((id) => ({
      id,
      cfg: builtinRebuses[id],
    }));

  // --- Postbilder: eget bilde per post, lagret lokalt på denne telefonen ---
  const [imgVersion, setImgVersion] = useState(0);
  const [imgError, setImgError] = useState<string | null>(null);
  const imageRebusId = leaderCustomRebus(state) ? 'custom' : leaderBuiltinId(state);
  const imagePosts = leaderPosts(state);

  async function uploadPostImage(postNumber: number, file: File | null) {
    if (!file) return;
    setImgError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      localStorage.setItem(postImageKey(imageRebusId, postNumber), dataUrl);
      setImgVersion((v) => v + 1);
    } catch {
      setImgError('Klarte ikke å lagre bildet. Prøv et mindre JPG/PNG-bilde.');
    }
  }

  function removePostImage(postNumber: number) {
    localStorage.removeItem(postImageKey(imageRebusId, postNumber));
    setImgVersion((v) => v + 1);
  }

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

  return (
    <div className="stack">
      <div className="card stack">
        <h2>🎪 Hvilken rebus skal brukes?</h2>
        <p className="small muted">
          Valget bestemmer poster, kart og forside – både for nye laglenker og på denne telefonen.
        </p>
        {builtinChoices.map(({ id, cfg }) => (
          <button
            key={id}
            className={`card card-soft stack ${activeId === id ? 'pop-in' : ''}`}
            onClick={() => selectRebus(id)}
            aria-pressed={activeId === id}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: activeId === id ? '3px solid var(--grass)' : '3px solid transparent',
              gap: 4,
            }}
          >
            <div className="spread">
              <strong>
                {cfg.map.homeEmoji} {cfg.shortName}
              </strong>
              {activeId === id && <span className="badge">✅ Aktiv</span>}
            </div>
            <span className="small muted">
              {cfg.home.title} · {cfg.posts.length} poster
            </span>
          </button>
        ))}
        {custom && (
          <button
            className={`card card-soft stack ${isActive ? 'pop-in' : ''}`}
            onClick={() => selectRebus('custom')}
            aria-pressed={isActive}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: isActive ? '3px solid var(--grass)' : '3px solid transparent',
              gap: 4,
            }}
          >
            <div className="spread">
              <strong>🪄 {custom.name}</strong>
              {isActive && <span className="badge">✅ Aktiv</span>}
            </div>
            <span className="small muted">Egen generert rebus · {custom.posts.length} poster</span>
          </button>
        )}
      </div>

      <div className="card stack">
        <h2>🖼️ Postbilder</h2>
        <p className="small muted">
          Bildene som følger med rebusen vises hos alle lag. Laster du opp et eget bilde her,
          vises det kun på denne telefonen – fint for å endre fortløpende når du selv leder.
        </p>
        {imagePosts.map((p) => {
          const own = imgVersion >= 0 ? localStorage.getItem(postImageKey(imageRebusId, p.number)) : null;
          const src = own ?? (p.image ? `${import.meta.env.BASE_URL}${p.image}` : null);
          return (
            <div key={p.number} className="stack" style={{ gap: 4 }}>
              <div className="row" style={{ alignItems: 'center' }}>
                <span className="small" style={{ flex: 1 }}>
                  <strong>{p.number}.</strong> {p.symbol} {p.title}
                  {own ? ' · eget bilde' : p.image ? ' · innebygd bilde' : ''}
                </span>
                {src && (
                  <img
                    src={src}
                    alt=""
                    style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}
                {own && (
                  <button
                    className="btn btn-small btn-ghost"
                    onClick={() => removePostImage(p.number)}
                    aria-label={`Fjern eget bilde for post ${p.number}`}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                aria-label={`Last opp bilde til post ${p.number}`}
                onChange={(e) => uploadPostImage(p.number, e.target.files?.[0] ?? null)}
              />
            </div>
          );
        })}
        {imgError && <p className="small" style={{ color: 'var(--coral-dark)' }}>{imgError}</p>}
      </div>

      <div className="card stack">
        <h2>🪄 Lag ny rebus</h2>
        <p className="small muted">
          De innebygde rebusene består som de er. Her lager du en helt egen rebus for din gjeng –
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
            <button className="btn btn-grass btn-big" onClick={() => selectRebus('custom')}>
              Bruk denne rebusen 🚀
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => selectRebus('ute')}>
              Bytt tilbake til bursdagsrebusen
            </button>
          )}
          {!confirmDelete ? (
            <button className="btn btn-small btn-ghost" onClick={() => setConfirmDelete(true)}>
              🗑️ Slett denne genererte rebusen …
            </button>
          ) : (
            <div className="row">
              <button className="btn btn-small btn-primary" onClick={deleteCustom}>
                Ja, slett den
              </button>
              <button className="btn btn-small btn-ghost" onClick={() => setConfirmDelete(false)}>
                Avbryt
              </button>
            </div>
          )}
          <p className="small muted">
            Når rebusen er aktiv, får nye laglenker denne i stedet for de innebygde.
            Plasser postene under 🗺️ Kart (GPS-kartet fungerer perfekt til dette).
            Obs: lag som allerede har fått en lenke, beholder rebusen sin – del ut nye lenker
            hvis dere bytter.
          </p>
        </div>
      )}
    </div>
  );
}
