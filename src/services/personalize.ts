import { gameConfig } from '../config/gameConfig';
import type { GameConfig } from '../config/gameConfig';
import { leaderStore, teamStore } from './storage';
import type { PersonalProfile, PostConfig } from '../types';

// Personlig tilpasning: standardhistorien handler om Sjur, Ida, Emil,
// Isak og Jenny i Skylleviga. For fremtidige rebuser byttes navnene og
// stedene ut overalt (også i sammensatte ord som «Sjursteg» og
// «Jennyminutt») basert på profilen spillleder fyller ut.

function buildReplacements(p: PersonalProfile): [string, string][] {
  const pairs: [string, string][] = [];
  const add = (from: string, to?: string) => {
    if (to && to.trim() && to.trim() !== from) pairs.push([from, to.trim()]);
  };
  // Lengste først slik at «Skyllevigsk» tas før «Skylleviga».
  add('Skyllevigsk', p.placeName ? `${p.placeName}sk` : undefined);
  add('skyllevigsk', p.placeName ? `${p.placeName.toLowerCase()}sk` : undefined);
  add('Skylleviga', p.placeName);
  add('Flekkerøytunnelen', p.islandName ? `${p.islandName}tunnelen` : undefined);
  add('Flekkerøya', p.islandName);
  add('Sjur', p.hostTall);
  add('Ida', p.hostLaugh);
  add('Emil', p.mathWhiz);
  add('Isak', p.rescuer);
  add('Jenny', p.sleeper);
  return pairs;
}

function substitute(text: string, pairs: [string, string][]): string {
  let out = text;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

function personalizeValue<T>(value: T, pairs: [string, string][]): T {
  if (typeof value === 'string') return substitute(value, pairs) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => personalizeValue(v, pairs)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = personalizeValue(v, pairs);
    }
    return out as unknown as T;
  }
  return value;
}

export function personalizeConfig(profile?: PersonalProfile): GameConfig {
  if (!profile) return gameConfig;
  const pairs = buildReplacements(profile);
  if (pairs.length === 0) return gameConfig;
  return personalizeValue(gameConfig, pairs);
}

let cacheKey = '';
let cacheValue: GameConfig = gameConfig;

// Profilen hentes fra lagets lenke (teamStore) eller spillleders oppsett.
export function activeProfile(): PersonalProfile | undefined {
  return teamStore.get()?.setup.personal ?? leaderStore.get().settings.personal;
}

export function activeConfig(): GameConfig {
  const profile = activeProfile();
  const key = JSON.stringify(profile ?? null);
  if (key !== cacheKey) {
    cacheKey = key;
    cacheValue = personalizeConfig(profile);
  }
  return cacheValue;
}

export function getActivePost(num: number): PostConfig {
  const post = activeConfig().posts.find((p) => p.number === num);
  if (!post) throw new Error(`Ukjent post: ${num}`);
  return post;
}

export function findActivePost(num: number): PostConfig | undefined {
  return activeConfig().posts.find((p) => p.number === num);
}
