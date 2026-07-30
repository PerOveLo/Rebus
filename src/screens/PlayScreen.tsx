import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findPost, gameConfig, getPost } from '../config/gameConfig';
import { MapView, directionDeg, distanceLabel } from '../components/MapView';
import { teamStore } from '../services/storage';
import { totalScore } from '../services/scoring';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Lagets hovedskjerm: kartet, neste post og fremdrift.
export function PlayScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  const reduced = useReducedMotion();
  const [symbolsOpen, setSymbolsOpen] = useState(false);

  const positions = useMemo(() => {
    const base: Record<number, { x: number; y: number }> = {};
    for (const p of gameConfig.posts) base[p.number] = { ...p.mapPos };
    if (progress?.setup.mapOverrides) {
      for (const [num, pos] of Object.entries(progress.setup.mapOverrides)) {
        base[Number(num)] = pos;
      }
    }
    return base;
  }, [progress?.setup.mapOverrides]);

  const order = progress?.setup.order ?? [];
  const completedCount = order.filter((n) => progress?.results[n]).length;
  const allDone = progress != null && order.length > 0 && completedCount === order.length;

  useEffect(() => {
    if (allDone) navigate('/celebration');
  }, [allDone, navigate]);

  if (!progress) {
    return (
      <div className="screen center stack">
        <p>Ingen aktivt lag på denne telefonen ennå.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  const completed = order.filter((n) => progress.results[n]);
  const safeIndex = Math.min(Math.max(0, progress.currentOrderIndex), order.length - 1);
  const currentNum = order[safeIndex];
  const prevNum = safeIndex > 0 ? order[safeIndex - 1] : undefined;

  const currentPost = currentNum != null ? findPost(currentNum) : undefined;
  if (!currentPost) {
    return (
      <div className="screen center stack">
        <p>Her gikk noe i surr med ruta. Be spillleder om en ny laglenke.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }
  const from = prevNum != null ? positions[prevNum] : positions[currentNum];
  const to = positions[currentNum];
  const deg = directionDeg(from, to);
  const dist = prevNum != null ? distanceLabel(from, to) : gameConfig.map.distanceLabels.short;

  if (allDone) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <div className="row">
          <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{progress.setup.team.icon}</span>
          <strong>{progress.setup.team.name}</strong>
        </div>
        <span className="badge">⭐ {totalScore(progress)}p</span>
      </div>

      <div className="progress-track" aria-label={`${completed.length} av ${order.length} poster fullført`}>
        <div className="progress-fill" style={{ width: `${(completed.length / order.length) * 100}%` }} />
      </div>

      <MapView
        positions={positions}
        visiblePosts={order}
        completedPosts={completed}
        currentPost={currentNum}
        previousPost={prevNum}
        onSelect={(n) => {
          if (n === currentNum) navigate(`/post/${n}`);
        }}
      />

      <div className="card stack">
        <div className="row">
          <span
            aria-hidden="true"
            className={reduced ? '' : 'floaty'}
            style={{
              fontSize: '2rem',
              display: 'inline-block',
              transform: `rotate(${deg + 90}deg)`,
            }}
          >
            ⬆️
          </span>
          <div>
            <h2 style={{ marginBottom: 2 }}>
              Neste: {currentPost.symbol} {currentPost.title}
            </h2>
            <div className="small muted">
              {dist} · Avstander er øy-omtrentlige, ikke målt med Sjur-meteren.
            </div>
          </div>
        </div>
        <p style={{ fontStyle: 'italic' }}>«{currentPost.clue}»</p>
        <button className="btn btn-primary btn-big" onClick={() => navigate(`/post/${currentNum}`)}>
          Vi er fremme! 🏁
        </button>
      </div>

      <button className="btn btn-ghost" onClick={() => setSymbolsOpen((o) => !o)}>
        🎒 Øysymboler ({progress.collectedSymbols.length}/{order.length})
      </button>
      {symbolsOpen && (
        <div className="row-wrap pop-in" style={{ justifyContent: 'center' }}>
          {order.map((n) => {
            const p = getPost(n);
            const has = progress.collectedSymbols.includes(p.islandSymbol.id);
            return (
              <div key={n} className={has ? 'symbol-tile' : 'symbol-tile symbol-locked'} style={{ width: 76 }}>
                <span className="big" aria-hidden="true">{p.islandSymbol.emoji}</span>
                <span>{has ? p.islandSymbol.name : '???'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
