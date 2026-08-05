import type { Category, PostConfig } from '../types';

// ============================================================
// ALT innhold i spillet redigeres her: tekster, poster, poeng,
// kartposisjoner, koder og lagnavn. Ikke rør komponentene for
// å endre innhold – endre denne filen.
// ============================================================

export const gameConfig = {
  id: 'standard' as const,
  eventName: 'Operasjon Skylleviga – Den store øyprøven',
  shortName: 'Skylleviga Hagefest',

  home: {
    kicker: 'OPERASJON SKYLLEVIGA',
    title: 'Den store øyprøven',
    startLabel: 'Start øyprøven 🏝️',
    continueLabel: 'Fortsett øyprøven 🏝️',
    namesPlaceholder: 'Emil\nIsak\nJenny',
    theme: 'island',
  },

  symbolsTitle: 'Øysymboler',

  family: {
    hosts: ['Sjur', 'Ida'],
    kids: ['Emil', 'Isak', 'Jenny'],
  },

  intro: {
    story:
      'Tunnelen til Flekkerøya har stått åpen litt for lenge, og stadig flere byfolk har funnet veien til Skylleviga. Før dere kan bli godkjente som æresøyboere, må dere bestå 15 hemmelige prøver.\n\nDere må regne som Emil, redde dagen som Isak, hvile som Jenny, le som Ida og tenke stort som Sjur.\n\nSamle øysymbolene, løs den siste koden og finn nøkkelen til Skylleviga!',
    loadingMessages: [
      'Kontakter øyrådet …',
      'Sjekker om laget lukter by …',
      'Måler Sjur i standard øyenheter …',
      'Vekker ikke Jenny …',
      'Starter Idas lattergenerator …',
      'Teller sauer ved tunnelinngangen …',
      'Pusser opp enda et rom …',
    ],
  },

  // Enkel lokal kode – ikke kryptografisk sikkerhet, bare for å holde
  // nysgjerrige barnefingre unna spillledermenyen.
  defaultLeaderPin: '2026',

  // Firesifret finalekode. Kan endres av spillleder.
  defaultFinalCode: '2515',

  // Hvilke fire poster som «lyser opp» i finalen og viser hvert sitt siffer.
  finaleSymbolPosts: [1, 5, 7, 12],

  // Standard kort spill (8 poster). Finalen (15) er alltid med.
  shortGamePosts: [1, 3, 5, 6, 7, 10, 14, 15],

  map: {
    image: 'skylleviga-kart.jpg', // legges i public/
    homeEmoji: '🏡',
    distanceLabels: {
      short: 'Kort vei',
      medium: 'Et lite stykke',
      long: 'Nå må dere bruke beina',
    },
    // Terskler i prosent av kartbildet (diagonalavstand).
    distanceThresholds: { short: 14, medium: 30 },
    distanceJoke: 'Avstander er øy-omtrentlige, ikke målt med Sjur-meteren.',
  },

  safetyChecklist: [
    'Barn går sammen med voksne.',
    'Ingen løper ut i veien.',
    'Ingen oppgaver krever klatring.',
    'Vi holder oss innenfor avtalt område.',
    'Vi ser opp fra telefonen når vi går der det kan komme biler.',
    'Spillet lagrer ikke posisjon, lyd eller bilder på en server.',
    'Kamera, mikrofon, GPS og bevegelsessensor er alltid valgfrie.',
  ],

  oath:
    'Vi lover å le som Ida, regne som Emil, redde som Isak, hvile som Jenny og tenke stort som Sjur. Leve Skylleviga!',

  teamIcons: ['🐑', '⛵', '🌊', '🗼', '🦀', '🐚', '🌞', '🚜', '🧇', '🦸', '🐕‍🦺', '💡'],

  suggestedTeamNames: [
    'Tunnel-Titanene',
    'Idas Latterlag',
    'Sjur-lange Steg',
    'Emils Tallknusere',
    'Isaks Redningsgjeng',
    'Jennys Drømmelag',
    'Skylleviga Superhelter',
    'Byfolk på Prøve',
    'Øyas Ukjente Helter',
    'De Uoffisielle Øyboerne',
  ],

  teamNameWords: {
    adjectives: ['Sovende', 'Raske', 'Smarte', 'Håse', 'Ville', 'Modige', 'Solbrune', 'Mistenkelige', 'Flytende', 'Ustoppelige'],
    nouns: ['Sjøløver', 'Redningshunder', 'Tunnelfarere', 'Hagehelter', 'Vaffelkapteiner', 'Øyråder', 'Bryggesjefer', 'Sauegjetere', 'Bølgeryttere', 'Krabbefangere'],
  },

  categories: [
    'Mattekraft',
    'Samarbeid',
    'Kreativitet',
    'Latter',
    'Redningsevne',
    'Øykunnskap',
    'Gründerkraft',
    'Stillhet',
  ] as Category[],

  finale: {
    solvedHeading: 'Huset lyser opp! Tunnelen åpner seg!',
    solvedText: 'Nøkkelen til Skylleviga er deres!',
    celebrationHeading: '🎉 Godkjente æresøyboere! 🎉',
    everyoneAward: { title: 'Dagens æresøyboere', detail: 'Alle som fullførte øyprøven' },
    unsungAward: { title: 'Øyrådets hederspris', detail: 'For stil, humør og upåklagelig øyholdning' },
    presentationOutro: 'Velkommen som æresøyboere i Skylleviga!',
    presentationJoke: 'Tunnelen står åpen. Vaflene er varme. Jenny sover fortsatt. 💤',
  },

  awards: [
    { id: 'sharpest', title: 'Øyas skarpeste hoder', category: 'Mattekraft' as Category },
    { id: 'teamwork', title: 'Beste samarbeid', category: 'Samarbeid' as Category },
    { id: 'laugh', title: 'Største latter', category: 'Latter' as Category },
    { id: 'quiet', title: 'Stillest rundt Jenny', category: 'Stillhet' as Category },
    { id: 'rescue', title: 'Beste redningslag', category: 'Redningsevne' as Category },
    { id: 'founder', title: 'Mest overbevisende gründer', category: 'Gründerkraft' as Category },
    { id: 'suspicious', title: 'Mest mistenkelige byfolk', category: 'Kreativitet' as Category },
    { id: 'honorary', title: 'Dagens æresøyboere', category: 'Øykunnskap' as Category },
  ],

  posts: [
    // ------------------------------------------------------------------
    {
      id: 'post1',
      number: 1,
      title: 'Tunneltesten',
      symbol: '🚇',
      clue: 'Finn stedet der byfolkene først slapp inn på øya.',
      gameType: 'tunnel-run',
      gameIntro:
        'Kjør bilen trygt gjennom tunnelen! Trykk på feltene for å bytte fil og unngå alt rart som har havnet i veien.',
      physicalTask: 'Still hele laget opp etter høyde – uten å si et eneste ord.',
      adultBonus:
        'En voksen har 15 sekunder på å forklare hvorfor tunnelen EGENTLIG ble bygget. Barna dømmer!',
      adultBonusJudgeOptions: ['Overbevisende', 'Mistenkelig', 'Helt sikkert oppdiktet'],
      hint: 'Trykk på feltet du vil hoppe til – du trenger ikke treffe bilen. Sauen står alltid stille.',
      funFact:
        'Flekkerøytunnelen åpnet i 1989. Øyrådet i dette spillet mener fortsatt at den var «en prøveordning».',
      islandSymbol: { id: 'tunnelstein', name: 'Tunnelsteinen', emoji: '🪨' },
      categories: ['Samarbeid', 'Redningsevne'],
      mapPos: { x: 27.5, y: 30.5 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        obstacles: [
          { emoji: '🐑', label: 'en sau' },
          { emoji: '🛒', label: 'en trillebår' },
          { emoji: '📦', label: 'en altfor stor flyttekasse fra Oslo' },
          { emoji: '🤳', label: 'en som stoppet for å ta bilde' },
        ],
        secondsToSurvive: 20,
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post2',
      number: 2,
      title: 'Øyas Passkontor',
      symbol: '🛂',
      clue: 'Øyrådet krever dokumentasjon. Finn neste kontrollpunkt.',
      gameType: 'passport',
      gameIntro:
        'Lag lagets offisielle øypass! Velg øydyr, transport, superkraft og hemmelig øysnacks – så stempler passkontoret.',
      physicalTask: 'Hele laget sier øyeden høyt sammen – med hånden på hjertet.',
      adultBonus:
        'Finn på ÉN absurd regel som alle byfolk må følge på Flekkerøya. Skriv den inn – den dukker opp igjen i finalen!',
      adultBonusJudgeOptions: ['Genial regel', 'Ganske streng', 'Øyrådet må vurdere'],
      hint: 'Det finnes ingen gale svar på et passkontor. Bare mistenkelige.',
      funFact: 'Øyrådet har aldri avvist en søknad. De har bare veldig lange kaffepauser.',
      islandSymbol: { id: 'oystempel', name: 'Øystempelet', emoji: '📮' },
      categories: ['Kreativitet', 'Øykunnskap'],
      mapPos: { x: 30, y: 23 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        animals: ['🐑 Sau', '🦀 Krabbe', '🦭 Sel', '🐟 Makrell', '🦅 Havørn', '🐌 Strandsnegle'],
        transports: ['⛵ Seilbåt', '🚣 Robåt', '🚜 Traktor', '🛴 Sparkesykkel', '🛶 Kano', '🦯 Sjumilssteg'],
        powers: ['Kan lukte vafler på 2 km', 'Sover gjennom alt', 'Ler så måkene letter', 'Regner ut alt i hodet', 'Redder katter fra trær', 'Finner alltid tunnelen'],
        snacks: ['🧇 Vafler', '🍦 Softis', '🐟 Fiskekaker', '🍓 Jordbær', '🥞 Sveler', '🍫 Kvikklunsj'],
        titles: [
          'Godkjent tunnelinnvandrer',
          'Midlertidig øyboer',
          'Svært mistenkelig byperson',
          'Æresmedlem av Skylleviga',
          'Sertifisert vaffelinspektør',
          'Øyrådets yndling',
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post3',
      number: 3,
      title: 'Sjur-meteren',
      symbol: '📏',
      clue: 'Her må dere tenke stort. Nesten to meter stort.',
      gameType: 'height-stack',
      gameIntro:
        'Hvor høy er egentlig Sjur? Stable ting oppå hverandre til tårnet er omtrent like høyt som øyas lengste gründer.',
      physicalTask: 'Lag en menneskelig målestokk på bakken som er omtrent to meter lang.',
      adultBonus:
        'De voksne får fem sekunder: Pek ut silhuetten som mest sannsynlig kan se over ALLE andre på konsert. Barna dømmer!',
      adultBonusJudgeOptions: ['Riktig på første forsøk', 'Litt nøling', 'Pekte på en sau'],
      hint: 'Sjur er nesten to meter. Tenk «to støvler mer enn en hagestol».',
      funFact:
        'Sjur er offisielt målt i øyenheten «1 Sjur». Alt annet på øya måles i brøkdeler av dette.',
      islandSymbol: { id: 'malebaand', name: 'Kjempemålebåndet', emoji: '📐' },
      categories: ['Mattekraft', 'Samarbeid'],
      mapPos: { x: 23, y: 15 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        targetMin: 195,
        targetMax: 202,
        items: [
          { emoji: '🐑', label: 'Liten sau', cm: 60 },
          { emoji: '🪑', label: 'Hagestol', cm: 85 },
          { emoji: '🥾', label: 'Støvel', cm: 30 },
          { emoji: '🧒', label: 'Et barn', cm: 120 },
          { emoji: '🚧', label: 'Tunnelkjegle', cm: 50 },
          { emoji: '🧍', label: 'Veldig høy gründer', cm: 198 },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post4',
      number: 4,
      title: 'Idas Latterlaboratorium',
      symbol: '😂',
      clue: 'Følg lyden av øyas mest smittende latter.',
      gameType: 'laugh-rhythm',
      gameIntro:
        'Latterboblene viser et rytmemønster. Se, husk og trykk latteren tilbake i riktig rekkefølge!',
      physicalTask: 'Én person starter en latter. Resten av laget må henge seg på – uten å si ord.',
      adultBonus:
        'Hver voksen leverer sin beste tresekunders «Ida-inspirerte» latter. Barna kårer vinneren!',
      adultBonusJudgeOptions: ['Verdig en Ida', 'God, men for pen', 'Mer hås neste gang'],
      hint: 'Boblene kommer i samme rekkefølge hver gang. Si mønsteret høyt sammen først.',
      funFact:
        'Idas latter er hørbar over hele Skylleviga og brukes uoffisielt som tåkelur når det er dårlig sikt.',
      islandSymbol: { id: 'latterboble', name: 'Den gylne latterboblen', emoji: '🫧' },
      categories: ['Latter', 'Samarbeid'],
      mapPos: { x: 8, y: 10 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        levels: [
          { name: 'He', pattern: ['He'] },
          { name: 'Ha-ha', pattern: ['Ha', 'Ha', 'He'] },
          { name: 'Hå-hå-ha-ha', pattern: ['Hå', 'Hå', 'Ha', 'Ha', 'He'] },
        ],
        micEnabled: true,
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post5',
      number: 5,
      title: 'Emils Mattehvelv',
      symbol: '🔐',
      clue: 'Hvelvet åpnes bare av mennesker som kan tenke som Emil.',
      gameType: 'math-vault',
      gameIntro:
        'Velg nivå og løs Emils oppgaver for å låse opp hvelvet. Alle på laget kan hjelpe!',
      physicalTask: 'Lag tallet 10 med kroppene deres. Hele laget må være med!',
      adultBonus:
        'Voksenspørsmål fra hvelvet: Et oppussingsprosjekt var budsjettert til 100 000 kroner og endte på 250 000. Hvor mange prosent over budsjett? (Svar: 150 %)',
      adultBonusJudgeOptions: ['Svarte som Emil', 'Trengte fingrene', 'Ringte banken'],
      hint: 'Del oppgaven opp i småbiter. Emil regner aldri alt på en gang.',
      funFact:
        'Emil regnet en gang ut hvor mange vafler som trengs til hele øya. Svaret var «fler».',
      islandSymbol: { id: 'tallnokkel', name: 'Emils tallnøkkel', emoji: '🔢' },
      categories: ['Mattekraft'],
      mapPos: { x: 7, y: 26 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        levels: {
          small: [
            { q: 'Hvor mange sauer ser du? 🐑🐑🐑', options: ['2', '3', '4'], answer: '3' },
            { q: 'Hvilken form har et vaffelhjerte mest lyst til å være?', options: ['❤️', '⬛', '🔺'], answer: '❤️' },
            { q: '2 krabber + 2 krabber = ?', options: ['3', '4', '5'], answer: '4' },
          ],
          medium: [
            { q: 'Sjur tar tre kjempesteg. Hvert steg er 1,2 meter. Hvor langt kommer han?', options: ['2,4 m', '3,6 m', '4,2 m'], answer: '3,6 m' },
            { q: 'Hva er neste tall? 2, 4, 8, 16, …', options: ['18', '24', '32'], answer: '32' },
            { q: 'Emil deler 24 vafler likt på 6 gjester. Hvor mange får hver?', options: ['3', '4', '6'], answer: '4' },
          ],
          adult: [
            { q: 'Jenny sover 12 timer i døgnet. Hvor stor andel av uka sover hun?', options: ['35 %', '50 %', '65 %'], answer: '50 %' },
            { q: '15 % rabatt på en trillebår til 1 200 kr. Ny pris?', options: ['1 020 kr', '1 050 kr', '980 kr'], answer: '1 020 kr' },
            { q: 'Tunnelen er ca. 2,3 km. Sjur går 100 m per minutt. Omtrent hvor lenge bruker han?', options: ['13 min', '23 min', '33 min'], answer: '23 min' },
          ],
        },
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post6',
      number: 6,
      title: 'Isaks Redningssentral',
      symbol: '🐕‍🦺',
      clue: 'Noen trenger hjelp. Heldigvis er redningssentralen bemannet.',
      gameType: 'rescue-match',
      gameIntro:
        'Alarmen går! Dra riktig redningshelt til riktig oppdrag. Isaks redningssentral godkjenner bare perfekte utrykninger.',
      physicalTask: 'Laget lager en redningssirene sammen – uten å bruke ord. Bare lyder!',
      adultBonus:
        'De voksne må prioritere tre oppdrag i riktig rekkefølge og begrunne det. Barna avgjør om prioriteringen var heltemodig.',
      adultBonusJudgeOptions: ['Heltemodig', 'Typisk voksen', 'Kaffen først?!'],
      hint: 'Se på hva helten er GOD til. Stigebilen når høyt, båten flyter, og kaffehunden … lukter kaffe.',
      funFact:
        'Isaks redningssentral har 100 % suksessrate. Riktignok mest på is-i-bakken-oppdrag.',
      islandSymbol: { id: 'redningsmerke', name: 'Redningsmerket', emoji: '🎖️' },
      categories: ['Redningsevne', 'Samarbeid'],
      mapPos: { x: 16, y: 41 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        incidents: [
          { emoji: '🐈', text: 'En katt sitter fast øverst i lekestativet', helperId: 'ladder' },
          { emoji: '🍦', text: 'En is har falt i bakken – tårer truer', helperId: 'ice' },
          { emoji: '🏖️', text: 'En båt har mistet en badeball på sjøen', helperId: 'boat' },
          { emoji: '☕', text: 'En voksen finner ikke kaffekoppen sin', helperId: 'sniffer' },
          { emoji: '🐑', text: 'En sau blokkerer tunnelinngangen', helperId: 'tractor' },
        ],
        helpers: [
          { id: 'ladder', emoji: '🚒', name: 'Stigebil-hunden' },
          { id: 'ice', emoji: '🍨', name: 'Iskrem-enheten' },
          { id: 'boat', emoji: '🚤', name: 'Sjøredningshunden' },
          { id: 'sniffer', emoji: '🐕', name: 'Kaffesporhunden' },
          { id: 'tractor', emoji: '🚜', name: 'Traktor-patruljen' },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post7',
      number: 7,
      title: 'Ikke vekk Jenny',
      symbol: '🌙',
      clue: 'Nå må dere bevege dere så stille at Jenny fortsetter å sove.',
      gameType: 'stillness',
      gameIntro:
        'Jenny sover. Hold telefonen HELT stille i åtte sekunder – eller hold fingeren rolig i sirkelen. Ett rykk, og hun snur seg …',
      physicalTask: 'Hele laget fryser som statuer i ti sekunder. Den som ler først, må bukke for Jenny.',
      adultBonus:
        'En voksen holder telefonen stille mens en annen voksen prøver å få personen til å le – KUN med miming.',
      adultBonusJudgeOptions: ['Stein-ansikt', 'Småsmil', 'Full latterkollaps'],
      hint: 'Legg albuene inntil kroppen og pust rolig. Eller legg telefonen på et fast underlag … nei vent, det er juks. Litt.',
      funFact:
        'Jenny er familiens uoffisielle verdensmester i søvn. Rekorden er hemmelig, men imponerende.',
      islandSymbol: { id: 'drommestjerne', name: 'Drømmestjernen', emoji: '⭐' },
      categories: ['Stillhet', 'Samarbeid'],
      mapPos: { x: 37, y: 44 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: { seconds: 8 },
    },
    // ------------------------------------------------------------------
    {
      id: 'post8',
      number: 8,
      title: 'Oppussingsdetektivene',
      symbol: '🔨',
      clue: 'Et stort hus er pusset opp, men håndverkerne kan ha tatt noen kreative valg.',
      gameType: 'renovation-find',
      gameIntro:
        'Håndverkerne har vært … kreative. Finn minst sju feil i rommet ved å trykke på dem!',
      physicalTask: 'Lag en hammer, sag eller drill med kroppene deres. Resten av laget gjetter verktøyet!',
      adultBonus:
        'Hvilken setning fører oftest til tre ekstra uker med oppussing? Diskuter og velg. (Riktig svar: ALLE.)',
      adultBonusJudgeOptions: ['De skjønte det', 'De nektet å innse det', 'De sa alle setningene i dag'],
      hint: 'Se etter ting som er OPP-NED, på feil rom eller … i dusjen.',
      funFact:
        'Huset i Skylleviga er nyoppusset. Ingen lamper er montert under gulvet. Så vidt vi vet.',
      islandSymbol: { id: 'skjevspiker', name: 'Den skjeve spikeren', emoji: '📎' },
      categories: ['Kreativitet', 'Øykunnskap'],
      mapPos: { x: 42, y: 39 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        bonusOptions: [
          '«Vi tar bare dette rommet også.»',
          '«Det går sikkert raskt.»',
          '«Vi trenger ikke måle først.»',
          '«Jeg så en video om det.»',
        ],
        errors: [
          { id: 'door', label: 'Døra åpner rett inn i veggen' },
          { id: 'lamp', label: 'Lampe montert under gulvet' },
          { id: 'bathtub', label: 'Badekar i taket' },
          { id: 'socket', label: 'Stikkontakt i dusjen' },
          { id: 'window', label: 'Vinduet viser innsiden av et annet rom' },
          { id: 'trim', label: 'Lista stopper midt på veggen' },
          { id: 'hammer', label: 'En hammer er dørhåndtak' },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post9',
      number: 9,
      title: 'Oslo-pengene på øya',
      symbol: '🪙',
      clue: 'Her skal dere vise at dere kan forvalte en helt oppdiktet formue.',
      gameType: 'budget',
      gameIntro:
        'Laget har fått 100 øymynter! Fordel dem klokt (eller uklokt) mellom øyas viktigste investeringer.',
      physicalTask: 'Vis med pantomime hva laget brukte MEST penger på. Ingen ord!',
      adultBonus:
        'Hold et ti sekunders styremøte og forsvar lagets mest absurde investering med alvorlig stemme.',
      adultBonusJudgeOptions: ['Styret er overbevist', 'Aksjonærene tviler', 'Politianmeldt av sparegrisen'],
      hint: 'Det finnes ingen fasit – men et lag som bruker alt på møterom får spørsmål fra revisor.',
      funFact:
        'Øyas økonomi er basert på vafler, dugnad og en trillebår med god rente.',
      islandSymbol: { id: 'oymynt', name: 'Den fiktive øymynten', emoji: '🥇' },
      categories: ['Gründerkraft', 'Mattekraft'],
      mapPos: { x: 48, y: 53 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        totalCoins: 100,
        options: [
          { id: 'trampoline', emoji: '🤸', label: 'Gigantisk trampoline' },
          { id: 'icecream', emoji: '🍦', label: 'Ismaskin' },
          { id: 'dock', emoji: '⚓', label: 'Ny brygge' },
          { id: 'toll', emoji: '🚇', label: 'Tunnelavgift' },
          { id: 'sheephotel', emoji: '🐑', label: 'Sauehotell' },
          { id: 'lights', emoji: '💡', label: 'Hagebelysning synlig fra Danmark' },
          { id: 'bedroom', emoji: '🛏️', label: 'Ekstra soverom til Jenny' },
          { id: 'meetingroom', emoji: '📊', label: 'Et svært unødvendig møterom' },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post10',
      number: 10,
      title: 'Supergründerfabrikken',
      symbol: '🚀',
      clue: 'Noen får ideer. Andre får altfor mange ideer. Her må dere lage den neste store øybedriften.',
      gameType: 'startup-wheel',
      gameIntro:
        'Snurr de tre hjulene og få en helt fersk forretningsidé! Gi bedriften navn og slagord – investorene venter.',
      physicalTask: 'Lagets yngste presenterer produktnavnet høyt og tydelig for hele laget.',
      adultBonus:
        'En voksen holder en investorpitch på maks 20 sekunder. Barna er investorer og bestemmer!',
      adultBonusJudgeOptions: ['Jeg investerer', 'Jeg må tenke', 'Ring en ansvarlig voksen'],
      hint: 'De beste øybedriftene løser ekte problemer. Eller i det minste morsomme problemer.',
      funFact:
        'Sjur er gründer og stedfortreder for en toppsjef. Ingen vet helt hva det betyr, men det høres travelt ut.',
      islandSymbol: { id: 'lyspare', name: 'Gründerlyspæren', emoji: '💡' },
      categories: ['Gründerkraft', 'Kreativitet'],
      mapPos: { x: 61, y: 64 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        customers: ['Sauer', 'Småbarn', 'Tunnelturister', 'Trøtte foreldre', 'Hagefestgjester'],
        problems: ['mister sokker', 'finner ikke veien', 'sovner for sent', 'ler for lite', 'har for mye plen'],
        technologies: ['kunstig intelligens', 'en drone', 'en robot', 'en app', 'en ekstremt lang person'],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post11',
      number: 11,
      title: 'Sjefens innboks',
      symbol: '💼',
      clue: 'Toppsjefen er borte i fire minutter. Nå er dere ansvarlige.',
      gameType: 'inbox',
      gameIntro:
        'Sju saker har landet i innboksen, men dere rekker bare TRE før sjefen er tilbake. Velg klokt og begrunn valget!',
      physicalTask: 'Lag et «konsernorganisasjonskart» ved å stille dere i en absurd formasjon. Toppsjefen øverst!',
      adultBonus:
        'Oversett til vanlig norsk: «Vi skal fasilitere en strategisk, tverrfaglig prosess for å realisere synergipotensialet.»',
      adultBonusJudgeOptions: ['Krystallklart', 'Fortsatt møtespråk', 'Trenger tolk'],
      hint: 'Det finnes flere gode svar. Tenk: Hva stopper HELE konsernet hvis ingen gjør noe?',
      funFact:
        'Fasit-forslag fra øyrådet: «Vi må snakke sammen og få gjort noe.» Møtet er hevet.',
      islandSymbol: { id: 'sjefsnokkel', name: 'Den midlertidige sjefsnøkkelen', emoji: '🗝️' },
      categories: ['Gründerkraft', 'Samarbeid'],
      mapPos: { x: 82, y: 72 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        pickCount: 3,
        cases: [
          { id: 'sheep', emoji: '🐑', text: 'Tunnelen er full av sauer', urgent: true },
          { id: 'coffee', emoji: '☕', text: 'Kaffemaskinen lager bare kakao', urgent: false },
          { id: 'customer', emoji: '📧', text: 'En kunde vil ha svar i går', urgent: true },
          { id: 'ida', emoji: '😂', text: 'Ida ler så høyt at videomøtet stopper', urgent: false },
          { id: 'cable', emoji: '🔌', text: 'Hele konsernet mangler én skjøteledning', urgent: true },
          { id: 'jenny', emoji: '😴', text: 'Jenny har sovnet på adgangskortet', urgent: false },
          { id: 'investor', emoji: '💰', text: 'En investor vil finansiere sauehotellet', urgent: false },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post12',
      number: 12,
      title: 'Noahs Øylogistikk',
      symbol: '🛶',
      clue: 'To og to. Men noen dyr er vanskeligere å ha med i båt enn andre.',
      gameType: 'animal-memory',
      gameIntro:
        'Finn dyreparene i minnespillet – og last deretter båten uten at den blir overfylt. To og to, med god planlegging!',
      physicalTask: 'Alle velger et dyr og stiller seg i riktig høydeorden – fra strandsnegle til sjiraff.',
      adultBonus:
        'Velg de to dyrene som ville vært vanskeligst å få med gjennom Flekkerøytunnelen – og begrunn svaret.',
      adultBonusJudgeOptions: ['God logistikk', 'Glemte sjiraffhøyden', 'Ville tatt bussen'],
      hint: 'I minnespillet: begynn i ett hjørne og jobb deg rundt. I båten: de minste dyrene gir plass til flest par – de aller største må nok bli igjen på brygga!',
      funFact:
        'Noah var tidlig ute med god logistikk: to og to, god planlegging og plass til alle. Det er fortsatt oppskriften.',
      islandSymbol: { id: 'regnbue', name: 'Regnbuebiten', emoji: '🌈' },
      categories: ['Samarbeid', 'Øykunnskap'],
      mapPos: { x: 73, y: 84 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        animals: [
          { emoji: '🐑', name: 'Sau', size: 2 },
          { emoji: '🐧', name: 'Pingvin', size: 1 },
          { emoji: '🐘', name: 'Elefant', size: 5 },
          { emoji: '🐔', name: 'Høne', size: 1 },
          { emoji: '🐕', name: 'Hund', size: 2 },
          { emoji: '🦒', name: 'Sjiraff', size: 4 },
        ],
        boatCapacity: 8,
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post13',
      number: 13,
      title: 'Skyllevigsk Språkprøve',
      symbol: '💬',
      clue: 'Ingen blir ordentlig øyboer uten å forstå det hemmelige språket.',
      gameType: 'language-match',
      gameIntro:
        'Skyllevigsk er et topphemmelig (og helt oppdiktet!) språk. Koble hvert uttrykk til riktig betydning.',
      physicalTask: 'Mim ett av uttrykkene for laget. Klarer de å gjette hvilket?',
      adultBonus:
        'Oversett en tilfeldig kontorsetning til Skyllevigsk. Jo flere øyord, jo bedre!',
      adultBonusJudgeOptions: ['Flytende skyllevigsk', 'Turistnivå', 'Fortsatt tunnelfersk'],
      hint: 'Tenk på hva familien er kjent for: Sjur er lang, Jenny sover, Ida ler …',
      funFact:
        'Skyllevigsk er 100 % oppdiktet for denne festen. Ekte flekkerøyfolk snakker heldigvis helt vanlig sørlandsk.',
      islandSymbol: { id: 'snakkeboble', name: 'Den hemmelige snakkeboblen', emoji: '🗨️' },
      categories: ['Øykunnskap', 'Latter'],
      mapPos: { x: 65, y: 92 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        pairs: [
          { word: 'Tunnelfersk', meaning: 'En person som nettopp har kommet fra byen' },
          { word: 'Sjursteg', meaning: 'En avstand som er lengre enn forventet' },
          { word: 'Jennyminutt', meaning: 'En lur som varer betydelig lenger enn planlagt' },
          { word: 'Idavarsel', meaning: 'Latter kan høres i området' },
          { word: 'Emilnivå', meaning: 'Oppgaven ble plutselig mye vanskeligere' },
          { word: 'Isakalarm', meaning: 'Noen trenger redningshjelp' },
        ],
        officeSentences: [
          '«Vi tar en fot i bakken etter lunsj.»',
          '«Kan du sende meg en kalenderinvitasjon?»',
          '«Vi parkerer den saken til neste møte.»',
          '«Har alle lest sakspapirene?»',
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post14',
      number: 14,
      title: 'Byfolkdetektoren',
      symbol: '🔍',
      clue: 'Øyrådet har observert mistenkelig urbane aktiviteter.',
      gameType: 'swipe-detector',
      gameIntro:
        'Byfolkdetektoren trenger kalibrering! Sveip hver gjenstand til riktig kategori: mistenkelig byfolk, øygodkjent – eller begge.',
      physicalTask: 'Pakk en usynlig piknikkurv med fem ting – uten å si hva tingene er. Laget gjetter!',
      adultBonus:
        'De voksne får 20 sekunder på å forklare forskjellen på babord og styrbord. Barna avgjør om de virket sikre.',
      adultBonusJudgeOptions: ['Sjøklare', 'Googlet i hodet', 'Pekte feil vei med stø hånd'],
      hint: 'Det finnes ting som er begge deler. Vafler, for eksempel. Vafler er alltid begge deler.',
      funFact:
        'Resultat: Alle slipper inn. Øya trenger både byfolk, øyfolk og folk som bare vil ha vaffel.',
      islandSymbol: { id: 'detektor', name: 'Byfolkdetektoren', emoji: '🧭' },
      categories: ['Øykunnskap', 'Latter'],
      mapPos: { x: 50, y: 78 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {
        // answer: 'by' | 'oy' | 'begge'
        items: [
          { emoji: '☕', text: 'Kaffe med fire ord i navnet', answer: 'by' },
          { emoji: '🥾', text: 'Gummistøvler', answer: 'oy' },
          { emoji: '🚲', text: 'Elektrisk lastesykkel', answer: 'by' },
          { emoji: '🎣', text: 'Fiskestang', answer: 'oy' },
          { emoji: '🧥', text: 'Regnjakke til 8 000 kroner', answer: 'by' },
          { emoji: '🔥', text: 'Engangsgrill', answer: 'begge' },
          { emoji: '⛵', text: 'Båt uten å vite forskjell på babord og styrbord', answer: 'by' },
          { emoji: '🧇', text: 'Vaffelrøre i en brusflaske', answer: 'begge' },
        ],
      },
    },
    // ------------------------------------------------------------------
    {
      id: 'post15',
      number: 15,
      title: 'Nøkkelen til Skylleviga',
      symbol: '🗝️',
      clue: 'Tilbake til festhuset! Der venter den aller siste prøven.',
      gameType: 'finale-code',
      gameIntro:
        'Fire av øysymbolene deres lyser opp – og hvert av dem gjemmer et siffer. Finn den firesifrede koden og lås opp nøkkelen til Skylleviga!',
      physicalTask: 'Hele laget lager sin beste seierspositur. Hold den i fem sekunder!',
      adultBonus:
        'En voksen holder en æresøyboer-skål på MAKS én setning. Barna dømmer lengde og verdighet.',
      adultBonusJudgeOptions: ['Rørende', 'Akkurat passe kort', 'Det var tre setninger'],
      hint: 'Se på symbolene som lyser – tallet står på hvert av dem. Rekkefølgen følger postnumrene.',
      funFact:
        'Gratulerer! Øyrådet har enstemmig (1 sau, 2 måker) vedtatt at dere er godkjente æresøyboere.',
      islandSymbol: { id: 'skyllevigano', name: 'Den komplette Skylleviga-nøkkelen', emoji: '🏆' },
      categories: ['Samarbeid', 'Øykunnskap'],
      mapPos: { x: 28, y: 31 },
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: {},
    },
  ] as PostConfig[],
};

export type GameConfig = typeof gameConfig;

export function getPost(num: number): PostConfig {
  const post = gameConfig.posts.find((p) => p.number === num);
  if (!post) throw new Error(`Ukjent post: ${num}`);
  return post;
}

export function findPost(num: number): PostConfig | undefined {
  return gameConfig.posts.find((p) => p.number === num);
}

export function isValidCode(code: unknown): code is string {
  return typeof code === 'string' && /^\d{4}$/.test(code);
}
