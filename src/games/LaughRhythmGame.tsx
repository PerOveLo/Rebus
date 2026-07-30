import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GameProps } from './types';

interface LaughLevel {
  name: string;
  pattern: string[];
}

interface LaughData {
  levels: LaughLevel[];
  micEnabled?: boolean;
}

const SYLLABLES: { text: string; emoji: string }[] = [
  { text: 'He', emoji: '😄' },
  { text: 'Ha', emoji: '😂' },
  { text: 'Hå', emoji: '🤣' },
];

// Post 4: Se latterboblene lyse opp, husk mønsteret og trykk latteren tilbake.
export function LaughRhythmGame({ post, onComplete }: GameProps) {
  const data = post.data as unknown as LaughData;
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<'intro' | 'watch' | 'play' | 'oops' | 'levelDone' | 'finale'>(
    'intro',
  );
  const [levelIndex, setLevelIndex] = useState(0);
  const [showIndex, setShowIndex] = useState(-1); // hvilken boble som lyser under avspilling
  const [inputIndex, setInputIndex] = useState(0); // hvor langt laget har kommet i mønsteret
  const [totalMistakes, setTotalMistakes] = useState(0);

  // Mikrofon-lek (helt frivillig, gir aldri poeng)
  const [micOpen, setMicOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micPeak, setMicPeak] = useState(0);
  const [micError, setMicError] = useState(false);

  const doneRef = useRef(false);
  const holdingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);

  const levels = data.levels;
  const level = levels[Math.min(levelIndex, levels.length - 1)];
  const pattern = level.pattern;

  // Spill av mønsteret: boblene lyser opp én etter én.
  useEffect(() => {
    if (phase !== 'watch' || reduced) return;
    setShowIndex(-1);
    let i = -1;
    const iv = setInterval(() => {
      i += 1;
      if (i >= pattern.length) {
        clearInterval(iv);
        setShowIndex(-1);
        setInputIndex(0);
        setPhase('play');
        return;
      }
      setShowIndex(i);
    }, 600);
    return () => clearInterval(iv);
  }, [phase, reduced, levelIndex, pattern.length]);

  // Kort feiring mellom nivåene før neste mønster.
  useEffect(() => {
    if (phase !== 'levelDone') return;
    const t = setTimeout(() => {
      if (levelIndex + 1 >= levels.length) {
        setPhase('finale');
      } else {
        setLevelIndex((i) => i + 1);
        setInputIndex(0);
        setPhase('watch');
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, levelIndex, levels.length]);

  // Rydd alltid opp mikrofonen hvis spillet lukkes midt i latteren.
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  function tapSyllable(text: string) {
    if (phase !== 'play') return;
    if (text === pattern[inputIndex]) {
      const next = inputIndex + 1;
      if (next >= pattern.length) {
        setInputIndex(next);
        setPhase('levelDone');
      } else {
        setInputIndex(next);
      }
    } else {
      setTotalMistakes((m) => m + 1);
      setPhase('oops');
    }
  }

  function stopMic() {
    holdingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setMicActive(false);
    setMicLevel(0);
  }

  async function startMic() {
    holdingRef.current = true;
    setMicError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Slapp taket før tillatelsen kom? Da stopper vi med en gang.
      if (!holdingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) {
        stopMic();
        setMicError(true);
        return;
      }
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      setMicActive(true);
      const loop = () => {
        if (!holdingRef.current) return;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i += 1) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const lvl = Math.min(100, Math.round(Math.sqrt(sum / buf.length) * 320));
        setMicLevel(lvl);
        setMicPeak((p) => Math.max(p, lvl));
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      holdingRef.current = false;
      setMicError(true);
      setMicActive(false);
    }
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    stopMic();
    // Raust: full pott ved opptil 2 feil, deretter -5 per ekstra. Aldri under 35.
    const score =
      totalMistakes <= 2
        ? post.points.main
        : Math.max(35, post.points.main - (totalMistakes - 2) * 5);
    onComplete({ score });
  }

  function micVerdict(peak: number): string {
    if (peak < 20) return 'Forsiktig fnis – søtt, men Ida hører dere knapt! 🤭';
    if (peak < 45) return 'Solid hagefest-latter! 😄';
    if (peak < 70) return 'Naboene hørte dere helt sikkert! 😂';
    return 'EKTE IDA-NIVÅ! Tåkeluren kan ta ferie! 🤣';
  }

  // Latterboblene øverst: viser mønsteret under avspilling og fremgang når laget trykker.
  function renderBubbles(mode: 'watch' | 'play') {
    return (
      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
        {pattern.map((syl, i) => {
          const lit = mode === 'watch' ? (reduced ? true : i === showIndex) : i < inputIndex;
          const revealText = mode === 'watch' ? lit : i < inputIndex;
          return (
            <span
              key={i}
              className={lit && !reduced ? 'pop-in' : undefined}
              aria-hidden="true"
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                background: lit ? 'var(--sun)' : 'var(--sky-soft)',
                color: 'var(--ink)',
                border: lit ? '3px solid var(--coral)' : '3px solid transparent',
                transition: reduced ? 'none' : 'background 0.2s',
              }}
            >
              {revealText ? syl : '🫧'}
            </span>
          );
        })}
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="stack center">
        <span className="big-emoji floaty" aria-hidden="true">
          🫧
        </span>
        <p className="muted">
          Idas latter kommer i mystiske mønstre! Se boblene lyse opp, husk rekkefølgen og trykk
          latteren tilbake. Tre nivåer – hele laget hjelper til!
        </p>
        <button className="btn btn-primary btn-big" onClick={() => setPhase('watch')}>
          Start latterlaben 😂
        </button>
      </div>
    );
  }

  if (phase === 'watch') {
    return (
      <div className="stack center">
        <span className="badge">Latter {levelIndex + 1} av {levels.length}: «{level.name}»</span>
        <h3>Se og hør etter! 👀</h3>
        {renderBubbles('watch')}
        {reduced ? (
          <>
            <p className="muted">
              Mønsteret er: <strong>{pattern.join(' – ')}</strong>
            </p>
            <button
              className="btn btn-primary btn-big"
              onClick={() => {
                setInputIndex(0);
                setPhase('play');
              }}
            >
              Vi husker det – deres tur! 😄
            </button>
          </>
        ) : (
          <p className="muted small">Boblene ler i tur og orden …</p>
        )}
      </div>
    );
  }

  if (phase === 'play') {
    return (
      <div className="stack center">
        <span className="badge">Latter {levelIndex + 1} av {levels.length}</span>
        <h3>Deres tur! 🎤</h3>
        {renderBubbles('play')}
        <p className="muted small">
          Trykk latteren i riktig rekkefølge ({inputIndex} av {pattern.length})
        </p>
        <div className="stack" style={{ width: '100%' }}>
          {SYLLABLES.map((s) => (
            <button
              key={s.text}
              className="btn btn-sun btn-big"
              style={{ minHeight: 64, fontSize: '1.4rem' }}
              onClick={() => tapSyllable(s.text)}
            >
              {s.text} {s.emoji}
            </button>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-small"
          onClick={() => {
            setInputIndex(0);
            setPhase('watch');
          }}
        >
          Vis mønsteret igjen 👂
        </button>
      </div>
    );
  }

  if (phase === 'oops') {
    return (
      <div className="stack center">
        <div className="card card-soft pop-in">
          <span className="big-emoji" aria-hidden="true">
            🙈
          </span>
          <p style={{ marginTop: 6 }}>Hihi, nesten! Hør en gang til – boblene gjentar seg gjerne.</p>
        </div>
        <button
          className="btn btn-primary btn-big"
          onClick={() => {
            setInputIndex(0);
            setPhase('watch');
          }}
        >
          Hør mønsteret på nytt 👂
        </button>
      </div>
    );
  }

  if (phase === 'levelDone') {
    return (
      <div className="stack center pop-in">
        <span className="big-emoji" aria-hidden="true">
          🎉
        </span>
        <h3>Perfekt latter!</h3>
        <p className="muted small">
          {levelIndex + 1 >= levels.length
            ? 'Laboratoriet koker over av fryd …'
            : 'Neste mønster er litt lengre. Klarer dere det?'}
        </p>
      </div>
    );
  }

  // finale
  return (
    <div className="stack center">
      <span className={reduced ? 'big-emoji' : 'big-emoji floaty'} aria-hidden="true">
        🏆
      </span>
      <h3 className="pop-in">Alle tre latrene godkjent!</h3>
      <p className="muted small">
        Ida nikker anerkjennende fra laboratoriet. Dere ler på ekte Flekkerøy-vis!
      </p>

      {data.micEnabled !== false && !micOpen && (
        <button className="btn btn-ghost btn-big" onClick={() => setMicOpen(true)}>
          🎤 Mål latteren vår (valgfritt)
        </button>
      )}

      {data.micEnabled !== false && micOpen && (
        <div className="card stack" style={{ width: '100%' }}>
          <p className="small muted">
            Bare for moro – gir ingen poeng! Lyden lagres aldri og sendes ingen steder. Mikrofonen
            lytter kun mens knappen holdes inne.
          </p>
          <div className="progress-track" aria-label="Lattermåler">
            <div
              className="progress-fill"
              style={{ width: `${micLevel}%`, transition: reduced ? 'none' : 'width 0.1s' }}
            />
          </div>
          <button
            className="btn btn-grass btn-big"
            style={{ minHeight: 64, touchAction: 'none' }}
            onPointerDown={startMic}
            onPointerUp={stopMic}
            onPointerCancel={stopMic}
            onPointerLeave={() => {
              if (holdingRef.current) stopMic();
            }}
          >
            {micActive ? 'LE HØYERE! 🤣' : 'Hold inne og LE! 😂'}
          </button>
          {micError && (
            <p className="small muted">
              Mikrofonen ville ikke være med i dag – helt greit! Latteren deres var uansett gull. 😄
            </p>
          )}
          {micPeak > 0 && !micActive && (
            <p className="small pop-in">
              Toppmåling: <strong>{micPeak} av 100</strong> – {micVerdict(micPeak)}
            </p>
          )}
        </div>
      )}

      <button className="btn btn-primary btn-big" onClick={finish}>
        Ferdig her! ✅
      </button>
    </div>
  );
}
