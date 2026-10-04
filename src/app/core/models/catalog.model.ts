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
    name: 'Garden vs Groaners',
    category: 'games',
    subcategory: 'Strategy / Defense',
    description: 'Protect your lawn from advancing Groaner zombies using plant units like Sunblooms and Pelt-Pods!',
    icon: '🌻',
    tags: ['Strategy', 'Defense', 'PvZ Clone', 'Popular'],
    isPopular: true
  },
  {
    id: 'snake',
    name: 'Coil Snake',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic arcade snake game with obstacles, speed levels, and power-up food items.',
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
    isPopular: true
  },
  {
    id: 'blockfall',
    name: 'Blockfall (Tetris)',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Classic polyomino block stacking game with line clears, hold box, and ghost preview.',
    icon: '🧱',
    tags: ['Arcade', 'Blocks', 'Retro'],
    isPopular: true
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
    description: 'Generate high-resolution SVG/Canvas QR codes for URLs, text, Wi-Fi credentials, and contacts.',
    icon: '📱',
    tags: ['Media', 'QR', 'Utility'],
    isPopular: true
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Evaluator',
    category: 'tools',
    subcategory: 'Developer',
    description: 'Test regular expressions in real time against sample strings with match highlighting.',
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
    description: 'Create cryptographically strong passwords with custom length, symbols, and entropy strength score.',
    icon: '🔑',
    tags: ['Security', 'Password', 'Utility'],
    isPopular: true
  }
];
