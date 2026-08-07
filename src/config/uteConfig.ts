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
  shortName: 'Lydias bursdagsrebus',

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
      'Velkommen til Lydias bursdagsrebus! Kartet viser veien fra post til post rundt huset. Den voksne på laget leser oppgavene høyt, og laget løser dem sammen.\n\nSamle et merke på hver post – og kom dere helt i mål. HURRA for Lydia!',
    loadingMessages: [
      'Blåser opp ballonger …',
      'Gjemmer postene rundt huset …',
      'Legger ut teppet til Kims lek …',
      'Setter opp kjegler på fotballbanen …',
      'Fyller bøtta med baller …',
      'Ruller ut golfdart-teppet …',
      'Teller barnesteg til lekeplassen …',
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

  // Underveis-spill: den voksne får varsel på kartet og velger selv i
  // ⚙️ Oppsett hvilket minispill fra innendørsrebusen som brukes.
  roadSlots: [
    { before: 3, label: 'På vei ned til fotballbanen', default: 4 }, // 🏎️ Lars Grand Prix
    { before: 6, label: 'På vei fra lekeplassen mot golfdart', default: 10 }, // ⚡ Hurtigrunden
  ],

  // ------------------------------------------------------------------
  // De seks postene rundt huset. Hver post er ÉN enkel, aktiv oppgave
  // (3–5 min) som den voksne leser og leder – appen guider og heier.
  // Bilder: post.image vises på posten (spillleder kan overstyre med
  // eget bilde under 🎪 Rebus → Postbilder).
  // ------------------------------------------------------------------
  posts: [
    {
      id: 'ute1',
      number: 1,
      title: 'Kims lek',
      symbol: '🕵️',
      clue: 'Start i hagen ved huset – der ligger et hemmelig teppe.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'Visste dere at hjernen husker best når man ler? Dere er ekte detektiver!',
      islandSymbol: { id: 'ute1-sym', name: 'Detektivmerket', emoji: '🕵️' },
      categories: ['Familiekunnskap', 'Samarbeid'],
      mapPos: { x: 16.9, y: 85.5 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {
        prompt:
          'KIMS LEK 🕵️\n\n1. Legg gjenstandene utover og la barna se på dem i ett minutt.\n2. Legg teppet over – og ta i skjul bort ÉN ting.\n3. Løft teppet: hvem ser hva som mangler?\n\nTa flere runder så alle får gjette. Klarer dere en runde der TO ting mangler?',
        buttonLabel: 'Vi klarte Kims lek! ✅',
      },
    },
    {
      id: 'ute2',
      number: 2,
      title: 'Mimeleken',
      symbol: '🎭',
      clue: 'Gå opp stien til bakken – der er mimescenen!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'Skuespillere øver i årevis – dere klarte det på fem minutter!',
      islandSymbol: { id: 'ute2-sym', name: 'Teatermerket', emoji: '🎭' },
      categories: ['Kreativitet', 'Latter'],
      mapPos: { x: 20.6, y: 66.5 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {
        prompt:
          'MIMELEKEN 🎭\n\n1. Den voksne hvisker et dyr eller en ting til ETT barn.\n2. Barnet mimer uten å lage lyd – resten gjetter!\n3. Bytt på til alle som vil har fått mime.\n\nForslag: løve, frosk, elefant, gravemaskin, is som smelter, sint katt, traktor.',
        buttonLabel: 'Alle har mimet! ✅',
      },
    },
    {
      id: 'ute3',
      number: 3,
      title: 'Fotballbanen',
      symbol: '⚽',
      clue: 'Følg stien helt bort til den store gressletta – fotballbanen!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'Proffspillere øver på akkurat denne øvelsen. Dere er i gang med proffkarrieren!',
      islandSymbol: { id: 'ute3-sym', name: 'Fotballmerket', emoji: '⚽' },
      categories: ['Fart', 'Samarbeid'],
      mapPos: { x: 92.8, y: 48.4 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      image: 'post-ute-3.jpg',
      data: {
        prompt:
          'FOTBALLØYPA ⚽\n\nSe på bildet! Ballen skal føres langs den røde ruta, innom de tre kjeglene – og til slutt: SKUDD i målet!\n\nAlle på laget får hver sin tur. Resten heier som på cupfinale!',
        buttonLabel: 'Alle har skutt! ✅',
      },
    },
    {
      id: 'ute4',
      number: 4,
      title: 'Bøttekast',
      symbol: '🎯',
      clue: 'Ta stikkveien opp bakken – der står bøtta og venter.',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'Verdensrekorden i bøttekast er ukjent – kanskje dere satte den akkurat nå?',
      islandSymbol: { id: 'ute4-sym', name: 'Blinkmerket', emoji: '🎯' },
      categories: ['Fart', 'Samarbeid'],
      mapPos: { x: 61.4, y: 37.4 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      data: {
        prompt:
          'BØTTEKAST 🎯\n\n1. Hvert barn får 5 baller.\n2. Kast mot bøtta – tell treffene høyt sammen!\n3. Runde to: ta ett skritt lenger unna.\n\nHvor mange treff klarer laget til sammen?',
        buttonLabel: 'Alle har kastet! ✅',
      },
    },
    {
      id: 'ute5',
      number: 5,
      title: 'Hinderløypa',
      symbol: '🤸',
      clue: 'Opp til lekeplassen – hinderløypa er klar!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'Ninjaer i trening! Neste stopp: sommer-OL.',
      islandSymbol: { id: 'ute5-sym', name: 'Ninjamerket', emoji: '🤸' },
      categories: ['Fart', 'Latter'],
      mapPos: { x: 30.7, y: 14.8 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      image: 'post-ute-5.jpg',
      data: {
        prompt:
          'HINDERLØYPA 🤸\n\nDen voksne leser løypa steg for steg (tallene står på bildet):\n\n1. Over sandkassen\n2. Opp på bordet\n3. Ned sklia\n4. Hopp gjennom huska\n5. Over vippa\n6. Avslutt oppå bordet – med seiersrop!\n\nÉn og én går løypa, resten heier.',
        buttonLabel: 'Alle kom seg gjennom! ✅',
      },
    },
    {
      id: 'ute6',
      number: 6,
      title: 'Golfdart – mål!',
      symbol: '⛳',
      clue: 'Tilbake til hagen ved huset – finalen: GOLFDART!',
      gameType: 'checkpoint',
      gameIntro: '',
      physicalTask: '',
      adultBonus: '',
      adultBonusJudgeOptions: [],
      hint: '',
      funFact: 'GRATULERER! Dere har fullført hele Lydias bursdagsrebus – nå venter kake! 🎂',
      islandSymbol: { id: 'ute6-sym', name: 'Bursdagspokalen', emoji: '🏆' },
      categories: ['Fart', 'Samarbeid'],
      mapPos: { x: 25.7, y: 84.2 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 0 },
      image: 'post-ute-6.jpg',
      data: {
        prompt:
          'GOLFDART ⛳\n\n1. Hvert barn kaster 3 golfballer mot dartteppet.\n2. Midt i blinken gir mest poeng!\n3. Tell lagets poeng høyt sammen.\n\nAvslutt med et skikkelig HURRA FOR LYDIA! 🎉',
        buttonLabel: 'Vi er i mål! 🏆',
      },
    },
  ] as PostConfig[],
};
