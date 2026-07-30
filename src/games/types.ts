import type { PostConfig, TeamCreations } from '../types';

// Kontrakt for alle minispill (hovedoppgaven på hver post).
//
// Reglene:
// - Spillet kaller onComplete NØYAKTIG én gang når oppgaven er ferdig.
// - score er 0..post.points.main (vanligvis 60). Vær raus – små barn skal
//   aldri føle at posten er ødelagt. Gi alltid noe for gjennomført forsøk.
// - creations kan sende med ting laget har laget (pass, firmanavn, regler)
//   som vises igjen i finalen og resultatene.
// - Spillet må fungere uten kamera, mikrofon og bevegelsessensor.
//   Slike sensorer er alltid et frivillig tillegg bak et aktivt valg.
export interface GameResult {
  score: number;
  creations?: Partial<TeamCreations>;
}

export interface GameProps {
  post: PostConfig;
  onComplete: (result: GameResult) => void;
}
