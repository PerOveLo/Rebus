import { useRef } from 'react';
import type { GameProps } from './types';

interface CheckpointData {
  prompt?: string;
  buttonLabel?: string;
}

// Enkel «gjort!»-post: den voksne leser oppgaven (f.eks. Kims lek med
// teppe og leker), laget løser den fysisk, og noen trykker på knappen.
// Full pott – appen er guiden, ikke dommeren.
export function CheckpointGame({ post, onComplete }: GameProps) {
  const data = (post.data ?? {}) as CheckpointData;
  const doneRef = useRef(false);

  return (
    <div className="stack">
      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>
        {data.prompt ?? 'Den voksne på laget leser oppgaven – løs den sammen!'}
      </p>
      <button
        className="btn btn-primary btn-big"
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onComplete({ score: post.points.main });
        }}
      >
        {data.buttonLabel ?? 'Vi har gjort det! ✅'}
      </button>
    </div>
  );
}
