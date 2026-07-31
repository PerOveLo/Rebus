import Anthropic from '@anthropic-ai/sdk';
import { gameConfig } from '../config/gameConfig';
import { CUSTOM_CATEGORIES, SYMBOL_EMOJIS, genericMiniGames } from '../config/genericGames';
import { uid } from './storage';
import type { Category, CustomRebusPayload, PostConfig, RebusAnswers } from '../types';

// ============================================================
// «Lag ny rebus»: bygger en komplett rebus fra spillleders svar.
// - Med Anthropic API-nøkkel: Claude skriver personlige spørsmål,
//   historie, lagoppgaver og voksenbonuser fra svarene.
// - Uten nøkkel: en innebygd mal-generator lager en enklere,
//   men fullt spillbar versjon.
// Nøkkelen lagres kun lokalt i nettleseren, og kallet går direkte
// fra telefonen til Anthropic – ingen mellomserver.
// ============================================================

export interface GeneratedPost {
  title: string;
  emoji: string;
  clue: string;
  question: { q: string; options: string[]; answerIndex: number; funny: string };
  physicalTask: string;
  adultBonus: string;
  judgeOptions: string[];
  hint: string;
  funFact: string;
  symbolName: string;
  symbolEmoji: string;
}

interface GeneratedRebus {
  story: string;
  posts: GeneratedPost[];
}

// Standard kartposisjoner for egne rebuser: en løype rundt bildet.
function defaultMapPos(index: number, count: number) {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.round((50 + Math.cos(angle) * 35) * 10) / 10,
    y: Math.round((50 + Math.sin(angle) * 35) * 10) / 10,
  };
}

function firstName(answers: RebusAnswers): string | undefined {
  return answers.people.split(/[,\n]/)[0]?.trim() || undefined;
}

// Gjør genererte poster om til ekte PostConfig-objekter (samme format
// som Skylleviga-postene) + bygger finalen.
export function assembleRebus(
  answers: RebusAnswers,
  generated: GeneratedRebus,
): CustomRebusPayload {
  const minis = genericMiniGames(answers.place || 'festen', firstName(answers));
  const regularCount = generated.posts.length;

  const posts: PostConfig[] = generated.posts.map((g, i) => {
    const number = i + 1;
    const mini = minis[Math.floor(i / 2) % minis.length];
    // Annenhver post: rent quizspørsmål eller rent minispill – da blir det
    // én hovedutfordring per post i stedet for to.
    const quizOnly = i % 2 === 0;
    return {
      id: `custom${number}`,
      number,
      title: g.title,
      symbol: g.emoji,
      clue: g.clue,
      gameType: quizOnly ? 'quiz-combo' : mini.type,
      gameIntro: quizOnly
        ? 'Et spørsmål om dere – diskuter i laget!'
        : 'Et minispill – alle kan hjelpe!',
      physicalTask: g.physicalTask,
      adultBonus: g.adultBonus,
      adultBonusJudgeOptions: g.judgeOptions.slice(0, 3),
      hint: g.hint,
      funFact: g.funFact,
      islandSymbol: {
        id: `sym${number}`,
        name: g.symbolName,
        emoji: g.symbolEmoji || SYMBOL_EMOJIS[i % SYMBOL_EMOJIS.length],
      },
      categories: [...CUSTOM_CATEGORIES[i % CUSTOM_CATEGORIES.length]] as Category[],
      mapPos: defaultMapPos(i, regularCount + 1),
      points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
      data: quizOnly ? { question: g.question, mini: null } : mini.data,
    };
  });

  // Finalen er alltid post 15 (kodegåten gjenbrukes).
  posts.push({
    id: 'custom-finale',
    number: 15,
    title: `Nøkkelen til ${answers.place || 'festen'}`,
    symbol: '🗝️',
    clue: 'Tilbake til start! Der venter den aller siste prøven.',
    gameType: 'finale-code',
    gameIntro:
      'Fire av symbolene deres lyser opp – og hvert av dem gjemmer et siffer. Finn den firesifrede koden!',
    physicalTask: 'Hele laget lager sin beste seierspositur. Hold den i fem sekunder!',
    adultBonus: 'En voksen holder en takketale på MAKS én setning. Barna dømmer lengde og verdighet.',
    adultBonusJudgeOptions: ['Rørende', 'Akkurat passe kort', 'Det var tre setninger'],
    hint: 'Se på symbolene som lyser – tallet står på hvert av dem. Rekkefølgen følger postnumrene.',
    funFact: `Gratulerer! Dere er offisielt godkjente ${answers.place ? `${answers.place}-helter` : 'festhelter'}!`,
    islandSymbol: { id: 'sym-final', name: 'Den store nøkkelen', emoji: '🏆' },
    categories: ['Samarbeid', 'Øykunnskap'] as Category[],
    mapPos: { x: 50, y: 50 },
    points: { main: 60, team: 20, bonus: 20, hintPenalty: 10 },
    data: {},
  });

  return {
    id: uid(),
    name: answers.groupName ? `${answers.groupName}s store prøve` : 'Vår egen rebus',
    place: answers.place || 'festen',
    story: generated.story,
    posts,
  };
}

// ------------------------------------------------------------
// AI-generering med Claude (spillleders egen Anthropic-nøkkel)
// ------------------------------------------------------------

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['story', 'posts'],
  properties: {
    story: { type: 'string', description: 'Introhistorie på 3-5 setninger, norsk bokmål' },
    posts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title', 'emoji', 'clue', 'question', 'physicalTask', 'adultBonus',
          'judgeOptions', 'hint', 'funFact', 'symbolName', 'symbolEmoji',
        ],
        properties: {
          title: { type: 'string' },
          emoji: { type: 'string' },
          clue: { type: 'string' },
          question: {
            type: 'object',
            additionalProperties: false,
            required: ['q', 'options', 'answerIndex', 'funny'],
            properties: {
              q: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              answerIndex: { type: 'integer' },
              funny: { type: 'string' },
            },
          },
          physicalTask: { type: 'string' },
          adultBonus: { type: 'string' },
          judgeOptions: { type: 'array', items: { type: 'string' } },
          hint: { type: 'string' },
          funFact: { type: 'string' },
          symbolName: { type: 'string' },
          symbolEmoji: { type: 'string' },
        },
      },
    },
  },
} as const;

export async function generateWithClaude(
  answers: RebusAnswers,
  postCount: number,
  apiKey: string,
): Promise<CustomRebusPayload> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const regular = postCount - 1;

  const prompt = `Du skal lage innholdet til en rebusløype for en privat fest. Lag NØYAKTIG ${regular} poster pluss en introhistorie, alt på norsk bokmål, i en varm, leken og familievennlig tone (barn 4-14 år og voksne spiller sammen i lag). Humoren skal være kjærlig – aldri på bekostning av enkeltpersoner.

VIKTIG OM STIL: Bruk svarene under som SPRINGBRETT, ikke fasit. Søk gjerne på nettet etter stedet og temaene (lokalhistorie, geografi, rare fakta om maten/hobbyene) og flett inn ekte, overraskende kunnskap. Vær kreativ, uventet og passe sprø – bygg små absurde univers rundt gjengen (hemmelige byråer, konspirasjoner om grillmat, verdensmesterskap ingen har hørt om). Voksenbonusene kan være VILLE: improvisasjonsteater, dramatiske opplesninger, absurde debatter – fortsatt familievennlige. Ikke lag alle spørsmål som «hva svarte spillleder» – lag også kunnskapsspørsmål om stedet/temaene der de morsomme gale svarene nesten er sanne.

Om gjengen (bruk dette aktivt i ALT innholdet – spørsmål, vitser, oppgaver):
- Sted: ${answers.place}
- Gjengen kalles: ${answers.groupName}
- Hvem er med: ${answers.people}
- Morsomme fakta om folkene: ${answers.funFacts}
- Gjengen er kjent for: ${answers.knownFor}
- Intern vits: ${answers.insideJoke}
- Spiser/drikker alltid: ${answers.food}
- Spesielt ved stedet: ${answers.placeFact}

Per post:
- "title": kort, morsomt postnavn (gjerne med navn/tema fra gjengen)
- "emoji": én passende emoji
- "clue": en generell ledetråd til å finne neste post UTEN konkrete stedsnavn (spillleder plasserer postene selv), f.eks. «Gå dit dere pleier å grille»-stil hvis stedsfakta gir grunnlag, ellers noe lekent og generelt
- "question": et quizspørsmål OM GJENGEN basert på faktaene over, med 3 svaralternativer (ett riktig, to morsomme feil), "answerIndex" (0-2) og "funny" (en kort, varm forklaring/vits etter riktig svar)
- "physicalTask": en fysisk/sosial lagoppgave uten utstyr og uten klatring
- "adultBonus": en voksenoppgave der BARNA er dommere (improvisasjon, selvironi eller vanskeligere spørsmål)
- "judgeOptions": 3 morsomme dommeralternativer barna velger mellom
- "hint": et vennlig hint til quizspørsmålet
- "funFact": en kort morsom avslutning
- "symbolName": navn på symbolet laget samler (knyttet til gjengen)
- "symbolEmoji": én emoji for symbolet

Varier spørsmålene godt: hvem-er-hvem, vaner, stedet, maten – men også ekte fakta du finner om stedet og temaene (med de gale svarene som nesten-sannheter). "story": en introhistorie på 3-5 setninger som gjør gjengen til helter i et litt sprøtt univers.`;

  type Loose = { stop_reason: string | null; content: { type: string; text?: string }[] };
  const baseParams = {
    model: 'claude-opus-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    // Skulle sikkerhetsklassifisererne avvise et kall, prøves automatisk
    // en annen Claude-modell server-side.
    fallbacks: 'default',
    // Claude kan søke opp stedet og temaene og flette inn ekte lokal kunnskap.
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
  };
  // SDK-typene henger litt etter beta-feltene (fallbacks) – responsformen
  // leses derfor strukturelt. Nettsøk kan gi pause_turn; da fortsetter vi.
  const messages: unknown[] = [{ role: 'user', content: prompt }];
  let response = (await client.beta.messages.create({ ...baseParams, messages } as never)) as unknown as Loose;
  for (let i = 0; i < 3 && response.stop_reason === 'pause_turn'; i += 1) {
    messages.push({ role: 'assistant', content: response.content });
    response = (await client.beta.messages.create({ ...baseParams, messages } as never)) as unknown as Loose;
  }

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude takket nei til denne forespørselen. Juster svarene og prøv igjen.');
  }
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Tomt svar fra Claude. Prøv igjen.');
  const parsed = JSON.parse(text) as GeneratedRebus;
  if (!parsed.posts || parsed.posts.length === 0) throw new Error('Claude leverte ingen poster. Prøv igjen.');
  return assembleRebus(answers, parsed);
}

// ------------------------------------------------------------
// Mal-generator (fungerer uten API-nøkkel)
// ------------------------------------------------------------

export function generateFromTemplate(answers: RebusAnswers, postCount: number): CustomRebusPayload {
  const people = answers.people.split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
  const p = (i: number) => people[i % Math.max(1, people.length)] || 'noen i gjengen';
  const place = answers.place || 'festen';

  const bank: GeneratedPost[] = [
    {
      title: `Velkommen til ${place}!`, emoji: '🎉',
      clue: 'Finn et sted med god plass til hele laget.',
      question: {
        q: `Hva er ${answers.groupName || 'gjengen'} mest kjent for?`,
        options: [answers.knownFor || 'Å være verdens hyggeligste', 'Å alltid komme presis', 'Å aldri le av egne vitser'],
        answerIndex: 0,
        funny: 'Selvfølgelig! Det visste alle.',
      },
      physicalTask: 'Still laget opp i alfabetisk rekkefølge på fornavn – uten å snakke.',
      adultBonus: `En voksen forklarer på 15 sekunder hvorfor ${place} er verdens beste sted. Barna dømmer!`,
      judgeOptions: ['Overbevisende', 'Mistenkelig', 'Helt sikkert oppdiktet'],
      hint: 'Tenk på det gjengen alltid får skryt (eller kjeft) for …',
      funFact: 'Godkjent! Dere kan tydeligvis gjengen deres.',
      symbolName: 'Velkomststeinen', symbolEmoji: '🗿',
    },
    {
      title: 'Matmysteriet', emoji: '🍽️',
      clue: 'Gå dit det lukter best.',
      question: {
        q: 'Hva spiser eller drikker gjengen ALLTID sammen?',
        options: [answers.food || 'Vafler', 'Kokt sellerisuppe', 'Ristet knekkebrød uten pålegg'],
        answerIndex: 0,
        funny: 'Mmm … nå ble alle sultne.',
      },
      physicalTask: 'Mim favorittmåltidet uten lyd – laget gjetter!',
      adultBonus: 'En voksen beskriver favorittmaten som en TV-kokk, med store armbevegelser. Barna dømmer!',
      judgeOptions: ['Michelin-stjerne', 'God husmannskost', 'Ring pizzabudet'],
      hint: 'Det serveres garantert i dag også …',
      funFact: 'Riktig svar gir dobbel porsjon senere. Kanskje.',
      symbolName: 'Gaffelen av gull', symbolEmoji: '🥇',
    },
    {
      title: 'Den interne vitsen', emoji: '😂',
      clue: 'Finn et sted der det er lov å le høyt.',
      question: {
        q: 'Hva er gjengens interne vits?',
        options: [answers.insideJoke || 'Den alle ler av men ingen husker', 'Noe med en papegøye', 'Den er hemmelig'],
        answerIndex: 0,
        funny: 'HAHA! Klassikeren. Den blir aldri gammel. (Jo.)',
      },
      physicalTask: 'Én starter en latter – resten må henge seg på uten å si et ord.',
      adultBonus: 'Hver voksen forteller sin dårligste vits. Barna kårer den ALLER dårligste (det er en ære).',
      judgeOptions: ['Genialt dårlig', 'Bare dårlig', 'Pappa-vits-hall-of-fame'],
      hint: 'Den dere ler av hver eneste gang …',
      funFact: 'Forskning viser at interne vitser blir 12 % morsommere per år.',
      symbolName: 'Latterperlen', symbolEmoji: '💎',
    },
    {
      title: 'Stedets hemmelighet', emoji: '🗺️',
      clue: 'Gå til det fineste stedet i nærheten.',
      question: {
        q: `Hva er spesielt med ${place}?`,
        options: [answers.placeFact || 'Alt!', 'Ingenting som helst', 'Det er strengt hemmelig'],
        answerIndex: 0,
        funny: 'Riktig! Og nå vet alle det.',
      },
      physicalTask: 'Lag en levende statue som viser stedet på sitt beste. Frys i ti sekunder!',
      adultBonus: `De voksne får 20 sekunder til å selge ${place} som eiendomsmeglere. Barna er kjøpere!`,
      judgeOptions: ['SOLGT!', 'Vi må tenke på det', 'Vi ringer en annen megler'],
      hint: 'Det står i invitasjonen … kanskje.',
      funFact: `${place}: nå med offisiell rebus-historie.`,
      symbolName: 'Stedsnøkkelen', symbolEmoji: '🗝️',
    },
    {
      title: 'Hvem er hvem?', emoji: '🕵️',
      clue: 'Finn et sted med god utsikt over festen.',
      question: {
        q: `Hva er sant om ${p(0)}?`,
        options: [answers.funFacts || 'Noe veldig morsomt', 'Har vunnet OL i stille lek', 'Snakker flytende delfinsk'],
        answerIndex: 0,
        funny: 'Helt riktig – og det er bare toppen av isfjellet!',
      },
      physicalTask: `Alle herme etter ${p(0)} i ti sekunder. Kjærlig, selvsagt!`,
      adultBonus: 'Barna stiller de voksne ett spørsmål om barna – klarer de voksne svare riktig?',
      judgeOptions: ['Imponerende foreldre', 'Godkjent på nåde', 'Følger de egentlig med?'],
      hint: 'Tenk på det alle alltid ler av …',
      funFact: 'Kjenner du gjengen, kjenner du veien videre.',
      symbolName: 'Forstørrelsesglasset', symbolEmoji: '🧭',
    },
  ];

  const regular = Math.min(postCount - 1, 14);
  const generated: GeneratedRebus = {
    story: `${answers.groupName || 'Gjengen'} samles i ${place} – men før festen kan nå nye høyder, må ${regular} hemmelige prøver bestås! Dere må kjenne hverandre, samarbeide og le (mye). Samle symbolene, knekk sluttkoden – og bli tidenes helter i ${place}!`,
    posts: Array.from({ length: regular }, (_, i) => {
      const base = bank[i % bank.length];
      return i < bank.length
        ? base
        : { ...base, title: `${base.title} ${Math.floor(i / bank.length) + 1}`, symbolName: `${base.symbolName} ${Math.floor(i / bank.length) + 1}` };
    }),
  };
  return assembleRebus(answers, generated);
}

// Standard antall poster i en egen rebus.
export const CUSTOM_POST_COUNTS = [8, 10, 15];
export { gameConfig as baseConfig };
