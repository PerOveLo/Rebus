import type { GameType } from '../types';

// Generiske minispill-oppsett for «Lag ny rebus»-poster. Disse er
// frikoblet fra Skylleviga-innholdet og kan brukes hvor som helst.
// Skylleviga-rebusen i gameConfig.ts bruker fortsatt sine egne data.

export interface MiniGameDef {
  type: GameType;
  data: Record<string, unknown>;
}

export function genericMiniGames(place: string, firstPerson?: string): MiniGameDef[] {
  return [
    { type: 'simon', data: { emojis: ['🌊', '🔥', '🌿', '⭐'], targetLength: 5 } },
    { type: 'whack', data: { target: '🧇', targetLabel: 'vaffelen', decoys: ['🐌', '🧦', '🥌'], seconds: 20, goal: 10 } },
    { type: 'balloon', data: { rounds: 3 } },
    {
      type: 'tunnel-run',
      data: {
        obstacles: [
          { emoji: '🛒', label: 'en handlevogn på rømmen' },
          { emoji: '🦆', label: 'en andefamilie' },
          { emoji: '📦', label: 'en altfor stor flyttekasse' },
          { emoji: '🤳', label: 'en som stoppet for å ta bilde' },
        ],
        secondsToSurvive: 20,
        tunnelLabel: `VEIEN TIL ${place.toUpperCase()}`,
        doneJoke: 'Kjørestil: «forsiktig festdeltaker». Godkjent!',
      },
    },
    {
      type: 'math-vault',
      data: {
        levels: {
          small: [
            { q: 'Hvor mange ender ser du? 🦆🦆🦆🦆', options: ['3', '4', '5'], answer: '4' },
            { q: '2 boller + 3 boller = ?', options: ['4', '5', '6'], answer: '5' },
            { q: 'Hvilken er størst?', options: ['🐜', '🐘', '🐭'], answer: '🐘' },
          ],
          medium: [
            { q: 'Hva er neste tall? 3, 6, 12, 24, …', options: ['36', '48', '30'], answer: '48' },
            { q: '7 · 8 = ?', options: ['54', '56', '63'], answer: '56' },
            { q: '100 − 37 = ?', options: ['63', '67', '73'], answer: '63' },
          ],
          adult: [
            { q: '25 % rabatt på en gressklipper til 4 800 kr. Ny pris?', options: ['3 600 kr', '3 800 kr', '4 000 kr'], answer: '3 600 kr' },
            { q: 'En kake deles i 12. Tre gjester tar 2 stykker hver. Hvor stor andel er igjen?', options: ['25 %', '50 %', '75 %'], answer: '50 %' },
            { q: 'Dere går 80 m per minutt. Hvor langt på 25 min?', options: ['1,6 km', '2,0 km', '2,4 km'], answer: '2,0 km' },
          ],
        },
      },
    },
    {
      type: 'animal-memory',
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
    { type: 'stillness', data: { seconds: 8, sleeperName: firstPerson || 'nabokatten' } },
  ];
}

// Emoji-pool for øysymbolene lagene samler i en egen rebus.
export const SYMBOL_EMOJIS = ['🗿', '🐚', '🗝️', '🌟', '🎖️', '🧭', '🎁', '🏵️', '💎', '🪶', '🌈', '🍀', '🎈', '🥇'];

export const CUSTOM_CATEGORIES = [
  ['Samarbeid', 'Latter'],
  ['Kreativitet', 'Samarbeid'],
  ['Mattekraft', 'Latter'],
  ['Redningsevne', 'Samarbeid'],
  ['Øykunnskap', 'Kreativitet'],
  ['Stillhet', 'Samarbeid'],
  ['Gründerkraft', 'Latter'],
] as const;
