import type { ReactNode } from 'react';

// Fullskjermvisning med tydelig lukkeknapp. Trykk utenfor innholdet
// lukker også.
export function Fullscreen({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fullscreen-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <button className="btn btn-primary fullscreen-close" onClick={onClose} aria-label="Lukk fullskjerm">
        ✕ Lukk
      </button>
      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
