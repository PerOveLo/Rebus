import { useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const COLORS = ['#f4553f', '#ffc94d', '#38bdf8', '#3f8f33', '#0e7490', '#ff8fab'];

export function Confetti({ count = 60 }: { count?: number }) {
  const reduced = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.6 + Math.random() * 2,
        color: COLORS[i % COLORS.length],
        size: 8 + Math.random() * 8,
      })),
    [count],
  );
  if (reduced) return null;
  return (
    <div aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
