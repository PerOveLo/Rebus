import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface InboxCase {
  id: string;
  emoji: string;
  text: string;
  urgent: boolean;
}

interface InboxData {
  pickCount: number;
  cases: InboxCase[];
}

// Morsomme, men fornuftige begrunnelser per sak. Alle er «gode nok» –
// laget får poeng for å begrunne, ikke for å treffe en fasit.
const REASONS: Record<string, string[]> = {
  sheep: [
    'Ingen kommer på jobb – og sauene betaler ikke bompenger.',
    'Trafikk-kaos OG ull i ventilasjonen. Dette haster.',
    'Dårlig for trafikken, verre for sauene. Ut med dem!',
  ],
  coffee: [
    'Uten kaffe stopper de voksne helt opp.',
    'Kakao er kos, men konsernet går på koffein.',
    'Vi frykter mytteri i tredje etasje før lunsj.',
  ],
  customer: [
    'Kunden betaler lønna vår – vi svarer i forgårs.',
    'Sinte kunder blir bare sintere av å vente.',
    'Ett hyggelig svar nå sparer ti sure e-poster senere.',
  ],
  ida: [
    'Latteren smitter – snart ler hele konsernet.',
    'Møtet må reddes. Men først: hva var så morsomt?',
    'Vi gir Ida en pute å le i. Problem løst.',
  ],
  cable: [
    'Uten strøm, ingen skjermer. Uten skjermer, panikk.',
    'Én ledning stopper alt? Da henter vi den NÅ.',
    'Vi låner naboens ledning før noen merker noe.',
  ],
  jenny: [
    'Ingen kommer inn eller ut før Jenny våkner.',
    'Hun trenger søvnen – men vi trenger kortet mer.',
    'Vi løfter kortet fooorsiktig. Ingen vekker Jenny.',
  ],
  investor: [
    'Penger nå! Sauene trenger jo et sted å bo.',
    'Sier vi nei, bygger naboøya sauehotell først.',
    'Et sauehotell løser faktisk også tunnelproblemet.',
  ],
};

const FALLBACK_REASONS = [
  'Magefølelsen sa at dette var viktigst.',
  'Noen måtte gjøre noe – og det ble oss.',
  'Det så mest brannfarlig ut av alt.',
];

// Post 11: Sjefen er borte – velg 3 saker fra innboksen og begrunn valgene.
export function InboxGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as InboxData;
  const reduced = useReducedMotion();

  const cases = data.cases ?? [];
  const pickCount = data.pickCount ?? 3;

  const [phase, setPhase] = useState<'pick' | 'reason' | 'summary' | 'done'>('pick');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reasonIdx, setReasonIdx] = useState(0);
  const [chosenReasons, setChosenReasons] = useState<Record<string, string>>({});
  const [tappedReason, setTappedReason] = useState<string | null>(null);

  const doneRef = useRef(false);
  const advanceRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCases = selectedIds
    .map((id) => cases.find((c) => c.id === id))
    .filter((c): c is InboxCase => Boolean(c));

  const urgentCount = selectedCases.filter((c) => c.urgent).length;
  const verdict =
    urgentCount >= 2
      ? { emoji: '🏆', text: 'Imponerende prioritering! Konsernet reddet.', score: 60 }
      : urgentCount === 1
        ? { emoji: '👏', text: 'Godt jobbet – kaffen ble riktignok kakao.', score: 55 }
        : { emoji: '🔥', text: 'Alle de viktige tingene brant, men stemningen er god!', score: 45 };
  const score = Math.min(post.points.main, verdict.score);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(() => onComplete({ score }), 1900);
      return () => clearTimeout(t);
    }
  }, [phase, score, onComplete]);

  function toggleCase(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= pickCount) return prev;
      return [...prev, id];
    });
  }

  function pickReason(caseId: string, reason: string) {
    if (advanceRef.current) return;
    advanceRef.current = true;
    setTappedReason(reason);
    setChosenReasons((prev) => ({ ...prev, [caseId]: reason }));
    timerRef.current = setTimeout(() => {
      advanceRef.current = false;
      setTappedReason(null);
      setReasonIdx((i) => {
        if (i + 1 >= selectedCases.length) {
          setPhase('summary');
          return i;
        }
        return i + 1;
      });
    }, reduced ? 200 : 550);
  }

  function restart() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSelectedIds([]);
    setChosenReasons({});
    setReasonIdx(0);
    setTappedReason(null);
    advanceRef.current = false;
    setPhase('pick');
  }

  // ---------------------------------------------------------- velg saker
  if (phase === 'pick') {
    return (
      <div className="stack">
        <div className="card card-soft center">
          <span className={`big-emoji${reduced ? '' : ' floaty'}`} aria-hidden="true">
            💼
          </span>
          <p className="small" style={{ marginBottom: 0 }}>
            Sjefen er ute! Dere rekker bare <strong>{pickCount}</strong> saker.
            Hvilke tar dere?
          </p>
        </div>
        <div className="spread">
          <span className="badge">📥 Innboks ({cases.length})</span>
          <span className="chip">
            {selectedIds.length} av {pickCount} valgt
          </span>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {cases.map((c) => {
            const chosen = selectedIds.includes(c.id);
            const full = !chosen && selectedIds.length >= pickCount;
            return (
              <button
                key={c.id}
                className={`option-btn${chosen ? ' option-selected' : ''}`}
                onClick={() => toggleCase(c.id)}
                aria-pressed={chosen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  width: '100%',
                  opacity: full ? 0.55 : 1,
                }}
              >
                <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
                  {c.emoji}
                </span>
                <span style={{ flex: 1 }}>{c.text}</span>
                <span aria-hidden="true">{chosen ? '✅' : '📩'}</span>
              </button>
            );
          })}
        </div>
        <button
          className="btn btn-primary btn-big"
          disabled={selectedIds.length !== pickCount}
          onClick={() => {
            setReasonIdx(0);
            setPhase('reason');
          }}
        >
          {selectedIds.length === pickCount
            ? 'Fiks disse! 🚀'
            : `Velg ${pickCount - selectedIds.length} til …`}
        </button>
      </div>
    );
  }

  // ------------------------------------------------------ begrunn valgene
  if (phase === 'reason') {
    const current = selectedCases[reasonIdx];
    if (!current) {
      // Skal ikke skje, men spillet skal aldri kjøre seg fast.
      return (
        <div className="stack center">
          <p className="muted">Oi, papirene blåste på sjøen. Vi tar det fra toppen!</p>
          <button className="btn btn-primary btn-big" onClick={restart}>
            Tilbake til innboksen 📥
          </button>
        </div>
      );
    }
    const options = REASONS[current.id] ?? FALLBACK_REASONS;
    return (
      <div className="stack">
        <div className="spread">
          <span className="chip">
            Sak {reasonIdx + 1} av {selectedCases.length}
          </span>
          <button className="btn btn-ghost btn-small" onClick={restart}>
            Ombestem dere 🔁
          </button>
        </div>
        <div className="card center">
          <span className="big-emoji" aria-hidden="true">
            {current.emoji}
          </span>
          <h3 style={{ marginTop: 6 }}>{current.text}</h3>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Hvorfor tar dere denne? (Alle svar kan forsvares i et møte.)
          </p>
        </div>
        <div className="option-grid option-grid-1">
          {options.map((r) => (
            <button
              key={r}
              className={`option-btn${tappedReason === r ? ' option-correct pop-in' : ''}`}
              onClick={() => pickReason(current.id, r)}
              style={{ textAlign: 'left' }}
            >
              💬 {r}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------- oppsummering
  if (phase === 'summary') {
    return (
      <div className="stack">
        <div className="card card-soft center">
          <span className="big-emoji" aria-hidden="true">📋</span>
          <p className="small" style={{ marginBottom: 0 }}>
            Handlingsplanen er klar. Les den høyt med sjefsstemme!
          </p>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {selectedCases.map((c) => (
            <div key={c.id} className="card" style={{ padding: 14 }}>
              <div className="row">
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                  {c.emoji}
                </span>
                <strong>{c.text}</strong>
              </div>
              <p className="muted small" style={{ margin: '6px 0 0' }}>
                💬 {chosenReasons[c.id] ?? 'Fordi det var lurt.'}
              </p>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('done')}>
          Sjefen er tilbake! 👔
        </button>
        <button className="btn btn-ghost" onClick={restart}>
          Nei vent, ombestem alt 🔁
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- dommen
  return (
    <div className="stack center pop-in">
      <span className={`big-emoji${reduced ? '' : ' wiggle'}`} aria-hidden="true">
        {verdict.emoji}
      </span>
      <h3>Sjefen er tilbake!</h3>
      <p>{verdict.text}</p>
      <p className="muted small">
        Sjefen nikker anerkjennende og later som om ingenting har skjedd.
      </p>
    </div>
  );
}
