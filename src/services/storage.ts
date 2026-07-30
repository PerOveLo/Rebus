import { useSyncExternalStore } from 'react';
import { gameConfig } from '../config/gameConfig';
import type { LeaderState, TeamProgress } from '../types';

// Enkel lokal lagring med pub/sub slik at alle skjermer holder seg i sync.
// Alt lagres kun i localStorage på denne telefonen.

const LEADER_KEY = 'skylleviga:leader:v1';
const TEAM_KEY = 'skylleviga:team:v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function createStore<T>(key: string, initial: () => T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  const get = (): T => {
    if (cache === undefined) {
      cache = safeParse<T>(localStorage.getItem(key)) ?? initial();
    }
    return cache;
  };

  const set = (next: T) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // full lagring skal aldri krasje spillet
    }
    listeners.forEach((l) => l());
  };

  const update = (fn: (prev: T) => T) => set(fn(get()));

  const reset = () => set(initial());

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  const useStore = (): T => useSyncExternalStore(subscribe, get, get);

  return { get, set, update, reset, useStore };
}

export function defaultLeaderState(): LeaderState {
  return {
    settings: {
      pin: gameConfig.defaultLeaderPin,
      finalCode: gameConfig.defaultFinalCode,
      enabledPosts: gameConfig.posts.map((p) => p.number),
      rotateStarts: true,
      teamCount: 2,
    },
    participants: [],
    teams: [],
    importedResults: [],
    mapOverrides: {},
  };
}

export const leaderStore = createStore<LeaderState>(LEADER_KEY, defaultLeaderState);

export const teamStore = createStore<TeamProgress | null>(TEAM_KEY, () => null);

export function resetEverything() {
  leaderStore.reset();
  teamStore.set(null);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
