import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { TeamLinkPayload, TeamResultPayload } from '../types';

// Laglenker og resultater deles som komprimerte strenger i URL/QR.
// Ingen server er involvert – all informasjon ligger i selve lenken.

export function encodePayload(payload: TeamLinkPayload | TeamResultPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeTeamLink(data: string): TeamLinkPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const parsed = JSON.parse(json) as TeamLinkPayload;
    if (parsed.v !== 1 || parsed.kind !== 'team' || !parsed.team?.id || !Array.isArray(parsed.order)) return null;
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
