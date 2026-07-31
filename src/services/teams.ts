import { gameConfig, isValidCode } from '../config/gameConfig';
import { uid } from './storage';
import type { LeaderState, MapPos, Participant, Team, TeamLinkPayload } from '../types';

export function randomTeamName(taken: string[] = []): string {
  const { adjectives, nouns } = gameConfig.teamNameWords;
  const pool = [
    ...gameConfig.suggestedTeamNames,
    ...adjectives.flatMap((a) => nouns.map((n) => `${a} ${n}`)),
  ].filter((n) => !taken.includes(n));
  if (pool.length === 0) return `Lag ${taken.length + 1}`;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomTeamIcon(taken: string[] = []): string {
  const pool = gameConfig.teamIcons.filter((i) => !taken.includes(i));
  const source = pool.length > 0 ? pool : gameConfig.teamIcons;
  return source[Math.floor(Math.random() * source.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fordel deltakere i lag med jevn fordeling av voksne.
export function autoSplitTeams(participants: Participant[], teamCount: number): Team[] {
  const count = Math.max(1, Math.min(teamCount, Math.max(1, participants.length)));
  const adults = shuffle(participants.filter((p) => p.isAdult));
  const kids = shuffle(participants.filter((p) => !p.isAdult));

  const teams: Team[] = [];
  const names: string[] = [];
  const icons: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = randomTeamName(names);
    const icon = randomTeamIcon(icons);
    names.push(name);
    icons.push(icon);
    teams.push({ id: uid(), name, icon, members: [] });
  }

  // Voksne først (rund fordeling), deretter barn – alltid til minste lag.
  adults.forEach((a, i) => teams[i % count].members.push(a));
  kids.forEach((k) => {
    const smallest = [...teams].sort((a, b) => a.members.length - b.members.length)[0];
    smallest.members.push(k);
  });

  return teams;
}

// Rekkefølge av poster for et lag. Post 1–14 kan roteres, finalen er alltid sist.
export function buildPostOrder(enabledPosts: number[], teamIndex: number, rotate: boolean): number[] {
  const finale = 15;
  const regular = enabledPosts.filter((n) => n !== finale).sort((a, b) => a - b);
  if (regular.length === 0) return [finale];
  // Spre startpunktene utover ruten slik at lagene ikke står i kø.
  const startIdx = rotate ? (teamIndex * Math.max(1, Math.floor(regular.length / 3))) % regular.length : 0;
  const ordered = [...regular.slice(startIdx), ...regular.slice(0, startIdx)];
  return [...ordered, finale];
}

export function buildTeamLink(
  state: LeaderState,
  team: Team,
  teamIndex: number,
): TeamLinkPayload {
  const overrides: Record<number, MapPos> = state.mapOverrides;
  const order = buildPostOrder(state.settings.enabledPosts, teamIndex, state.settings.rotateStarts);

  // GPS-kartet brukes bare når alle aktive poster faktisk er plassert.
  const geoOverrides = state.geoOverrides ?? {};
  const geoComplete =
    (state.settings.useGeoMap ?? false) &&
    state.settings.enabledPosts.every((n) => geoOverrides[n]);
  const geo = geoComplete
    ? Object.fromEntries(
        state.settings.enabledPosts.map((n) => [n, geoOverrides[n]]),
      )
    : undefined;

  return {
    v: 1,
    kind: 'team',
    eventName: gameConfig.eventName,
    team,
    order,
    finalCode: isValidCode(state.settings.finalCode)
      ? state.settings.finalCode
      : gameConfig.defaultFinalCode,
    mapOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    geo,
    center: geoComplete ? state.geoCenter : undefined,
    personal: state.settings.personal,
  };
}
