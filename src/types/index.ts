// Delte typer for hele spillet.

export type Category =
  | 'Mattekraft'
  | 'Samarbeid'
  | 'Kreativitet'
  | 'Latter'
  | 'Redningsevne'
  | 'Øykunnskap'
  | 'Gründerkraft'
  | 'Stillhet'
  | 'Familiekunnskap'
  | 'Fart';

// Innebygde rebuser som følger med appen (i motsetning til genererte
// egenrebuser, som reiser med i laglenken).
export type BuiltinRebusId = 'standard' | 'lydia';

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
  | 'finale-code'
  | 'simon'
  | 'whack'
  | 'balloon'
  | 'quiz-combo'
  | 'family-quiz'
  | 'who-said-it'
  | 'true-false'
  | 'speed-quiz';

export interface MapPos {
  x: number; // prosent fra venstre (0-100)
  y: number; // prosent fra toppen (0-100)
}

// Ekte GPS-posisjon (WGS84). Brukes av GPS-kartmodusen.
export interface GeoPos {
  lat: number;
  lng: number;
}

// «Lag ny rebus»: spillleders svar på de morsomme spørsmålene.
// Alle spørsmål og poster genereres fra disse.
export interface RebusAnswers {
  place: string; // f.eks. «Søm»
  groupName: string; // f.eks. «Familien på Søm»
  people: string; // navn, kommaseparert
  funFacts: string; // morsomme ting om folkene
  knownFor: string; // hva gjengen er kjent for
  insideJoke: string; // intern vits
  food: string; // hva de alltid spiser/drikker
  placeFact: string; // noe spesielt ved stedet
}

// En komplett egen rebus, generert fra svarene. Skylleviga-rebusen i
// gameConfig.ts røres aldri – denne lever ved siden av.
export interface CustomRebusPayload {
  id: string;
  name: string; // rebusens navn
  place: string;
  story: string; // introhistorie
  posts: PostConfig[]; // nummerert 1..N-1 + finalen som 15
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
  // Egen rebus: hele innholdet følger med i lenken.
  custom?: CustomRebusPayload;
  // Innebygd rebus (utenom standard): bare id-en trengs i lenken,
  // innholdet ligger i appen.
  builtin?: BuiltinRebusId;
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
  activeRebus?: BuiltinRebusId | 'custom';
}

// Felles fasong for de innebygde rebusene (Skylleviga, Lydias bursdag …).
// gameConfig.ts og lydiaConfig.ts oppfyller begge denne.
export interface BuiltinRebusConfig {
  id: BuiltinRebusId;
  eventName: string;
  shortName: string;
  home: {
    kicker: string; // liten overskrift på forsiden
    title: string;
    startLabel: string;
    continueLabel: string;
    namesPlaceholder: string; // eksempelnavn i «Kun denne telefonen»
    theme: string; // 'island' | 'birthday' – velger forsideanimasjonen
  };
  symbolsTitle: string; // f.eks. «Øysymboler» / «Bursdagssymboler»
  intro: { story: string; loadingMessages: string[] };
  defaultFinalCode: string;
  finaleSymbolPosts: number[];
  shortGamePosts: number[];
  map: {
    image: string;
    homeEmoji: string; // tegnes over finaleposten på bildekartet
    distanceLabels: { short: string; medium: string; long: string };
    distanceThresholds: { short: number; medium: number };
    distanceJoke: string;
  };
  safetyChecklist: string[];
  teamIcons: string[];
  suggestedTeamNames: string[];
  teamNameWords: { adjectives: string[]; nouns: string[] };
  categories: Category[];
  awards: { id: string; title: string; category: Category }[];
  finale: {
    solvedHeading: string;
    solvedText: string;
    celebrationHeading: string;
    everyoneAward: { title: string; detail: string };
    unsungAward: { title: string; detail: string };
    presentationOutro: string;
    presentationJoke: string;
  };
  posts: PostConfig[];
}

export interface LeaderState {
  settings: LeaderSettings;
  participants: Participant[];
  teams: Team[];
  importedResults: TeamResultPayload[];
  mapOverrides: Record<number, MapPos>;
  geoOverrides?: Record<number, GeoPos>;
  geoCenter?: GeoPos;
  customRebus?: CustomRebusPayload;
  rebusAnswers?: RebusAnswers;
}
