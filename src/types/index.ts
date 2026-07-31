// Delte typer for hele spillet.

export type Category =
  | 'Mattekraft'
  | 'Samarbeid'
  | 'Kreativitet'
  | 'Latter'
  | 'Redningsevne'
  | 'Øykunnskap'
  | 'Gründerkraft'
  | 'Stillhet';

export type GameType =
  | 'tunnel-run'
  | 'passport'
  | 'height-stack'
  | 'laugh-rhythm'
  | 'math-vault'
  | 'rescue-match'
  | 'stillness'
  | 'renovation-find'
  | 'budget'
  | 'startup-wheel'
  | 'inbox'
  | 'animal-memory'
  | 'language-match'
  | 'swipe-detector'
  | 'finale-code';

export interface MapPos {
  x: number; // prosent fra venstre (0-100)
  y: number; // prosent fra toppen (0-100)
}

// Ekte GPS-posisjon (WGS84). Brukes av GPS-kartmodusen.
export interface GeoPos {
  lat: number;
  lng: number;
}

// Personlig tilpasning for fremtidige rebuser: navnene og stedene i
// standardhistorien byttes ut med deltakernes egne.
export interface PersonalProfile {
  placeName?: string; // erstatter «Skylleviga»
  islandName?: string; // erstatter «Flekkerøya»
  hostTall?: string; // erstatter «Sjur» (den høye verten/gründeren)
  hostLaugh?: string; // erstatter «Ida» (den med latteren)
  mathWhiz?: string; // erstatter «Emil»
  rescuer?: string; // erstatter «Isak»
  sleeper?: string; // erstatter «Jenny»
}

export interface IslandSymbol {
  id: string;
  name: string;
  emoji: string;
}

export interface PostPoints {
  main: number; // hovedoppgave (opptil)
  team: number; // lagoppgave
  bonus: number; // voksenbonus
  hintPenalty: number; // trekk ved hint
}

export interface PostConfig {
  id: string;
  number: number;
  title: string;
  symbol: string; // emoji som representerer posten
  clue: string; // ledetråd til stedet
  gameType: GameType;
  gameIntro: string; // kort forklaring av den interaktive oppgaven
  physicalTask: string;
  adultBonus: string;
  adultBonusJudgeOptions: string[]; // barna dømmer med disse
  hint: string;
  funFact: string; // kort morsom forklaring etter svaret
  islandSymbol: IslandSymbol;
  categories: Category[];
  mapPos: MapPos;
  points: PostPoints;
  // Spillspesifikke data (spørsmål, gjenstander osv.) – bevisst løst typet
  // slik at alt innhold kan redigeres i gameConfig.ts.
  data?: Record<string, unknown>;
}

export interface Participant {
  id: string;
  name: string;
  isAdult: boolean;
}

export interface Team {
  id: string;
  name: string;
  icon: string; // emoji
  members: Participant[];
}

// Det som pakkes inn i laglenken/QR-koden.
export interface TeamLinkPayload {
  v: 1;
  kind: 'team';
  eventName: string;
  team: Team;
  order: number[]; // rekkefølge av postnummer, alltid med finalen sist
  finalCode: string;
  mapOverrides?: Record<number, MapPos>;
  // GPS-modus: ekte posisjoner for postene + kartsentrum.
  geo?: Record<number, GeoPos>;
  center?: GeoPos;
  personal?: PersonalProfile;
}

export interface PostResult {
  postNumber: number;
  mainScore: number;
  teamScore: number;
  bonusScore: number;
  hintUsed: boolean;
  completedAt: number;
}

// Ting lagene lager underveis og som vises i finalen/resultatene.
export interface TeamCreations {
  passAnimal?: string;
  passTransport?: string;
  passPower?: string;
  passSnack?: string;
  passTitle?: string;
  byfolkRule?: string;
  startupIdea?: string;
  startupName?: string;
  startupSlogan?: string;
}

export interface TeamProgress {
  setup: TeamLinkPayload;
  startedAt: number | null;
  finishedAt: number | null;
  safetyConfirmed: boolean;
  currentOrderIndex: number; // indeks i setup.order
  results: Record<number, PostResult>; // per postnummer
  collectedSymbols: string[]; // islandSymbol.id
  creations: TeamCreations;
  // delvis fremdrift på en post (overlever at nettleseren lukkes)
  partial?: { postNumber: number; stage: number; mainScore: number; teamScore: number; hintUsed: boolean };
  // Laget kan bytte fra GPS-kart til vanlig bildekart (f.eks. for å
  // teste spillet innendørs uten å gå ruta).
  preferClassicMap?: boolean;
}

// Det som pakkes inn i resultat-QR-koden.
export interface TeamResultPayload {
  v: 1;
  kind: 'result';
  teamId: string;
  teamName: string;
  icon: string;
  members: { name: string; isAdult: boolean }[];
  total: number;
  postsCompleted: number;
  minutesUsed: number | null;
  categoryScores: Partial<Record<Category, number>>;
  creations: TeamCreations;
}

export interface LeaderSettings {
  pin: string;
  finalCode: string;
  enabledPosts: number[]; // postnummer som er med (15 alltid med)
  rotateStarts: boolean;
  teamCount: number;
  useGeoMap?: boolean; // GPS-kart i stedet for bildekart
  personal?: PersonalProfile;
}

export interface LeaderState {
  settings: LeaderSettings;
  participants: Participant[];
  teams: Team[];
  importedResults: TeamResultPayload[];
  mapOverrides: Record<number, MapPos>;
  geoOverrides?: Record<number, GeoPos>;
  geoCenter?: GeoPos;
}
