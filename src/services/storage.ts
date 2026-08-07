import { useSyncExternalStore } from 'react';
import { gameConfig, isValidCode } from '../config/gameConfig';
import { lydiaConfig } from '../config/lydiaConfig';
import { uteConfig } from '../config/uteConfig';
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

// Uterebusen rundt huset er standardrebusen.
export function defaultLeaderState(): LeaderState {
  return {
    settings: {
      pin: gameConfig.defaultLeaderPin,
      finalCode: uteConfig.defaultFinalCode,
      enabledPosts: uteConfig.posts.map((p) => p.number),
      rotateStarts: true,
      teamCount: 3,
      activeRebus: 'ute',
    },
    participants: [],
    teams: [],
    importedResults: [],
    mapOverrides: {},
  };
}

export const leaderStore = createStore<LeaderState>(LEADER_KEY, defaultLeaderState);

export const teamStore = createStore<TeamProgress | null>(TEAM_KEY, () => null);

// Engangsflytt: alle telefoner flippes til uterebusen rundt huset, og
// gamle test-lag (genererte rebuser og innendørsrebusen) ryddes bort.
// Kjøres én gang per telefon; etterpå gjelder valget i 🎪 Rebus som før.
const UTE_MIGRATION_KEY = 'skylleviga:ute-default:v1';
try {
  if (!localStorage.getItem(UTE_MIGRATION_KEY)) {
    localStorage.setItem(UTE_MIGRATION_KEY, '1');
    const knownDefaults = [gameConfig.defaultFinalCode, lydiaConfig.defaultFinalCode, uteConfig.defaultFinalCode];
    leaderStore.update((s) => ({
      ...s,
      settings: {
        ...s.settings,
        activeRebus: 'ute',
        enabledPosts: uteConfig.posts.map((p) => p.number),
        finalCode:
          isValidCode(s.settings.finalCode) && !knownDefaults.includes(s.settings.finalCode)
            ? s.settings.finalCode
            : uteConfig.defaultFinalCode,
      },
    }));
    const team = teamStore.get();
    if (team && (team.setup.custom || team.setup.builtin === 'lydia')) teamStore.set(null);
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
