import { useEffect, useState } from 'react';
import { qrDataUrl } from '../services/qr';

// QR-visning med deling: last ned som bilde eller kopier til utklipps-
// tavlen, klart til å limes inn i en Messenger-gruppe.
export function QRView({
  text,
  label,
  shareable = false,
  filename = 'rebus-qr.png',
}: {
  text: string;
  label?: string;
  shareable?: boolean;
  filename?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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

  async function copyImage() {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied('✅ Bilde kopiert – lim inn i Messenger!');
    } catch {
      setCopied('Kopiering støttes ikke her – hold fingeren på bildet og velg «Kopier», eller last ned.');
    }
    setTimeout(() => setCopied(null), 3500);
  }

  if (error) {
    return (
      <div className="card card-soft center stack">
        <p className="small" style={{ margin: 0 }}>
          Denne rebusen har for mye innhold til én QR-kode – del lenken i stedet (den funker
          akkurat like bra i Messenger!).
        </p>
        <button
          className="btn btn-small"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied('✅ Lenke kopiert!');
            } catch {
              prompt('Kopier lenken manuelt:', text);
            }
            setTimeout(() => setCopied(null), 3000);
          }}
        >
          🔗 Kopier lenke
        </button>
        {copied && <p className="small muted">{copied}</p>}
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
      {shareable && url && (
        <div className="row">
          <a className="btn btn-small" href={url} download={filename}>
            📥 Last ned bilde
          </a>
          <button className="btn btn-small btn-ghost" onClick={copyImage}>
            📋 Kopier bilde
          </button>
        </div>
      )}
      {copied && <p className="small muted">{copied}</p>}
    </div>
  );
}
