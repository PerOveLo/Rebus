import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// Kamera åpnes først etter aktivt samtykke (knappetrykk i forelderen).
// Ingen bilder lagres eller sendes noe sted – analysen skjer i minnet.
// onScan returnerer true når koden ble godtatt (skanningen stopper),
// false for å fortsette å lete (f.eks. feil type QR).
export function QRScanner({ onScan, onClose }: { onScan: (text: string) => boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let pauseTimer = 0;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        const video = videoRef.current;
        if (!video || stopped) {
          // Komponenten rakk å lukke seg mens vi ventet – slipp kameraet.
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        video.srcObject = s;
        await video.play();
        const tick = () => {
          if (stopped) return;
          const v = videoRef.current;
          if (v && v.readyState === v.HAVE_ENOUGH_DATA && ctx) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (code?.data) {
              if (onScanRef.current(code.data)) return; // godtatt – forelder lukker
              // Ikke godtatt: pust litt før neste forsøk, så samme kode
              // ikke hamres inn hver eneste frame.
              pauseTimer = window.setTimeout(() => {
                if (!stopped) raf = requestAnimationFrame(tick);
              }, 900);
              return;
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError('Fikk ikke tilgang til kameraet. Bruk manuell registrering i stedet.');
      }
    }
    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearTimeout(pauseTimer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="stack">
      {error ? (
        <div className="card card-soft">{error}</div>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: '100%', borderRadius: 20, background: '#123044', minHeight: 220 }}
        />
      )}
      <button className="btn btn-ghost" onClick={onClose}>
        Lukk kamera
      </button>
    </div>
  );
}
