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
  audioPlaylist?: 'high-energy' | 'chill-lofi' | 'funny-quirky' | 'arcade-retro' | 'horror-dissonant';
}

export const CATALOG_ITEMS: CatalogItem[] = [
  // --- GAMES (Full Upgraded Catalog with Responsive & Non-Copyright Audio Playlists) ---
  {
    id: 'pvz',
    name: 'Garden vs Groaners 3D',
    category: 'games',
    subcategory: '3D Strategy / Defense',
    description: '3D Plants vs Zombies genre defense game with procedural models, 8 plant types, wave pathfinding, non-repeating funny music, and mobile touch support.',
    icon: '🌻',
    tags: ['3D', 'Strategy', 'Defense', 'PvZ Clone', 'Non-Copyright Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'funny-quirky'
  },
  {
    id: 'turbo-speed',
    name: 'Turbo Speed II SE 3D',
    category: 'games',
    subcategory: '3D Racing / Multiplayer',
    description: 'Retro 3D split-screen racing game with 1–4 player split-screen, virtual touch joystick, high-energy eurobeat playlist, and responsive rendering.',
    icon: '🏎️',
    tags: ['3D', 'Racing', 'Multiplayer', 'Joystick', 'Non-Copyright Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'high-energy'
  },
  {
    id: 'chess3d',
    name: '3D Battle Chess',
    category: 'games',
    subcategory: '3D Strategy / Board',
    description: 'Stylized 3D chessboard with animated pieces, Minimax AI engine, chill Lofi playlist, fullscreen toggle, and resolution scaling.',
    icon: '♟️',
    tags: ['3D', 'Chess', 'Board', 'Strategy', 'Lofi Audio'],
    isPopular: true,
    audioPlaylist: 'chill-lofi'
  },
  {
    id: 'card-clash',
    name: 'Card Clash (Uno Style)',
    category: 'games',
    subcategory: 'Card / Casual',
    description: 'Match colors and values, play Action cards (+2, Skip, Wild), against smart AI with casual arcade music playlist.',
    icon: '🃏',
    tags: ['Card', 'Uno', 'Casual', 'AI', 'Arcade Audio'],
    isPopular: true,
    audioPlaylist: 'arcade-retro'
  },
  {
    id: 'snakes-ladders',
    name: '3D Snakes & Ladders',
    category: 'games',
    subcategory: '3D Board / Casual',
    description: 'Interactive 3D board game with 3D rolling dice, animated tokens, cheerful non-copyright soundtrack, and mobile controls.',
    icon: '🎲',
    tags: ['3D', 'Board', 'Retro', 'Dice', 'Funny Audio'],
    isPopular: false,
    audioPlaylist: 'funny-quirky'
  },
  {
    id: 'mario3d',
    name: 'Super Plumber 3D',
    category: 'games',
    subcategory: '3D Platformer',
    description: '3D platformer runner with floating grass platforms, collectible coins, virtual mobile jump/move buttons, and funny cartoon music.',
    icon: '🍄',
    tags: ['3D', 'Platformer', 'Mario', 'Retro', 'Touch Control', 'Popular'],
    isPopular: true,
    audioPlaylist: 'funny-quirky'
  },
  {
    id: 'fps3d',
    name: 'Project Vanguard (3D Tactical FPS)',
    category: 'games',
    subcategory: '3D Action / FPS',
    description: 'Tactical FPS with target elimination, crosshair HUD, virtual touch look/fire overlay for mobile, and tactical high-energy soundtrack.',
    icon: '🎯',
    tags: ['3D', 'FPS', 'Action', 'Shooter', 'Tactical Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'high-energy'
  },
  {
    id: 'horror3d',
    name: 'Midnight Asylum (3D Horror)',
    category: 'games',
    subcategory: '3D Horror / Survival',
    description: 'Navigate dark asylum corridors with flashlight, collect hidden keys, avoid shadows with eerie dissonant ambient audio and touch controls.',
    icon: '🔦',
    tags: ['3D', 'Horror', 'Survival', 'Maze', 'Horror Audio'],
    isPopular: false,
    audioPlaylist: 'horror-dissonant'
  },
  {
    id: 'city-sprint',
    name: 'City Sprint (3D Open World)',
    category: 'games',
    subcategory: '3D Open World / Parkour',
    description: 'Rooftop parkour and urban exploration with dynamic stunt jumping, mobile touch controls, and high-energy music.',
    icon: '🌆',
    tags: ['3D', 'Parkour', 'Open World', 'High-Energy Audio'],
    isPopular: false,
    audioPlaylist: 'high-energy'
  },
  {
    id: 'snake',
    name: 'Coil Snake',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic arcade snake game with obstacles, glowing food items, touch virtual D-pad controls, and non-repeating 8-bit chiptune playlist.',
    icon: '🐍',
    tags: ['Arcade', 'Retro', 'Classic', 'Chiptune Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'arcade-retro'
  },
  {
    id: '2048',
    name: '2048 Zen',
    category: 'games',
    subcategory: 'Puzzle',
    description: 'Merge matching number tiles strategically to reach 2048, backed by relaxing Lofi music and touch swipe support.',
    icon: '🧩',
    tags: ['Puzzle', 'Math', 'Strategy', 'Lofi Audio'],
    isPopular: false,
    audioPlaylist: 'chill-lofi'
  },
  {
    id: 'blockfall',
    name: 'Blockfall (Tetris)',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic polyomino block stacking game with line clears, hold box, ghost preview, retro chiptune audio, and virtual mobile D-pad.',
    icon: '🧱',
    tags: ['Arcade', 'Blocks', 'Retro', 'Chiptune Audio'],
    isPopular: false,
    audioPlaylist: 'arcade-retro'
  },
  {
    id: 'maze-muncher',
    name: 'Maze Muncher',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Navigate the maze, eat all dots, avoid 4 ghost AI chasers with touch D-pad, fullscreen mode, and non-repeating arcade audio.',
    icon: '🟡',
    tags: ['Arcade', 'Retro', 'Maze', 'Chiptune Audio'],
    isPopular: false,
    audioPlaylist: 'arcade-retro'
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
  },
  {
    id: 'pdf-tools',
    name: 'PDF Swiss Army Knife & Utilities',
    category: 'tools',
    subcategory: 'Documents / Utilities',
    description: 'Complete client-side PDF processing suite: Compress, Convert (Word/Excel/Images), Merge/Split/Rotate, Edit/Watermark/Redact, Fill & Sign, AI Chat Assistant, and Camera Scanner.',
    icon: '📄',
    tags: ['PDF', 'Compress', 'Convert', 'Edit', 'Sign', 'AI', 'Scanner', 'Popular'],
    isPopular: true
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'tools',
    subcategory: 'Documents / Business',
    description: 'Create, customize, save, and print professional invoices. Everything stays on your device.',
    icon: '🧾',
    tags: ['Invoice', 'Bill', 'Business', 'PDF', 'Documents'],
    isPopular: true
  }
];
