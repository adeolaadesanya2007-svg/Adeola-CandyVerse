
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  multiplier: number;
  type: 'cps' | 'cpc';
  value: number;
  emoji: string;
  imageUrl?: string;
  color?: string;
  unlockAt?: number; 
  isGranny?: boolean;
  category?: 'shop' | 'magic' | 'stats';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: GameState) => boolean;
}

export interface GrannyInstance {
  id: string;
  name: string;
  age: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speech: string | null;
  speechType: 'intro' | 'random' | null;
  imageUrl?: string;
  emoji: string;
  introTriggered?: boolean;
}

export interface AntInstance {
  id: string;
  x: number;
  y: number;
  isEating: boolean;
  angle: number;
}

export type DeviceMode = 'phone' | 'tablet' | 'laptop';

export interface GameState {
  candyCount: number;
  totalCandies: number;
  clicks: number;
  upgrades: Record<string, number>;
  lastSaved: number;
  playerName: string;
  grannyInstances: GrannyInstance[];
  antInstances: AntInstance[];
  unlockedAchievements: string[];
  multiplier: number;
  multiplierEndTime: number;
  hasSeenIntro: boolean;
  isCoreAwakened: boolean;
  candySkin: string;
  deviceMode: DeviceMode;
  prestigeLevel: number;
}

export interface LoreEntry {
  title: string;
  text: string;
}
