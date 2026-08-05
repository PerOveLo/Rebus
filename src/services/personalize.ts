import { builtinRebus, builtinRebuses, isBuiltinRebusId } from '../config/rebuses';
import { leaderStore, teamStore } from './storage';
import type {
  BuiltinRebusConfig,
  BuiltinRebusId,
  CustomRebusPayload,
  LeaderState,
  PostConfig,
} from '../types';

// Innholdsoppslag for «aktiv rebus». Rekkefølgen er:
// 1) Har telefonen et aktivt lag, bestemmer laglenken alt (custom eller builtin).
// 2) Ellers gjelder spillleders valg på denne telefonen.
// Skylleviga-rebusen (gameConfig.ts) er alltid standard og røres aldri.

export function activeCustomRebus(): CustomRebusPayload | undefined {
  const team = teamStore.get();
  if (team) return team.setup.custom; // laglenken bestemmer
  const leader = leaderStore.get();
  if (leader.settings.activeRebus === 'custom' && leader.customRebus) return leader.customRebus;
  return undefined;
}

export function activeBuiltinId(): BuiltinRebusId {
  const team = teamStore.get();
  if (team) return isBuiltinRebusId(team.setup.builtin) ? team.setup.builtin : 'standard';
  const id = leaderStore.get().settings.activeRebus;
  return isBuiltinRebusId(id) ? id : 'standard';
}

// Den innebygde rebusen som gjelder nå (for en egen generert rebus er
// dette standardoppsettet, som gir kart, ikoner og finaletekster).
export function activeConfig(): BuiltinRebusConfig {
  return builtinRebuses[activeBuiltinId()];
}

export function activePosts(): PostConfig[] {
  return activeCustomRebus()?.posts ?? activeConfig().posts;
}

export function getActivePost(num: number): PostConfig {
  const post = activePosts().find((p) => p.number === num);
  if (!post) throw new Error(`Ukjent post: ${num}`);
  return post;
}

export function findActivePost(num: number): PostConfig | undefined {
  return activePosts().find((p) => p.number === num);
}

export function activeStory(): string {
  return activeCustomRebus()?.story ?? activeConfig().intro.story;
}

export function activeEventName(): string {
  return activeCustomRebus()?.name ?? activeConfig().eventName;
}

// Postene som «lyser opp» og viser sifrene i finalekoden.
export function activeFinaleSymbolPosts(): number[] {
  const custom = activeCustomRebus();
  if (!custom) return activeConfig().finaleSymbolPosts;
  return custom.posts
    .filter((p) => p.number !== 15)
    .slice(0, 4)
    .map((p) => p.number);
}

// --- Spillleder-siden: løses fra leader-state, uavhengig av om telefonen
// også har et (test)lag liggende i teamStore.

export function leaderBuiltinId(state: LeaderState): BuiltinRebusId {
  const id = state.settings.activeRebus;
  return isBuiltinRebusId(id) ? id : 'standard';
}

export function leaderConfig(state: LeaderState): BuiltinRebusConfig {
  return builtinRebus(leaderBuiltinId(state));
}

export function leaderCustomRebus(state: LeaderState): CustomRebusPayload | undefined {
  return state.settings.activeRebus === 'custom' && state.customRebus
    ? state.customRebus
    : undefined;
}

export function leaderPosts(state: LeaderState): PostConfig[] {
  return leaderCustomRebus(state)?.posts ?? leaderConfig(state).posts;
}
