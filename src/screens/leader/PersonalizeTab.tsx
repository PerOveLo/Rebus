import { useState } from 'react';
import { leaderStore } from '../../services/storage';
import { personalizeConfig } from '../../services/personalize';
import type { PersonalProfile } from '../../types';

interface Question {
  key: keyof PersonalProfile;
  label: string;
  placeholder: string;
  hint?: string;
}

const QUESTIONS: Question[] = [
  { key: 'placeName', label: 'Hva heter stedet der festen er?', placeholder: 'Skylleviga' },
  { key: 'islandName', label: 'Hva heter øya eller bygda?', placeholder: 'Flekkerøya' },
  {
    key: 'hostTall',
    label: 'Hvem er den (nesten) to meter høye sjefen?',
    placeholder: 'Sjur',
    hint: 'Blir helten i Sjur-meteren og Sjefens innboks.',
  },
  {
    key: 'hostLaugh',
    label: 'Hvem har den mest smittende latteren?',
    placeholder: 'Ida',
    hint: 'Blir stjernen i Latterlaboratoriet.',
  },
  { key: 'mathWhiz', label: 'Hvem er mattegeniet?', placeholder: 'Emil' },
  { key: 'rescuer', label: 'Hvem elsker redningsoppdrag?', placeholder: 'Isak' },
  { key: 'sleeper', label: 'Hvem er sovemesteren?', placeholder: 'Jenny' },
];

// «Lag din egen rebus»: svar på noen spørsmål, så skrives hele
// historien og alle postene om med deres egne navn og steder.
export function PersonalizeTab() {
  const state = leaderStore.useStore();
  const [draft, setDraft] = useState<PersonalProfile>(state.settings.personal ?? {});
  const [saved, setSaved] = useState(false);

  function setField(key: keyof PersonalProfile, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function apply() {
    const cleaned: PersonalProfile = {};
    for (const [k, v] of Object.entries(draft)) {
      if (typeof v === 'string' && v.trim()) cleaned[k as keyof PersonalProfile] = v.trim();
    }
    leaderStore.update((s) => ({
      ...s,
      settings: {
        ...s.settings,
        personal: Object.keys(cleaned).length > 0 ? cleaned : undefined,
      },
    }));
    setSaved(true);
  }

  function reset() {
    setDraft({});
    leaderStore.update((s) => ({
      ...s,
      settings: { ...s.settings, personal: undefined },
    }));
    setSaved(true);
  }

  const preview = personalizeConfig(
    Object.fromEntries(
      Object.entries(draft).filter(([, v]) => typeof v === 'string' && v.trim()),
    ) as PersonalProfile,
  );

  return (
    <div className="stack">
      <div className="card stack">
        <h2>✨ Lag deres egen rebus</h2>
        <p className="small muted">
          Standardspillet handler om familien i Skylleviga. Svar på spørsmålene under, så
          skrives historien, postene og alle vitsene om med deres egne navn og steder. Tomme
          felt beholder originalen.
        </p>
        {QUESTIONS.map((q) => (
          <div key={q.key} className="stack" style={{ gap: 4 }}>
            <label className="small" htmlFor={`q-${q.key}`}>
              <strong>{q.label}</strong>
            </label>
            <input
              id={`q-${q.key}`}
              type="text"
              maxLength={30}
              placeholder={q.placeholder}
              value={draft[q.key] ?? ''}
              onChange={(e) => setField(q.key, e.target.value)}
            />
            {q.hint && <span className="small muted">{q.hint}</span>}
          </div>
        ))}
        <div className="row">
          <button className="btn btn-primary" onClick={apply}>
            {saved ? '✅ Lagret' : 'Bruk tilpasningen'}
          </button>
          <button className="btn btn-ghost btn-small" onClick={reset}>
            Tilbake til originalen
          </button>
        </div>
        <p className="small muted">
          Tilpasningen følger med i laglenkene, så alle telefoner får samme historie.
        </p>
      </div>

      <div className="card card-soft stack">
        <h3>Forhåndsvisning</h3>
        <p className="small" style={{ whiteSpace: 'pre-line' }}>
          {preview.intro.story}
        </p>
        <div className="row-wrap">
          {preview.posts.slice(0, 6).map((p) => (
            <span key={p.number} className="chip">
              {p.symbol} {p.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
