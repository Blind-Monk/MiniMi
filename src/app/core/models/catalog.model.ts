export type ItemCategory = 'games' | 'tools';

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  subcategory: string;
  description: string;
  icon: string;
  tags: string[];
  isPopular?: boolean;
  componentRoute?: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  // --- GAMES ---
  {
    id: 'pvz',
    name: 'Garden vs Groaners 3D',
    category: 'games',
    subcategory: '3D Strategy / Defense',
    description: '3D Plants vs Zombies genre defense game with procedural plant/zombie models, automatic sun spawns, and multiple game modes.',
    icon: '🌻',
    tags: ['3D', 'Strategy', 'Defense', 'PvZ Clone', 'Popular'],
    isPopular: true
  },
  {
    id: 'turbo-speed',
    name: 'Turbo Speed II SE 3D',
    category: 'games',
    subcategory: '3D Racing / Multiplayer',
    description: 'Retro 3D split-screen racing game with 1–4 player support, Web Gamepad/Joystick API integration, and customizable keybindings.',
    icon: '🏎️',
    tags: ['3D', 'Racing', 'Multiplayer', 'Joystick', 'Popular'],
    isPopular: true
  },
  {
    id: 'chess3d',
    name: '3D Battle Chess',
    category: 'games',
    subcategory: '3D Strategy / Board',
    description: 'Stylized 3D chessboard with animated 3D pieces, checkmate validation, move highlighting, P1 vs AI, and local 2P.',
    icon: '♟️',
    tags: ['3D', 'Chess', 'Board', 'Strategy'],
    isPopular: true
  },
  {
    id: 'card-clash',
    name: 'Card Clash (Uno Style)',
    category: 'games',
    subcategory: 'Card / Casual',
    description: 'Match colors and values, play Action cards (+2, Skip, Wild), and compete against smart AI opponents.',
    icon: '🃏',
    tags: ['Card', 'Uno', 'Casual', 'AI'],
    isPopular: true
  },
  {
    id: 'snakes-ladders',
    name: '3D Snakes & Ladders',
    category: 'games',
    subcategory: '3D Board / Casual',
    description: 'Interactive 3D board game with 3D rolling dice, player token animations climbing ladders and sliding down snakes.',
    icon: '🎲',
    tags: ['3D', 'Board', 'Retro', 'Dice'],
    isPopular: false
  },
  {
    id: 'mario3d',
    name: 'Super Plumber 3D',
    category: 'games',
    subcategory: '3D Platformer',
    description: '3D platformer runner where you jump across floating grass platforms, collect coins, and avoid obstacles.',
    icon: '🍄',
    tags: ['3D', 'Platformer', 'Mario', 'Retro'],
    isPopular: true
  },
  {
    id: 'fps3d',
    name: 'Project Vanguard (3D Tactical FPS)',
    category: 'games',
    subcategory: '3D Action / FPS',
    description: 'Tactical first-person shooter inspired by Far Cry & Project IGI with 3D target elimination objectives.',
    icon: '🎯',
    tags: ['3D', 'FPS', 'Action', 'Shooter'],
    isPopular: true
  },
  {
    id: 'horror3d',
    name: 'Midnight Asylum (3D Horror)',
    category: 'games',
    subcategory: '3D Horror / Survival',
    description: 'Navigate dark corridors with your flashlight, collect hidden key items, and escape the asylum.',
    icon: '🔦',
    tags: ['3D', 'Horror', 'Survival', 'Maze'],
    isPopular: false
  },
  {
    id: 'city-sprint',
    name: 'City Sprint (3D Open World)',
    category: 'games',
    subcategory: '3D Open World / Parkour',
    description: 'Rooftop parkour and urban exploration challenge with dynamic jumping stunt mechanics.',
    icon: '🌆',
    tags: ['3D', 'Parkour', 'Open World'],
    isPopular: false
  },
  {
    id: 'snake',
    name: 'Coil Snake',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic arcade snake game with obstacles, glowing food items, smooth keyboard/touch controls, and high score tracking.',
    icon: '🐍',
    tags: ['Arcade', 'Retro', 'Classic'],
    isPopular: true
  },
  {
    id: '2048',
    name: '2048 Zen',
    category: 'games',
    subcategory: 'Puzzle',
    description: 'Merge matching number tiles strategically to reach the 2048 tile and beyond.',
    icon: '🧩',
    tags: ['Puzzle', 'Math', 'Strategy'],
    isPopular: false
  },
  {
    id: 'blockfall',
    name: 'Blockfall (Tetris)',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic polyomino block stacking game with line clears, hold box, and ghost preview.',
    icon: '🧱',
    tags: ['Arcade', 'Blocks', 'Retro'],
    isPopular: false
  },
  {
    id: 'maze-muncher',
    name: 'Maze Muncher',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Navigate the maze, eat all yellow dots, and avoid 4 unique ghost AI chasers.',
    icon: '🟡',
    tags: ['Arcade', 'Retro', 'Maze'],
    isPopular: false
  },

  // --- TOOLS ---
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Tree',
    category: 'tools',
    subcategory: 'Developer',
    description: 'Format, validate, minify, and visually inspect JSON structures with error highlighting.',
    icon: '⚙️',
    tags: ['Dev', 'JSON', 'Formatter'],
    isPopular: true
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    category: 'tools',
    subcategory: 'Developer / Crypto',
    description: 'Encode plain text or binary string data to Base64 and decode Base64 back to plain text.',
    icon: '🔐',
    tags: ['Dev', 'Security', 'Base64'],
    isPopular: true
  },
  {
    id: 'qr-gen',
    name: 'QR Code Generator',
    category: 'tools',
    subcategory: 'Media / Utilities',
    description: 'Generate high-resolution SVG/Canvas QR codes with custom colors, custom module shapes, logo overlay, and background tinting.',
    icon: '📱',
    tags: ['Media', 'QR', 'Utility'],
    isPopular: true
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Evaluator',
    category: 'tools',
    subcategory: 'Developer',
    description: 'Test regular expressions in real time against sample strings with match highlighting and capture group breakdowns.',
    icon: '🔍',
    tags: ['Dev', 'Regex', 'Text'],
    isPopular: false
  },
  {
    id: 'hash-gen',
    name: 'Crypto Hash Generator',
    category: 'tools',
    subcategory: 'Security',
    description: 'Generate SHA-256, SHA-512, SHA-1, and MD5 cryptographic digests instantly via Web Crypto API.',
    icon: '🛡️',
    tags: ['Security', 'Crypto', 'Hash'],
    isPopular: true
  },
  {
    id: 'pass-gen',
    name: 'Password & Entropy Generator',
    category: 'tools',
    subcategory: 'Security',
    description: 'Create cryptographically strong passwords with custom length slider, character toggles, bit entropy score, and crack time analysis.',
    icon: '🔑',
    tags: ['Security', 'Password', 'Utility'],
    isPopular: true
  }
];
