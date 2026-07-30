import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '../components/Confetti';
import { QRView } from '../components/QRView';
import { TeamPass } from '../components/TeamPass';
import { teamStore } from '../services/storage';
import { buildResultPayload, categoryScores, minutesUsed, totalScore } from '../services/scoring';
import { encodePayload } from '../services/share';

// Etter finalen: stemplet øypass, poeng, kategorier og resultat-QR.
export function CelebrationScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  const [showQr, setShowQr] = useState(false);

  const resultData = useMemo(() => {
    if (!progress) return null;
    return encodePayload(buildResultPayload(progress));
  }, [progress]);

  if (!progress) {
    return (
      <div className="screen center stack">
        <p>Ingen resultater her ennå.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  const total = totalScore(progress);
  const cats = Object.entries(categoryScores(progress)).sort((a, b) => b[1] - a[1]);
  const mins = minutesUsed(progress);

  return (
    <div className="screen">
      <Confetti count={80} />
      <h1 className="center pop-in">🎉 Godkjente æresøyboere! 🎉</h1>
      <TeamPass team={progress.setup.team} creations={progress.creations} stamped />

      <div className="card center stack">
        <div style={{ fontSize: '2.6rem', fontWeight: 900 }}>⭐ {total} poeng</div>
        <div className="small muted">
          {Object.keys(progress.results).length} poster fullført
          {mins != null ? ` · ca. ${mins} minutter` : ''}
        </div>
        {cats.length > 0 && (
          <div className="row-wrap" style={{ justifyContent: 'center' }}>
            {cats.slice(0, 3).map(([cat, val], i) => (
              <span key={cat} className="chip">
                {i === 0 ? '🏅 ' : ''}{cat}: {val}
              </span>
            ))}
          </div>
        )}
      </div>

      {progress.creations.startupIdea && (
        <div className="card card-soft small">
          🚀 <strong>{progress.creations.startupName || 'Øybedriften'}:</strong>{' '}
          {progress.creations.startupIdea}
          {progress.creations.startupSlogan && <> – «{progress.creations.startupSlogan}»</>}
        </div>
      )}
      {progress.creations.byfolkRule && (
        <div className="card card-soft small">
          📜 <strong>Lagets byfolkregel:</strong> {progress.creations.byfolkRule}
        </div>
      )}

      <div className="card stack center">
        <h2>Vis resultatet til spillleder</h2>
        {showQr && resultData ? (
          <>
            <QRView text={resultData} label="Spillleder skanner denne" />
            <p className="small muted">
              Funker ikke skanningen? Vis bare poengsummen øverst – spillleder kan taste den inn
              manuelt.
            </p>
          </>
        ) : (
          <button className="btn btn-primary btn-big" onClick={() => setShowQr(true)}>
            Vis resultat-QR 📱
          </button>
        )}
      </div>

      <button className="btn btn-ghost" onClick={() => navigate('/')}>Til forsiden</button>
    </div>
  );
}
