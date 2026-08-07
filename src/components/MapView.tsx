import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { customMapKey } from '../config/rebuses';
import { activeBuiltinId, activeConfig } from '../services/personalize';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { MapPos } from '../types';

export interface MapViewProps {
  positions: Record<number, MapPos>; // postnummer -> posisjon
  visiblePosts: number[]; // postnummer som vises
  completedPosts?: number[];
  currentPost?: number; // neste post laget skal til
  previousPost?: number; // der laget kommer fra (for stiplet linje)
  editable?: boolean;
  onMove?: (postNumber: number, pos: MapPos) => void;
  onSelect?: (postNumber: number) => void;
  symbols?: Record<number, string>; // overstyr postsymboler (egen rebus)
  mapImage?: string; // overstyr kartbildet (spillleder-siden)
  // Zoom automatisk inn på forrige + neste post (lagets spillvisning).
  zoomRoute?: boolean;
  // Trykk på kartet åpner fullskjerm (håndteres av forelderen).
  onExpand?: () => void;
}

function clampNum(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function distanceLabel(from: MapPos, to: MapPos): string {
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  const { distanceThresholds: t, distanceLabels } = activeConfig().map;
  if (d <= t.short) return distanceLabels.short;
  if (d <= t.medium) return distanceLabels.medium;
  return distanceLabels.long;
}

export function directionDeg(from: MapPos, to: MapPos): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

export function MapView({
  positions,
  visiblePosts,
  completedPosts = [],
  currentPost,
  previousPost,
  editable = false,
  onMove,
  onSelect,
  symbols,
  mapImage,
  zoomRoute = false,
  onExpand,
}: MapViewProps) {
  const [imgOk, setImgOk] = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const cfg = activeConfig();
  const fallbackSymbols: Record<number, string> = Object.fromEntries(
    cfg.posts.map((p) => [p.number, p.symbol]),
  );
  // Spillleder kan laste opp eget kartbilde (lagres lokalt på telefonen,
  // per rebus). Ellers brukes rebusens innebygde kart.
  const [customImg] = useState(() => localStorage.getItem(customMapKey(activeBuiltinId())));
  const mapSrc = mapImage ?? customImg ?? `${import.meta.env.BASE_URL}${cfg.map.image}`;

  function posFromEvent(e: ReactPointerEvent): MapPos | null {
    const el = frameRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(1, Math.min(99, Math.round(x * 10) / 10)), y: Math.max(1, Math.min(99, Math.round(y * 10) / 10)) };
  }

  function handlePointerDown(num: number) {
    if (editable) dragging.current = num;
  }
  function handlePointerMove(e: ReactPointerEvent) {
    if (!editable || dragging.current == null) return;
    const pos = posFromEvent(e);
    if (pos) onMove?.(dragging.current, pos);
  }
  function handlePointerUp() {
    dragging.current = null;
  }

  const from = previousPost != null ? positions[previousPost] : undefined;
  const to = currentPost != null ? positions[currentPost] : undefined;

  // Dynamisk zoom: utsnittet dekker forrige og neste post, med luft rundt.
  let zoom: { k: number; vx: number; vy: number } | null = null;
  if (zoomRoute && to) {
    const pts = from ? [from, to] : [to];
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const pad = 14;
    const halfW = Math.max((maxX - minX) / 2 + pad, 17);
    const halfH = Math.max((maxY - minY) / 2 + pad, 17);
    const k = Math.min(2.6, Math.max(1, Math.min(50 / halfW, 50 / halfH)));
    if (k > 1.06) {
      const cx = clampNum((minX + maxX) / 2, 50 / k, 100 - 50 / k);
      const cy = clampNum((minY + maxY) / 2, 50 / k, 100 - 50 / k);
      zoom = { k, vx: cx - 50 / k, vy: cy - 50 / k };
    }
  }
  const tf = (p: MapPos): MapPos =>
    zoom ? { x: (p.x - zoom.vx) * zoom.k, y: (p.y - zoom.vy) * zoom.k } : p;
  const pinAnim = zoomRoute && !reduced ? ' map-anim' : '';

  return (
    <div
      className="map-frame"
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={editable ? undefined : onExpand}
      style={onExpand && !editable ? { cursor: 'zoom-in' } : undefined}
    >
      {imgOk ? (
        <>
          <img
            src={mapSrc}
            alt={`Kart for ${cfg.shortName}`}
            className="map-img"
            style={zoom ? { visibility: 'hidden' } : undefined}
            onError={() => setImgOk(false)}
            draggable={false}
          />
          {zoom && (
            <img
              src={mapSrc}
              alt=""
              aria-hidden="true"
              className={`map-img map-img-zoom${pinAnim}`}
              style={{
                width: `${zoom.k * 100}%`,
                height: `${zoom.k * 100}%`,
                left: `${-zoom.vx * zoom.k}%`,
                top: `${-zoom.vy * zoom.k}%`,
              }}
              draggable={false}
            />
          )}
        </>
      ) : (
        <div className="map-placeholder">
          <span style={{ fontSize: '2.4rem' }}>🗺️</span>
          <strong>Kartbildet mangler</strong>
          <span className="small">
            Legg kartbildet i <code>public/{cfg.map.image}</code> – spillet fungerer fint uten.
          </span>
        </div>
      )}

      {/* Pynt i kantene – følger rebusens tema */}
      {cfg.home.theme === 'birthday' ? (
        <>
          <div aria-hidden="true" style={{ position: 'absolute', top: 6, left: 10, fontSize: '1.6rem', opacity: 0.9 }} className={reduced ? '' : 'floaty'}>🎈</div>
          <div aria-hidden="true" style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.2rem', opacity: 0.9 }} className={reduced ? '' : 'floaty'}>🎈</div>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '1.3rem' }}>🧸</div>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '1.3rem' }}>🎉</div>
        </>
      ) : (
        <>
          <div aria-hidden="true" style={{ position: 'absolute', top: 6, left: 10, fontSize: '1.6rem', opacity: 0.9 }} className={reduced ? '' : 'floaty'}>☁️</div>
          <div aria-hidden="true" style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.2rem', opacity: 0.9 }} className={reduced ? '' : 'floaty'}>☁️</div>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '1.3rem' }}>🌊</div>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '1.3rem' }}>🌿</div>
          <div aria-hidden="true" style={{ position: 'absolute', top: '46%', left: 2, fontSize: '1.4rem' }}>🚇</div>
        </>
      )}

      {/* Romnavn – bare på rebusens eget kartbilde, ikke egne opplastinger */}
      {!mapSrc.startsWith('data:') &&
        cfg.map.labels?.map((l) => {
          const lp = tf(l.pos);
          return (
            <span
              key={l.text}
              className={`map-label${pinAnim}`}
              style={{ left: `${lp.x}%`, top: `${lp.y}%` }}
              aria-hidden="true"
            >
              {l.text}
            </span>
          );
        })}

      {/* Stiplet rute fra forrige til neste post */}
      {from && to && (
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={tf(from).x}
            y1={tf(from).y}
            x2={tf(to).x}
            y2={tf(to).y}
            stroke="#f4553f"
            strokeWidth="1.1"
            strokeDasharray="3 2.4"
            strokeLinecap="round"
            style={reduced ? undefined : { animation: 'dash-move 1.2s linear infinite' }}
          />
        </svg>
      )}

      {visiblePosts.map((num) => {
        const pos = positions[num];
        if (!pos) return null;
        const done = completedPosts.includes(num);
        const isNext = currentPost === num;
        const cls = done ? 'map-pin-done' : isNext ? 'map-pin-next' : 'map-pin-inactive';
        const pp = tf(pos);
        return (
          <button
            key={num}
            type="button"
            className={`map-pin ${cls}${pinAnim}`}
            style={{ left: `${pp.x}%`, top: `${pp.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(num);
            }}
            onPointerDown={() => handlePointerDown(num)}
            aria-label={`Post ${num}${done ? ' (fullført)' : isNext ? ' (neste)' : ''}`}
          >
            <span className="map-pin-dot">{done ? '✓' : num}</span>
            {(isNext || editable) && (
              <span style={{ fontSize: '1.05rem', marginTop: 1, textShadow: '0 1px 3px #fff' }}>{(symbols ?? fallbackSymbols)[num]}</span>
            )}
          </button>
        );
      })}

      {/* Festhus/kake ved start/mål */}
      {positions[cfg.finaleNumber] && (
        <span
          aria-hidden="true"
          className={pinAnim ? 'map-anim' : undefined}
          style={{
            position: 'absolute',
            left: `${tf(positions[cfg.finaleNumber]).x}%`,
            top: `${tf({ x: positions[cfg.finaleNumber].x, y: positions[cfg.finaleNumber].y - 6 }).y}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            fontSize: '1.5rem',
            textShadow: '0 1px 4px rgba(255,255,255,0.9)',
          }}
        >
          {cfg.map.homeEmoji}
        </span>
      )}

      {/* Fullskjerm-hint */}
      {onExpand && !editable && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 44,
            fontSize: '1.1rem',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 999,
            padding: '3px 8px',
            pointerEvents: 'none',
          }}
        >
          🔎
        </span>
      )}
    </div>
  );
}
