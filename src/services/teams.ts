import { gameConfig, isValidCode } from '../config/gameConfig';
import { leaderConfig, leaderCustomRebus, leaderEnabledPosts, leaderFinaleNumber, leaderRoadGames } from './personalize';
import { shortTeamLinkUrl, teamLinkUrl } from './share';
import { uid } from './storage';
import type {
  BuiltinRebusConfig,
  LeaderState,
  MapPos,
  Participant,
  Team,
  TeamLinkPayload,
} from '../types';

export function randomTeamName(taken: string[] = [], cfg: BuiltinRebusConfig = gameConfig): string {
  const { adjectives, nouns } = cfg.teamNameWords;
  const pool = [
    ...cfg.suggestedTeamNames,
    ...adjectives.flatMap((a) => nouns.map((n) => `${a} ${n}`)),
  ].filter((n) => !taken.includes(n));
  if (pool.length === 0) return `Lag ${taken.length + 1}`;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomTeamIcon(taken: string[] = [], cfg: BuiltinRebusConfig = gameConfig): string {
  const pool = cfg.teamIcons.filter((i) => !taken.includes(i));
  const source = pool.length > 0 ? pool : cfg.teamIcons;
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
export function autoSplitTeams(
  participants: Participant[],
  teamCount: number,
  cfg: BuiltinRebusConfig = gameConfig,
): Team[] {
  const count = Math.max(1, Math.min(teamCount, Math.max(1, participants.length)));
  const adults = shuffle(participants.filter((p) => p.isAdult));
  const kids = shuffle(participants.filter((p) => !p.isAdult));

  const teams: Team[] = [];
  const names: string[] = [];
  const icons: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = randomTeamName(names, cfg);
    const icon = randomTeamIcon(icons, cfg);
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

// Rekkefølge av poster for et lag. Vanlige poster kan roteres, finalen er alltid sist.
export function buildPostOrder(
  enabledPosts: number[],
  teamIndex: number,
  rotate: boolean,
  finale = 15,
): number[] {
  const regular = enabledPosts.filter((n) => n !== finale).sort((a, b) => a - b);
  if (regular.length === 0) return [finale];
  // Spre startpunktene utover ruten slik at lagene ikke står i kø.
  const startIdx = rotate ? (teamIndex * Math.max(1, Math.floor(regular.length / 3))) % regular.length : 0;
  const ordered = [...regular.slice(startIdx), ...regular.slice(0, startIdx)];
  return [...ordered, finale];
}

// Beste delbare URL for et lag: kortlenke når rebusen er innebygd og
// kartet er urørt, ellers den fulle lenken med alt innhold.
export function bestTeamUrl(state: LeaderState, team: Team, teamIndex: number): string {
  const cfg = leaderConfig(state);
  const enabledPosts = leaderEnabledPosts(state);
  const geoOverrides = state.geoOverrides ?? {};
  const geoComplete =
    (state.settings.useGeoMap ?? false) && enabledPosts.every((n) => geoOverrides[n]);
  const canShort =
    !leaderCustomRebus(state) && !geoComplete && Object.keys(state.mapOverrides).length === 0;
  if (!canShort) return teamLinkUrl(buildTeamLink(state, team, teamIndex));

  const order = buildPostOrder(enabledPosts, teamIndex, state.settings.rotateStarts, leaderFinaleNumber(state));
  const all = cfg.posts.map((p) => p.number).sort((a, b) => a - b);
  const enabled = [...enabledPosts].sort((a, b) => a - b);
  const samePosts = enabled.length === all.length && enabled.every((n, idx) => n === all[idx]);
  const roadGames = leaderRoadGames(state);
  return shortTeamLinkUrl({
    r: cfg.id,
    n: team.name,
    i: team.icon,
    o: order[0],
    f: isValidCode(state.settings.finalCode) ? state.settings.finalCode : cfg.defaultFinalCode,
    p: samePosts ? undefined : enabled,
    g: Object.keys(roadGames).length > 0 ? roadGames : undefined,
  });
}

export function buildTeamLink(
  state: LeaderState,
  team: Team,
  teamIndex: number,
): TeamLinkPayload {
  const cfg = leaderConfig(state);
  const enabledPosts = leaderEnabledPosts(state);
  const overrides: Record<number, MapPos> = state.mapOverrides;
  const order = buildPostOrder(enabledPosts, teamIndex, state.settings.rotateStarts, leaderFinaleNumber(state));

  // GPS-kartet brukes bare når alle aktive poster faktisk er plassert.
  const geoOverrides = state.geoOverrides ?? {};
  const geoComplete =
    (state.settings.useGeoMap ?? false) && enabledPosts.every((n) => geoOverrides[n]);
  const geo = geoComplete
    ? Object.fromEntries(enabledPosts.map((n) => [n, geoOverrides[n]]))
    : undefined;

  const custom = leaderCustomRebus(state);
  const roadGames = leaderRoadGames(state);

  return {
    v: 1,
    kind: 'team',
    eventName: custom?.name ?? cfg.eventName,
    team,
    order,
    finalCode: isValidCode(state.settings.finalCode)
      ? state.settings.finalCode
      : cfg.defaultFinalCode,
    mapOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    geo,
    center: geoComplete ? state.geoCenter : undefined,
    custom,
    builtin: !custom && cfg.id !== 'standard' ? cfg.id : undefined,
    roadGames: Object.keys(roadGames).length > 0 ? roadGames : undefined,
  };
}
