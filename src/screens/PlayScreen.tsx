import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { builtinRebuses } from '../config/rebuses';
import { activeConfig, activeCustomRebus, activePosts, findActivePost, getActivePost } from '../services/personalize';
import { MapView, directionDeg, distanceLabel } from '../components/MapView';
import { GeoMap } from '../components/GeoMap';
import { teamStore } from '../services/storage';
import { shortUrlFromSetup, teamLinkUrl } from '../services/share';
import { QRView } from '../components/QRView';
import { totalScore } from '../services/scoring';
import {
  ARRIVAL_RADIUS_M,
  DEFAULT_CENTER,
  bearingDeg,
  compassLabel,
  haversineMeters,
  metersLabel,
} from '../services/geo';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GeoPos } from '../types';

// Lagets hovedskjerm: kartet, neste post og fremdrift.
// Bruker GPS-kart når laglenken inneholder ekte posisjoner, ellers bildekartet.
export function PlayScreen() {
  const navigate = useNavigate();
  const progress = teamStore.useStore();
  const reduced = useReducedMotion();
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [userPos, setUserPos] = useState<GeoPos | null>(null);
  const [gpsOn, setGpsOn] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const positions = useMemo(() => {
    const base: Record<number, { x: number; y: number }> = {};
    for (const p of activePosts()) base[p.number] = { ...p.mapPos };
    if (progress?.setup.mapOverrides) {
      for (const [num, pos] of Object.entries(progress.setup.mapOverrides)) {
        base[Number(num)] = pos;
      }
    }
    return base;
  }, [progress?.setup.mapOverrides, progress?.setup.custom, progress?.setup.builtin]);

  const postSymbols = useMemo(() => {
    const map: Record<number, string> = {};
    for (const p of activePosts()) map[p.number] = p.symbol;
    return map;
  }, [progress?.setup.custom, progress?.setup.builtin]);

  const order = progress?.setup.order ?? [];
  const completedCount = order.filter((n) => progress?.results[n]).length;
  const allDone = progress != null && order.length > 0 && completedCount === order.length;

  useEffect(() => {
    if (allDone) navigate('/celebration');
  }, [allDone, navigate]);

  // GPS er alltid valgfritt og kun lokalt. Rydd opp ved unmount.
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation?.clearWatch(watchIdRef.current);
    };
  }, []);

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

  const currentPost = currentNum != null ? findActivePost(currentNum) : undefined;
  if (!currentPost) {
    return (
      <div className="screen center stack">
        <p>Her gikk noe i surr med ruta. Be spillleder om en ny laglenke.</p>
        <button className="btn" onClick={() => navigate('/')}>Til forsiden</button>
      </div>
    );
  }

  if (allDone) return null;

  const geo = progress.setup.geo;
  const geoAvailable = geo != null && geo[currentNum] != null;
  const classic = progress.preferClassicMap ?? false;
  const geoMode = geoAvailable && !classic;

  function stopGpsWatch() {
    if (watchIdRef.current != null) navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setGpsOn(false);
    setUserPos(null);
  }

  // Bytt mellom GPS-kart og vanlig modus (test innendørs uten å gå ruta).
  function toggleClassic() {
    if (!classic) stopGpsWatch();
    setGpsError(null);
    teamStore.update((p) => (p ? { ...p, preferClassicMap: !classic } : p));
  }

  function toggleGps() {
    if (gpsOn) {
      stopGpsWatch();
      return;
    }
    if (!('geolocation' in navigator)) {
      setGpsError('Denne telefonen har ikke GPS tilgjengelig i nettleseren.');
      return;
    }
    setGpsError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setGpsOn(true);
        setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        setGpsError('Fikk ikke posisjon. Dere klarer dere fint med kartet!');
        setGpsOn(false);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
  }

  // Underveis-spill på vei mot neste post (spilles én gang).
  const roadGameNumber = progress.setup.roadGames?.[currentNum];
  const roadGamePost =
    roadGameNumber != null && progress.roadResults?.[currentNum] == null
      ? builtinRebuses.lydia.posts.find((p) => p.number === roadGameNumber)
      : undefined;

  // Retning og avstand
  let distanceText: string;
  let arrow: { deg: number; label: string } | null = null;
  let arrived = false;

  if (geoMode && geo) {
    const target = geo[currentNum];
    const from = userPos ?? (prevNum != null ? geo[prevNum] : null);
    if (from) {
      const meters = haversineMeters(from, target);
      const bearing = bearingDeg(from, target);
      distanceText = `${metersLabel(meters)} mot ${compassLabel(bearing)}`;
      arrow = { deg: bearing, label: compassLabel(bearing) };
      arrived = userPos != null && haversineMeters(userPos, target) <= ARRIVAL_RADIUS_M;
    } else {
      distanceText = 'Følg kartet til første post';
    }
  } else {
    const from = prevNum != null ? positions[prevNum] : positions[currentNum];
    const to = positions[currentNum];
    const mapCfg = activeConfig().map;
    // Egen generert rebus skal ikke arve Skylleviga-vitsene.
    const joke = activeCustomRebus()
      ? 'Avstander er hjemmelagde og omtrentlige.'
      : mapCfg.distanceJoke;
    distanceText = `${prevNum != null ? distanceLabel(from, to) : mapCfg.distanceLabels.short} · ${joke}`;
    arrow = { deg: directionDeg(from, to) + 90, label: '' };
  }

  const geoPosts = geoMode && geo
    ? order
        .filter((n) => geo[n])
        .map((n) => {
          const p = getActivePost(n);
          return {
            number: n,
            symbol: p.symbol,
            pos: geo[n],
            done: completed.includes(n),
            isNext: n === currentNum,
          };
        })
    : [];

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

      {geoMode && geo ? (
        <>
          <GeoMap
            center={progress.setup.center ?? geo[currentNum] ?? DEFAULT_CENTER}
            posts={geoPosts}
            userPos={userPos}
            routeFrom={userPos ?? (prevNum != null ? geo[prevNum] : null)}
            onSelect={(n) => {
              if (n === currentNum) navigate(`/post/${n}`);
            }}
          />
          <div className="row">
            <button className={`btn btn-small ${gpsOn ? 'btn-grass' : 'btn-ghost'}`} onClick={toggleGps} style={{ flex: 1 }}>
              {gpsOn ? '📍 GPS på (kun lokalt)' : '📍 Vis hvor vi er (GPS, valgfritt)'}
            </button>
            <button className="btn btn-small btn-ghost" onClick={toggleClassic}>
              🛋️ Vanlig modus
            </button>
          </div>
          {gpsError && <p className="small muted center">{gpsError}</p>}
        </>
      ) : (
        <>
          <MapView
            positions={positions}
            visiblePosts={order}
            completedPosts={completed}
            currentPost={currentNum}
            previousPost={prevNum}
            symbols={postSymbols}
            onSelect={(n) => {
              if (n === currentNum) navigate(`/post/${n}`);
            }}
          />
          {geoAvailable && (
            <button className="btn btn-small btn-ghost" onClick={toggleClassic}>
              🛰️ Tilbake til GPS-kartet
            </button>
          )}
        </>
      )}

      <div className="card stack">
        <div className="row">
          {arrow && (
            <span
              aria-hidden="true"
              className={reduced ? '' : 'floaty'}
              style={{
                fontSize: '2rem',
                display: 'inline-block',
                transform: `rotate(${arrow.deg}deg)`,
              }}
            >
              ⬆️
            </span>
          )}
          <div>
            <h2 style={{ marginBottom: 2 }}>
              Neste: {currentPost.symbol} {currentPost.title}
            </h2>
            <div className="small muted">{distanceText}</div>
          </div>
        </div>
        <p style={{ fontStyle: 'italic' }}>«{currentPost.clue}»</p>
        {roadGamePost && (
          <div className="card card-soft stack" style={{ border: '2px dashed var(--sun, #ffc94d)' }}>
            <strong>🎒 Oppdrag på veien!</strong>
            <p className="small" style={{ margin: 0 }}>
              Mens dere går mot post {currentNum}: spill{' '}
              <strong>{roadGamePost.symbol} {roadGamePost.title}</strong> – det gir bonuspoeng!
            </p>
            <button className="btn btn-sun" onClick={() => navigate(`/road/${currentNum}`)}>
              Start underveis-spillet 🎮
            </button>
          </div>
        )}
        {arrived && (
          <p className="small center" style={{ color: 'var(--ok)', fontWeight: 700 }} aria-live="polite">
            🎉 GPS-en mener dere er fremme!
          </p>
        )}
        <button
          className={`btn btn-primary btn-big ${arrived && !reduced ? 'wiggle' : ''}`}
          onClick={() => navigate(`/post/${currentNum}`)}
        >
          Vi er fremme! 🏁
        </button>
      </div>

      <button className="btn btn-ghost" onClick={() => setJoinOpen(true)}>
        👥 Flere telefoner på laget?
      </button>
      {joinOpen && (
        <div className="modal-backdrop" onClick={() => setJoinOpen(false)}>
          <div className="modal stack" onClick={(e) => e.stopPropagation()}>
            <h2 className="center">Bli med på {progress.setup.team.name}</h2>
            <QRView
              text={shortUrlFromSetup(progress.setup) ?? teamLinkUrl(progress.setup)}
              label="Andre på laget skanner denne"
              shareable
              filename="lag-qr.png"
            />
            <p className="small muted center">
              Flere foreldre kan gjerne følge spillet på egen mobil – men poengene teller bare på
              lagets hovedtelefon (denne). De andre kan øve på minispillene helt gratis. 😄
            </p>
            <button className="btn" onClick={() => setJoinOpen(false)}>Lukk</button>
          </div>
        </div>
      )}

      <button className="btn btn-ghost" onClick={() => setSymbolsOpen((o) => !o)}>
        🎒 {activeConfig().symbolsTitle} ({progress.collectedSymbols.length}/{order.length})
      </button>
      {symbolsOpen && (
        <div className="row-wrap pop-in" style={{ justifyContent: 'center' }}>
          {order.map((n) => {
            const p = getActivePost(n);
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
