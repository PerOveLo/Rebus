import type { BuiltinRebusConfig, BuiltinRebusId } from '../types';
import { gameConfig } from './gameConfig';
import { lydiaConfig } from './lydiaConfig';

// Register over de innebygde rebusene. Skylleviga er alltid standard;
// nye rebuser legges til her med sin egen config-fil.
export const builtinRebuses: Record<BuiltinRebusId, BuiltinRebusConfig> = {
  standard: gameConfig,
  lydia: lydiaConfig,
};

// Slår opp en innebygd rebus og faller alltid trygt tilbake til standard.
export function builtinRebus(id: string | undefined | null): BuiltinRebusConfig {
  if (id && id in builtinRebuses) return builtinRebuses[id as BuiltinRebusId];
  return gameConfig;
}

export function isBuiltinRebusId(id: unknown): id is BuiltinRebusId {
  return typeof id === 'string' && id in builtinRebuses;
}

// Eget opplastet kartbilde lagres per rebus, så Skylleviga-kartet og
// plantegningen ikke overskriver hverandre.
export function customMapKey(id: BuiltinRebusId): string {
  return id === 'standard' ? 'skylleviga:custom-map' : `skylleviga:custom-map:${id}`;
}
