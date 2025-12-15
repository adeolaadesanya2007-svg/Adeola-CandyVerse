
import { Upgrade, Achievement, GameState } from './types';

export const PLAYER_NAMES = [
  "Cosmic Restorer",
  "Sugar Sovereign",
  "Void Sealer",
  "Galactic Glazier",
  "Nebula Nibbler",
  "Starlight Stirrer",
  "Dimension Dipper",
  "Celestial Confectioner",
  "Reality Refiner",
  "The Sweetness Guardian"
];

export const SOCIAL_CONVERSATIONS = [
  ["Did you see that Goblin's hat?", "Totally tacky. Neon green is SO last millennium."],
  ["How many taps are we at?", "I lost count after a billion. My wings are sticky."],
  ["I heard Ade found a secret stash of fudge.", "Don't tell her I know, she'll turn my wings into licorice."],
  ["The Sugar Core looks extra sparkly today.", "It's the manual labor. Humans are weirdly good at it."],
  ["Wanna race to the edge of the screen?", "Last one there is a sour grape!"],
  ["I found a stray Jellybean earlier.", "Did you eat it?", "Obviously. It tasted like destiny."],
  ["I absolutely despise Goblins.", "Ugh, tell me about it. They smell like wet cardboard and sour milk."],
  ["A Goblin tried to bite my wand yesterday!", "How rude! I hope you turned its nose into a lemon drop."],
  ["Why are Goblins so... green?", "It's the lack of sugar. It makes them bitter and moldy."],
  ["I saw a Goblin crying near the Void.", "Good. They deserve to be sad for what they did to the candy fields."]
];

export const ADE_PHRASES = [
  "Did you know that CandyVerse was actually destroyed by the goblin 100000yrs ago? ...I'm kidding!",
  "Hello, I'm Ade and my friends say I'm crazy, but this is not about me—the universe is in trouble... and I need a snack.",
  "I once tried to date a Chocolate Golem. He was sweet, but he totally melted during our first beach trip. Tragic.",
  "You know, tapping a giant candy is technically exercise. Tell your doctor you're a 'Sugar Athlete'.",
  "I’ve seen the edge of the universe. It’s slightly sticky and smells like burnt caramel. 1/10 stars, would not recommend.",
  "My wings are actually made of crystallized sarcasm. That's why I'm so sparkly!",
  "If life gives you lemons, throw them back and demand lemon-drops. Know your worth.",
  "The secret to eternal life is 40% sugar, 60% ignoring your problems, and 0% kale. Especially the kale.",
  "I heard a rumor that the Sugar Pixies are starting a union. They want more glitter and less 'mandatory humming'.",
  "Is it just me, or is that Candy getting more judgmental the more you tap it? It’s got that 'I'm rounder than you' look.",
  "I'm not saying I'm the reason the sky is purple in the 5th dimension, but I *was* playing with glitter near a wormhole.",
  "Stop looking at my wings, my eyes are up here. Well, usually. Sometimes they wander to the nearest donut.",
  "The Goblins aren't even scary once you realize they're just highly aggressive marshmallows with dental issues.",
  "I ate a star once. It was spicy. Now I can see through time, and trust me, you're going to want to buy more upgrades.",
  "Every 100,000 years, the Great Gummy awakens. He’s basically just a giant toddler who needs a nap and some justice.",
  "Don't trust the pink ones. Pink is the color of hidden teeth and strawberry-flavored lies.",
  "The void isn't empty. It's full of single socks and things people 'meant to do tomorrow'. It's very crowded.",
  "I’m not crazy, I’m just tuned to a frequency you haven’t discovered yet. It sounds like a pop-rock exploding in a library.",
  "If you tap fast enough, you might actually rip a hole in reality. If you do, please look for my car keys. They're shiny.",
  "Why be a hero when you can be a Sugar Sovereign? Heroes get statues, but we get the fudge.",
  "I whispered a secret to a Jellybean once. Now it won't stop following me. It knows too much about my 3 AM habits."
];

export const UPGRADES: Upgrade[] = [
  {
    id: 'mana_needle',
    name: 'Mana Needle',
    description: 'Stitches together stray sugar atoms from the air.',
    baseCost: 15,
    multiplier: 1.15,
    type: 'cps',
    value: 0.1,
    emoji: '🧵',
    color: '#94a3b8',
    category: 'shop'
  },
  {
    id: 'magic_wand',
    name: 'Magic Wand',
    description: 'Autonomous enchanting. Adds automatic clicks in every cycle!',
    baseCost: 80,
    multiplier: 1.3,
    type: 'cps',
    value: 0.5,
    emoji: '🪄',
    color: '#a855f7',
    category: 'shop'
  },
  {
    id: 'sugar_pixie',
    name: 'Sugar Pixie',
    description: 'A tiny garden sprite humming melodies of growth.',
    baseCost: 100,
    multiplier: 1.15,
    type: 'cps',
    value: 1,
    emoji: '🧚',
    color: '#fbbf24',
    isGranny: true,
    category: 'magic'
  },
  {
    id: 'peppermint_fairy',
    name: 'Peppermint Fairy',
    description: 'A cool, minty ally who works 10x harder than a pixie.',
    baseCost: 1200,
    multiplier: 1.15,
    type: 'cps',
    value: 10,
    emoji: '🧚🏼‍♂️',
    color: '#10b981',
    isGranny: true,
    unlockAt: 500,
    category: 'magic'
  },
  {
    id: 'candy_fairy',
    name: 'Candy Fairy',
    description: 'Clicks 2x as fast as the Peppermint Fairy!',
    baseCost: 15000,
    multiplier: 1.2,
    type: 'cps',
    value: 20,
    emoji: '🧚🏼‍♀️',
    color: '#f472b6',
    isGranny: true,
    unlockAt: 5000,
    category: 'magic'
  },
  {
    id: 'sovereign_fairy',
    name: 'Sovereign Fairy',
    description: 'A majestic fairy from the deep void. Clicks 2x as fast as the Candy Fairy!',
    baseCost: 100000,
    multiplier: 1.25,
    type: 'cps',
    value: 40,
    emoji: '🧚🏿‍♀️',
    color: '#6366f1',
    isGranny: true,
    unlockAt: 25000,
    category: 'magic'
  },
  {
    id: 'crystal_archmage',
    name: 'Candy Wizard',
    description: 'A celestial wizard who converts starlight into syrup.',
    baseCost: 500000,
    multiplier: 1.2,
    type: 'cps',
    value: 450,
    emoji: '🧙‍♂️',
    color: '#3b82f6',
    isGranny: true,
    unlockAt: 100000,
    category: 'magic'
  },
  {
    id: 'dragon_vault',
    name: 'Dragon Vault',
    description: 'Ancient drakes sleeping on piles of hardened caramel.',
    baseCost: 2000000,
    multiplier: 1.15,
    type: 'cps',
    value: 1400,
    emoji: '🐉',
    color: '#ef4444',
    category: 'shop'
  },
  {
    id: 'ant_infestation',
    name: 'Candy Ants',
    description: 'Tiny workers that organize your sugar crumbs with military precision.',
    baseCost: 10000000,
    multiplier: 1.5,
    type: 'cps',
    value: 6500,
    emoji: '🐜',
    color: '#4b5563',
    isGranny: true,
    unlockAt: 500000,
    category: 'magic'
  },
  {
    id: 'empire_monolith',
    name: 'Empire Monolith',
    description: 'A structure celebrating your sugar conquest.',
    baseCost: 50000000,
    multiplier: 2.0,
    type: 'cps',
    value: 25000,
    emoji: '🏢',
    color: '#f97316',
    unlockAt: 2000000,
    category: 'stats'
  },
  {
    id: 'sugar_supercomputer',
    name: 'Sugar AI',
    description: 'A neural network that optimizes sweetness logic.',
    baseCost: 250000000,
    multiplier: 2.5,
    type: 'cps',
    value: 500000,
    emoji: '💻',
    color: '#06b6d4',
    unlockAt: 10000000,
    category: 'stats'
  },
  {
    id: 'philosophers_stone',
    name: 'Philosopher\'s Stone',
    description: 'Transmutes logic into pure strawberry fudge.',
    baseCost: 1000000000,
    multiplier: 1.15,
    type: 'cps',
    value: 2000000,
    emoji: '💎',
    color: '#6366f1',
    category: 'shop'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_click', name: 'Awakened', description: 'Click the Core for the first time.', emoji: '🌟', condition: (s) => s.clicks >= 1 },
  { id: 'pixie_friend', name: 'Pixie Friend', description: 'Hire your first Sugar Pixie.', emoji: '🧚', condition: (s) => (s.upgrades['sugar_pixie'] || 0) >= 1 },
  { id: 'fairy_master', name: 'Fairy Tale', description: 'Assemble a team of different fairies.', emoji: '✨', condition: (s) => (s.upgrades['peppermint_fairy'] || 0) >= 1 && (s.upgrades['candy_fairy'] || 0) >= 1 },
  { id: 'sovereign_presence', name: 'Sovereign Presence', description: 'Enlist a Sovereign Fairy.', emoji: '👑', condition: (s) => (s.upgrades['sovereign_fairy'] || 0) >= 1 },
  { id: 'ant_tamer', name: 'Lord of the Ants', description: 'Triggered the ant workforce.', emoji: '🐜', condition: (s) => (s.upgrades['ant_infestation'] || 0) >= 1 },
  { id: 'click_100', name: 'Wand Master', description: 'Extract 100 units manually.', emoji: '🦾', condition: (s) => s.clicks >= 100 },
  { id: 'cookies_1m', name: 'Grand Enchanter', description: 'Harvest 1,000,000 units.', emoji: '🍭', condition: (s) => s.totalCandies >= 1000000 },
  { id: 'skin_collector', name: 'Skin Switcher', description: 'Try a different Core skin.', emoji: '👗', condition: (s) => s.candySkin !== '🍬' }
];

export const INITIAL_STATE: GameState = {
  candyCount: 0,
  totalCandies: 0,
  clicks: 0,
  upgrades: {},
  lastSaved: Date.now(),
  playerName: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
  grannyInstances: [],
  antInstances: [],
  unlockedAchievements: [],
  multiplier: 1,
  multiplierEndTime: 0,
  hasSeenIntro: false,
  isCoreAwakened: false,
  candySkin: '🍬',
  deviceMode: window.innerWidth < 768 ? 'phone' : window.innerWidth < 1024 ? 'tablet' : 'laptop',
  prestigeLevel: 0
};

export const GRANNY_NAMES = [
  "Astra", "Luna", "Nova", "Lyra", "Eara", "Vela", "Selene", "Solari",
  "Pippa", "Trixie", "Fawn", "Willow", "Iris", "Cleo", "Zara", "Mabel",
  "Flora", "Blossom", "Dahlia", "Juniper", "Clover", "Poppy", "Fern"
];

export const GRANNY_PHRASES = [
  "The sweetness flow is returning...",
  "I sense a disturbance in the sour-verse.",
  "The Void is hungry, but you are faster, {name}.",
  "Have you ever tasted a galaxy? It's crunchy.",
  "The Sugar Core pulses with your effort.",
  "Reality is just a very complex recipe.",
  "Keep clicking, the stars are watching!",
  "Goblins are so sticky... and not in a good way.",
  "I saw a Goblin earlier. I turned its ears into marshmallows. Serves it right!",
  "The Sour Dimension Goblins have no fashion sense.",
  "Disgusting Goblins... always trying to steal our sugar atoms.",
  "I despise Goblins more than I despise low-fat candy.",
  "Every time a Goblin sneezes, a lollipop loses its stick. Truly evil.",
  "Don't let the Goblins win, {name}. They want to replace all sugar with salt!"
];
