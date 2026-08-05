import { useSyncExternalStore } from 'react';
import { gameConfig, isValidCode } from '../config/gameConfig';
import { lydiaConfig } from '../config/lydiaConfig';
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

// Lydias bursdagsrebus (plantegningen av huset) er standardrebusen.
export function defaultLeaderState(): LeaderState {
  return {
    settings: {
      pin: gameConfig.defaultLeaderPin,
      finalCode: lydiaConfig.defaultFinalCode,
      enabledPosts: lydiaConfig.posts.map((p) => p.number),
      rotateStarts: true,
      teamCount: 2,
      activeRebus: 'lydia',
    },
    participants: [],
    teams: [],
    importedResults: [],
    mapOverrides: {},
  };
}

export const leaderStore = createStore<LeaderState>(LEADER_KEY, defaultLeaderState);

export const teamStore = createStore<TeamProgress | null>(TEAM_KEY, () => null);

// Engangsflytt: telefoner med gammelt oppsett flippes til bursdagsrebusen,
// og gamle genererte lag (som holdt det gamle kartet i live) ryddes bort.
// Kjøres én gang per telefon; etterpå gjelder valget i 🎪 Rebus som før.
const LYDIA_MIGRATION_KEY = 'skylleviga:lydia-default:v1';
try {
  if (!localStorage.getItem(LYDIA_MIGRATION_KEY)) {
    localStorage.setItem(LYDIA_MIGRATION_KEY, '1');
    leaderStore.update((s) => ({
      ...s,
      settings: {
        ...s.settings,
        activeRebus: 'lydia',
        enabledPosts: lydiaConfig.posts.map((p) => p.number),
        finalCode:
          isValidCode(s.settings.finalCode) && s.settings.finalCode !== gameConfig.defaultFinalCode
            ? s.settings.finalCode
            : lydiaConfig.defaultFinalCode,
      },
    }));
    const team = teamStore.get();
    if (team?.setup.custom) teamStore.set(null);
  }
} catch {
  // localStorage utilgjengelig – appen fungerer likevel
}

export function resetEverything() {
  leaderStore.reset();
  teamStore.set(null);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
