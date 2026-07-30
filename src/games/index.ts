import type { ComponentType } from 'react';
import type { GameType } from '../types';
import type { GameProps } from './types';
import { TunnelRunGame } from './TunnelRunGame';
import { PassportGame } from './PassportGame';
import { HeightStackGame } from './HeightStackGame';
import { LaughRhythmGame } from './LaughRhythmGame';
import { MathVaultGame } from './MathVaultGame';
import { RescueMatchGame } from './RescueMatchGame';
import { StillnessGame } from './StillnessGame';
import { RenovationFindGame } from './RenovationFindGame';
import { BudgetGame } from './BudgetGame';
import { StartupWheelGame } from './StartupWheelGame';
import { InboxGame } from './InboxGame';
import { AnimalMemoryGame } from './AnimalMemoryGame';
import { LanguageMatchGame } from './LanguageMatchGame';
import { SwipeDetectorGame } from './SwipeDetectorGame';
import { FinaleCodeGame } from './FinaleCodeGame';

export const games: Record<GameType, ComponentType<GameProps>> = {
  'tunnel-run': TunnelRunGame,
  'passport': PassportGame,
  'height-stack': HeightStackGame,
  'laugh-rhythm': LaughRhythmGame,
  'math-vault': MathVaultGame,
  'rescue-match': RescueMatchGame,
  'stillness': StillnessGame,
  'renovation-find': RenovationFindGame,
  'budget': BudgetGame,
  'startup-wheel': StartupWheelGame,
  'inbox': InboxGame,
  'animal-memory': AnimalMemoryGame,
  'language-match': LanguageMatchGame,
  'swipe-detector': SwipeDetectorGame,
  'finale-code': FinaleCodeGame,
};
