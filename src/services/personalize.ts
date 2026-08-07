import { builtinRebus, builtinRebuses, isBuiltinRebusId } from '../config/rebuses';
import { leaderStore, teamStore } from './storage';
import type {
  BuiltinRebusConfig,
  BuiltinRebusId,
  CustomRebusPayload,
  LeaderState,
  PostConfig,
  PostTextOverride,
} from '../types';

// Legg spillleders omskrevne tekster oppå rebusens originaler.
// Tomme felt betyr «bruk originalen».
function withTextOverrides(
  posts: PostConfig[],
  overrides: Record<number, PostTextOverride> | undefined,
): PostConfig[] {
  if (!overrides || Object.keys(overrides).length === 0) return posts;
  return posts.map((p) => {
    const o = overrides[p.number];
    if (!o) return p;
    return {
      ...p,
      title: o.title?.trim() ? o.title.trim() : p.title,
      clue: o.clue?.trim() ? o.clue.trim() : p.clue,
      data: o.prompt?.trim() ? { ...(p.data ?? {}), prompt: o.prompt.trim() } : p.data,
    };
  });
}

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
  if (team) {
    if (isBuiltinRebusId(team.setup.builtin)) return team.setup.builtin;
    // Egne genererte rebuser bruker uterebusen som basis; gamle lenker
    // uten builtin-felt er Skylleviga-lenker.
    return team.setup.custom ? 'ute' : 'standard';
  }
  const id = leaderStore.get().settings.activeRebus;
  if (id === 'custom') return 'ute';
  return isBuiltinRebusId(id) ? id : 'ute';
}

// Den innebygde rebusen som gjelder nå (for en egen generert rebus er
// dette standardoppsettet, som gir kart, ikoner og finaletekster).
export function activeConfig(): BuiltinRebusConfig {
  return builtinRebuses[activeBuiltinId()];
}

export function activePosts(): PostConfig[] {
  const custom = activeCustomRebus();
  if (custom) return custom.posts;
  const team = teamStore.get();
  const overrides = team
    ? team.setup.postTexts
    : leaderStore.get().postTexts?.[activeBuiltinId()];
  return withTextOverrides(activeConfig().posts, overrides);
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
  if (id === 'custom') return 'ute'; // basisinnhold for egne rebuser
  return isBuiltinRebusId(id) ? id : 'ute'; // uterebusen er standard
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
  const custom = leaderCustomRebus(state);
  if (custom) return custom.posts;
  return withTextOverrides(
    leaderConfig(state).posts,
    state.postTexts?.[leaderBuiltinId(state)],
  );
}

// Renskede tekst-overstyringer til laglenker: bare felt med innhold.
export function leaderPostTexts(state: LeaderState): Record<number, PostTextOverride> {
  if (leaderCustomRebus(state)) return {};
  const raw = state.postTexts?.[leaderBuiltinId(state)] ?? {};
  const clean: Record<number, PostTextOverride> = {};
  for (const [num, o] of Object.entries(raw)) {
    const entry: PostTextOverride = {};
    if (o.title?.trim()) entry.title = o.title.trim();
    if (o.clue?.trim()) entry.clue = o.clue.trim();
    if (o.prompt?.trim()) entry.prompt = o.prompt.trim();
    if (Object.keys(entry).length > 0) clean[Number(num)] = entry;
  }
  return clean;
}

// Aktive poster filtrert mot rebusen som faktisk er valgt – beskytter mot
// at et gammelt oppsett peker på poster som ikke finnes i rebusen.
export function leaderEnabledPosts(state: LeaderState): number[] {
  const valid = new Set(leaderPosts(state).map((p) => p.number));
  const filtered = state.settings.enabledPosts.filter((n) => valid.has(n));
  return filtered.length > 0 ? filtered : [...valid];
}

// Finaleposten (alltid sist i løypa) for spillleders aktive rebus.
export function leaderFinaleNumber(state: LeaderState): number {
  return leaderCustomRebus(state) ? 15 : leaderConfig(state).finaleNumber;
}

// Underveis-spill for spillleders aktive rebus: målpost -> postnummer i
// innendørsrebusen. Uten eget valg brukes rebusens standard; 0 = ingen.
export function leaderRoadGames(state: LeaderState): Record<number, number> {
  if (leaderCustomRebus(state)) return {};
  const slots = leaderConfig(state).roadSlots ?? [];
  const chosen = state.settings.roadGames ?? {};
  const result: Record<number, number> = {};
  for (const slot of slots) {
    const pick = chosen[slot.before] ?? slot.default;
    if (pick > 0 && builtinRebuses.lydia.posts.some((p) => p.number === pick && p.number !== 15)) {
      result[slot.before] = pick;
    }
  }
  return result;
}

// Bilde for en post: spillleders eget opplastede bilde (kun denne
// telefonen) vinner over bildet som følger med rebusen.
export function postImageKey(rebusId: string, postNumber: number): string {
  return `skylleviga:post-image:${rebusId}:${postNumber}`;
}

export function activePostImage(post: PostConfig): string | null {
  const rebusId = activeCustomRebus() ? 'custom' : activeBuiltinId();
  try {
    const own = localStorage.getItem(postImageKey(rebusId, post.number));
    if (own) return own;
  } catch {
    // localStorage utilgjengelig
  }
  return post.image ? `${import.meta.env.BASE_URL}${post.image}` : null;
}
