import { useEffect, useState } from 'react';
import { qrDataUrl } from '../services/qr';

export function QRView({ text, label }: { text: string; label?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setError(false);
    qrDataUrl(text)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [text]);

  if (error) {
    return (
      <div className="card card-soft center small">
        Klarte ikke å lage QR-kode. Bruk «kopier lenke» i stedet.
      </div>
    );
  }
  return (
    <div className="center stack" style={{ alignItems: 'center' }}>
      {url ? (
        <img
          src={url}
          alt={label ?? 'QR-kode'}
          style={{ width: 'min(70vw, 300px)', borderRadius: 16, border: '6px solid #fff', boxShadow: 'var(--shadow)' }}
        />
      ) : (
        <div className="muted small">Lager QR-kode …</div>
      )}
      {label && <div className="small muted">{label}</div>}
    </div>
  );
}
