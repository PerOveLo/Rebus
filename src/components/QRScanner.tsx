import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// Kamera åpnes først etter aktivt samtykke (knappetrykk i forelderen).
// Ingen bilder lagres eller sendes noe sted – analysen skjer i minnet.
export function QRScanner({ onScan, onClose }: { onScan: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        const video = videoRef.current;
        if (!video || stopped) return;
        video.srcObject = stream;
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
              onScanRef.current(code.data);
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
