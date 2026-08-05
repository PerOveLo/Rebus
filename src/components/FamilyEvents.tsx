import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Tilfeldige «familiehendelser» i quizspillene: en figur løper over
// skjermen med en snakkeboble. Ren pynt – blokkerer aldri spillet.

export interface FamilyEvent {
  emoji: string;
  text: string;
}

export function useFamilyEvents(events: FamilyEvent[] | undefined) {
  const [current, setCurrent] = useState<{ ev: FamilyEvent; key: number } | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const trigger = useCallback(() => {
    if (!events || events.length === 0) return;
    const ev = events[Math.floor(Math.random() * events.length)];
    counter.current += 1;
    setCurrent({ ev, key: counter.current });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCurrent(null), 2600);
  }, [events]);

  const overlay = current ? (
    <div className="family-event" key={current.key} aria-live="polite">
      <span
        className={`family-event-emoji ${reduced ? 'family-event-still' : 'family-event-run'}`}
        aria-hidden="true"
      >
        {current.ev.emoji}
      </span>
      <span className="family-event-bubble">{current.ev.text}</span>
    </div>
  ) : null;

  return { trigger, overlay };
}
