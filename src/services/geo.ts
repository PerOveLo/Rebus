import type { GeoPos } from '../types';

// GPS-hjelpere. All posisjonsbruk skjer lokalt på telefonen –
// ingenting sendes til noen server.

// Omtrentlig sentrum for Skylleviga på Flekkerøya. Spillleder bør
// alltid søke opp adressen i appen for å treffe helt riktig.
export const DEFAULT_CENTER: GeoPos = { lat: 58.069, lng: 8.005 };
export const DEFAULT_ADDRESS = 'Skylleviga 46, Kristiansand';

// Radius (meter) for «dere er fremme»-følelsen.
export const ARRIVAL_RADIUS_M = 35;

const EARTH_R = 6371000;

export function haversineMeters(a: GeoPos, b: GeoPos): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

// Kompasskurs fra a mot b i grader (0 = nord, 90 = øst).
export function bearingDeg(a: GeoPos, b: GeoPos): number {
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function compassLabel(deg: number): string {
  const dirs = ['nord', 'nordøst', 'øst', 'sørøst', 'sør', 'sørvest', 'vest', 'nordvest'];
  return dirs[Math.round(deg / 45) % 8];
}

export function metersLabel(m: number): string {
  if (m < 25) return 'rett her';
  if (m < 1000) return `ca. ${Math.round(m / 10) * 10} m`;
  return `ca. ${(m / 1000).toFixed(1)} km`;
}

// Flytt et punkt nMeters mot øst/nord (grov, men god nok på hagefestnivå).
export function offsetMeters(origin: GeoPos, east: number, north: number): GeoPos {
  const lat = origin.lat + north / 111320;
  const lng = origin.lng + east / (111320 * Math.cos((origin.lat * Math.PI) / 180));
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

// Spre postene i en spiral rundt sentrum som utgangspunkt for redigering.
// Finalen (15) legges ved sentrum.
export function scatterPosts(center: GeoPos, postNumbers: number[]): Record<number, GeoPos> {
  const result: Record<number, GeoPos> = {};
  const regular = postNumbers.filter((n) => n !== 15);
  const golden = 137.5;
  regular.forEach((n, i) => {
    const angle = ((i * golden) % 360) * (Math.PI / 180);
    const radius = 60 + (i / Math.max(1, regular.length - 1)) * 120; // 60–180 m
    result[n] = offsetMeters(center, Math.cos(angle) * radius, Math.sin(angle) * radius);
  });
  if (postNumbers.includes(15)) {
    result[15] = offsetMeters(center, 8, -8);
  }
  return result;
}

export interface GeocodeHit {
  label: string;
  pos: GeoPos;
}

// Gratis adressesøk via OpenStreetMap Nominatim. Kalles kun når
// spillleder aktivt søker – lett bruk er innenfor bruksvilkårene.
export async function geocodeAddress(query: string): Promise<GeocodeHit[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=no&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Geokoding feilet (${res.status})`);
  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return data.map((d) => ({
    label: d.display_name,
    pos: { lat: Number(d.lat), lng: Number(d.lon) },
  }));
}
