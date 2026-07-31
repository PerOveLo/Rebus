import { gameConfig } from '../config/gameConfig';
import { leaderStore, teamStore } from './storage';
import type { CustomRebusPayload, PostConfig } from '../types';

// Innholdsoppslag: Skylleviga-rebusen (gameConfig.ts) er standard og
// røres aldri. Har laget fått en egenlaget rebus i lenken – eller har
// spillleder aktivert en på denne telefonen – brukes den i stedet.

export function activeCustomRebus(): CustomRebusPayload | undefined {
  const teamCustom = teamStore.get()?.setup.custom;
  if (teamCustom) return teamCustom;
  const leader = leaderStore.get();
  if (leader.settings.activeRebus === 'custom' && leader.customRebus) return leader.customRebus;
  return undefined;
}

export function activePosts(): PostConfig[] {
  return activeCustomRebus()?.posts ?? gameConfig.posts;
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
  return activeCustomRebus()?.story ?? gameConfig.intro.story;
}

export function activeEventName(): string {
  return activeCustomRebus()?.name ?? gameConfig.eventName;
}

// Postene som «lyser opp» og viser sifrene i finalekoden.
export function activeFinaleSymbolPosts(): number[] {
  const custom = activeCustomRebus();
  if (!custom) return gameConfig.finaleSymbolPosts;
  return custom.posts
    .filter((p) => p.number !== 15)
    .slice(0, 4)
    .map((p) => p.number);
}

// Bakoverkompatibelt navn brukt av enkelte skjermer.
export function activeConfig() {
  return gameConfig;
}
