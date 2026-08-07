import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { builtinRebus, isBuiltinRebusId } from '../config/rebuses';
import { uid } from './storage';
import type { BuiltinRebusId, TeamLinkPayload, TeamResultPayload } from '../types';

// Laglenker og resultater deles som komprimerte strenger i URL/QR.
// Ingen server er involvert – all informasjon ligger i selve lenken.
//
// To formater:
// - v1 (lang): hele oppsettet i lenken. Trengs for egne genererte rebuser
//   (innholdet må reise med) og når kart/GPS-posisjoner er endret.
// - v2 (kort): for innebygde rebuser ligger innholdet i appen, så lenken
//   trenger bare lagnavn, ikon, startpost og kode. Mye kortere lenker!

export function encodePayload(payload: TeamLinkPayload | TeamResultPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

// Kortlenke-data: r = rebus, n = lagnavn, i = ikon, o = startpost,
// f = finalekode, p = aktive poster (bare hvis ikke alle er med),
// g = underveis-spill (målpost -> post i innendørsrebusen).
export interface ShortTeamLink {
  v: 2;
  r: BuiltinRebusId;
  n: string;
  i: string;
  o: number;
  f: string;
  p?: number[];
  g?: Record<number, number>;
}

export function shortTeamLinkUrl(data: Omit<ShortTeamLink, 'v'>): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/join/${compressToEncodedURIComponent(JSON.stringify({ v: 2, ...data }))}`;
}

// Kortlenke for et lag som allerede er i gang (flere telefoner på laget).
// Forutsetter at oppsettet ikke bærer egen rebus, GPS eller kartendringer.
export function shortUrlFromSetup(setup: TeamLinkPayload): string | null {
  if (setup.custom || setup.geo || setup.mapOverrides) return null;
  const cfg = builtinRebus(setup.builtin);
  const all = cfg.posts.map((p) => p.number).sort((a, b) => a - b);
  const enabled = [...setup.order].sort((a, b) => a - b);
  const samePosts = enabled.length === all.length && enabled.every((n, idx) => n === all[idx]);
  return shortTeamLinkUrl({
    r: cfg.id,
    n: setup.team.name,
    i: setup.team.icon,
    o: setup.order[0],
    f: setup.finalCode,
    p: samePosts ? undefined : enabled,
    g: setup.roadGames && Object.keys(setup.roadGames).length > 0 ? setup.roadGames : undefined,
  });
}

// Pakker en kortlenke ut til et fullt lagoppsett med innhold fra appen.
function expandShortTeamLink(parsed: ShortTeamLink): TeamLinkPayload | null {
  if (!isBuiltinRebusId(parsed.r)) return null;
  if (typeof parsed.n !== 'string' || parsed.n.trim() === '') return null;
  const cfg = builtinRebus(parsed.r);
  const finale = cfg.finaleNumber;
  const all = cfg.posts.map((p) => p.number);
  const enabled = Array.isArray(parsed.p)
    ? parsed.p.filter((n) => typeof n === 'number' && all.includes(n))
    : all;
  const regular = enabled.filter((n) => n !== finale).sort((a, b) => a - b);
  if (regular.length === 0) return null;
  const startIdx = Math.max(0, regular.indexOf(parsed.o));
  const order = [...regular.slice(startIdx), ...regular.slice(0, startIdx), finale];
  return {
    v: 1,
    kind: 'team',
    eventName: cfg.eventName,
    team: {
      id: uid(),
      name: parsed.n.slice(0, 40),
      icon: typeof parsed.i === 'string' && parsed.i ? parsed.i : '🚩',
      members: [],
    },
    order,
    finalCode: typeof parsed.f === 'string' && /^\d{4}$/.test(parsed.f) ? parsed.f : cfg.defaultFinalCode,
    builtin: parsed.r !== 'standard' ? parsed.r : undefined,
    roadGames:
      parsed.g && typeof parsed.g === 'object' && Object.keys(parsed.g).length > 0
        ? parsed.g
        : undefined,
  };
}

export function decodeTeamLink(data: string): TeamLinkPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const parsed = JSON.parse(json) as TeamLinkPayload | ShortTeamLink;
    if (parsed.v === 2) return expandShortTeamLink(parsed);
    // Ukjent innebygd rebus-id (f.eks. fra en nyere versjon av appen)
    // avvises i stedet for å vise feil innhold.
    if (parsed.builtin != null && !isBuiltinRebusId(parsed.builtin)) return null;
    const posts = Array.isArray(parsed.custom?.posts)
      ? parsed.custom.posts
      : builtinRebus(parsed.builtin).posts;
    const validNumbers = new Set(posts.map((p) => p.number));
    if (
      parsed.v !== 1 ||
      parsed.kind !== 'team' ||
      !parsed.team?.id ||
      !Array.isArray(parsed.order) ||
      parsed.order.length === 0 ||
      !parsed.order.every((n) => typeof n === 'number' && validNumbers.has(n))
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function decodeResult(data: string): TeamResultPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const parsed = JSON.parse(json) as TeamResultPayload;
    if (parsed.v !== 1 || parsed.kind !== 'result' || !parsed.teamId) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Full URL et annet lag kan åpne direkte (fungerer med HashRouter på GitHub Pages).
export function teamLinkUrl(payload: TeamLinkPayload): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/join/${encodePayload(payload)}`;
}
