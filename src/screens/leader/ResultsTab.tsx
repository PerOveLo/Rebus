import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../../components/QRScanner';
import { leaderConfig } from '../../services/personalize';
import { leaderStore, uid } from '../../services/storage';
import { decodeResult } from '../../services/share';
import { computeAwards } from '../../services/scoring';
import type { Category, TeamResultPayload } from '../../types';

// Spillleders resultatliste: skann resultat-QR fra lagene, eller legg inn
// poeng manuelt hvis kameraet streiker.
export function ResultsTab() {
  const state = leaderStore.useStore();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualScore, setManualScore] = useState('');

  function addResult(result: TeamResultPayload) {
    // Dedup både på teamId og lagnavn, slik at manuell registrering og
    // QR-skann av samme lag ikke teller dobbelt.
    const name = result.teamName.trim().toLowerCase();
    leaderStore.update((s) => ({
      ...s,
      importedResults: [
        ...s.importedResults.filter(
          (r) => r.teamId !== result.teamId && r.teamName.trim().toLowerCase() !== name,
        ),
        result,
      ],
    }));
  }

  function handleScan(text: string): boolean {
    // QR-en kan inneholde hele lenken eller bare datadelen.
    const data = text.includes('#/') ? text.split('/').pop() ?? text : text;
    const result = decodeResult(data);
    if (result) {
      addResult(result);
      setScanMsg(`✅ ${result.teamName}: ${result.total} poeng registrert!`);
      setScanning(false);
      return true;
    }
    setScanMsg('Fant en QR-kode, men den var ikke et lagresultat. Prøv igjen.');
    return false;
  }

  function addManual() {
    const score = Number(manualScore);
    if (!manualName.trim() || !Number.isFinite(score)) return;
    addResult({
      v: 1,
      kind: 'result',
      teamId: `manual-${uid()}`,
      teamName: manualName.trim(),
      icon: '📝',
      members: [],
      total: Math.max(0, Math.round(score)),
      postsCompleted: 0,
      minutesUsed: null,
      categoryScores: {},
      creations: {},
    });
    setManualName('');
    setManualScore('');
    setManualOpen(false);
  }

  function removeResult(teamId: string) {
    leaderStore.update((s) => ({
      ...s,
      importedResults: s.importedResults.filter((r) => r.teamId !== teamId),
    }));
  }

  // Simuler et ferdig spill: fyller inn morsomme testresultater.
  function simulate() {
    const demo: [string, string, number][] = [
      ['Tunnel-Titanene', '🐑', 1180],
      ['Idas Latterlag', '🧇', 1235],
      ['Byfolk på Prøve', '⛵', 990],
    ];
    demo.forEach(([name, icon, total], i) => {
      const cats: Partial<Record<Category, number>> = {};
      leaderConfig(state).categories.forEach((c, ci) => {
        cats[c] = 100 + ((i * 37 + ci * 53) % 160);
      });
      addResult({
        v: 1,
        kind: 'result',
        teamId: `demo-${i}`,
        teamName: name,
        icon,
        members: [
          { name: 'Testbarn', isAdult: false },
          { name: 'Testvoksen', isAdult: true },
        ],
        total,
        postsCompleted: 15,
        minutesUsed: 65 + i * 7,
        categoryScores: cats,
        creations: {
          startupName: 'SauScan AS',
          startupIdea: 'En droneapp som hjelper trøtte foreldre med å finne sokker.',
          startupSlogan: 'Aldri mer én og én sokk',
          byfolkRule: 'Alle byfolk må hilse på minst tre sauer per dag.',
          passTitle: 'Godkjent tunnelinnvandrer',
        },
      });
    });
  }

  const sorted = [...state.importedResults].sort((a, b) => b.total - a.total);
  const awards = computeAwards(state.importedResults, leaderConfig(state));

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Samle inn resultater</h2>
        {!scanning ? (
          <button className="btn btn-primary" onClick={() => { setScanning(true); setScanMsg(null); }}>
            📷 Skann resultat-QR (åpner kameraet)
          </button>
        ) : (
          <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}
        {scanMsg && <p className="small">{scanMsg}</p>}
        <button className="btn btn-ghost btn-small" onClick={() => setManualOpen((o) => !o)}>
          ✍️ Legg inn manuelt (reserveløsning)
        </button>
        {manualOpen && (
          <div className="stack pop-in">
            <input
              type="text"
              placeholder="Lagnavn"
              aria-label="Lagnavn"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Poengsum (står på lagets skjerm)"
              aria-label="Poengsum"
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn btn-small btn-grass" onClick={addManual} disabled={!manualName.trim() || manualScore === ''}>
              Registrer laget
            </button>
          </div>
        )}
        <button className="btn btn-small btn-sun" onClick={simulate}>
          🧪 Simuler ferdig spill
        </button>
      </div>

      {sorted.length > 0 && (
        <div className="card stack">
          <h2>Resultatliste</h2>
          {sorted.map((r, i) => (
            <div key={r.teamId} className="spread" style={{ borderBottom: '1px solid #eef3f6', paddingBottom: 8 }}>
              <div>
                <strong>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {r.icon} {r.teamName}
                </strong>
                <div className="small muted">
                  {r.total} poeng · {r.postsCompleted > 0 ? `${r.postsCompleted} poster` : 'manuelt registrert'}
                  {r.minutesUsed != null ? ` · ca. ${r.minutesUsed} min` : ''}
                </div>
                {r.creations.startupIdea && (
                  <div className="small muted">🚀 {r.creations.startupName}: {r.creations.startupIdea}</div>
                )}
                {r.creations.byfolkRule && (
                  <div className="small muted">📜 {r.creations.byfolkRule}</div>
                )}
                {r.creations.passTitle && (
                  <div className="small muted">🛂 Øypass: «{r.creations.passTitle}»</div>
                )}
              </div>
              <button className="btn btn-small btn-ghost" onClick={() => removeResult(r.teamId)} aria-label={`Fjern ${r.teamName}`}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {awards.length > 0 && (
        <div className="card stack">
          <h2>🏅 Titler</h2>
          {awards.map((a) => (
            <div key={a.title}>
              <strong>{a.title}</strong>
              <div className="small muted">
                {a.teamNames.join(', ')} · {a.detail}
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-big" onClick={() => navigate('/presentation')}>
            📺 Presentasjonsmodus (for TV)
          </button>
        </div>
      )}

      {sorted.length === 0 && (
        <p className="small muted center">
          Ingen resultater ennå. Når lagene er ferdige, viser de en resultat-QR du kan skanne her.
        </p>
      )}
    </div>
  );
}
