import type { BuiltinRebusConfig, Category, PostConfig } from '../types';

// ============================================================
// Lydias 6-årsdag – Den store familierebusen. En innebygd rebus
// som spilles INNE i huset: postene ligger på plantegningen
// (public/lydia-kart.jpg). Alt innhold redigeres her.
// ============================================================

// Tilfeldige «familiehendelser» som dukker opp i quizspillene –
// særlig når noen svarer feil. 😄
const FAMILY_EVENTS = [
  { emoji: '🦸', text: 'Lars løper gjennom rommet og SKRIKER!' },
  { emoji: '🧸', text: 'Lydia slipper bamser over hele skjermen!' },
  { emoji: '🤖', text: 'Pappa har startet et nytt prosjekt midt i quizen …' },
  { emoji: '👟', text: 'Mamma prøver å få alle til å skynde seg!' },
  { emoji: '👶', text: 'Lotte veltet noe – og ler rått!' },
  { emoji: '🏎️', text: 'En racerbil suser forbi – det er Lars sin!' },
  { emoji: '🖍️', text: 'Lydia har tegnet på veggen … den uferdige, heldigvis.' },
];

export const lydiaConfig: BuiltinRebusConfig = {
  id: 'lydia',
  eventName: 'Lydias 6-årsdag – Den store familierebusen',
  shortName: 'Bursdagsrebus inne (reserve)',

  home: {
    kicker: 'LYDIA BLIR 6 ÅR',
    title: 'Den store familierebusen',
    startLabel: 'Start bursdagsrebusen 🎂',
    continueLabel: 'Fortsett bursdagsrebusen 🎂',
    namesPlaceholder: 'Lydia\nLars\nLotte',
    theme: 'birthday',
  },

  symbolsTitle: 'Bursdagssymboler',

  intro: {
    story:
      'Det er Lydias store dag – hun blir SEKS år! Men den store bursdagsskatten er låst med en hemmelig kode, og sifrene har gjemt seg rundt i huset …\n\nDere må danse som Lydia, kjøre som Lars, liste dere forbi Lotte, holde tusen baller i lufta som mamma – og love MINDRE enn pappa.\n\nSamle bursdagssymbolene, løs oppgavene i hvert rom og finn koden før kaka er spist opp!',
    loadingMessages: [
      'Blåser opp ballonger …',
      'Teller Lydias bamser … (mistet tellinga)',
      'Gjemmer gavene et tryggere sted …',
      'Lars øver på seiersskrik …',
      'Lotte har veltet noe – rydder …',
      'Pappa fikk akkurat en ny idé …',
      'Mamma pakker sekken til alle …',
      'Sjekker om huset ble ferdig i natt … nei.',
    ],
  },

  // Firesifret finalekode – 06 for sjette bursdag, to ganger for hurra.
  defaultFinalCode: '0606',

  // Finaleposten er alltid sist i løypa.
  finaleNumber: 15,

  // Postene som «lyser opp» i finalen og viser hvert sitt siffer.
  finaleSymbolPosts: [1, 4, 6, 8],

  // Kort spill for små bein og korte selskaper. Finalen (15) alltid med.
  shortGamePosts: [1, 2, 4, 6, 8, 10, 15],

  map: {
    image: 'lydia-kart.jpg', // plantegningen av huset i public/
    homeEmoji: '🎂',
    distanceLabels: {
      short: 'Rett rundt hjørnet',
      medium: 'Et par rom unna',
      long: 'Helt på andre siden av huset',
    },
    distanceThresholds: { short: 14, medium: 30 },
    distanceJoke: 'Avstander er målt i barnesteg – nøyaktighet garanteres ikke.',
    labels: [
      { text: 'Spisestua', pos: { x: 36, y: 26 } },
      { text: 'Kjøkkenet', pos: { x: 33, y: 58 } },
      { text: 'Kosekroken', pos: { x: 11, y: 44.5 } },
      { text: 'Stua', pos: { x: 27, y: 68 } },
      { text: 'TV-stua', pos: { x: 85, y: 66 } },
      { text: 'Badet', pos: { x: 64, y: 86 } },
      { text: 'Entré', pos: { x: 44, y: 84 } },
    ],
  },

  safetyChecklist: [
    'Vi går – ingen løping i trapper eller rundt hjørner.',
    'Barn og voksne holder sammen.',
    'Vi åpner og lukker dører forsiktig, og vekker ingen som sover.',
    'Ingen oppgaver krever klatring eller balansekunst.',
    'Vi holder oss i rommene som er med i spillet.',
    'Spillet lagrer ikke posisjon, lyd eller bilder på en server.',
    'Kamera, mikrofon og sensorer er alltid valgfrie.',
  ],

  teamIcons: ['🎈', '🧸', '🎂', '🦄', '🏎️', '🐾', '🎨', '⭐', '🍭', '🦸', '👑', '🎁'],

  suggestedTeamNames: [
    'Bamsepatruljen',
    'Lydias Livgarde',
    'Kakekameratene',
    'Turbo-Lars-Laget',
    'Lottes Lattergjeng',
    'Ballongbanden',
    'Glitterheltene',
    'LEGO-Legendene',
    'Danseløvene',
    'Prosjekt Ferdig (aldri)',
  ],

  teamNameWords: {
    adjectives: ['Dansende', 'Syngende', 'Glitrende', 'Superraske', 'Kakesultne', 'Fnisende', 'Modige', 'Rosa', 'Ustoppelige', 'Hemmelige'],
    nouns: ['Bamser', 'Ballonger', 'Racerbiler', 'Enhjørninger', 'Kakemonstre', 'Bursdagshelter', 'Valper', 'Tegneblyanter', 'Sjørøvere', 'Prinsesser'],
  },

  categories: [
    'Familiekunnskap',
    'Fart',
    'Latter',
    'Kreativitet',
    'Samarbeid',
    'Mattekraft',
    'Stillhet',
    'Redningsevne',
  ] as Category[],

  awards: [
    { id: 'family', title: 'Familieekspertene', category: 'Familiekunnskap' as Category },
    { id: 'speed', title: 'Raskeste fingre', category: 'Fart' as Category },
    { id: 'laugh', title: 'Største latter', category: 'Latter' as Category },
    { id: 'creative', title: 'Kunstnerhjertene', category: 'Kreativitet' as Category },
    { id: 'teamwork', title: 'Beste samarbeid', category: 'Samarbeid' as Category },
    { id: 'math', title: 'Kakematematikerne', category: 'Mattekraft' as Category },
    { id: 'quiet', title: 'Stillest forbi Lotte', category: 'Stillhet' as Category },
    { id: 'honorary', title: 'Dagens bursdagshelter', category: 'Familiekunnskap' as Category },
  ],

  finale: {
    solvedHeading: 'Skatten er åpen! Hele huset jubler!',
    solvedText: 'Den store bursdagsskatten til Lydia er deres!',
    celebrationHeading: '🎉 Hurra for Lydia – dere klarte det! 🎉',
    everyoneAward: { title: 'Dagens bursdagshelter', detail: 'Alle som fullførte Lydias familierebus' },
    unsungAward: { title: 'Bursdagskomiteens hederspris', detail: 'For humør, sang og ekte bursdagsstemning' },
    presentationOutro: 'Hurra for Lydia – 6 år i dag!',
    presentationJoke: 'Kaka er klar. Bamsene jubler. Og huset? Snart ferdig. 😉',
  },

  posts: [
    // ------------------------------------------------------------------
    {
      id: 'lydia1',
      number: 1,
      title: 'Velkomstporten',
      symbol: '🎈',
      clue: 'Start der alle gjestene kommer inn – der skoene hoper seg opp.',
      gameType: 'family-quiz',
      gameIntro:
        'Bursdagsvaktene slipper bare inn de som kjenner bursdagsbarnet! Svar på spørsmålene – riktig svar gir konfetti.',
      physicalTask:
        'Lag en bursdagsportal med armene og rop «HURRA FOR LYDIA» tre ganger – litt høyere for hver gang.',
      adultBonus:
        'En voksen holder bursdagstale på 15 sekunder – uten å si «prosjekt», «AI» eller «snart ferdig». Barna dømmer!',
      adultBonusJudgeOptions: ['Rørende!', 'Godkjent tale', 'Der røk et forbudt ord'],
      hint: 'Svaret henger i alle ballongene i dag.',
      funFact: 'Lydia har øvd på å bli 6 i nesten et helt år. Nå er hun proff.',
      islandSymbol: { id: 'ballong', name: 'Bursdagsballongen', emoji: '🎈' },
      categories: ['Familiekunnskap', 'Latter'],
      mapPos: { x: 53, y: 88 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        events: FAMILY_EVENTS,
        questions: [
          {
            q: 'Hvem har bursdag i dag?',
            options: ['Lydia', 'Lars', 'Pappa', 'En av bamsene'],
            answerIndex: 0,
            funny: 'Lydia! Bamsene har visst det i flere uker – de har øvd på sangen.',
          },
          {
            q: 'Hvor gammel blir Lydia?',
            options: ['4', '5', '6', '100'],
            answerIndex: 2,
            funny: 'SEKS! Det er nesten så mange som pappas påbegynte prosjekter denne uka.',
          },
          {
            q: 'Hva skal Lydia snart begynne på?',
            options: ['Skolen', 'Månen', 'Jobb i barnehagen', 'F1-laget til Lars'],
            answerIndex: 0,
            funny: 'Skolen! Frøken aner ikke hvor mye sang og dans hun har i vente.',
          },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia2',
      number: 2,
      title: 'Bamseregnet',
      symbol: '🧸',
      clue: 'Gå til den store sofaen der alle koser seg – der regner det snart bamser.',
      gameType: 'whack',
      gameIntro:
        'Lydia har sluppet ALLE bamsene sine! Fang 10 bamser før tiden går ut – men ikke rør pappas verktøy, det er sikkert midt i et prosjekt.',
      physicalTask:
        'Send en bamse (eller pute) rundt i ringen uten å bruke hendene. Mister dere den, starter dere på nytt – med latter.',
      adultBonus:
        'En voksen fremfører bamseteater med to bamser: «Da pappa skulle henge opp en hylle». Barna dømmer.',
      adultBonusJudgeOptions: ['Oscar-verdig', 'Rørende og sant', 'Hylla henger fortsatt ikke'],
      hint: 'Bamsene beveger seg fort – men de kommer alltid tilbake. Trykk rolig og presist.',
      funFact:
        'Ingen vet nøyaktig hvor mange bamser Lydia har. Sist noen prøvde å telle, dukket det opp tre nye.',
      islandSymbol: { id: 'bamse', name: 'Bursdagsbamsen', emoji: '🧸' },
      categories: ['Fart', 'Latter'],
      mapPos: { x: 24, y: 79 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        target: '🧸',
        targetLabel: 'bamsen',
        decoys: ['🔨', '🧦', '🖌️'],
        seconds: 20,
        goal: 10,
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia3',
      number: 3,
      title: 'Dansegulvet',
      symbol: '💃',
      clue: 'Finn den åpne gulvplassen i stua – der Lydia holder danseforestillinger.',
      gameType: 'simon',
      gameIntro:
        'Lydia er danselærer! Se dansebevegelsene lyse opp og herm i nøyaktig samme rekkefølge. Rekka blir lengre for hver runde!',
      physicalTask:
        'Freeze-dans: én synger, resten danser. Når sangen stopper, fryser alle – den som ler først, tar en ekstra svingom.',
      adultBonus:
        'En voksen viser sitt aller beste dansetrekk fra sin egen ungdom. Barna dømmer – strengt.',
      adultBonusJudgeOptions: ['TikTok-klar', 'Imponerende gammeldags', 'Vi ringer 1995 og leverer tilbake'],
      hint: 'Se nøye på rekkefølgen – den vokser med ett trinn hver runde.',
      funFact: 'Lydia danser så bra at selv Lotte prøver å reise seg og bli med.',
      islandSymbol: { id: 'dansesko', name: 'Danseskoen', emoji: '🩰' },
      categories: ['Kreativitet', 'Samarbeid'],
      mapPos: { x: 18, y: 72 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        emojis: ['💃', '🙌', '🕺', '👏'],
        targetLength: 5,
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia4',
      number: 4,
      title: 'Lars Grand Prix',
      symbol: '🏎️',
      clue: 'Kjør til TV-stua – Lars har gjort den om til racerbane.',
      gameType: 'tunnel-run',
      gameIntro:
        'Lars har bygd racerbane i stua! Styr bilen forbi alt som ligger i veien – akkurat som Kimi og Lewis ville gjort.',
      physicalTask:
        'Hele laget kjører én runde rundt sofaen som formelbiler – med motorlyd. Depotstopp (high five) er obligatorisk.',
      adultBonus:
        'En voksen kommenterer lagets sofarunde som F1-kommentator i 20 sekunder – med FULL innlevelse. Barna dømmer.',
      adultBonusJudgeOptions: ['Ansett denne stemmen!', 'God fart i stemmen', 'Mer skrik, takk'],
      hint: 'Trykk på feltet du vil bytte til. LEGO-biten flytter seg aldri – og den gjør vondt uansett.',
      funFact:
        'Lars heier på Kimi Antonelli OG Lewis Hamilton. Å velge én er som å velge mellom LEGO og Paw Patrol.',
      islandSymbol: { id: 'racerbil', name: 'Racerbilen', emoji: '🏎️' },
      categories: ['Fart', 'Redningsevne'],
      mapPos: { x: 85, y: 79 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        obstacles: [
          { emoji: '🧸', label: 'en bamse på banen' },
          { emoji: '🐶', label: 'en Paw Patrol-figur i full fart' },
          { emoji: '🧱', label: 'en LEGO-bit (AU!)' },
          { emoji: '🍼', label: 'Lottes tåteflaske' },
        ],
        secondsToSurvive: 20,
        tunnelLabel: 'LARS GRAND PRIX',
        doneJoke: 'Målflagg! Kimi og Lewis hadde vært stolte.',
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia5',
      number: 5,
      title: 'Kakekontoret',
      symbol: '🧁',
      clue: 'Følg kakelukten til rommet med benkeplater og kjøleskap.',
      gameType: 'math-vault',
      gameIntro:
        'Kakesafen på kjøkkenet åpner seg bare for de som kan bursdagsmatte! Velg nivå og knekk regnestykkene.',
      physicalTask:
        'Lag en menneskekake: laget stiller seg tett i «lag» (forsiktig!) og roper hver sin ingrediens.',
      adultBonus:
        'En voksen beskriver Lydias drømmekake med minst FEM detaljer. Barna dømmer om det stemmer.',
      adultBonusJudgeOptions: ['Helt riktig kake!', 'Nesten – mangler glasur', 'Det der er Lars sin kake'],
      hint: 'Ta nivåene i den rekkefølgen dere vil – det viktigste er kake til slutt.',
      funFact:
        'Kjøkkenet er rommet som oftest lukter kake. Av og til brent kake. Det teller også som kake.',
      islandSymbol: { id: 'kakelys', name: 'Kakelyset', emoji: '🕯️' },
      categories: ['Mattekraft', 'Samarbeid'],
      mapPos: { x: 32, y: 49 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        levels: {
          small: [
            { q: 'Hvor mange lys skal på kaka til Lydia?', options: ['5', '6', '7'], answer: '6' },
            { q: '🧁🧁🧁 + 🧁🧁 = ?', options: ['4', '5', '6'], answer: '5' },
            { q: 'Hvilken er størst?', options: ['🧁', '🎂', '🍬'], answer: '🎂' },
          ],
          medium: [
            { q: '12 muffins deles likt på 6 barn. Hvor mange får hver?', options: ['1', '2', '3'], answer: '2' },
            { q: 'Bursdagen starter kl. 13 og varer i 3 timer. Når er den ferdig?', options: ['15', '16', '17'], answer: '16' },
            { q: '6 + 6 + 6 = ?', options: ['12', '16', '18'], answer: '18' },
          ],
          adult: [
            { q: 'Kaka deles i 12. Tre voksne «smaker» 2 biter hver i skjul. Hvor mange biter er igjen?', options: ['4', '6', '8'], answer: '6' },
            { q: '25 % av 24 ballonger sprakk. Hvor mange lever fortsatt?', options: ['16', '18', '20'], answer: '18' },
            { q: 'Selskapet har 20 gjester og 30 muffins. Hvor mange kan gjemmes til i morgen?', options: ['0 – de blir spist', '10', 'Alle'], answer: '0 – de blir spist' },
          ],
        },
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia6',
      number: 6,
      title: 'Prosjekthjørnet',
      symbol: '🔨',
      clue: 'Gå til trappa – der pappas prosjekter står og venter … på seg selv.',
      gameType: 'true-false',
      gameIntro:
        'Sant eller tull? Her gjelder det å kjenne familien – og huset som aldri blir helt ferdig.',
      physicalTask:
        'Laget bygger et usynlig hus sammen på 30 sekunder – med mime og lydeffekter. MINST én må være sag.',
      adultBonus:
        'En voksen lover høytidelig når huset blir ferdig. Barna dømmer om løftet er til å tro på.',
      adultBonusJudgeOptions: ['Snart ferdig!', 'Til jul … et år', 'Aldri – og det er helt greit'],
      hint: 'Tenk: hva ville mamma svart?',
      funFact: 'Huset er aldri helt ferdig – men det er alltid fullt av folk som ler. Det er viktigere.',
      islandSymbol: { id: 'hammer', name: 'Prosjekthammeren', emoji: '🔨' },
      categories: ['Familiekunnskap', 'Latter'],
      mapPos: { x: 44, y: 70 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        events: FAMILY_EVENTS,
        statements: [
          {
            text: 'Pappa har fullført alle prosjektene sine.',
            isTrue: false,
            punchline: 'TULL! Ordet «fullført» finnes ikke i pappas ordbok. Ordboka er forresten heller ikke ferdig.',
          },
          {
            text: 'Huset blir helt ferdig til jul.',
            isTrue: false,
            punchline: 'TULL! «Det står ikke hvilken jul», sier pappa.',
          },
          {
            text: 'Pappa elsker AI og roboter.',
            isTrue: true,
            punchline: 'SANT! Pappa har flere AI-venner enn vanlige apper på telefonen.',
          },
          {
            text: 'Mamma jubler hver gang pappa starter et nytt prosjekt.',
            isTrue: false,
            punchline: 'TULL! Mamma har et helt eget blikk for akkurat dette. Dere vet hvilket.',
          },
          {
            text: 'Lars kunne spist LEGO til middag hvis han fikk lov.',
            isTrue: true,
            punchline: 'SANT! Heldigvis smaker LEGO verst i hele verden.',
          },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia7',
      number: 7,
      title: 'Lottes lekekrok',
      symbol: '👶',
      clue: 'List dere til den lune kroken med det lille runde bordet.',
      gameType: 'stillness',
      gameIntro:
        'Hysj! Lotte har ENDELIG sovnet. Hold telefonen helt stille i 8 sekunder – vekker dere henne, hater hun leggetid resten av kvelden!',
      physicalTask:
        'Hele laget går tåspissmarsj én runde rundt rommet – helt uten lyd. Den som knirker, går en runde til.',
      adultBonus:
        'En voksen mimer «kveldslegging av Lotte» som stumfilm på 20 sekunder. Barna dømmer.',
      adultBonusJudgeOptions: ['Nøyaktig sånn er det', 'Oscar for tålmodighet', 'Lotte hadde vunnet'],
      hint: 'Hold telefonen med begge hender og pust rolig. Tenk på sovende babyer.',
      funFact: 'Lotte smiler hele dagen – helt til noen sier ordet «leggetid».',
      islandSymbol: { id: 'smokk', name: 'Sovesmokken', emoji: '🍼' },
      categories: ['Stillhet', 'Samarbeid'],
      mapPos: { x: 13, y: 48 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: { seconds: 8, sleeperName: 'Lotte' },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia8',
      number: 8,
      title: 'Hvem sa det?-bordet',
      symbol: '💬',
      clue: 'Sett dere ved spisebordet i stua – der de beste diskusjonene skjer.',
      gameType: 'who-said-it',
      gameIntro:
        'Noen i familien har sagt dette – men HVEM? Les sitatet høyt med innlevelse og gjett dere frem!',
      physicalTask:
        'Alle i laget sier «Gratulerer med dagen, Lydia!» med stemmen til hvert sitt familiemedlem – de andre gjetter hvem.',
      adultBonus:
        'En voksen imiterer et familiemedlem i 15 sekunder (med kjærlighet!). Barna dømmer treffsikkerheten.',
      adultBonusJudgeOptions: ['Helt identisk!', 'Litt likt', 'Hvem var DET?'],
      hint: 'Les sitatet høyt en gang til – med følelse. Da hører dere det.',
      funFact: 'Alle familier har egne stemmer. Denne har fem – pluss motorlyden til Lars.',
      islandSymbol: { id: 'snakkeboble', name: 'Snakkeboblen', emoji: '💬' },
      categories: ['Familiekunnskap', 'Latter'],
      mapPos: { x: 13, y: 66 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        events: FAMILY_EVENTS,
        people: [
          { name: 'Lydia', emoji: '👧' },
          { name: 'Lars', emoji: '🦸' },
          { name: 'Lotte', emoji: '👶' },
          { name: 'Mamma', emoji: '🙋‍♀️' },
          { name: 'Pappa', emoji: '🤖' },
        ],
        quotes: [
          {
            quote: 'Jeg har bare én liten idé …',
            answer: 'Pappa',
            reaction: 'Pappa! Og sånn ble det syv nye prosjekter den uka.',
          },
          {
            quote: 'Skynd dere! Vi skulle vært der for ti minutter siden!',
            answer: 'Mamma',
            reaction: 'Mamma! Hun har alltid kontroll på klokka. Resten av familien har … ikke.',
          },
          {
            quote: 'PAW PATROL, KLARE FOR INNSATS!',
            answer: 'Lars',
            reaction: 'Lars! Ropes minst fire ganger daglig. Gjerne klokka 06.30.',
          },
          {
            quote: 'Kan jeg tegne en tegning til deg?',
            answer: 'Lydia',
            reaction: 'Lydia! Svaret er alltid ja – kjøleskapet er egentlig et kunstgalleri.',
          },
          {
            quote: 'Hihihihi! (noe velter i bakgrunnen)',
            answer: 'Lotte',
            reaction: 'Lotte! Hun ler alltid først – særlig når hun er skyldig.',
          },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia9',
      number: 9,
      title: 'Tegnestudioet',
      symbol: '🎨',
      clue: 'Gå til det store bordet der bursdagskunsten blir til.',
      gameType: 'family-quiz',
      gameIntro:
        'Velkommen til Lydias tegnestudio! Her henger kunsten tett – og spørsmålene handler om kunstneren selv.',
      physicalTask:
        'Tegn og gjett: barna tegner noe Lydia elsker – de voksne må gjette. Ingen bokstaver lov!',
      adultBonus:
        'En voksen tegner en «bursdags-Lydia» med FEIL hånd på 20 sekunder. Barna dømmer kunsten.',
      adultBonusJudgeOptions: ['Rett på kjøleskapet!', 'Moderne kunst', 'Er det … en potet?'],
      hint: 'Tenk på hva som henger på kjøleskapet.',
      funFact: 'Lydia har tegnet flere tegninger enn pappa har startet prosjekter. Det sier MYE.',
      islandSymbol: { id: 'fargeblyant', name: 'Fargeblyanten', emoji: '🖍️' },
      categories: ['Kreativitet', 'Familiekunnskap'],
      mapPos: { x: 36, y: 34 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        events: FAMILY_EVENTS,
        questions: [
          {
            q: 'Hva elsker Lydia aller mest å gjøre?',
            options: ['Tegne, synge og danse', 'Rydde rommet sitt', 'Se på nyhetene', 'Vente pent på tur'],
            answerIndex: 0,
            funny: 'Helst alle tre samtidig – det blir litt lyd, og det er helt riktig.',
          },
          {
            q: 'Hva finnes det ALLER mest av på Lydias rom?',
            options: ['Bamser', 'Støvsugere', 'Regneark', 'Verktøy (det er pappas greie)'],
            answerIndex: 0,
            funny: 'Bamser! De har egen køordning for å få plass i senga.',
          },
          {
            q: 'Hvilken hobby deler Lydia og Lars?',
            options: ['LEGO', 'F1-kommentering', 'Skattemelding', 'Å legge seg tidlig frivillig'],
            answerIndex: 0,
            funny: 'LEGO! Byggverkene deres blir ferdige oftere enn huset.',
          },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia10',
      number: 10,
      title: 'Hurtigrunden',
      symbol: '⚡',
      clue: 'Finn det eneste rommet i huset som faktisk ble helt ferdig. (Det har dusj.)',
      gameType: 'speed-quiz',
      gameIntro:
        'Badet: det ferdigste rommet i huset – perfekt for hurtigrunden! 10 lynspørsmål på 30 sekunder. Ikke tenk – trykk!',
      physicalTask:
        'Lynstafett: laget stiller seg på rekke og snur rekkefølgen til motsatt – tre ganger, fortere for hver gang.',
      adultBonus:
        'En voksen sier «Lydia er best!» på fem forskjellige språk eller dialekter. Barna teller og dømmer.',
      adultBonusJudgeOptions: ['Polyglott!', 'Godkjent verdensturné', 'Var tre av dem norsk?'],
      hint: 'Magefølelsen kjenner familien best. Trykk!',
      funFact: 'Da badet ble ferdig, feiret familien i to dager. Det er fortsatt husets stolthet.',
      islandSymbol: { id: 'lyn', name: 'Fartslynet', emoji: '⚡' },
      categories: ['Fart', 'Familiekunnskap'],
      mapPos: { x: 66.5, y: 80 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        events: FAMILY_EVENTS,
        seconds: 30,
        questions: [
          { q: 'Hvem har bursdag?', options: ['Lydia', 'Lars'], answerIndex: 0 },
          { q: 'Hvor gammel blir hun?', options: ['6', '60'], answerIndex: 0 },
          { q: 'Hvem elsker Paw Patrol?', options: ['Lars', 'Mamma'], answerIndex: 0 },
          { q: 'Hvem lærer å gå?', options: ['Lotte', 'Pappa'], answerIndex: 0 },
          { q: 'Hvem har tusen baller i lufta?', options: ['Mamma', 'Lotte'], answerIndex: 0 },
          { q: 'Hvem elsker AI?', options: ['Pappa', 'Bamsene'], answerIndex: 0 },
          { q: 'Når blir huset ferdig?', options: ['Aldri 😂', 'I morgen'], answerIndex: 0 },
          { q: 'Hva bygger Lydia og Lars med?', options: ['LEGO', 'Regneark'], answerIndex: 0 },
          { q: 'Hvem danser best?', options: ['Lydia', 'Kjøleskapet'], answerIndex: 0 },
          { q: 'Hva roper vi i dag?', options: ['HURRA!', 'Nei takk'], answerIndex: 0 },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'lydia15',
      number: 15,
      title: 'Den store bursdagsskatten',
      symbol: '🎂',
      clue: 'Alle spor peker mot midten av huset – dit lukten av kake er sterkest.',
      gameType: 'finale-code',
      gameIntro:
        'Fire av symbolene deres lyser opp og gjemmer hvert sitt siffer! Tast koden i riktig rekkefølge og lås opp den store bursdagsskatten.',
      physicalTask:
        'Hele laget synger «Hurra for deg» for Lydia – med dansetrinn. Høyeste jubel til slutt vinner hjertene.',
      adultBonus:
        'En voksen holder gratulasjonstale for Lydia på MAKS én setning. Barna dømmer lengde og kjærlighet.',
      adultBonusJudgeOptions: ['Rørende!', 'Akkurat passe kort', 'Det var tre setninger'],
      hint: 'Se på symbolene som lyser – tallet står på hvert av dem. Rekkefølgen følger postnumrene.',
      funFact:
        'Gratulerer! Familierådet (1 bamse, 2 racerbiler og 1 sovende baby) har enstemmig vedtatt at dere er ekte bursdagshelter.',
      islandSymbol: { id: 'bursdagsnokkel', name: 'Den store bursdagsnøkkelen', emoji: '🏆' },
      categories: ['Samarbeid', 'Familiekunnskap'],
      mapPos: { x: 54, y: 52 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {},
    },
  ] as PostConfig[],
};
