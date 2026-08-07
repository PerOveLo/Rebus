import { gameConfig } from '../config/gameConfig';
import { findActivePost } from './personalize';
import type { BuiltinRebusConfig, Category, TeamProgress, TeamResultPayload } from '../types';

export function totalScore(progress: TeamProgress): number {
  const posts = Object.values(progress.results).reduce(
    (sum, r) => sum + r.mainScore + r.teamScore + r.bonusScore,
    0,
  );
  const road = Object.values(progress.roadResults ?? {}).reduce((sum, s) => sum + s, 0);
  return posts + road;
}

export function maxPossibleScore(progress: TeamProgress): number {
  return progress.setup.order.length * 100;
}

export function categoryScores(progress: TeamProgress): Partial<Record<Category, number>> {
  const scores: Partial<Record<Category, number>> = {};
  for (const r of Object.values(progress.results)) {
    const post = findActivePost(r.postNumber);
    if (!post) continue;
    const points = r.mainScore + r.teamScore + r.bonusScore;
    for (const cat of post.categories) {
      scores[cat] = (scores[cat] ?? 0) + points;
    }
  }
  return scores;
}

export function bestCategory(progress: TeamProgress): Category | null {
  const scores = categoryScores(progress);
  let best: Category | null = null;
  let bestVal = -1;
  for (const [cat, val] of Object.entries(scores) as [Category, number][]) {
    if (val > bestVal) {
      best = cat;
      bestVal = val;
    }
  }
  return best;
}

export function minutesUsed(progress: TeamProgress): number | null {
  if (!progress.startedAt || !progress.finishedAt) return null;
  return Math.round((progress.finishedAt - progress.startedAt) / 60000);
}

export function buildResultPayload(progress: TeamProgress): TeamResultPayload {
  return {
    v: 1,
    kind: 'result',
    teamId: progress.setup.team.id,
    teamName: progress.setup.team.name,
    icon: progress.setup.team.icon,
    members: progress.setup.team.members.map((m) => ({ name: m.name, isAdult: m.isAdult })),
    total: totalScore(progress),
    postsCompleted: Object.keys(progress.results).length,
    minutesUsed: minutesUsed(progress),
    categoryScores: categoryScores(progress),
    creations: progress.creations,
  };
}

export interface AwardResult {
  title: string;
  teamNames: string[];
  detail: string;
}

// Del ut titler slik at flere lag blir fremhevet – ikke bare vinneren.
// Titlene kommer fra den aktive rebusens config.
export function computeAwards(
  results: TeamResultPayload[],
  cfg: BuiltinRebusConfig = gameConfig,
): AwardResult[] {
  if (results.length === 0) return [];
  const awards: AwardResult[] = [];
  const winners = new Set<string>();

  const bestIn = (cat: Category): TeamResultPayload[] => {
    let bestVal = -1;
    for (const r of results) bestVal = Math.max(bestVal, r.categoryScores[cat] ?? 0);
    if (bestVal <= 0) return [];
    return results.filter((r) => (r.categoryScores[cat] ?? 0) === bestVal);
  };

  for (const award of cfg.awards) {
    if (award.id === 'honorary') continue; // alle får denne til slutt
    const best = bestIn(award.category);
    if (best.length > 0) {
      best.forEach((r) => winners.add(r.teamId));
      awards.push({
        title: award.title,
        teamNames: best.map((r) => r.teamName),
        detail: `${award.category}: ${best[0].categoryScores[award.category] ?? 0} poeng`,
      });
    }
  }

  // Sørg for at lag uten tittel også blir hedret.
  const unsung = results.filter((r) => !winners.has(r.teamId));
  if (unsung.length > 0) {
    awards.push({
      title: cfg.finale.unsungAward.title,
      teamNames: unsung.map((r) => r.teamName),
      detail: cfg.finale.unsungAward.detail,
    });
  }

  awards.push({
    title: cfg.finale.everyoneAward.title,
    teamNames: results.map((r) => r.teamName),
    detail: cfg.finale.everyoneAward.detail,
  });

  return awards;
}
