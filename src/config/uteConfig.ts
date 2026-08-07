import type { BuiltinRebusConfig, Category, PostConfig } from '../types';

// ============================================================
// Lydias bursdagsrebus UTE: en enkel rebus rundt huset for
// barnehagebarn og førsteklassinger. Den voksne på laget leser
// og guider – appen viser kartet og veien. Kartet er flyfotoet
// public/fuglevikkleiva-kart.jpg med 6 poster.
//
// NB: Postinnholdet under er PLASSHOLDERE – selve rebusoppgavene
// fylles inn når de er klare. Kartposisjonene er ferdig plassert.
// ============================================================

export const uteConfig: BuiltinRebusConfig = {
  id: 'ute',
  eventName: 'Lydias 6-årsdag – Bursdagsrebusen',
  shortName: 'Bursdagsrebusen (ute)',

  home: {
    kicker: 'LYDIA BLIR 6 ÅR',
    title: 'Bursdagsrebusen',
    startLabel: 'Start rebusen 🎈',
    continueLabel: 'Fortsett rebusen 🎈',
    namesPlaceholder: 'Lydia\nLars\nLotte',
    theme: 'birthday',
  },

  symbolsTitle: 'Bursdagssymboler',

  intro: {
    story:
      'Velkommen til Lydias bursdagsrebus! Kartet viser veien fra post til post rundt huset. Den voksne på laget leser oppgavene høyt, og laget løser dem sammen.\n\nSamle et symbol på hver post – og kom dere helt i mål. HURRA for Lydia!',
    loadingMessages: [
      'Blåser opp ballonger …',
      'Gjemmer postene rundt huset …',
      'Legger ut teppet til Kims lek …',
      'Teller barnesteg til lekeplassen …',
      'Lotte har veltet noe – rydder …',
      'Mamma pakker sekken til alle …',
    ],
  },

  defaultFinalCode: '0606',

  // Post 6 (hjemme ved huset) er alltid siste post.
  finaleNumber: 6,

  finaleSymbolPosts: [1, 2, 3, 4],

  shortGamePosts: [1, 2, 5, 6],

  map: {
    image: 'fuglevikkleiva-kart.jpg', // flyfoto rundt huset i public/
    homeEmoji: '🎂',
    distanceLabels: {
      short: 'Rett borti her',
      medium: 'Et lite stykke å gå',
      long: 'Et godt stykke – følg stien',
    },
    distanceThresholds: { short: 14, medium: 30 },
    distanceJoke: 'Avstander er målt i barnesteg.',
  },

  safetyChecklist: [
    'Barna går sammen med den voksne på laget.',
    'Vi ser oss godt for der det kan komme biler.',
    'Vi venter på hverandre ved hver post.',
    'Vi holder oss til stien og hagene vi har lov til å gå i.',
    'Spillet lagrer ikke posisjon, lyd eller bilder på en server.',
    'Kamera, mikrofon og GPS er alltid valgfrie.',
  ],

  teamIcons: ['🎈', '🧸', '🦄', '🏎️', '🐾', '⭐', '🍭', '🦸', '👑', '🎁', '🌈', '🐣'],

  suggestedTeamNames: [
    'Bamsepatruljen',
    'Ballongbanden',
    'Glitterheltene',
    'Danseløvene',
    'Turbogjengen',
    'Regnbueheltene',
    'Stjernelaget',
    'Kakekameratene',
  ],

  teamNameWords: {
    adjectives: ['Dansende', 'Glitrende', 'Superraske', 'Fnisende', 'Modige', 'Rosa', 'Ustoppelige', 'Hemmelige'],
    nouns: ['Bamser', 'Ballonger', 'Enhjørninger', 'Bursdagshelter', 'Valper', 'Sjørøvere', 'Prinsesser', 'Stjerner'],
  },

  categories: ['Samarbeid', 'Latter', 'Kreativitet', 'Fart', 'Familiekunnskap'] as Category[],

  awards: [
    { id: 'teamwork', title: 'Beste samarbeid', category: 'Samarbeid' as Category },
    { id: 'laugh', title: 'Største latter', category: 'Latter' as Category },
    { id: 'creative', title: 'Kreativiteten sjæl', category: 'Kreativitet' as Category },
    { id: 'honorary', title: 'Dagens bursdagshelter', category: 'Samarbeid' as Category },
  ],

  finale: {
    solvedHeading: 'Hurra! Dere klarte hele rebusen!',
    solvedText: 'Bursdagsskatten er deres!',
    celebrationHeading: '🎉 Hurra for Lydia – dere klarte rebusen! 🎉',
    everyoneAward: { title: 'Dagens bursdagshelter', detail: 'Alle som fullførte Lydias bursdagsrebus' },
    unsungAward: { title: 'Bursdagskomiteens hederspris', detail: 'For godt humør hele veien rundt huset' },
    presentationOutro: 'Hurra for Lydia – 6 år i dag!',
    presentationJoke: 'Kaka venter. 🎂',
  },

  // ------------------------------------------------------------------
  // PLASSHOLDER-POSTER: kartposisjonene er ferdige (fra det markerte
  // flyfotoet). Tekster, oppgaver og spill byttes ut når rebusinnholdet
  // er klart. «checkpoint» = den voksne leser oppgaven, laget løser den
  // og trykker «Vi har gjort det!».
  // ------------------------------------------------------------------
  posts: [
    {
      id: 'ute1',
      number: 1,
      title: 'Post 1',
      symbol: '🎈',
      clue: 'Start i hagen ved huset.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute1-sym', name: 'Ballongmerket', emoji: '🎈' },
      categories: ['Samarbeid'],
      mapPos: { x: 16.9, y: 85.5 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
    {
      id: 'ute2',
      number: 2,
      title: 'Post 2',
      symbol: '🌿',
      clue: 'Følg stien oppover fra huset.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute2-sym', name: 'Stimerket', emoji: '🌿' },
      categories: ['Samarbeid'],
      mapPos: { x: 20.6, y: 66.5 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
    {
      id: 'ute3',
      number: 3,
      title: 'Post 3',
      symbol: '🌳',
      clue: 'Gå stien helt bort til den grønne sletta.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute3-sym', name: 'Slettemerket', emoji: '🌳' },
      categories: ['Samarbeid'],
      mapPos: { x: 92.8, y: 48.4 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
    {
      id: 'ute4',
      number: 4,
      title: 'Post 4',
      symbol: '🦋',
      clue: 'Tilbake langs stien – stopp midt på.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute4-sym', name: 'Sommerfuglmerket', emoji: '🦋' },
      categories: ['Samarbeid'],
      mapPos: { x: 61.4, y: 37.4 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
    {
      id: 'ute5',
      number: 5,
      title: 'Post 5',
      symbol: '🛝',
      clue: 'Opp til lekeplassen!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute5-sym', name: 'Lekeplassmerket', emoji: '🛝' },
      categories: ['Samarbeid'],
      mapPos: { x: 30.7, y: 14.8 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
    {
      id: 'ute6',
      number: 6,
      title: 'Post 6 – mål!',
      symbol: '🎂',
      clue: 'Hjem til huset – der venter målgangen!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: '',
      islandSymbol: { id: 'ute6-sym', name: 'Målmerket', emoji: '🏆' },
      categories: ['Samarbeid'],
      mapPos: { x: 25.7, y: 84.2 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {},
    },
  ] as PostConfig[],
};
