import { useRef, useState } from 'react';
import type { GameProps } from './types';

interface BudgetOption {
  id: string;
  emoji: string;
  label: string;
}

interface BudgetData {
  totalCoins: number;
  options: BudgetOption[];
}

const STEP = 5;

// Øyrådets dom når en post får mest penger.
const VERDICTS: Record<string, string> = {
  trampoline:
    'Øyrådet hopper av glede – bokstavelig talt. Møtet er hevet til noen kommer ned igjen.',
  icecream:
    'Enstemmig vedtatt! Revisor krever to kuler ekstra i styrehonorar, med strøssel.',
  dock:
    'Solid og sjøsprutsikkert! Til og med måkene klapper med vingene. Trillebåren får egen parkeringsplass.',
  toll:
    'Øyrådet er rørt. Byfolkene betaler endelig for seg!',
  sheephotel:
    'Fem stjerner fra samtlige sauer. Frokosten er gress, men utsikten er upåklagelig. Bææ-nk på det!',
  lights:
    'Danmark har sendt takkekort. Naboene har sendt regning på solbriller.',
  bedroom:
    'Jenny har allerede flyttet inn og hengt opp «OPPTATT»-skilt. Øyrådet tør ikke protestere.',
  meetingroom:
    'Revisor har besvimt. Møterommet brukes nå til møter om hvorfor møterommet ble kjøpt.',
};

const FALLBACK_VERDICT =
  'Øyrådet klapper høflig og noterer «spennende prioritering» i protokollen.';

const MEDALS = ['🥇', '🥈', '🥉'];

// Post 9: Fordel 100 øymynter på øyas viktigste (og minst viktige) investeringer.
export function BudgetGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as BudgetData;
  const total = data.totalCoins ?? 100;
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'budget' | 'verdict'>('budget');
  const doneRef = useRef(false);

  const spent = data.options.reduce((sum, o) => sum + (amounts[o.id] ?? 0), 0);
  const remaining = total - spent;

  function change(id: string, delta: number) {
    setAmounts((prev) => {
      const current = prev[id] ?? 0;
      const spentNow = data.options.reduce((sum, o) => sum + (prev[o.id] ?? 0), 0);
      const maxForThis = current + (total - spentNow);
      const next = Math.max(0, Math.min(current + delta, maxForThis));
      return { ...prev, [id]: next };
    });
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    // Budsjettering har ingen fasit – gjennomført budsjett gir full pott.
    onComplete({ score: post.points.main });
  }

  const ranked = data.options
    .map((o) => ({ ...o, amount: amounts[o.id] ?? 0 }))
    .sort((a, b) => b.amount - a.amount);

  if (phase === 'verdict') {
    const winner = ranked[0];
    const tie = ranked.length > 1 && ranked[1].amount === winner.amount;
    const top3 = ranked.filter((r) => r.amount > 0).slice(0, 3);
    return (
      <div className="stack center pop-in">
        <span className="big-emoji floaty" aria-hidden="true">
          {winner.emoji}
        </span>
        <h3>Øyrådets dom</h3>
        <div className="card card-soft">
          <p style={{ margin: 0 }}>
            Mest penger gikk til <strong>{winner.label.toLowerCase()}</strong>.{' '}
            {VERDICTS[winner.id] ?? FALLBACK_VERDICT}
            {tie && ' (Delt førsteplass! Øyrådet krever omkamp i vaffelspising.)'}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 10 }}>Lagets topp 3</h3>
          <div className="stack">
            {top3.map((r, i) => (
              <div className="spread" key={r.id}>
                <span style={{ fontWeight: 700 }}>
                  {MEDALS[i]} {r.emoji} {r.label}
                </span>
                <span className="badge">🪙 {r.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-big" onClick={finish}>
          Budsjettet er vedtatt! ✅
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div
        className="card"
        style={{ position: 'sticky', top: 8, zIndex: 5, padding: '12px 16px' }}
      >
        <div className="spread">
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {remaining === 0 ? '🎉 Alt fordelt!' : `🪙 ${remaining} igjen av ${total}`}
          </span>
          <button
            className="btn btn-ghost btn-small"
            onClick={() => setAmounts({})}
            disabled={spent === 0}
          >
            Nullstill 🧹
          </button>
        </div>
        <div className="progress-track" style={{ marginTop: 8 }} aria-label="Fordelte mynter">
          <div className="progress-fill" style={{ width: `${(spent / total) * 100}%` }} />
        </div>
      </div>

      <p className="small muted" style={{ margin: 0 }}>
        Trykk + og − for å flytte mynter (5 om gangen). Alt må brukes – øyrådet hater
        rester!
      </p>

      <div className="stack">
        {data.options.map((o) => {
          const amount = amounts[o.id] ?? 0;
          return (
            <div className="card" key={o.id} style={{ padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                <span aria-hidden="true">{o.emoji}</span> {o.label}
              </div>
              <div className="row">
                <button
                  className="btn btn-ghost"
                  style={{ width: 52, minHeight: 52, padding: 0, fontSize: '1.5rem', flexShrink: 0 }}
                  onClick={() => change(o.id, -STEP)}
                  disabled={amount === 0}
                  aria-label={`Fem mynter mindre til ${o.label}`}
                >
                  −
                </button>
                <div
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(18, 48, 68, 0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${(amount / total) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--sun), #f0a63a)',
                      transition: 'width 0.25s ease',
                      borderRadius: 12,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                    }}
                  >
                    🪙 {amount}
                  </span>
                </div>
                <button
                  className="btn btn-grass"
                  style={{ width: 52, minHeight: 52, padding: 0, fontSize: '1.5rem', flexShrink: 0 }}
                  onClick={() => change(o.id, STEP)}
                  disabled={remaining === 0}
                  aria-label={`Fem mynter mer til ${o.label}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-primary btn-big"
        onClick={() => setPhase('verdict')}
        disabled={remaining !== 0}
      >
        {remaining === 0
          ? 'Send budsjettet til øyrådet! 📮'
          : `Fordel ${remaining} mynter til…`}
      </button>
    </div>
  );
}
