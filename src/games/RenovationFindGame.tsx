import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface RenovationError {
  id: string;
  label: string;
}

interface RenovationData {
  errors: RenovationError[];
}

interface Zone {
  hit: { x: number; y: number; w: number; h: number };
  ring: { cx: number; cy: number; rx: number; ry: number };
}

// Klikkflater (usynlige, rause) og markeringsringer per feil i tegningen.
const ZONES: Record<string, Zone> = {
  door: { hit: { x: 8, y: 104, w: 100, h: 118 }, ring: { cx: 58, cy: 164, rx: 48, ry: 58 } },
  hammer: { hit: { x: 6, y: 148, w: 52, h: 50 }, ring: { cx: 32, cy: 172, rx: 17, ry: 17 } },
  lamp: { hit: { x: 120, y: 226, w: 60, h: 48 }, ring: { cx: 150, cy: 252, rx: 30, ry: 24 } },
  bathtub: { hit: { x: 190, y: 28, w: 112, h: 66 }, ring: { cx: 246, cy: 56, rx: 58, ry: 30 } },
  socket: { hit: { x: 298, y: 124, w: 48, h: 50 }, ring: { cx: 322, cy: 151, rx: 26, ry: 26 } },
  window: { hit: { x: 108, y: 72, w: 90, h: 92 }, ring: { cx: 153, cy: 117, rx: 47, ry: 47 } },
  trim: { hit: { x: 106, y: 168, w: 116, h: 42 }, ring: { cx: 162, cy: 190, rx: 60, ry: 18 } },
};

const MISS_REPLIES = [
  'Der ser det faktisk greit ut!',
  'Hm – det der er montert riktig. Overraskende nok.',
  'Ingen slurv akkurat der. Prøv et annet sted!',
];

const PRAISE = [
  'Skarpt blikk! 🔍',
  'Der bomma håndverkerne, ja!',
  'Funnet! Øyrådet noterer.',
  'Snakk om detektivteft!',
];

function Hotspot(props: {
  id: string;
  label: string;
  found: boolean;
  onFind: (id: string) => void;
  children: ReactNode;
}) {
  const z = ZONES[props.id];
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={props.found ? `${props.label} (funnet)` : props.label}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        props.onFind(props.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          props.onFind(props.id);
        }
      }}
    >
      <rect x={z.hit.x} y={z.hit.y} width={z.hit.w} height={z.hit.h} fill="transparent" />
      {props.children}
    </g>
  );
}

// Post 8: Finn de sju oppussingstabbene i rommet ved å trykke på dem.
export function RenovationFindGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as RenovationData;
  const reduced = useReducedMotion();
  const errors = (data.errors ?? []).filter((e) => ZONES[e.id]);
  const total = errors.length;

  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [missCount, setMissCount] = useState(0);
  const [toast, setToast] = useState('Trykk på alt som ser rart ut i rommet!');
  const [toastN, setToastN] = useState(0);
  const [hintReady, setHintReady] = useState(false);
  const [hintId, setHintId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const doneRef = useRef(false);

  function say(msg: string) {
    setToast(msg);
    setToastN((n) => n + 1);
  }

  // Pekepinn-knappen dukker opp etter 60 sekunder uansett.
  useEffect(() => {
    const t = setTimeout(() => setHintReady(true), 60000);
    return () => clearTimeout(t);
  }, []);

  // Alle funnet: feire, og lever resultat NØYAKTIG én gang.
  useEffect(() => {
    if (doneRef.current) return;
    if (total > 0 && found.size < total) return;
    doneRef.current = true;
    setCelebrate(true);
    const score =
      total === 0 ? post.points.main : Math.max(35, post.points.main - hintsUsed * 5);
    let fired = false;
    const t = setTimeout(() => {
      fired = true;
      onComplete({ score });
    }, 1900);
    return () => {
      clearTimeout(t);
      if (!fired) doneRef.current = false;
    };
  }, [found, total, hintsUsed, onComplete, post.points.main]);

  function handleFind(id: string) {
    if (celebrate) return;
    if (found.has(id)) {
      say('Den tabben har dere allerede avslørt!');
      return;
    }
    const next = new Set(found);
    next.add(id);
    setFound(next);
    say(PRAISE[next.size % PRAISE.length]);
    if (hintId === id) setHintId(null);
  }

  function handleMiss() {
    if (celebrate) return;
    setMissCount((c) => c + 1);
    say(MISS_REPLIES[missCount % MISS_REPLIES.length]);
  }

  function giveHint() {
    const unfound = errors.filter((e) => !found.has(e.id));
    if (unfound.length === 0) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    setHintId(pick.id);
    setHintsUsed((h) => h + 1);
    say('Pekepinn: følg det som blinker gult! 🔍');
  }

  const hintActive = hintId !== null && !found.has(hintId);
  const showHintBtn =
    (hintReady || missCount >= 5) && !celebrate && found.size < total;

  return (
    <div className="stack">
      <div className="spread">
        <span className="badge">🔎 Funnet {found.size} av {total}</span>
        {showHintBtn && (
          <button className="btn btn-sun btn-small" onClick={giveHint} disabled={hintActive}>
            Vis en detektivpekepinn 🔍
          </button>
        )}
      </div>
      <div className="progress-track" aria-label="Antall feil funnet">
        <div
          className="progress-fill"
          style={{ width: `${total > 0 ? (found.size / total) * 100 : 100}%` }}
        />
      </div>

      <div className="tap-zone">
        <svg
          viewBox="0 0 360 300"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Tegning av et nyoppusset rom med skjulte feil"
          onClick={handleMiss}
        >
          {/* --- Statisk kulisse ------------------------------------ */}
          <rect x="0" y="0" width="360" height="300" rx="16" fill="#bfe4f5" />
          <rect x="0" y="270" width="360" height="30" fill="#3f8f33" />
          <rect x="8" y="230" width="344" height="42" fill="#4a3524" />
          <rect x="8" y="34" width="344" height="184" fill="#ffeecf" />
          <rect x="8" y="16" width="344" height="18" fill="#f0d9a4" />
          <line x1="8" y1="34" x2="352" y2="34" stroke="#c9a75f" strokeWidth="2" />
          {/* sidevegg venstre */}
          <rect x="8" y="34" width="26" height="184" fill="#eacf96" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={i}
              x1={11}
              y1={42 + i * 25}
              x2={31}
              y2={54 + i * 25}
              stroke="#c9a75f"
              strokeWidth="1.5"
            />
          ))}
          {/* gulv med planker */}
          <rect x="8" y="218" width="344" height="12" fill="#d99b4e" />
          {[48, 88, 128, 168, 208, 248, 288, 328].map((x) => (
            <line key={x} x1={x} y1={218} x2={x} y2={230} stroke="#b97b35" strokeWidth="1.5" />
          ))}
          {/* dusjsone med fliser */}
          <rect x="296" y="60" width="52" height="158" fill="#cfeefc" stroke="#9fd8f2" strokeWidth="2" />
          {[86, 112, 138, 164, 190].map((y) => (
            <line key={y} x1={296} y1={y} x2={348} y2={y} stroke="#b3e2f6" strokeWidth="1.5" />
          ))}
          <line x1="322" y1="60" x2="322" y2="218" stroke="#b3e2f6" strokeWidth="1.5" />
          {/* dusjhode og spruter */}
          <rect x="319" y="34" width="6" height="42" fill="#8899a6" />
          <polygon points="306,76 338,76 342,88 302,88" fill="#8899a6" stroke="#6f7f8c" strokeWidth="1.5" />
          {[
            [306, 300],
            [314, 310],
            [322, 322],
            [330, 334],
            [338, 344],
          ].map(([a, b]) => (
            <line
              key={a}
              x1={a}
              y1={92}
              x2={b}
              y2={126}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 8"
            />
          ))}
          <ellipse cx="310" cy="196" rx="2.2" ry="3.6" fill="#38bdf8" />
          <ellipse cx="333" cy="186" rx="2.2" ry="3.6" fill="#38bdf8" />
          {/* dusjkar og forheng */}
          <rect x="294" y="206" width="56" height="12" rx="5" fill="#e6eef2" stroke="#9db4bf" strokeWidth="2" />
          <line x1="286" y1="56" x2="352" y2="56" stroke="#6f7f8c" strokeWidth="3" />
          <rect x="288" y="58" width="11" height="148" rx="4" fill="#ffc94d" stroke="#e0a52e" strokeWidth="1.5" />
          <line x1="292" y1="62" x2="292" y2="202" stroke="#e0a52e" strokeWidth="1" />
          <line x1="295" y1="62" x2="295" y2="202" stroke="#e0a52e" strokeWidth="1" />
          {/* koselig krypkjeller */}
          <text x="60" y="264" fontSize="12" textAnchor="middle" aria-hidden="true">🕷️</text>
          <text x="330" y="248" fontSize="11" textAnchor="middle" aria-hidden="true">🕸️</text>

          {/* --- Feil 1: Døra åpner rett inn i veggen --------------- */}
          <Hotspot
            id="door"
            label={errors.find((e) => e.id === 'door')?.label ?? 'Døra'}
            found={found.has('door')}
            onFind={handleFind}
          >
            <rect x="44" y="108" width="58" height="110" rx="3" fill="#b06e3c" stroke="#8a5227" strokeWidth="2" />
            <rect x="51" y="115" width="44" height="103" fill="#7a4a22" />
            <polygon points="51,116 16,130 16,218 51,218" fill="#c98548" stroke="#8a5227" strokeWidth="2" />
            <line x1="24" y1="152" x2="46" y2="146" stroke="#8a5227" strokeWidth="1.5" opacity="0.5" />
            <line x1="24" y1="186" x2="46" y2="182" stroke="#8a5227" strokeWidth="1.5" opacity="0.5" />
            {/* veggen «spiser» dørkanten */}
            <polygon points="16,130 27,126 27,214 16,218" fill="#eacf96" opacity="0.75" />
            <line x1="17" y1="140" x2="26" y2="147" stroke="#c9a75f" strokeWidth="1.5" />
            <line x1="17" y1="170" x2="26" y2="177" stroke="#c9a75f" strokeWidth="1.5" />
            {/* smell-stjerne der døra traff */}
            <polygon
              points="24,118 28,107 32,116 42,111 35,121 44,126 33,126 31,137 26,127 15,128"
              fill="#ffc94d"
              stroke="#f4553f"
              strokeWidth="1.5"
            />
          </Hotspot>

          {/* --- Feil 2: Vinduet viser innsiden av et annet rom ----- */}
          <Hotspot
            id="window"
            label={errors.find((e) => e.id === 'window')?.label ?? 'Vinduet'}
            found={found.has('window')}
            onFind={handleFind}
          >
            <rect x="114" y="76" width="78" height="80" rx="4" fill="#ffffff" stroke="#8a5227" strokeWidth="3" />
            <rect x="122" y="84" width="62" height="64" fill="#fbd9c7" />
            <rect x="122" y="128" width="62" height="20" fill="#c98548" />
            <rect x="130" y="92" width="14" height="11" fill="#0e7490" stroke="#8a5227" strokeWidth="1.5" />
            {/* sofa i naborommet */}
            <rect x="128" y="112" width="30" height="9" rx="3" fill="#d43a25" />
            <rect x="126" y="119" width="34" height="12" rx="4" fill="#f4553f" />
            <rect x="124" y="117" width="6" height="14" rx="2" fill="#d43a25" />
            <rect x="156" y="117" width="6" height="14" rx="2" fill="#d43a25" />
            {/* stålampe der inne */}
            <line x1="172" y1="140" x2="172" y2="106" stroke="#123044" strokeWidth="2.5" />
            <polygon points="166,96 178,96 181,106 163,106" fill="#ffc94d" stroke="#e0a52e" strokeWidth="1.5" />
            <ellipse cx="172" cy="140" rx="7" ry="2.5" fill="#123044" />
            <rect x="110" y="154" width="86" height="7" rx="3" fill="#f0d9a4" stroke="#c9a75f" strokeWidth="1.5" />
          </Hotspot>

          {/* --- Feil 3: Lista stopper midt på veggen --------------- */}
          <Hotspot
            id="trim"
            label={errors.find((e) => e.id === 'trim')?.label ?? 'Lista'}
            found={found.has('trim')}
            onFind={handleFind}
          >
            <rect x="112" y="186" width="94" height="9" rx="2" fill="#b06e3c" stroke="#8a5227" strokeWidth="2" />
            <polygon points="206,186 215,190.5 206,195" fill="#8a5227" />
            <line
              x1="220"
              y1="190"
              x2="286"
              y2="190"
              stroke="#c9a75f"
              strokeWidth="2.5"
              strokeDasharray="5 7"
              opacity="0.9"
            />
          </Hotspot>

          {/* --- Feil 4: Badekar i taket ---------------------------- */}
          <Hotspot
            id="bathtub"
            label={errors.find((e) => e.id === 'bathtub')?.label ?? 'Badekaret'}
            found={found.has('bathtub')}
            onFind={handleFind}
          >
            <rect x="212" y="34" width="10" height="10" rx="2" fill="#6f7f8c" />
            <rect x="270" y="34" width="10" height="10" rx="2" fill="#6f7f8c" />
            <rect x="202" y="42" width="88" height="26" rx="13" fill="#ffffff" stroke="#9db4bf" strokeWidth="3" />
            <rect x="196" y="62" width="100" height="9" rx="4.5" fill="#e6eef2" stroke="#9db4bf" strokeWidth="2" />
            <path d="M284 71 v8 h-6" stroke="#6f7f8c" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="278" cy="92" rx="3" ry="5" fill="#38bdf8" />
            <ellipse cx="280" cy="106" rx="2.2" ry="3.6" fill="#38bdf8" />
            {/* badeand i fritt fall */}
            <text x="238" y="88" fontSize="14" textAnchor="middle" transform="rotate(160 238 84)" aria-hidden="true">
              🐤
            </text>
          </Hotspot>

          {/* --- Feil 5: Stikkontakt i dusjen (med dusjhette) ------- */}
          <Hotspot
            id="socket"
            label={errors.find((e) => e.id === 'socket')?.label ?? 'Stikkontakten'}
            found={found.has('socket')}
            onFind={handleFind}
          >
            <path d="M310 142 a12 9 0 0 1 24 0 z" fill="#f4553f" stroke="#d43a25" strokeWidth="1.5" />
            <circle cx="316" cy="137" r="1.5" fill="#fff7e6" />
            <circle cx="322" cy="134.5" r="1.5" fill="#fff7e6" />
            <circle cx="328" cy="137" r="1.5" fill="#fff7e6" />
            <rect x="310" y="142" width="24" height="26" rx="5" fill="#fffdf5" stroke="#123044" strokeWidth="2" />
            <circle cx="317.5" cy="155" r="2.4" fill="#123044" />
            <circle cx="326.5" cy="155" r="2.4" fill="#123044" />
            <text x="341" y="139" fontSize="11" textAnchor="middle" aria-hidden="true">⚡</text>
            <ellipse cx="305" cy="150" rx="2" ry="3.4" fill="#38bdf8" />
            <ellipse cx="340" cy="162" rx="2" ry="3.4" fill="#38bdf8" />
          </Hotspot>

          {/* --- Feil 6: Lampe montert under gulvet ----------------- */}
          <Hotspot
            id="lamp"
            label={errors.find((e) => e.id === 'lamp')?.label ?? 'Lampa'}
            found={found.has('lamp')}
            onFind={handleFind}
          >
            <line x1="150" y1="230" x2="150" y2="243" stroke="#d9d2c6" strokeWidth="2.5" />
            <circle cx="150" cy="263" r="13" fill="#ffc94d" opacity="0.28" />
            <polygon points="150,241 136,259 164,259" fill="#f4553f" stroke="#d43a25" strokeWidth="2" />
            <circle cx="150" cy="263" r="6" fill="#ffe9b0" stroke="#e0a52e" strokeWidth="1.5" />
            <line x1="140" y1="268" x2="136" y2="271" stroke="#ffc94d" strokeWidth="2" strokeLinecap="round" />
            <line x1="160" y1="268" x2="164" y2="271" stroke="#ffc94d" strokeWidth="2" strokeLinecap="round" />
          </Hotspot>

          {/* --- Feil 7: Hammer som dørhåndtak (over døra i lagene) - */}
          <Hotspot
            id="hammer"
            label={errors.find((e) => e.id === 'hammer')?.label ?? 'Hammeren'}
            found={found.has('hammer')}
            onFind={handleFind}
          >
            <circle cx="32" cy="172" r="8" fill="#e8e2d8" stroke="#8a5227" strokeWidth="1.5" />
            <text x="32" y="179" fontSize="18" textAnchor="middle" transform="rotate(-35 32 172)" aria-hidden="true">
              🔨
            </text>
          </Hotspot>

          {/* --- Markeringer (blokkerer ikke klikk) ----------------- */}
          <g style={{ pointerEvents: 'none' }}>
            {errors
              .filter((e) => found.has(e.id))
              .map((e) => {
                const r = ZONES[e.id].ring;
                return (
                  <g key={e.id}>
                    <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill="none" stroke="#ffffff" strokeWidth="7" opacity="0.85" />
                    <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill="none" stroke="#f4553f" strokeWidth="4" />
                    <circle cx={r.cx + r.rx * 0.72} cy={r.cy - r.ry * 0.72} r="9" fill="#f4553f" />
                    <text
                      x={r.cx + r.rx * 0.72}
                      y={r.cy - r.ry * 0.72 + 4.5}
                      fontSize="12"
                      fontWeight="bold"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      ✓
                    </text>
                  </g>
                );
              })}
            {hintActive && hintId && ZONES[hintId] && (
              <ellipse
                className={reduced ? undefined : 'glow'}
                cx={ZONES[hintId].ring.cx}
                cy={ZONES[hintId].ring.cy}
                rx={ZONES[hintId].ring.rx}
                ry={ZONES[hintId].ring.ry}
                fill="none"
                stroke="#ffc94d"
                strokeWidth="5"
                strokeDasharray="10 8"
              />
            )}
          </g>
        </svg>
      </div>

      {!celebrate && (
        <p className="small muted center pop-in" key={toastN}>
          {toast}
        </p>
      )}

      {celebrate ? (
        <div className="card center pop-in">
          <span className="big-emoji" aria-hidden="true">🕵️</span>
          <h3>Alle {total} tabbene avslørt!</h3>
          <p className="muted small">
            {hintsUsed === 0
              ? 'Uten en eneste pekepinn – Øyrådet er mektig imponert!'
              : 'Solid detektivarbeid! Håndverkerne er sendt på nytt kurs.'}
          </p>
        </div>
      ) : (
        <div className="card card-soft">
          <p className="small" style={{ fontWeight: 700, marginBottom: 6 }}>
            Slurvelista:
          </p>
          <div className="stack" style={{ gap: 4 }}>
            {errors.map((e) => (
              <div key={e.id} className="row small">
                <span aria-hidden="true">{found.has(e.id) ? '✅' : '❓'}</span>
                <span className={found.has(e.id) ? undefined : 'muted'}>
                  {found.has(e.id) ? e.label : 'Uoppdaget slurv …'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
