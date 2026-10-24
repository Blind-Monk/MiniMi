export type ItemCategory = 'games' | 'tools';

export interface CatalogItem {
  sourceUrl?: string;
  repoType?: string;
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
  // --- 1. CORE INTERACTIVE 3D & 2D WEB GAMES ---
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
    description: '3D platformer runner with coyote-time jump physics, Goomba enemy stomping, collectible coins, virtual mobile jump buttons, and cartoon music.',
    icon: '🍄',
    tags: ['3D', 'Platformer', 'Mario', 'Retro', 'Coyote Time', 'Touch Control', 'Popular'],
    isPopular: true,
    audioPlaylist: 'funny-quirky'
  },
  {
    id: 'fps3d',
    name: 'Project Vanguard (3D Tactical FPS)',
    category: 'games',
    subcategory: '3D Action / FPS',
    description: 'Tactical FPS with target elimination, suppressor noise mechanics, mobile touch controls, and high-energy soundtrack.',
    icon: '🎯',
    tags: ['3D', 'FPS', 'Action', 'Shooter', 'Stealth', 'Tactical Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'high-energy'
  },
  {
    id: 'horror3d',
    name: 'Midnight Asylum (3D Horror)',
    category: 'games',
    subcategory: '3D Horror / Survival',
    description: 'Navigate dark asylum corridors with flashlight spotlight, manage battery drain, collect keys & batteries, avoid shadows with dissonant audio.',
    icon: '🔦',
    tags: ['3D', 'Horror', 'Survival', 'Maze', 'Battery Management', 'Horror Audio'],
    isPopular: false,
    audioPlaylist: 'horror-dissonant'
  },
  {
    id: 'city-sprint',
    name: 'City Sprint (3D Open World)',
    category: 'games',
    subcategory: '3D Open World / Parkour',
    description: 'Rooftop parkour and urban exploration sandbox with dynamic stunt jumps, mobile touch controls, and high-energy music.',
    icon: '🌆',
    tags: ['3D', 'Parkour', 'Open World', 'High-Energy Audio', 'Popular'],
    isPopular: true,
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
    id: 'maze-muncher',
    name: 'Maze Muncher (Pac-Man Style)',
    category: 'games',
    subcategory: 'Arcade',
    description: 'Authentic Pac-Man clone with 28x31 classic maze, 4 ghost personalities (Blinky, Pinky, Inky, Clyde), frightened mode, and fruit bonuses.',
    icon: '🟡',
    tags: ['Arcade', 'Retro', 'PacMan', 'Ghost AI', 'Chiptune Audio', 'Popular'],
    isPopular: true,
    audioPlaylist: 'arcade-retro'
  },

// --- 2. STRATEGY & CITY BUILDERS (OPEN SOURCE DIRECTORY) ---
  { id: '0ad', name: '0 A.D.', category: 'games', subcategory: 'Strategy / City Builder', description: 'Historical RTS of ancient warfare with 3D graphics and deep empire management.', icon: '🏛️', tags: ['OpenSource', 'RTS', 'History', 'GPL'], sourceUrl: 'https://github.com/topics/0ad', repoType: 'Open Source Repository' },
  { id: 'bar', name: 'Beyond All Reason (BAR)', category: 'games', subcategory: 'Strategy / RTS', description: 'Massive scale sci-fi real-time strategy inspired by Total Annihilation.', icon: '🤖', tags: ['OpenSource', 'RTS', 'SciFi'], sourceUrl: 'https://github.com/topics/bar', repoType: 'Open Source Repository' },
  { id: 'openra', name: 'OpenRA', category: 'games', subcategory: 'Strategy / RTS', description: 'Modern open-source RTS engine for Command & Conquer, Red Alert, and Dune 2000.', icon: '🎖️', tags: ['OpenSource', 'RTS', 'Retro'], sourceUrl: 'https://github.com/topics/openra', repoType: 'Open Source Repository' },
  { id: 'wesnoth', name: 'The Battle for Wesnoth', category: 'games', subcategory: 'Strategy / Turn-Based', description: 'Turn-based fantasy strategy game with hex grids and campaign progression.', icon: '⚔️', tags: ['OpenSource', 'TurnBased', 'Fantasy'], sourceUrl: 'https://github.com/topics/wesnoth', repoType: 'Open Source Repository' },
  { id: 'mindustry', name: 'Mindustry', category: 'games', subcategory: 'Strategy / Factory', description: 'Sandbox factory building and tower defense strategy game.', icon: '⚙️', tags: ['OpenSource', 'TowerDefense', 'Factory'], sourceUrl: 'https://github.com/topics/mindustry', repoType: 'Open Source Repository' },
  { id: 'freeciv', name: 'Freeciv', category: 'games', subcategory: 'Strategy / Empire', description: 'Empire-building strategy game inspired by Civilization series.', icon: '🌍', tags: ['OpenSource', 'Civ', 'TurnBased'], sourceUrl: 'https://github.com/topics/freeciv', repoType: 'Open Source Repository' },
  { id: 'unciv', name: 'Unciv', category: 'games', subcategory: 'Strategy / 2D Civ', description: 'Open-source 2D remake of Civilization V optimized for mobile & desktop.', icon: '🏹', tags: ['OpenSource', 'Civ', '2D'], sourceUrl: 'https://github.com/topics/unciv', repoType: 'Open Source Repository' },
  { id: 'openrct2', name: 'OpenRCT2', category: 'games', subcategory: 'Simulation / Tycoon', description: 'Modern open-source re-implementation of RollerCoaster Tycoon 2.', icon: '🎢', tags: ['OpenSource', 'Tycoon', 'Simulation'], sourceUrl: 'https://github.com/topics/openrct2', repoType: 'Open Source Repository' },
  { id: 'openttd', name: 'OpenTTD', category: 'games', subcategory: 'Simulation / Transport', description: 'Urban transport simulation based on Transport Tycoon Deluxe.', icon: '🚂', tags: ['OpenSource', 'Tycoon', 'Transport'], sourceUrl: 'https://github.com/topics/openttd', repoType: 'Open Source Repository' },
  { id: 'zerok', name: 'Zero-K', category: 'games', subcategory: 'Strategy / 3D RTS', description: '3D RTS powered by the Spring engine with dynamic terrain modification.', icon: '💥', tags: ['OpenSource', 'RTS', 'Physics'], sourceUrl: 'https://github.com/topics/zerok', repoType: 'Open Source Repository' },
  { id: 'freecol', name: 'FreeCol', category: 'games', subcategory: 'Strategy / Colonization', description: 'Turn-based strategy game based on Colonization and trade routes.', icon: '⛵', tags: ['OpenSource', 'History', 'Trade'], sourceUrl: 'https://github.com/topics/freecol', repoType: 'Open Source Repository' },
  { id: 'freeorion', name: 'FreeOrion', category: 'games', subcategory: 'Strategy / 4X Space', description: 'Turn-based 4X space empire conquest game inspired by Master of Orion.', icon: '🚀', tags: ['OpenSource', '4X', 'Space'], sourceUrl: 'https://github.com/topics/freeorion', repoType: 'Open Source Repository' },
  { id: 'julius', name: 'Julius (Caesar III)', category: 'games', subcategory: 'Strategy / City Builder', description: 'Open-source re-implementation of Caesar III city builder engine.', icon: '🏛️', tags: ['OpenSource', 'Rome', 'CityBuilder'], sourceUrl: 'https://github.com/topics/julius', repoType: 'Open Source Repository' },
  { id: 'augustus', name: 'Augustus', category: 'games', subcategory: 'Strategy / City Builder', description: 'Enhanced fork of Julius for Caesar III with modern UI and gameplay additions.', icon: '👑', tags: ['OpenSource', 'Rome', 'Enhanced'], sourceUrl: 'https://github.com/topics/augustus', repoType: 'Open Source Repository' },
  { id: 'openage', name: 'OpenAge', category: 'games', subcategory: 'Strategy / RTS Engine', description: 'Free RTS engine reimplementation for Age of Empires series.', icon: '⚔️', tags: ['OpenSource', 'AoE', 'Engine'], sourceUrl: 'https://github.com/topics/openage', repoType: 'Open Source Repository' },
  { id: 'widelands', name: 'Widelands', category: 'games', subcategory: 'Strategy / Settlers', description: 'Real-time strategy game inspired by Settlers II with economy chains.', icon: '🌲', tags: ['OpenSource', 'Economy', 'RTS'], sourceUrl: 'https://github.com/topics/widelands', repoType: 'Open Source Repository' },
  { id: 'triplea', name: 'TripleA', category: 'games', subcategory: 'Strategy / Grand Board', description: 'Open-source turn-based grand strategy board game engine like Axis & Allies.', icon: '🗺️', tags: ['OpenSource', 'Board', 'WW2'], sourceUrl: 'https://github.com/topics/triplea', repoType: 'Open Source Repository' },
  { id: 'cevo', name: 'C-evo', category: 'games', subcategory: 'Strategy / Empire', description: 'Empire-building turn-based strategy game focused on refined AI mechanics.', icon: '🏰', tags: ['OpenSource', 'Strategy', 'AI'], sourceUrl: 'https://github.com/topics/cevo', repoType: 'Open Source Repository' },
  { id: 'fheroes2', name: 'fheroes2', category: 'games', subcategory: 'Strategy / Fantasy', description: 'Recreation of Heroes of Might and Magic II engine with high-res support.', icon: '🧙‍♂️', tags: ['OpenSource', 'HoMM', 'Fantasy'], sourceUrl: 'https://github.com/topics/fheroes2', repoType: 'Open Source Repository' },
  { id: 'vcmi', name: 'VCMI', category: 'games', subcategory: 'Strategy / Fantasy', description: 'Open-source engine for Heroes of Might and Magic III.', icon: '🐉', tags: ['OpenSource', 'HoMM3', 'Engine'], sourceUrl: 'https://github.com/topics/vcmi', repoType: 'Open Source Repository' },
  { id: 'keeperfx', name: 'KeeperFX', category: 'games', subcategory: 'Strategy / Dungeon', description: 'Open-source remake and expansion of Dungeon Keeper.', icon: '👹', tags: ['OpenSource', 'Dungeon', 'Evil'], sourceUrl: 'https://github.com/topics/keeperfx', repoType: 'Open Source Repository' },
  { id: 'corsixth', name: 'CorsixTH', category: 'games', subcategory: 'Simulation / Hospital', description: 'Re-implementation of Theme Hospital simulation game.', icon: '🏥', tags: ['OpenSource', 'Hospital', 'Sim'], sourceUrl: 'https://github.com/topics/corsixth', repoType: 'Open Source Repository' },
  { id: 'openloco', name: 'OpenLoco', category: 'games', subcategory: 'Simulation / Transport', description: 'Modern re-implementation of Chris Sawyer\'s Locomotion.', icon: '厢', tags: ['OpenSource', 'Locomotion', 'Tycoon'] },
  { id: 'openxcom', name: 'OpenXcom', category: 'games', subcategory: 'Strategy / Tactical FPS', description: 'Open-source engine for classic UFO: Enemy Unknown / X-COM.', icon: '👽', tags: ['OpenSource', 'XCOM', 'Tactical'], sourceUrl: 'https://github.com/topics/openxcom', repoType: 'Open Source Repository' },
  { id: 'openhv', name: 'OpenHV', category: 'games', subcategory: 'Strategy / Pixel RTS', description: 'Science-fiction pixel art RTS game built on OpenRA engine.', icon: '👾', tags: ['OpenSource', 'PixelArt', 'SciFi'], sourceUrl: 'https://github.com/topics/openhv', repoType: 'Open Source Repository' },
  { id: 'boswars', name: 'Bos Wars', category: 'games', subcategory: 'Strategy / Futuristic', description: 'Futuristic real-time strategy game with energy economy.', icon: '⚡', tags: ['OpenSource', 'RTS', 'Futuristic'], sourceUrl: 'https://github.com/topics/boswars', repoType: 'Open Source Repository' },
  { id: 'tanksoffreedom', name: 'Tanks of Freedom', category: 'games', subcategory: 'Strategy / Isometric', description: 'Turn-based tactical strategy in isometric 3D pixel art.', icon: '🚜', tags: ['OpenSource', 'Tactical', 'Isometric'], sourceUrl: 'https://github.com/topics/tanksoffreedom', repoType: 'Open Source Repository' },
  { id: 'athenacrisis', name: 'Athena Crisis', category: 'games', subcategory: 'Strategy / Retro Turn-Based', description: 'Modern retro turn-based tactical strategy game.', icon: '⚡', tags: ['OpenSource', 'Tactical', 'Retro'], sourceUrl: 'https://github.com/topics/athenacrisis', repoType: 'Open Source Repository' },
  { id: 'dune2maker', name: 'Dune II The Maker', category: 'games', subcategory: 'Strategy / RTS Classic', description: 'Modern open-source remake of Dune II: Building of a Dynasty.', icon: '⏳', tags: ['OpenSource', 'Dune', 'RTS'], sourceUrl: 'https://github.com/topics/dune2maker', repoType: 'Open Source Repository' },
  { id: 'cnc_tiberiandawn', name: 'Command & Conquer Tiberian Dawn', category: 'games', subcategory: 'Strategy / Official Source', description: 'Official EA open-source code release for Tiberian Dawn.', icon: '☢️', tags: ['OpenSource', 'EA', 'Classic'], sourceUrl: 'https://github.com/topics/cnc-tiberiandawn', repoType: 'Open Source Repository' },

  // --- 3. ACTION, FPS & SHOOTERS (OPEN SOURCE DIRECTORY) ---
  { id: 'xonotic', name: 'Xonotic', category: 'games', subcategory: 'Action / Arena FPS', description: 'Fast-paced arena FPS with crisp physics and futuristic weapons.', icon: '🚀', tags: ['OpenSource', 'FPS', 'Arena'], sourceUrl: 'https://github.com/topics/xonotic', repoType: 'Open Source Repository' },
  { id: 'doom1993', name: 'DOOM (1993)', category: 'games', subcategory: 'Action / Classic FPS', description: 'Original source code release by id Software for legendary DOOM.', icon: '👹', tags: ['OpenSource', 'Doom', 'Retro'], sourceUrl: 'https://github.com/topics/doom1993', repoType: 'Open Source Repository' },
  { id: 'doom3bfg', name: 'Doom 3 BFG Edition', category: 'games', subcategory: 'Action / 3D FPS Engine', description: 'Doom 3 BFG source engine release by id Software.', icon: '🔥', tags: ['OpenSource', 'Engine', '3D'], sourceUrl: 'https://github.com/topics/doom3bfg', repoType: 'Open Source Repository' },
  { id: 'quake', name: 'Quake', category: 'games', subcategory: 'Action / 3D FPS', description: 'Original Quake engine release by id Software that revolutionized 3D FPS.', icon: '🎯', tags: ['OpenSource', 'Quake', '3D'], sourceUrl: 'https://github.com/topics/quake', repoType: 'Open Source Repository' },
  { id: 'quake2', name: 'Quake II', category: 'games', subcategory: 'Action / SciFi FPS', description: 'Classic sci-fi FPS source code release.', icon: '🔫', tags: ['OpenSource', 'FPS', 'SciFi'], sourceUrl: 'https://github.com/topics/quake2', repoType: 'Open Source Repository' },
  { id: 'quake3', name: 'Quake III Arena', category: 'games', subcategory: 'Action / Multiplayer FPS', description: 'Classic arena multiplayer FPS source code release.', icon: '💀', tags: ['OpenSource', 'Arena', 'Multiplayer'], sourceUrl: 'https://github.com/topics/quake3', repoType: 'Open Source Repository' },
  { id: 'wolf3d', name: 'Wolfenstein 3D', category: 'games', subcategory: 'Action / Pioneer FPS', description: 'Pioneer 1992 FPS source code release by id Software.', icon: '🎖️', tags: ['OpenSource', 'Wolfenstein', 'Retro'], sourceUrl: 'https://github.com/topics/wolf3d', repoType: 'Open Source Repository' },
  { id: 'teeworlds', name: 'Teeworlds', category: 'games', subcategory: 'Action / 2D Shooter', description: 'Retro 2D multiplayer platform shooter with grapple physics.', icon: '🎯', tags: ['OpenSource', '2D', 'Platformer'], sourceUrl: 'https://github.com/topics/teeworlds', repoType: 'Open Source Repository' },
  { id: 'ddnet', name: 'DDNet (DDraceNetwork)', category: 'games', subcategory: 'Action / Co-op Shooter', description: 'Cooperative 2D platform shooter with puzzle obstacle courses.', icon: '🌐', tags: ['OpenSource', 'Co-op', '2D'], sourceUrl: 'https://github.com/topics/ddnet', repoType: 'Open Source Repository' },
  { id: 'tesseract', name: 'Tesseract', category: 'games', subcategory: 'Action / 3D FPS Map Editor', description: '3D FPS engine with dynamic real-time in-game map editing.', icon: '🧊', tags: ['OpenSource', '3D', 'Editor'], sourceUrl: 'https://github.com/topics/tesseract', repoType: 'Open Source Repository' },
  { id: 'sauerbraten', name: 'Cube 2: Sauerbraten', category: 'games', subcategory: 'Action / 3D FPS Engine', description: '3D arena shooter built on the Cube engine with map editing.', icon: '💥', tags: ['OpenSource', '3D', 'Cube'], sourceUrl: 'https://github.com/topics/sauerbraten', repoType: 'Open Source Repository' },
  { id: 'thedarkmod', name: 'The Dark Mod', category: 'games', subcategory: 'Action / Stealth FPS', description: 'First-person stealth action game inspired by Thief series.', icon: '🕯️', tags: ['OpenSource', 'Stealth', 'Dark'], sourceUrl: 'https://github.com/topics/thedarkmod', repoType: 'Open Source Repository' },
  { id: 'bzflag', name: 'BZFlag', category: 'games', subcategory: 'Action / 3D Tank Battle', description: '3D multiplayer tank battle arcade game.', icon: '🚜', tags: ['OpenSource', '3D', 'Tanks'], sourceUrl: 'https://github.com/topics/bzflag', repoType: 'Open Source Repository' },
  { id: 'alienarena', name: 'Alien Arena', category: 'games', subcategory: 'Action / Arena FPS', description: 'Retro sci-fi arena FPS with fast action and alien weapons.', icon: '👽', tags: ['OpenSource', 'SciFi', 'FPS'], sourceUrl: 'https://github.com/topics/alienarena', repoType: 'Open Source Repository' },
  { id: 'openlara', name: 'OpenLara', category: 'games', subcategory: 'Action / Tomb Raider Engine', description: 'Open-source engine for classic Tomb Raider games in browser.', icon: '🏛️', tags: ['OpenSource', 'TombRaider', '3D'], sourceUrl: 'https://github.com/topics/openlara', repoType: 'Open Source Repository' },
  { id: 're3', name: 'RE3 (GTA III & VC)', category: 'games', subcategory: 'Action / Open World Engine', description: 'Reverse-engineered Grand Theft Auto III and Vice City engine.', icon: '🏙️', tags: ['OpenSource', 'GTA', 'OpenWorld'], sourceUrl: 'https://github.com/topics/re3', repoType: 'Open Source Repository' },
  { id: 'openrw', name: 'OpenRW', category: 'games', subcategory: 'Action / GTA III Engine', description: 'Open-source re-implementation of 3D GTA III engine.', icon: '🚗', tags: ['OpenSource', 'GTA', 'Engine'], sourceUrl: 'https://github.com/topics/openrw', repoType: 'Open Source Repository' },
  { id: 'overgrowth', name: 'Overgrowth', category: 'games', subcategory: 'Action / 3D Combat', description: '3D acrobatic rabbit martial arts combat game by Wolfire.', icon: '🐰', tags: ['OpenSource', 'MartialArts', 'Physics'], sourceUrl: 'https://github.com/topics/overgrowth', repoType: 'Open Source Repository' },
  { id: 'lugaru', name: 'Lugaru: The Rabbit\'s Foot', category: 'games', subcategory: 'Action / 3D Combat', description: 'Predecessor to Overgrowth featuring third-person rabbit combat.', icon: '🥊', tags: ['OpenSource', 'Action', '3D'] },
  { id: 'cncrenegade', name: 'Command & Conquer Renegade', category: 'games', subcategory: 'Action / Official FPS', description: 'Official source release for C&C Renegade FPS engine.', icon: '💥', tags: ['OpenSource', 'EA', 'FPS'], sourceUrl: 'https://github.com/topics/cncrenegade', repoType: 'Open Source Repository' },
  { id: 'cdogsdx', name: 'C-Dogs DX', category: 'games', subcategory: 'Action / Overhead Shooter', description: 'Overhead run-and-gun arcade shooter with multiplayer co-op.', icon: '🐶', tags: ['OpenSource', 'TopDown', 'Co-op'], sourceUrl: 'https://github.com/topics/cdogsdx', repoType: 'Open Source Repository' },
  { id: 'abuse1996', name: 'Abuse (1996)', category: 'games', subcategory: 'Action / Side-Scroller', description: 'Classic 90s side-scrolling run-and-gun alien shooter.', icon: '👾', tags: ['OpenSource', 'Retro', 'SideScroller'], sourceUrl: 'https://github.com/topics/abuse1996', repoType: 'Open Source Repository' },
  { id: 'descent3', name: 'Descent 3', category: 'games', subcategory: 'Action / 6DoF Space FPS', description: '3D full-freedom 6DoF space combat shooter.', icon: '🚀', tags: ['OpenSource', 'Space', '6DoF'], sourceUrl: 'https://github.com/topics/descent3', repoType: 'Open Source Repository' },
  { id: 'chromiumbsu', name: 'Chromium B.S.U.', category: 'games', subcategory: 'Action / Space Shooter', description: 'Fast-paced top-scrolling arcade space shooter.', icon: '🛸', tags: ['OpenSource', 'Shmup', 'Arcade'], sourceUrl: 'https://github.com/topics/chromiumbsu', repoType: 'Open Source Repository' },
  { id: 'astromenace', name: 'AstroMenace', category: 'games', subcategory: 'Action / 3D Shmup', description: 'Hardcore 3D space scroll-shooter with ship upgrades.', icon: '🌌', tags: ['OpenSource', 'Shmup', '3D'], sourceUrl: 'https://github.com/topics/astromenace', repoType: 'Open Source Repository' },
  { id: 'jumpy', name: 'Fish Folk: Jumpy', category: 'games', subcategory: 'Action / 2D Brawler', description: 'Tactical 2D multiplayer platform shooter written in Rust.', icon: '🐟', tags: ['OpenSource', 'Rust', 'Multiplayer'], sourceUrl: 'https://github.com/topics/jumpy', repoType: 'Open Source Repository' },
  { id: 'liblast', name: 'Liblast', category: 'games', subcategory: 'Action / Godot FPS', description: 'Open-source multiplayer FPS created in Godot Engine.', icon: '⚡', tags: ['OpenSource', 'Godot', 'FPS'], sourceUrl: 'https://github.com/topics/liblast', repoType: 'Open Source Repository' },
  { id: 'srb2', name: 'Sonic Robo Blast 2', category: 'games', subcategory: 'Action / 3D Platformer', description: '3D Sonic fangame built on a heavily modified Doom engine.', icon: '🦔', tags: ['OpenSource', 'Sonic', '3D'], sourceUrl: 'https://github.com/topics/srb2', repoType: 'Open Source Repository' },
  { id: 'warsow', name: 'Warsow / Warfork', category: 'games', subcategory: 'Action / Esport FPS', description: 'Fast-paced esports arena FPS with cartoon cel-shaded visuals.', icon: '⚡', tags: ['OpenSource', 'Esports', 'FPS'], sourceUrl: 'https://github.com/topics/warsow', repoType: 'Open Source Repository' },
  { id: 'assaultcube', name: 'AssaultCube', category: 'games', subcategory: 'Action / Lightweight FPS', description: 'Lightweight multiplayer first-person shooter based on Cube.', icon: '🪖', tags: ['OpenSource', 'FPS', 'Lightweight'], sourceUrl: 'https://github.com/topics/assaultcube', repoType: 'Open Source Repository' },

  // --- 4. RPG & SANDBOX GAMES (OPEN SOURCE DIRECTORY) ---
  { id: 'veloren', name: 'Veloren', category: 'games', subcategory: 'RPG / Voxel MMORPG', description: 'Multiplayer voxel RPG written in Rust inspired by Cube World.', icon: '🗡️', tags: ['OpenSource', 'Rust', 'Voxel', 'RPG'], sourceUrl: 'https://github.com/topics/veloren', repoType: 'Open Source Repository' },
  { id: 'luanti', name: 'Luanti (Minetest)', category: 'games', subcategory: 'Sandbox / Voxel Engine', description: 'Voxel sandbox game creation engine similar to Minecraft.', icon: '⛏️', tags: ['OpenSource', 'Voxel', 'Sandbox'], sourceUrl: 'https://github.com/topics/luanti', repoType: 'Open Source Repository' },
  { id: 'cdda', name: 'Cataclysm: Dark Days Ahead', category: 'games', subcategory: 'RPG / Post-Apocalyptic', description: 'Turn-based post-apocalyptic survival roguelike RPG with deep crafting.', icon: '☣️', tags: ['OpenSource', 'Roguelike', 'Survival'], sourceUrl: 'https://github.com/topics/cdda', repoType: 'Open Source Repository' },
  { id: 'brightnights', name: 'Cataclysm: Bright Nights', category: 'games', subcategory: 'RPG / Survival', description: 'Focused action and futuristic tech fork of CDDA.', icon: '💡', tags: ['OpenSource', 'Roguelike', 'Tech'], sourceUrl: 'https://github.com/topics/brightnights', repoType: 'Open Source Repository' },
  { id: 'openmw', name: 'OpenMW (Morrowind)', category: 'games', subcategory: 'RPG / TES III Engine', description: 'Re-implementation of The Elder Scrolls III: Morrowind engine.', icon: '🌋', tags: ['OpenSource', 'RPG', 'Morrowind'], sourceUrl: 'https://github.com/topics/openmw', repoType: 'Open Source Repository' },
  { id: 'daggerfallunity', name: 'Daggerfall Unity', category: 'games', subcategory: 'RPG / TES II Engine', description: 'Modern recreation of TES II: Daggerfall in Unity.', icon: '🏰', tags: ['OpenSource', 'RPG', 'Unity'], sourceUrl: 'https://github.com/topics/daggerfallunity', repoType: 'Open Source Repository' },
  { id: 'falloutce', name: 'Fallout Community Edition', category: 'games', subcategory: 'RPG / Fallout 1 Engine', description: 'Fully working engine re-implementation of original Fallout.', icon: '☢️', tags: ['OpenSource', 'Fallout', 'RPG'], sourceUrl: 'https://github.com/topics/falloutce', repoType: 'Open Source Repository' },
  { id: 'fallout2ce', name: 'Fallout 2 Community Edition', category: 'games', subcategory: 'RPG / Fallout 2 Engine', description: 'Engine reimplementation for Fallout 2.', icon: '🤠', tags: ['OpenSource', 'Fallout2', 'RPG'], sourceUrl: 'https://github.com/topics/fallout2ce', repoType: 'Open Source Repository' },
  { id: 'ss14', name: 'Space Station 14', category: 'games', subcategory: 'RPG / Station Sim', description: 'Open-source multiplayer space station simulator RPG.', icon: '🛸', tags: ['OpenSource', 'Space', 'Sim'], sourceUrl: 'https://github.com/topics/ss14', repoType: 'Open Source Repository' },
  { id: 'endlesssky', name: 'Endless Sky', category: 'games', subcategory: 'RPG / Space Trading', description: '2D space trading and combat RPG inspired by Escape Velocity.', icon: '🌌', tags: ['OpenSource', 'Space', 'Trade'], sourceUrl: 'https://github.com/topics/endlesssky', repoType: 'Open Source Repository' },
  { id: 'naev', name: 'Naev', category: 'games', subcategory: 'RPG / Space Exploration', description: '2D action/RPG space exploration and trading game.', icon: '🚀', tags: ['OpenSource', 'Space', '2D'], sourceUrl: 'https://github.com/topics/naev', repoType: 'Open Source Repository' },
  { id: 'cubyz', name: 'Cubyz', category: 'games', subcategory: 'Sandbox / Voxel Survival', description: 'Voxel sandbox survival game written in Zig with infinite worlds.', icon: '🧊', tags: ['OpenSource', 'Zig', 'Voxel'], sourceUrl: 'https://github.com/topics/cubyz', repoType: 'Open Source Repository' },
  { id: 'gemrb', name: 'GemRB (Baldur\'s Gate Engine)', category: 'games', subcategory: 'RPG / Infinity Engine', description: 'Open-source engine for BioWare Infinity Engine RPG games.', icon: '🧙‍♂️', tags: ['OpenSource', 'BaldursGate', 'RPG'] },
  { id: 'exult', name: 'Exult (Ultima VII)', category: 'games', subcategory: 'RPG / Ultima VII Engine', description: 'Engine recreation for Ultima VII: The Black Gate & Serpent Isle.', icon: '🛡️', tags: ['OpenSource', 'Ultima', 'RPG'], sourceUrl: 'https://github.com/topics/exult', repoType: 'Open Source Repository' },
  { id: 'scummvm', name: 'ScummVM', category: 'games', subcategory: 'Adventure / Point & Click', description: 'Cross-platform engine for classic point-and-click adventure games.', icon: '🔮', tags: ['OpenSource', 'SCUMM', 'Adventure'], sourceUrl: 'https://github.com/topics/scummvm', repoType: 'Open Source Repository' },
  { id: 'kandria', name: 'Kandria', category: 'games', subcategory: 'RPG / Action Platformer', description: 'Action-RPG side-scroller made in Common Lisp set in ruined world.', icon: '⚔️', tags: ['OpenSource', 'Lisp', 'RPG'], sourceUrl: 'https://github.com/topics/kandria', repoType: 'Open Source Repository' },
  { id: 'shatteredpixel', name: 'Shattered Pixel Dungeon', category: 'games', subcategory: 'RPG / Roguelike', description: 'Popular roguelike dungeon crawler with randomized levels.', icon: '🗡️', tags: ['OpenSource', 'PixelArt', 'Dungeon'], sourceUrl: 'https://github.com/topics/shatteredpixel', repoType: 'Open Source Repository' },
  { id: 'broguece', name: 'BrogueCE', category: 'games', subcategory: 'RPG / ASCII Roguelike', description: 'Community edition of classic ASCII roguelike Brogue.', icon: '📜', tags: ['OpenSource', 'ASCII', 'Roguelike'], sourceUrl: 'https://github.com/topics/broguece', repoType: 'Open Source Repository' },
  { id: 'nethack', name: 'NetHack', category: 'games', subcategory: 'RPG / Classic Roguelike', description: 'Famous single-player dungeon exploration roguelike game.', icon: '🐲', tags: ['OpenSource', 'NetHack', 'Classic'], sourceUrl: 'https://github.com/topics/nethack', repoType: 'Open Source Repository' },
  { id: 'dcss', name: 'Dungeon Crawl Stone Soup', category: 'games', subcategory: 'RPG / Tactical Roguelike', description: 'Deep roguelike focused on tactical choice and dungeon crawling.', icon: '🥣', tags: ['OpenSource', 'Tactical', 'Roguelike'], sourceUrl: 'https://github.com/topics/dcss', repoType: 'Open Source Repository' },
  { id: 'angband', name: 'Angband', category: 'games', subcategory: 'RPG / Tolkien Roguelike', description: 'Single-player dungeon-exploration roguelike based on Tolkien lore.', icon: '👑', tags: ['OpenSource', 'Angband', 'Tolkien'], sourceUrl: 'https://github.com/topics/angband', repoType: 'Open Source Repository' },
  { id: 'tome', name: 'Tales of Maj\'Eyal (ToME)', category: 'games', subcategory: 'RPG / Tactical Turn-Based', description: 'Tactical turn-based roguelike RPG with rich class customization.', icon: '🧙‍♂️', tags: ['OpenSource', 'ToME', 'RPG'] },
  { id: 'crossfire', name: 'Crossfire MMORPG', category: 'games', subcategory: 'RPG / Graphical MMORPG', description: 'Cooperative multiplayer graphical roguelike MMORPG.', icon: '🛡️', tags: ['OpenSource', 'MMO', 'Roguelike'], sourceUrl: 'https://github.com/topics/crossfire', repoType: 'Open Source Repository' },
  { id: 'argentumonline', name: 'Argentum Online', category: 'games', subcategory: 'RPG / 2D MMORPG', description: 'Argentinian open-source 2D MMORPG classic.', icon: '⚔️', tags: ['OpenSource', 'MMO', '2D'], sourceUrl: 'https://github.com/topics/argentumonline', repoType: 'Open Source Repository' },
  { id: 'opennox', name: 'OpenNox', category: 'games', subcategory: 'RPG / Action RPG', description: 'Community engine project for Westwood\'s Nox action RPG.', icon: '🔮', tags: ['OpenSource', 'Nox', 'ActionRPG'] },
  { id: 'reone', name: 'reone (Star Wars KOTOR)', category: 'games', subcategory: 'RPG / KOTOR Engine', description: 'Engine capable of running Star Wars: Knights of the Old Republic.', icon: '⚔️', tags: ['OpenSource', 'StarWars', 'Engine'], sourceUrl: 'https://github.com/topics/reone', repoType: 'Open Source Repository' },
  { id: 'ambermoon_net', name: 'Ambermoon.net', category: 'games', subcategory: 'RPG / Amiga Rewrite', description: 'Open-source C# rewrite of Amiga RPG Ambermoon.', icon: '🌙', tags: ['OpenSource', 'Amiga', 'RPG'], sourceUrl: 'https://github.com/topics/ambermoon-net', repoType: 'Open Source Repository' },
  { id: 'flare', name: 'Flare Engine', category: 'games', subcategory: 'RPG / Action RPG Engine', description: 'Single-player 2D isometric action RPG engine.', icon: '🔥', tags: ['OpenSource', 'Isometric', 'RPG'], sourceUrl: 'https://github.com/topics/flare', repoType: 'Open Source Repository' },
  { id: 'severedchains', name: 'Severed Chains (Legend of Dragoon)', category: 'games', subcategory: 'RPG / PC Engine Port', description: 'Reverse-engineered Legend of Dragoon PC engine port.', icon: '🐉', tags: ['OpenSource', 'Dragoon', 'RPG'], sourceUrl: 'https://github.com/topics/severedchains', repoType: 'Open Source Repository' },
  { id: 'adarkroom', name: 'A Dark Room', category: 'games', subcategory: 'RPG / Text Adventure', description: 'Minimalist text-based RPG and town management game.', icon: '🔥', tags: ['OpenSource', 'Text', 'Minimalist'], sourceUrl: 'https://github.com/topics/adarkroom', repoType: 'Open Source Repository' },

  // --- 5. PUZZLE, ARCADE & CASUAL (OPEN SOURCE DIRECTORY) ---
  { id: 'pingus', name: 'Pingus', category: 'games', subcategory: 'Puzzle / Lemmings Clone', description: 'Lemmings-inspired puzzle game starring penguins.', icon: '🐧', tags: ['OpenSource', 'Lemmings', 'Puzzle'], sourceUrl: 'https://github.com/topics/pingus', repoType: 'Open Source Repository' },
  { id: 'frozenbubble', name: 'Frozen Bubble', category: 'games', subcategory: 'Puzzle / Bubble Shooter', description: 'Classic bubble shooter puzzle game featuring Tux.', icon: '🔮', tags: ['OpenSource', 'Bubble', 'Arcade'], sourceUrl: 'https://github.com/topics/frozenbubble', repoType: 'Open Source Repository' },
  { id: 'blobbyvolley2', name: 'Blobby Volley 2', category: 'games', subcategory: 'Arcade / Physics Volleyball', description: 'Fun 2D physics volleyball arcade game.', icon: '🏐', tags: ['OpenSource', 'Volleyball', 'Physics'], sourceUrl: 'https://github.com/topics/blobbyvolley2', repoType: 'Open Source Repository' },
  { id: 'supertux', name: 'SuperTux', category: 'games', subcategory: 'Platformer / 2D Platformer', description: 'Classic 2D jump-\'n\'-run platformer starring Tux the penguin.', icon: '🐧', tags: ['OpenSource', 'Platformer', '2D'] },
  { id: 'smc', name: 'Secret Maryo Chronicles', category: 'games', subcategory: 'Platformer / Mario Style', description: '2D side-scrolling Mario-style platformer.', icon: '🍄', tags: ['OpenSource', 'Mario', '2D'], sourceUrl: 'https://github.com/topics/smc', repoType: 'Open Source Repository' },
  { id: 'mari0', name: 'Mari0', category: 'games', subcategory: 'Platformer / Portal Mashup', description: 'Super Mario Bros mixed with Portal gun puzzle mechanics.', icon: '🌀', tags: ['OpenSource', 'Portal', 'Mario'], sourceUrl: 'https://github.com/topics/mari0', repoType: 'Open Source Repository' },
  { id: 'hedgewars', name: 'HedgeWars', category: 'games', subcategory: 'Arcade / Artillery', description: 'Turn-based artillery game inspired by Worms starring hedgehogs.', icon: '🦔', tags: ['OpenSource', 'Worms', 'Artillery'], sourceUrl: 'https://github.com/topics/hedgewars', repoType: 'Open Source Repository' },
  { id: 'warmux', name: 'Warmux', category: 'games', subcategory: 'Arcade / Turn-Based Artillery', description: 'Free turn-based artillery 2D game starring open-source mascots.', icon: '💣', tags: ['OpenSource', 'Artillery', '2D'], sourceUrl: 'https://github.com/topics/warmux', repoType: 'Open Source Repository' },
  { id: 'lix', name: 'Lix', category: 'games', subcategory: 'Puzzle / Lemmings Multiplayer', description: 'Multiplayer puzzle game inspired by Lemmings.', icon: '🐜', tags: ['OpenSource', 'Lemmings', 'Puzzle'], sourceUrl: 'https://github.com/topics/lix', repoType: 'Open Source Repository' },
  { id: 'neverball', name: 'Neverball', category: 'games', subcategory: 'Puzzle / 3D Tilt Ball', description: '3D tilt puzzle rolling ball game with custom physics.', icon: '🔮', tags: ['OpenSource', '3D', 'Physics'], sourceUrl: 'https://github.com/topics/neverball', repoType: 'Open Source Repository' },
  { id: 'blockattack', name: 'Block Attack', category: 'games', subcategory: 'Puzzle / Tetris Attack', description: 'Puzzle League / Tetris Attack clone for match-3 action.', icon: '🧱', tags: ['OpenSource', 'Match3', 'Blocks'], sourceUrl: 'https://github.com/topics/blockattack', repoType: 'Open Source Repository' },
  { id: 'biniax2', name: 'Biniax2', category: 'games', subcategory: 'Puzzle / Arcade Logic', description: 'Original arcade logic puzzle game.', icon: '🧩', tags: ['OpenSource', 'Arcade', 'Puzzle'], sourceUrl: 'https://github.com/topics/biniax2', repoType: 'Open Source Repository' },
  { id: 'tegaki', name: 'Tegaki', category: 'games', subcategory: 'Casual / Drawing Game', description: 'Open-source online drawing and guessing party game.', icon: '🎨', tags: ['OpenSource', 'Drawing', 'Party'], sourceUrl: 'https://github.com/topics/tegaki', repoType: 'Open Source Repository' },
  { id: 'minesweeper_web', name: 'Minesweeper (Web)', category: 'games', subcategory: 'Puzzle / Classic Logic', description: 'Modern open-source implementation of classic Minesweeper.', icon: '💣', tags: ['OpenSource', 'Minesweeper', 'Logic'], sourceUrl: 'https://github.com/topics/minesweeper-web', repoType: 'Open Source Repository' },
  { id: 'sgt_puzzles', name: 'Simon Tatham\'s Portable Puzzles', category: 'games', subcategory: 'Puzzle / 40+ Logic Games', description: '40+ single-player logic puzzle games collection.', icon: '🧩', tags: ['OpenSource', 'Logic', 'Collection'] },
  { id: 'passage', name: 'Passage', category: 'games', subcategory: 'Casual / Experimental Art', description: 'Experimental indie art game by Jason Rohrer about life.', icon: '⏳', tags: ['OpenSource', 'Indie', 'Art'], sourceUrl: 'https://github.com/topics/passage', repoType: 'Open Source Repository' },
  { id: 'onesinglelife', name: 'One Single Life', category: 'games', subcategory: 'Platformer / Precision Jump', description: 'Platformer about precision jumping where you get 1 life.', icon: '🏃', tags: ['OpenSource', 'Platformer', 'Precision'], sourceUrl: 'https://github.com/topics/onesinglelife', repoType: 'Open Source Repository' },
  { id: 'castledoctrine', name: 'The Castle Doctrine', category: 'games', subcategory: 'Puzzle / Stealth Defense', description: 'Game of theft and house defense by Jason Rohrer.', icon: '🏰', tags: ['OpenSource', 'Rohrer', 'Multiplayer'], sourceUrl: 'https://github.com/topics/castledoctrine', repoType: 'Open Source Repository' },
  { id: 'onehouronelife', name: 'One Hour One Life', category: 'games', subcategory: 'Survival / Civilization Sim', description: 'Multiplayer survival game where each player lives 60 minutes.', icon: '👶', tags: ['OpenSource', 'Survival', 'Rohrer'], sourceUrl: 'https://github.com/topics/onehouronelife', repoType: 'Open Source Repository' },
  { id: 'redrunner', name: 'RedRunner', category: 'games', subcategory: 'Arcade / 2D Runner', description: '2D endless runner built in Unity.', icon: '🏃', tags: ['OpenSource', 'Runner', 'Unity'], sourceUrl: 'https://github.com/topics/redrunner', repoType: 'Open Source Repository' },
  { id: 'pacmancanvas', name: 'Pacman Canvas', category: 'games', subcategory: 'Arcade / Canvas Classic', description: 'HTML5 Canvas implementation of arcade Pacman.', icon: '🟡', tags: ['OpenSource', 'Pacman', 'Canvas'], sourceUrl: 'https://github.com/topics/pacmancanvas', repoType: 'Open Source Repository' },
  { id: 'claria', name: 'Claria', category: 'games', subcategory: 'Puzzle / Adventure', description: 'Open-source puzzle adventure game.', icon: '🔍', tags: ['OpenSource', 'Adventure', 'Puzzle'], sourceUrl: 'https://github.com/topics/claria', repoType: 'Open Source Repository' },
  { id: 'pipewalker', name: 'Pipewalker', category: 'games', subcategory: 'Puzzle / Network Connect', description: 'Puzzle game where you connect all computers via water pipes.', icon: '🔧', tags: ['OpenSource', 'Pipes', 'Logic'], sourceUrl: 'https://github.com/topics/pipewalker', repoType: 'Open Source Repository' },
  { id: 'hexamaze', name: 'Hexamaze', category: 'games', subcategory: 'Puzzle / Hexagonal Maze', description: 'Hexagonal maze puzzle game.', icon: '🛑', tags: ['OpenSource', 'Maze', 'Hexagon'], sourceUrl: 'https://github.com/topics/hexamaze', repoType: 'Open Source Repository' },
  { id: 'sudokujs', name: 'SudokuJS', category: 'games', subcategory: 'Puzzle / Sudoku Engine', description: 'Fully featured Sudoku game engine in JS.', icon: '🔢', tags: ['OpenSource', 'Sudoku', 'Logic'], sourceUrl: 'https://github.com/topics/sudokujs', repoType: 'Open Source Repository' },
  { id: 'waterworks', name: 'Waterworks!', category: 'games', subcategory: 'Puzzle / Strategy Sim', description: 'Strategy puzzle game about ancient water management.', icon: '🚰', tags: ['OpenSource', 'Water', 'History'], sourceUrl: 'https://github.com/topics/waterworks', repoType: 'Open Source Repository' },
  { id: 'fishfillets', name: 'Fish Fillets FC', category: 'games', subcategory: 'Puzzle / Undersea Logic', description: 'Linux port of Czech puzzle game Fish Fillets.', icon: '🐟', tags: ['OpenSource', 'Fish', 'Puzzle'], sourceUrl: 'https://github.com/topics/fishfillets', repoType: 'Open Source Repository' },
  { id: 'pathological', name: 'Pathological', category: 'games', subcategory: 'Puzzle / Marble Wheels', description: 'Marble puzzle game based on Logical with wheel matching.', icon: '🔮', tags: ['OpenSource', 'Marble', 'Logic'], sourceUrl: 'https://github.com/topics/pathological', repoType: 'Open Source Repository' },
  { id: 'enigma', name: 'Enigma', category: 'games', subcategory: 'Puzzle / Marble Oxyd', description: 'Marble puzzle game inspired by Oxyd and Sokoban.', icon: '🌀', tags: ['OpenSource', 'Sokoban', 'Marble'], sourceUrl: 'https://github.com/topics/enigma', repoType: 'Open Source Repository' },

  // --- 6. RACING, SIMULATION & RHYTHM (OPEN SOURCE DIRECTORY) ---
  { id: 'supertuxkart', name: 'SuperTuxKart', category: 'games', subcategory: 'Racing / 3D Kart Racer', description: '3D open-source arcade kart racer featuring open-source mascots.', icon: '🏎️', tags: ['OpenSource', '3D', 'Kart', 'Racing'], sourceUrl: 'https://github.com/topics/supertuxkart', repoType: 'Open Source Repository' },
  { id: 'osu_lazer', name: 'osu! (lazer)', category: 'games', subcategory: 'Rhythm / Circle Clicking', description: 'Rhythm game for clicking circles and hitting beats.', icon: '🔴', tags: ['OpenSource', 'Rhythm', 'Anime'], sourceUrl: 'https://github.com/topics/osu-lazer', repoType: 'Open Source Repository' },
  { id: 'stepmania', name: 'StepMania', category: 'games', subcategory: 'Rhythm / Dance Pad', description: 'Cross-platform rhythm game for dance pads and keyboards.', icon: '💃', tags: ['OpenSource', 'Dance', 'Rhythm'], sourceUrl: 'https://github.com/topics/stepmania', repoType: 'Open Source Repository' },
  { id: 'etterna', name: 'Etterna', category: 'games', subcategory: 'Rhythm / Keyboard', description: 'Advanced cross-platform keyboard rhythm game.', icon: '🎹', tags: ['OpenSource', 'Keyboard', 'Rhythm'], sourceUrl: 'https://github.com/topics/etterna', repoType: 'Open Source Repository' },
  { id: 'quaver', name: 'Quaver', category: 'games', subcategory: 'Rhythm / Community', description: 'Competitive community-driven 4K/7K rhythm game.', icon: '🎵', tags: ['OpenSource', 'Rhythm', 'Community'], sourceUrl: 'https://github.com/topics/quaver', repoType: 'Open Source Repository' },
  { id: 'performous', name: 'Performous', category: 'games', subcategory: 'Rhythm / Karaoke & Band', description: 'Music game supporting singing, guitar, bass, and dance.', icon: '🎤', tags: ['OpenSource', 'Karaoke', 'Band'], sourceUrl: 'https://github.com/topics/performous', repoType: 'Open Source Repository' },
  { id: 'fofix', name: 'Frets on Fire X (FoFiX)', category: 'games', subcategory: 'Rhythm / Guitar Hero', description: 'Guitar hero rhythm game for keyboard and guitar controllers.', icon: '🎸', tags: ['OpenSource', 'Guitar', 'Rhythm'], sourceUrl: 'https://github.com/topics/fofix', repoType: 'Open Source Repository' },
  { id: 'flightgear', name: 'FlightGear', category: 'games', subcategory: 'Simulation / Flight Sim', description: 'Professional-grade open-source flight simulator.', icon: '✈️', tags: ['OpenSource', 'Flight', 'Simulator'], sourceUrl: 'https://github.com/topics/flightgear', repoType: 'Open Source Repository' },
  { id: 'speeddreams', name: 'Speed Dreams', category: 'games', subcategory: 'Racing / 3D Motorsport', description: 'Motorsport 3D racing simulator fork of TORCS.', icon: '🏎️', tags: ['OpenSource', 'Motorsport', '3D'], sourceUrl: 'https://github.com/topics/speeddreams', repoType: 'Open Source Repository' },
  { id: 'torcs', name: 'TORCS', category: 'games', subcategory: 'Racing / 3D Sim', description: 'The Open Racing Car Simulator with AI car scripting.', icon: '🚗', tags: ['OpenSource', 'Racing', 'AI'], sourceUrl: 'https://github.com/topics/torcs', repoType: 'Open Source Repository' },
  { id: 'armagetron', name: 'Armagetron Advanced', category: 'games', subcategory: 'Racing / 3D Tron Lightcycle', description: '3D multiplayer Tron lightcycle racing game.', icon: '🏍️', tags: ['OpenSource', 'Tron', '3D'], sourceUrl: 'https://github.com/topics/armagetron', repoType: 'Open Source Repository' },
  { id: 'thrive', name: 'Thrive', category: 'games', subcategory: 'Simulation / Microbiology', description: 'Evolution simulation game focused on microbiology and organisms.', icon: '🧫', tags: ['OpenSource', 'Evolution', 'Biology'], sourceUrl: 'https://github.com/topics/thrive', repoType: 'Open Source Repository' },
  { id: 'oolite', name: 'Oolite', category: 'games', subcategory: 'Simulation / Space Trader', description: 'Open-world 3D space opera trader and dogfight simulator.', icon: '🚀', tags: ['OpenSource', 'Space', 'Elite'], sourceUrl: 'https://github.com/topics/oolite', repoType: 'Open Source Repository' },
  { id: 'emptyepsilon', name: 'EmptyEpsilon', category: 'games', subcategory: 'Simulation / Co-op Bridge', description: 'Spaceship bridge simulator for cooperative multiplayer crews.', icon: '🛰️', tags: ['OpenSource', 'Co-op', 'Bridge'], sourceUrl: 'https://github.com/topics/emptyepsilon', repoType: 'Open Source Repository' },
  { id: 'cartlife', name: 'Cart Life', category: 'games', subcategory: 'Simulation / Retail Shop', description: 'Award-winning retail shopkeeping simulation game by Richard Hofmeier.', icon: '🛒', tags: ['OpenSource', 'Sim', 'Indie'], sourceUrl: 'https://github.com/topics/cartlife', repoType: 'Open Source Repository' },
  { id: 'spacecombatsim', name: 'Space Combat Simulator', category: 'games', subcategory: 'Simulation / Space Dogfight', description: 'Open space pilot simulator with physics dogfights.', icon: '🚀', tags: ['OpenSource', 'Space', 'Physics'], sourceUrl: 'https://github.com/topics/spacecombatsim', repoType: 'Open Source Repository' },
  { id: 'ysflight', name: 'YSFlight Community Edition', category: 'games', subcategory: 'Simulation / Flight Sim', description: 'Lightweight 3D flight simulator optimized for performance.', icon: '🛩️', tags: ['OpenSource', 'Flight', 'Lightweight'], sourceUrl: 'https://github.com/topics/ysflight', repoType: 'Open Source Repository' },
  { id: 'rigsofrods', name: 'Rigs of Rods', category: 'games', subcategory: 'Simulation / Soft-Body Vehicle', description: 'Soft-body physics vehicle and truck simulator.', icon: '🚛', tags: ['OpenSource', 'SoftBody', 'Physics'], sourceUrl: 'https://github.com/topics/rigsofrods', repoType: 'Open Source Repository' },
  { id: 'pioneer', name: 'Pioneer', category: 'games', subcategory: 'Simulation / Space Trader', description: 'Space adventure trading and combat game set in 31st century.', icon: '🌌', tags: ['OpenSource', 'Space', 'Trade'], sourceUrl: 'https://github.com/topics/pioneer', repoType: 'Open Source Repository' },
  { id: 'openbve', name: 'OpenBVE', category: 'games', subcategory: 'Simulation / Train Sim', description: 'Open-source train simulator engine with 3D cabs and routes.', icon: '🚆', tags: ['OpenSource', 'Train', 'Sim'], sourceUrl: 'https://github.com/topics/openbve', repoType: 'Open Source Repository' },

  // --- 7. CLASSIC BOARD, CARDS & TURN-BASED (OPEN SOURCE DIRECTORY) ---
  { id: 'lichess', name: 'Lichess Mobile / Web', category: 'games', subcategory: 'Board / Chess Platform', description: 'World-leading open-source chess platform.', icon: '♟️', tags: ['OpenSource', 'Chess', 'Online'], sourceUrl: 'https://github.com/topics/lichess', repoType: 'Open Source Repository' },
  { id: 'pychess', name: 'PyChess', category: 'games', subcategory: 'Board / Chess Client', description: 'Chess client supporting engines, variants, and online play.', icon: '♞', tags: ['OpenSource', 'Chess', 'Python'], sourceUrl: 'https://github.com/topics/pychess', repoType: 'Open Source Repository' },
  { id: 'stockfish', name: 'Stockfish Engine', category: 'games', subcategory: 'Board / Chess Engine', description: 'World\'s most powerful open-source chess evaluation engine.', icon: '🦈', tags: ['OpenSource', 'Chess', 'AI'] },
  { id: 'gnugo', name: 'GNU Go', category: 'games', subcategory: 'Board / Go Engine', description: 'Free program that plays the ancient board game of Go.', icon: '⚪', tags: ['OpenSource', 'Go', 'Board'], sourceUrl: 'https://github.com/topics/gnugo', repoType: 'Open Source Repository' },
  { id: 'dominionweb', name: 'Dominion (Web)', category: 'games', subcategory: 'Cards / Deckbuilding', description: 'Web implementation of card drafting strategy deckbuilder.', icon: '🃏', tags: ['OpenSource', 'Deckbuilding', 'Cards'], sourceUrl: 'https://github.com/topics/dominionweb', repoType: 'Open Source Repository' },
  { id: 'cockatrice', name: 'Cockatrice', category: 'games', subcategory: 'Cards / Virtual Tabletop', description: 'Open-source virtual tabletop for card games (MTG).', icon: '🎴', tags: ['OpenSource', 'MTG', 'Cards'], sourceUrl: 'https://github.com/topics/cockatrice', repoType: 'Open Source Repository' },
  { id: 'forge', name: 'Forge (MTG Rules Engine)', category: 'games', subcategory: 'Cards / Single-Player MTG', description: 'Rules engine for Magic: The Gathering single-player AI matches.', icon: '🔮', tags: ['OpenSource', 'MTG', 'AI'], sourceUrl: 'https://github.com/topics/forge', repoType: 'Open Source Repository' },
  { id: 'openpanzer', name: 'OpenPanzer', category: 'games', subcategory: 'Board / Panzer General', description: 'HTML5/JS remake of Panzer General II wargame.', icon: '🎖️', tags: ['OpenSource', 'Panzer', 'WW2'], sourceUrl: 'https://github.com/topics/openpanzer', repoType: 'Open Source Repository' },
  { id: 'ancientbeast', name: 'Ancient Beast', category: 'games', subcategory: 'Board / Turn-Based Combat', description: 'Online turn-based strategy creature combat game.', icon: '🐉', tags: ['OpenSource', 'TurnBased', 'Combat'], sourceUrl: 'https://github.com/topics/ancientbeast', repoType: 'Open Source Repository' },
  { id: 'hnefatafl', name: 'Hnefatafl (Viking Chess)', category: 'games', subcategory: 'Board / Viking Strategy', description: 'Open-source implementation of ancient Viking chess.', icon: '🛡️', tags: ['OpenSource', 'Viking', 'Board'], sourceUrl: 'https://github.com/topics/hnefatafl', repoType: 'Open Source Repository' },

  // --- 8. REVERSE-ENGINEERED & CLASSIC RESTORATIONS ---
  { id: 'sm64', name: 'Super Mario 64 (sm64)', category: 'games', subcategory: 'Classics / Decompilation', description: 'Full C decompilation project for Super Mario 64.', icon: '🍄', tags: ['OpenSource', 'Decomp', 'Mario64'], sourceUrl: 'https://github.com/topics/sm64', repoType: 'Open Source Repository' },
  { id: 'soh', name: 'Zelda: Ocarina of Time (soh)', category: 'games', subcategory: 'Classics / Ship of Harkinian', description: 'Decompiled C++ engine port for Zelda: Ocarina of Time.', icon: '🗡️', tags: ['OpenSource', 'Zelda', '64Bit'], sourceUrl: 'https://github.com/topics/soh', repoType: 'Open Source Repository' },
  { id: 'zelda3', name: 'Zelda 3 (A Link to the Past)', category: 'games', subcategory: 'Classics / SNES Reverse', description: 'Reverse-engineered C++ engine port for ALTTP.', icon: '🛡️', tags: ['OpenSource', 'Zelda', 'SNES'], sourceUrl: 'https://github.com/topics/zelda3', repoType: 'Open Source Repository' },
  { id: 'twilightprincess', name: 'Zelda: Twilight Princess', category: 'games', subcategory: 'Classics / Decompilation', description: 'C++ decompilation project for Zelda Twilight Princess.', icon: '🐺', tags: ['OpenSource', 'Zelda', 'Decomp'], sourceUrl: 'https://github.com/topics/twilightprincess', repoType: 'Open Source Repository' },
  { id: 'perfectdark', name: 'Perfect Dark', category: 'games', subcategory: 'Classics / N64 Decomp', description: 'PC port decompilation of N64 classic Perfect Dark.', icon: '🎯', tags: ['OpenSource', 'N64', 'FPS'], sourceUrl: 'https://github.com/topics/perfectdark', repoType: 'Open Source Repository' },
  { id: 'doom64re', name: 'Doom 64 RE', category: 'games', subcategory: 'Classics / Doom 64', description: 'Complete reverse engineering of N64 Doom 64.', icon: '👹', tags: ['OpenSource', 'Doom64', 'Retro'], sourceUrl: 'https://github.com/topics/doom64re', repoType: 'Open Source Repository' },
  { id: 'devilutionx', name: 'DevilutionX (Diablo I)', category: 'games', subcategory: 'Classics / Diablo Engine', description: 'Open-source port and engine for original Diablo I.', icon: '👿', tags: ['OpenSource', 'Diablo', 'RPG'], sourceUrl: 'https://github.com/topics/devilutionx', repoType: 'Open Source Repository' },
  { id: 'croftengine', name: 'CroftEngine', category: 'games', subcategory: 'Classics / Tomb Raider', description: 'Open-source Tomb Raider 1 engine remake in C++.', icon: '🏺', tags: ['OpenSource', 'Lara', '3D'], sourceUrl: 'https://github.com/topics/croftengine', repoType: 'Open Source Repository' },
  { id: 'openenroth', name: 'OpenEnroth', category: 'games', subcategory: 'Classics / Might & Magic', description: 'Engine remake for Might and Magic VI-VIII.', icon: '🧙‍♂️', tags: ['OpenSource', 'MightAndMagic', 'RPG'], sourceUrl: 'https://github.com/topics/openenroth', repoType: 'Open Source Repository' },
  { id: 'ultima7revisited', name: 'Ultima VII: Revisited', category: 'games', subcategory: 'Classics / Ultima 3D', description: '3D engine replacement for Ultima VII.', icon: '⚔️', tags: ['OpenSource', 'Ultima', '3D'], sourceUrl: 'https://github.com/topics/ultima7revisited', repoType: 'Open Source Repository' },

  // --- 9. WEB, HTML5 & LIGHTWEIGHT GAMES ---
  { id: 'phaser_games', name: 'Phaser Showcase Games', category: 'games', subcategory: 'Web / HTML5 Framework', description: 'Open-source HTML5 showcase games built with Phaser engine.', icon: '⚡', tags: ['OpenSource', 'Phaser', 'HTML5'], sourceUrl: 'https://github.com/topics/phaser-games', repoType: 'Open Source Repository' },
  { id: 'hextris', name: 'Hextris', category: 'games', subcategory: 'Web / Hexagonal Tetris', description: 'Fast-paced HTML5 Tetris-like puzzle game on hexagon.', icon: '🛑', tags: ['OpenSource', 'Tetris', 'HTML5'], sourceUrl: 'https://github.com/topics/hextris', repoType: 'Open Source Repository' },
  { id: 'pacman_html5', name: 'Pacman HTML5', category: 'games', subcategory: 'Web / Retro Canvas', description: 'Canvas-based retro arcade Pacman implementation.', icon: '🟡', tags: ['OpenSource', 'Pacman', 'Web'], sourceUrl: 'https://github.com/topics/pacman-html5', repoType: 'Open Source Repository' },
  { id: 'canvasrider', name: 'Canvas Rider', category: 'games', subcategory: 'Web / Physics Bike', description: 'JavaScript physics bike riding game with user drawn tracks.', icon: '🚴', tags: ['OpenSource', 'Bike', 'Physics'], sourceUrl: 'https://github.com/topics/canvasrider', repoType: 'Open Source Repository' },
  { id: 'clueless', name: 'Clueless', category: 'games', subcategory: 'Web / Clue Board Game', description: 'Clue/Cluedo board game built in web stack.', icon: '🔍', tags: ['OpenSource', 'Clue', 'Web'], sourceUrl: 'https://github.com/topics/clueless', repoType: 'Open Source Repository' },
  { id: 'littlealchemy', name: 'Little Alchemy Open', category: 'games', subcategory: 'Web / Element Combining', description: 'Web element-combining sandbox crafting game.', icon: '🧪', tags: ['OpenSource', 'Crafting', 'Web'], sourceUrl: 'https://github.com/topics/littlealchemy', repoType: 'Open Source Repository' },
  { id: 'browserquest', name: 'BrowserQuest', category: 'games', subcategory: 'Web / Multiplayer RPG', description: 'Multiplayer HTML5 canvas RPG by Mozilla.', icon: '⚔️', tags: ['OpenSource', 'Mozilla', 'MMO'], sourceUrl: 'https://github.com/topics/browserquest', repoType: 'Open Source Repository' },
  { id: 'astray', name: 'Astray', category: 'games', subcategory: 'Web / WebGL 3D Maze', description: 'WebGL 3D physics ball maze game.', icon: '🔮', tags: ['OpenSource', 'WebGL', 'Maze'], sourceUrl: 'https://github.com/topics/astray', repoType: 'Open Source Repository' },
  { id: 'towergame', name: 'Tower Game', category: 'games', subcategory: 'Web / Stacking Tower', description: 'Tower block stacking HTML5 casual game.', icon: '🏙️', tags: ['OpenSource', 'Stack', 'HTML5'], sourceUrl: 'https://github.com/topics/towergame', repoType: 'Open Source Repository' },
  { id: 'duckhuntjs', name: 'DuckHunt JS', category: 'games', subcategory: 'Web / Retro Shooter', description: 'Retro lightgun duck shooting game implementation in JS.', icon: '🦆', tags: ['OpenSource', 'DuckHunt', 'Retro'], sourceUrl: 'https://github.com/topics/duckhuntjs', repoType: 'Open Source Repository' },

  // --- 10. EDUCATIONAL, PROGRAMMING & EXPERIMENTAL ---
  { id: 'colobot', name: 'Colobot: Gold Edition', category: 'games', subcategory: 'Programming / 3D RTS', description: '3D programming RTS where you code robot AI scripts in CBOT.', icon: '🤖', tags: ['OpenSource', 'Code', 'Robots'], sourceUrl: 'https://github.com/topics/colobot', repoType: 'Open Source Repository' },
  { id: 'corewar', name: 'Core War', category: 'games', subcategory: 'Programming / Memory Battle', description: 'Programming game where battle scripts fight in memory ring.', icon: '💻', tags: ['OpenSource', 'Assembly', 'Code'], sourceUrl: 'https://github.com/topics/corewar', repoType: 'Open Source Repository' },
  { id: 'untrusted', name: 'Untrusted', category: 'games', subcategory: 'Programming / JS Puzzle', description: 'Meta-JavaScript adventure puzzle game where you alter code.', icon: '🔍', tags: ['OpenSource', 'JavaScript', 'Puzzle'], sourceUrl: 'https://github.com/topics/untrusted', repoType: 'Open Source Repository' },
  { id: 'robocode', name: 'Robocode', category: 'games', subcategory: 'Programming / Java Battle', description: 'Java programming game to build tank AI battle bots.', icon: '🚜', tags: ['OpenSource', 'Java', 'Robots'], sourceUrl: 'https://github.com/topics/robocode', repoType: 'Open Source Repository' },
  { id: 'elevatorsaga', name: 'Elevator Saga', category: 'games', subcategory: 'Programming / Logic Optimization', description: 'Elevator programming optimization game in JS.', icon: '🛗', tags: ['OpenSource', 'JavaScript', 'Logic'], sourceUrl: 'https://github.com/topics/elevatorsaga', repoType: 'Open Source Repository' },
  { id: 'vimadventures', name: 'Vim Adventures Engine', category: 'games', subcategory: 'Programming / Vim Learning', description: 'Vim keybinding learning puzzle game engine.', icon: '⌨️', tags: ['OpenSource', 'Vim', 'Code'], sourceUrl: 'https://github.com/topics/vimadventures', repoType: 'Open Source Repository' },
  { id: 'screeps', name: 'Screeps: World', category: 'games', subcategory: 'Programming / MMO RTS', description: 'MMO RTS game for programmers where you write Node.js AI scripts.', icon: '🌐', tags: ['OpenSource', 'NodeJS', 'MMO'], sourceUrl: 'https://github.com/topics/screeps', repoType: 'Open Source Repository' },
  { id: 'hrm_engine', name: 'Human Resource Machine Engine', category: 'games', subcategory: 'Programming / Assembly Logic', description: 'Assembly logic programming game engine.', icon: '📋', tags: ['OpenSource', 'Assembly', 'Logic'], sourceUrl: 'https://github.com/topics/hrm-engine', repoType: 'Open Source Repository' },
  { id: 'cyberchef_games', name: 'CyberChef Games', category: 'games', subcategory: 'Programming / Crypto Puzzles', description: 'Interactive crypto & data logic puzzle frameworks.', icon: '🔐', tags: ['OpenSource', 'Crypto', 'Puzzles'], sourceUrl: 'https://github.com/topics/cyberchef-games', repoType: 'Open Source Repository' },
  { id: 'colossal_cave', name: 'Colossal Cave Adventure', category: 'games', subcategory: 'Classics / First Text Game', description: 'Original 1976 first text adventure game source code.', icon: '📜', tags: ['OpenSource', 'Text', 'History'], sourceUrl: 'https://github.com/topics/colossal-cave', repoType: 'Open Source Repository' },

  // --- 11. MOBILE OPEN SOURCE GAMES ---
  { id: 'anutotd', name: 'Anuto TD', category: 'games', subcategory: 'Mobile / Tower Defense', description: 'Open-source tower defense game for Android.', icon: '🏰', tags: ['OpenSource', 'Mobile', 'Android'], sourceUrl: 'https://github.com/topics/anutotd', repoType: 'Open Source Repository' },
  { id: 'superretromegawars', name: 'Super Retro Mega Wars', category: 'games', subcategory: 'Mobile / Retro Mashup', description: 'Retro arcade mashup multiplayer Android game.', icon: '👾', tags: ['OpenSource', 'Mobile', 'Arcade'], sourceUrl: 'https://github.com/topics/superretromegawars', repoType: 'Open Source Repository' },
  { id: 'andorstrail', name: 'Andor\'s Trail', category: 'games', subcategory: 'Mobile / Roguelike RPG', description: 'Quest-driven open-source roguelike RPG for Android.', icon: '⚔️', tags: ['OpenSource', 'Android', 'RPG'] },
  { id: 'pixeldungeon_orig', name: 'Pixel Dungeon', category: 'games', subcategory: 'Mobile / Original Roguelike', description: 'Original traditional roguelike for Android.', icon: '🗡️', tags: ['OpenSource', 'Android', 'Dungeon'], sourceUrl: 'https://github.com/topics/pixeldungeon-orig', repoType: 'Open Source Repository' },
  { id: 'opensudoku', name: 'OpenSudoku', category: 'games', subcategory: 'Mobile / Sudoku', description: 'Simple, open-source Sudoku game for mobile.', icon: '🔢', tags: ['OpenSource', 'Sudoku', 'Android'], sourceUrl: 'https://github.com/topics/opensudoku', repoType: 'Open Source Repository' },
  { id: 'vectorpinball', name: 'Vector Pinball', category: 'games', subcategory: 'Mobile / Vector Pinball', description: 'Vector graphics physics pinball game for Android.', icon: '🎰', tags: ['OpenSource', 'Pinball', 'Vector'], sourceUrl: 'https://github.com/topics/vectorpinball', repoType: 'Open Source Repository' },
  { id: 'simplebrickgames', name: 'Simple Brick Games', category: 'games', subcategory: 'Mobile / Handheld Retro', description: 'Retro handheld brick game simulator.', icon: '🧱', tags: ['OpenSource', 'Handheld', 'Retro'], sourceUrl: 'https://github.com/topics/simplebrickgames', repoType: 'Open Source Repository' },
  { id: 'lexica', name: 'Lexica', category: 'games', subcategory: 'Mobile / Word Search', description: 'Word search puzzle game for Android.', icon: '🔤', tags: ['OpenSource', 'Words', 'Android'], sourceUrl: 'https://github.com/topics/lexica', repoType: 'Open Source Repository' },
  { id: 'minicraft', name: 'Minicraft', category: 'games', subcategory: 'Mobile / Notch 48h Port', description: 'Markus Persson\'s 48-hour Ludum Dare 2D Minecraft port.', icon: '⛏️', tags: ['OpenSource', 'Notch', '2D'] },
  { id: 'slidepuzzle', name: 'Slide Puzzle', category: 'games', subcategory: 'Mobile / Sliding Tile', description: 'Minimalist sliding tile puzzle game for mobile.', icon: '🧩', tags: ['OpenSource', 'Minimalist', 'Puzzle'], sourceUrl: 'https://github.com/topics/slidepuzzle', repoType: 'Open Source Repository' },

  // --- 12. COMMUNITY ENGINES & OPEN FRAMEWORKS ---
  { id: 'godot_demos', name: 'Godot Engine Demo Games', category: 'games', subcategory: 'Engines / Godot Demos', description: 'Massive library of complete 2D/3D open-source Godot games.', icon: '🤖', tags: ['OpenSource', 'Godot', '2D3D'], sourceUrl: 'https://github.com/topics/godot-demos', repoType: 'Open Source Repository' },
  { id: 'bevy_examples', name: 'Bevy Engine Examples', category: 'games', subcategory: 'Engines / Rust Bevy', description: 'Data-driven Rust game engine showcase projects.', icon: '🦀', tags: ['OpenSource', 'Rust', 'Bevy'], sourceUrl: 'https://github.com/topics/bevy-examples', repoType: 'Open Source Repository' },
  { id: 'raylib_games', name: 'Raylib Games Collection', category: 'games', subcategory: 'Engines / C Raylib', description: 'Lightweight C game architecture showcase examples.', icon: '⚡', tags: ['OpenSource', 'Raylib', 'C'], sourceUrl: 'https://github.com/topics/raylib-games', repoType: 'Open Source Repository' },
  { id: 'love2d_games', name: 'LÖVE (Love2D) Games', category: 'games', subcategory: 'Engines / Lua Love2D', description: 'Lua game framework open-source projects.', icon: '❤️', tags: ['OpenSource', 'Love2D', 'Lua'], sourceUrl: 'https://github.com/topics/love2d-games', repoType: 'Open Source Repository' },
  { id: 'libgdx_demos', name: 'LibGDX Demo Games', category: 'games', subcategory: 'Engines / Java LibGDX', description: 'Cross-platform Java framework games showcase.', icon: '☕', tags: ['OpenSource', 'Java', 'LibGDX'], sourceUrl: 'https://github.com/topics/libgdx-demos', repoType: 'Open Source Repository' },
  { id: 'pico8_carts', name: 'Pico-8 Open Cartridges', category: 'games', subcategory: 'Engines / Fantasy Console', description: 'Open-source fantasy console cartridges collection.', icon: '👾', tags: ['OpenSource', 'Pico8', 'Retro'], sourceUrl: 'https://github.com/topics/pico8-carts', repoType: 'Open Source Repository' },
  { id: 'pygame_games', name: 'Pygame Games Directory', category: 'games', subcategory: 'Engines / Python Pygame', description: 'Python open source arcade games collection.', icon: '🐍', tags: ['OpenSource', 'Python', 'Pygame'], sourceUrl: 'https://github.com/topics/pygame-games', repoType: 'Open Source Repository' },
  { id: 'monogame_samples', name: 'MonoGame Samples', category: 'games', subcategory: 'Engines / C# MonoGame', description: 'C# open cross-platform framework showcase.', icon: '🎯', tags: ['OpenSource', 'CSharp', 'MonoGame'], sourceUrl: 'https://github.com/topics/monogame-samples', repoType: 'Open Source Repository' },
  { id: 'babylon_playground', name: 'Babylon.js Playground Games', category: 'games', subcategory: 'Engines / WebGL 3D', description: 'WebGL 3D browser games written in Babylon.js.', icon: '🌐', tags: ['OpenSource', 'BabylonJS', 'WebGL'], sourceUrl: 'https://github.com/topics/babylon-playground', repoType: 'Open Source Repository' },
  { id: 'threejs_examples', name: 'Three.js Game Examples', category: 'games', subcategory: 'Engines / WebGL ThreeJS', description: 'Interactive WebGL 3D open-source mini-games.', icon: '📐', tags: ['OpenSource', 'ThreeJS', 'WebGL'], sourceUrl: 'https://github.com/topics/threejs-examples', repoType: 'Open Source Repository' },

  // --- 13. DEVELOPER & SECURITY TOOLS ---
// --- EXISTING TOOLS ---
  {
    id: 'html-compiler',
    name: 'HTML Compiler & Live Preview',
    category: 'tools',
    subcategory: 'Developer / Web',
    description: 'Write, compile, and live preview HTML, CSS, and JS code directly in browser with isolated sandbox.',
    icon: '🌐',
    tags: ['Dev', 'HTML', 'Compiler', 'CSS', 'JavaScript', 'Popular'],
    isPopular: true
  },
  {
    id: 'md-compiler',
    name: 'Markdown Compiler & Preview',
    category: 'tools',
    subcategory: 'Developer / Text',
    description: 'Compile and render Markdown text to styled HTML live preview with table, code block, and list support.',
    icon: '📝',
    tags: ['Dev', 'Markdown', 'Compiler', 'Text'],
    isPopular: true
  },
  {
    id: 'code-compiler',
    name: 'JS / Script Code Runner',
    category: 'tools',
    subcategory: 'Developer / Execution',
    description: 'Execute JavaScript & script snippets in a safe client-side environment with captured console output logs.',
    icon: '⚡',
    tags: ['Dev', 'JavaScript', 'Script', 'Runner', 'Compiler'],
    isPopular: true
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Tree',
    category: 'tools',
    subcategory: 'Developer',
    description: 'Format, validate, minify, and visually inspect JSON structures with error highlighting.',
    icon: '⚙️',
    tags: ['Dev', 'JSON', 'Formatter', 'Prettify', 'Minify'],
    isPopular: true
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    category: 'tools',
    subcategory: 'Developer / Crypto',
    description: 'Encode plain text or binary string data to Base64 and decode Base64 back to plain text.',
    icon: '🔐',
    tags: ['Dev', 'Security', 'Base64', 'Decode', 'Encode'],
    isPopular: true
  },
  {
    id: 'qr-gen',
    name: 'QR Code Generator',
    category: 'tools',
    subcategory: 'Media / Utilities',
    description: 'Generate high-resolution SVG/Canvas QR codes with custom colors, custom module shapes, logo overlay, and background tinting.',
    icon: '📱',
    tags: ['Media', 'QR', 'Utility', 'Barcode', 'Generator'],
    isPopular: true
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Evaluator',
    category: 'tools',
    subcategory: 'Developer',
    description: 'Test regular expressions in real time against sample strings with match highlighting and capture group breakdowns.',
    icon: '🔍',
    tags: ['Dev', 'Regex', 'Text', 'Pattern', 'Match'],
    isPopular: false
  },
  {
    id: 'hash-gen',
    name: 'Crypto Hash Generator',
    category: 'tools',
    subcategory: 'Security',
    description: 'Generate SHA-256, SHA-512, SHA-1, and MD5 cryptographic digests instantly via Web Crypto API.',
    icon: '🛡️',
    tags: ['Security', 'Crypto', 'Hash', 'SHA256', 'MD5'],
    isPopular: true
  },
  {
    id: 'pass-gen',
    name: 'Password & Entropy Generator',
    category: 'tools',
    subcategory: 'Security',
    description: 'Create cryptographically strong passwords with custom length slider, character toggles, bit entropy score, and crack time analysis.',
    icon: '🔑',
    tags: ['Security', 'Password', 'Utility', 'Entropy', 'Secret'],
    isPopular: true
  },
  {
    id: 'pdf-tools',
    name: 'PDF Swiss Army Knife & Utilities',
    category: 'tools',
    subcategory: 'Documents / Utilities',
    description: 'Complete client-side PDF processing suite: Compress, Convert (Word/Excel/Images), Merge/Split/Rotate, Edit/Watermark/Redact, Fill & Sign, AI Chat Assistant, and Camera Scanner.',
    icon: '📄',
    tags: ['PDF', 'Compress', 'Convert', 'Edit', 'Sign', 'AI', 'Scanner', 'Popular', 'Size'],
    isPopular: true
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'tools',
    subcategory: 'Documents / Business',
    description: 'Create, customize, save, and print professional invoices. Everything stays on your device.',
    icon: '🧾',
    tags: ['Invoice', 'Bill', 'Business', 'PDF', 'Documents', 'Receipt'],
    isPopular: true
  },

  // --- 1. Image & Graphics Utilities ---
  {
    id: 'img-compress',
    name: 'Image Compressor',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'JPEG, PNG, WebP, AVIF compression with target file size sliders and side-by-side quality preview.',
    icon: '🖼️',
    tags: ['Image', 'Compress', 'Optimize', 'Size', 'Reduce', 'Quality', 'WebP', 'JPEG', 'PNG', 'AVIF']
  },
  {
    id: 'img-convert',
    name: 'Image Format Converter',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Convert images instantly between PNG, JPG, WebP, AVIF, BMP, TIFF, and GIF formats client-side.',
    icon: '🔄',
    tags: ['Image', 'Convert', 'Format', 'PNG', 'JPG', 'WebP', 'AVIF', 'BMP', 'TIFF']
  },
  {
    id: 'img-resize',
    name: 'Resolution & Image Resizer',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Resize image dimensions by exact pixel width/height or dynamic percentage scaling.',
    icon: '📐',
    tags: ['Image', 'Resize', 'Dimension', 'Pixels', 'Scale', 'Resolution', 'Size']
  },
  {
    id: 'img-crop',
    name: 'Image Cropper & Rotator',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Crop standard aspect ratios (1:1, 16:9, 4:3), flip horizontally/vertically, and rotate freely.',
    icon: '✂️',
    tags: ['Image', 'Crop', 'Rotate', 'Flip', 'Aspect Ratio', 'Cut']
  },
  {
    id: 'img-blend',
    name: 'Image Morpher / Blender',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Blend two images using opacity sliders or overlay vibrant gradient masks and blend modes.',
    icon: '🎨',
    tags: ['Image', 'Blend', 'Morph', 'Overlay', 'Gradient', 'Mix']
  },
  {
    id: 'svg-convert',
    name: 'SVG to PNG/JPEG Converter',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Rasterize scalable vector graphics (SVG) into crisp high-resolution PNG or JPEG images.',
    icon: '⚡',
    tags: ['SVG', 'Vector', 'PNG', 'JPEG', 'Rasterize', 'Convert']
  },
  {
    id: 'favicon-gen',
    name: 'Favicon Generator',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Generate multi-resolution favicons (16x16, 32x32, 180x180, ICO) with ready HTML web snippet tags.',
    icon: '🌐',
    tags: ['Favicon', 'Icon', 'Web', 'ICO', 'HTML', 'App Icon']
  },
  {
    id: 'palette-extract',
    name: 'Color Palette Extracted from Image',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Extract dominant color palettes with HEX/RGB codes and copy color schemes in one click.',
    icon: '🎨',
    tags: ['Color', 'Palette', 'Extract', 'HEX', 'RGB', 'Theme', 'Image']
  },
  {
    id: 'bg-remove',
    name: 'Image Background Remover',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Client-side background isolation and cutout tool with chroma-key and magic wand precision.',
    icon: '🧙',
    tags: ['Background', 'Remove', 'Cutout', 'Transparent', 'Chroma', 'Image']
  },
  {
    id: 'watermark-add',
    name: 'Watermark Adder',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Stamp custom text or logo image watermarks across single photos or batches of images.',
    icon: '🏷️',
    tags: ['Watermark', 'Stamp', 'Logo', 'Copyright', 'Batch', 'Image']
  },
  {
    id: 'gif-maker',
    name: 'GIF Maker / Editor',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Combine animated frame sequences, adjust frame delays, optimize palette, and extract frames.',
    icon: '🎞️',
    tags: ['GIF', 'Animation', 'Frames', 'Editor', 'Optimize', 'Extract']
  },
  {
    id: 'exif-viewer',
    name: 'Image Metadata (EXIF) Viewer & Stripper',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Inspect camera model, aperture, shutter speed, GPS location, and scrub sensitive metadata.',
    icon: '🔍',
    tags: ['EXIF', 'Metadata', 'GPS', 'Camera', 'Strip', 'Clean', 'Privacy']
  },
  {
    id: 'ascii-art',
    name: 'ASCII Art Generator',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Convert photos and graphics into customizable text-based character art grids.',
    icon: '🔤',
    tags: ['ASCII', 'Art', 'Text', 'Character', 'Convert', 'Retro']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art Maker / Editor',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Draw 8-bit and 16-bit retro pixel art on custom grid canvases with color swatches and PNG export.',
    icon: '👾',
    tags: ['Pixel', 'Art', 'Draw', 'Retro', 'Grid', '8bit', 'Canvas']
  },
  {
    id: 'img-blur',
    name: 'Image Blur / Pixelate Tool',
    category: 'tools',
    subcategory: 'Image & Graphics',
    description: 'Obfuscate sensitive information, faces, or credentials on screenshots using blur and pixelation brushes.',
    icon: '🙈',
    tags: ['Blur', 'Pixelate', 'Hide', 'Censor', 'Obfuscate', 'Screenshot']
  },

  // --- 2. Video & Audio Utilities ---
  {
    id: 'video-compress',
    name: 'Video Compressor',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Reduce MP4, MOV, and WebM video file sizes directly in-browser using client-side compression canvas.',
    icon: '📹',
    tags: ['Video', 'Compress', 'Reduce', 'MP4', 'WebM', 'Size']
  },
  {
    id: 'video-convert',
    name: 'Video Format Converter',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Shift video formats between MP4, WebM, AVI, and MOV for maximum web and device compatibility.',
    icon: '🔄',
    tags: ['Video', 'Convert', 'MP4', 'WebM', 'AVI', 'MOV', 'Format']
  },
  {
    id: 'video-gif',
    name: 'Video to GIF Converter',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Select exact video clip timestamps and convert video segments into lightweight animated GIFs.',
    icon: '📽️',
    tags: ['Video', 'GIF', 'Convert', 'Clip', 'Animation']
  },
  {
    id: 'video-trim',
    name: 'Video Trimmer & Cutter',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Trim start and end time limits of video tracks and export precise clips.',
    icon: '✂️',
    tags: ['Video', 'Trim', 'Cut', 'Clip', 'Timestamp']
  },
  {
    id: 'audio-compress',
    name: 'Audio Compressor',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Compress MP3, WAV, and AAC bitrate quality to lower file size while keeping clear fidelity.',
    icon: '🎵',
    tags: ['Audio', 'Compress', 'MP3', 'WAV', 'Bitrate', 'Size']
  },
  {
    id: 'audio-convert',
    name: 'Audio Format Converter',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Convert sound files between WAV, MP3, FLAC, OGG, and AAC formats.',
    icon: '🎧',
    tags: ['Audio', 'Convert', 'WAV', 'MP3', 'FLAC', 'OGG', 'AAC']
  },
  {
    id: 'audio-cut',
    name: 'Song / Audio Cutter & Ringtone Maker',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Trim audio tracks with waveform editor preview, create custom ringtones, and export trimmed audio.',
    icon: '🎶',
    tags: ['Audio', 'Cut', 'Trim', 'Ringtone', 'Song', 'Waveform']
  },
  {
    id: 'pitch-speed',
    name: 'Audio Pitch & Speed Changer',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Adjust playback speed/tempo independent of pitch, or shift key pitch without affecting speed.',
    icon: '🎛️',
    tags: ['Audio', 'Pitch', 'Speed', 'Tempo', 'Key', 'Playback']
  },
  {
    id: 'tone-gen',
    name: 'Tone / Frequency Generator',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Generate continuous sine, square, sawtooth, and triangle audio frequencies with precise Hz control.',
    icon: '🔊',
    tags: ['Tone', 'Frequency', 'Hz', 'Sine', 'Audio', 'Generator']
  },
  {
    id: 'instrument-tuner',
    name: 'Instrument Tuner',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Tune guitars, violins, and instruments in real time using microphone input and Web Audio pitch detection.',
    icon: '🎸',
    tags: ['Tuner', 'Guitar', 'Instrument', 'Microphone', 'Pitch', 'Audio']
  },
  {
    id: 'metronome',
    name: 'Metronome Utility',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Visual beat pendulum and audio click track for musicians with customizable BPM and time signatures.',
    icon: '⏱️',
    tags: ['Metronome', 'BPM', 'Beat', 'Tempo', 'Music', 'Rhythm']
  },
  {
    id: 'volume-booster',
    name: 'Audio Volume Booster',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Amplify low decibel quiet audio and video tracks up to 500% with gain control and distortion limiter.',
    icon: '📢',
    tags: ['Audio', 'Volume', 'Boost', 'Gain', 'Amplify', 'Sound']
  },
  {
    id: 'video-frame-extract',
    name: 'Video Frame Extractor',
    category: 'tools',
    subcategory: 'Video & Audio',
    description: 'Extract crisp high-resolution PNG image frames from video files at specified timestamps or frame intervals.',
    icon: '🖼️',
    tags: ['Video', 'Frame', 'Extract', 'PNG', 'Snapshot', 'Image']
  },

  // --- 3. Code, Data & Formatting Tools ---
  {
    id: 'sql-format',
    name: 'SQL Formatter & Minifier',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Beautify, indent, uppercase SQL keywords, and minify complex database queries.',
    icon: '🗄️',
    tags: ['SQL', 'Format', 'Minify', 'Query', 'Database', 'Beautify']
  },
  {
    id: 'html-format',
    name: 'HTML Formatter & Minifier',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Beautify nested HTML code structures with clean indentation or compress whitespace into minified HTML.',
    icon: '🌐',
    tags: ['HTML', 'Format', 'Minify', 'Beautify', 'Code', 'Web']
  },
  {
    id: 'css-format',
    name: 'CSS / SCSS / LESS Formatter & Minifier',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Structure stylesheets with clean indentation or minify CSS rulesets for maximum web loading speed.',
    icon: '🎨',
    tags: ['CSS', 'SCSS', 'LESS', 'Format', 'Minify', 'Stylesheet']
  },
  {
    id: 'js-minifier',
    name: 'JavaScript / TypeScript Minifier & Beautifier',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Minify JS/TS code by stripping comments and white space, or format obfuscated code cleanly.',
    icon: '💻',
    tags: ['JS', 'TS', 'JavaScript', 'TypeScript', 'Minify', 'Format', 'Beautify']
  },
  {
    id: 'xml-viewer',
    name: 'XML Formatter & Tree Viewer',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Format raw XML documents into collapsible tree views with syntax validation.',
    icon: '🌳',
    tags: ['XML', 'Format', 'Tree', 'Viewer', 'Code', 'Validate']
  },
  {
    id: 'yaml-json',
    name: 'YAML to JSON / JSON to YAML Converter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Seamless bidirectional conversion between YAML configuration files and JSON objects.',
    icon: '🔀',
    tags: ['YAML', 'JSON', 'Convert', 'Config', 'Data']
  },
  {
    id: 'json-csv',
    name: 'JSON to CSV / CSV to JSON Converter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Convert JSON arrays to tabular CSV files and flatten structured CSV rows into JSON objects.',
    icon: '📊',
    tags: ['JSON', 'CSV', 'Convert', 'Table', 'Spreadsheet', 'Data']
  },
  {
    id: 'json-types',
    name: 'JSON to Type Definitions',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Generate TypeScript interfaces, Go structs, Python Pydantic models, or Java POJOs from JSON objects.',
    icon: '🏷️',
    tags: ['JSON', 'Types', 'TypeScript', 'Go', 'Python', 'Struct', 'Interface']
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Live Preview Editor',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Split-pane Markdown notes editor with live side-by-side HTML preview and quick syntax bar.',
    icon: '📝',
    tags: ['Markdown', 'Editor', 'Preview', 'HTML', 'Notes']
  },
  {
    id: 'latex-editor',
    name: 'LaTeX Editor & Compiler',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'In-browser LaTeX document editor with predefined resume templates, live compiled preview, and print/PDF export.',
    icon: '📄',
    tags: ['LaTeX', 'Editor', 'Compiler', 'Resume', 'CV', 'Templates', 'TEX']
  },
  {
    id: 'curl-converter',
    name: 'cURL to Code Converter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Convert cURL terminal commands into Fetch API, Axios, Python Requests, PHP, or Go code snippets.',
    icon: '🚀',
    tags: ['cURL', 'Fetch', 'Axios', 'Python', 'PHP', 'API', 'Request']
  },
  {
    id: 'graphql-validator',
    name: 'GraphQL Query Validator & Formatter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Validate GraphQL syntax, check query depth, format query blocks, and extract variables.',
    icon: '⚛️',
    tags: ['GraphQL', 'Query', 'Validate', 'Format', 'API']
  },
  {
    id: 'toml-json',
    name: 'TOML to JSON / JSON to TOML Converter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Convert TOML config files (Cargo.toml, pyproject.toml) to JSON and back instantly.',
    icon: '📄',
    tags: ['TOML', 'JSON', 'Convert', 'Config', 'Rust', 'Python']
  },
  {
    id: 'plist-json',
    name: 'Plist (Apple XML) to JSON Converter',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Parse Apple Property List (.plist) XML files into easy JSON data objects.',
    icon: '🍏',
    tags: ['Plist', 'Apple', 'JSON', 'Convert', 'iOS', 'macOS']
  },
  {
    id: 'sql-schema-visualizer',
    name: 'SQL Schema Visualizer',
    category: 'tools',
    subcategory: 'Code & Data',
    description: 'Render database CREATE TABLE statements into interactive ER diagram tables with foreign key relationship lines.',
    icon: '📐',
    tags: ['SQL', 'Schema', 'Visualizer', 'ERD', 'Diagram', 'Database']
  },

  // --- 4. Text & String Manipulation ---
  {
    id: 'text-diff',
    name: 'Text Diff / Compare Checker',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Side-by-side or inline text comparison highlighting insertions, deletions, and modified lines.',
    icon: '⚖️',
    tags: ['Diff', 'Compare', 'Text', 'Highlight', 'Compare', 'Side-by-side']
  },
  {
    id: 'case-converter',
    name: 'String Case Converter',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Transform strings into camelCase, snake_case, PascalCase, kebab-case, UPPERCASE, and lowercase.',
    icon: '🔤',
    tags: ['String', 'Case', 'camelCase', 'snake_case', 'PascalCase', 'kebab-case']
  },
  {
    id: 'line-sort-dedupe',
    name: 'Line Sort & Deduplicator',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Sort lines alphabetically or numerically, remove duplicate entries, and scrub empty lines.',
    icon: '📑',
    tags: ['Sort', 'Deduplicate', 'Unique', 'Lines', 'Text', 'Clean']
  },
  {
    id: 'text-inspector',
    name: 'Text Inspector & Counter',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Live character count, word count, sentence count, line count, and estimated reading time calculator.',
    icon: '📊',
    tags: ['Text', 'Count', 'Words', 'Characters', 'Reading Time', 'Inspector']
  },
  {
    id: 'html-entity',
    name: 'HTML Entity Encoder / Decoder',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Convert special characters into HTML entities (&lt;, &gt;, &amp;) and decode entities back to plain text.',
    icon: '🔣',
    tags: ['HTML', 'Entity', 'Encode', 'Decode', 'Special Characters']
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Encode parameters safely into percent-encoded URL strings and decode query parameters.',
    icon: '🔗',
    tags: ['URL', 'Encode', 'Decode', 'URI', 'Query', 'Percent']
  },
  {
    id: 'backslash-escape',
    name: 'Backslash Escape / Unescape Tool',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Escape quotes, newlines, and special characters for JS, JSON, and regex strings.',
    icon: '🛡️',
    tags: ['Escape', 'Unescape', 'Backslash', 'String', 'Quotes', 'JSON']
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum / Placeholder Text Generator',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Generate paragraphs, sentences, bullet lists, or word counts of classic placeholder text.',
    icon: '📄',
    tags: ['Lorem', 'Ipsum', 'Generator', 'Placeholder', 'Text', 'Dummy']
  },
  {
    id: 'find-replace-regex',
    name: 'Find and Replace Regex Tool',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Perform powerful search and replace operations across multiline text blocks using Regular Expressions.',
    icon: '🔍',
    tags: ['Regex', 'Find', 'Replace', 'Text', 'Pattern', 'Search']
  },
  {
    id: 'slugify',
    name: 'Slugify Tool',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Convert titles and phrases into clean, lowercased, URL-safe permalink slugs.',
    icon: '🏷️',
    tags: ['Slugify', 'Slug', 'URL', 'Permalink', 'SEO', 'Title']
  },
  {
    id: 'text-reverse',
    name: 'Text Reverse / Flip Generator',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Reverse string character order, flip text upside down, or mirror text backwards.',
    icon: '🔄',
    tags: ['Text', 'Reverse', 'Flip', 'Upside Down', 'Mirror', 'String']
  },
  {
    id: 'csv-markdown-table',
    name: 'CSV to Markdown Table Converter',
    category: 'tools',
    subcategory: 'Text Manipulation',
    description: 'Convert raw CSV comma-delimited data into formatted Markdown table syntax.',
    icon: '📋',
    tags: ['CSV', 'Markdown', 'Table', 'Convert', 'Grid']
  },

  // --- 5. Security, Crypto & Encoding ---
  {
    id: 'jwt-debugger',
    name: 'JWT (JSON Web Token) Debugger & Decoder',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Inspect JWT header, payload, expiration times, and verify secret signatures client-side.',
    icon: '🔑',
    tags: ['JWT', 'Token', 'Decode', 'Inspect', 'Security', 'Auth']
  },
  {
    id: 'base32-58',
    name: 'Base32 & Base58 Encoder / Decoder',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Encode and decode Base32 and Bitcoin-style Base58 string representations.',
    icon: '🔐',
    tags: ['Base32', 'Base58', 'Encode', 'Decode', 'Crypto', 'Bitcoin']
  },
  {
    id: 'hex-ascii',
    name: 'Hex to ASCII / ASCII to Hex Converter',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Convert hexadecimal string bytes into readable ASCII text and vice versa.',
    icon: '🔢',
    tags: ['Hex', 'ASCII', 'Convert', 'Bytes', 'Encoding']
  },
  {
    id: 'binary-translator',
    name: 'Binary Translator',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Translate plain text strings to binary 01010101 streams and back.',
    icon: '💻',
    tags: ['Binary', 'Text', 'Translate', '0101', 'Convert', 'Bytes']
  },
  {
    id: 'morse-code',
    name: 'Morse Code Translator',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Translate text to Morse code dots and dashes with real-time audio beep playback.',
    icon: '📻',
    tags: ['Morse', 'Code', 'Audio', 'Playback', 'Translate', 'Beep']
  },
  {
    id: 'rsa-gen',
    name: 'RSA Key Pair Generator',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Generate 1024-bit, 2048-bit, or 4096-bit RSA public and private key pairs via Web Crypto API.',
    icon: '🔐',
    tags: ['RSA', 'Key', 'Public', 'Private', 'Crypto', 'Security', 'Generate']
  },
  {
    id: 'x509-decoder',
    name: 'X.509 SSL Certificate Decoder',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Inspect PEM SSL certificates, subject names, issuer details, validity dates, and fingerprint hashes.',
    icon: '📜',
    tags: ['X509', 'SSL', 'Certificate', 'PEM', 'Inspect', 'Security']
  },
  {
    id: 'hmac-gen',
    name: 'HMAC Generator',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Compute Hash-based Message Authentication Codes (HMAC-SHA256, HMAC-SHA512) with custom secret keys.',
    icon: '🛡️',
    tags: ['HMAC', 'Hash', 'Secret', 'SHA256', 'SHA512', 'Crypto']
  },
  {
    id: 'uuid-gen',
    name: 'UUID / ULID / NanoID Generator',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Bulk generate cryptographically secure UUID v4, ULID time-sortable IDs, and NanoIDs.',
    icon: '🎲',
    tags: ['UUID', 'ULID', 'NanoID', 'Generator', 'Bulk', 'Unique ID']
  },
  {
    id: 'bcrypt-hasher',
    name: 'Bcrypt Hash Generator & Verifier',
    category: 'tools',
    subcategory: 'Security & Crypto',
    description: 'Generate Bcrypt salt hashes with custom round costs and verify passwords against Bcrypt hashes.',
    icon: '🔒',
    tags: ['Bcrypt', 'Hash', 'Verify', 'Password', 'Salt', 'Security']
  },

  // --- 6. Date, Time & Math Utilities ---
  {
    id: 'epoch-converter',
    name: 'Unix Epoch Timestamp Converter',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Live current epoch counter, convert timestamps to human dates, and translate dates to Unix timestamps.',
    icon: '⏰',
    tags: ['Unix', 'Epoch', 'Timestamp', 'Date', 'Time', 'Convert']
  },
  {
    id: 'timezone-planner',
    name: 'Timezone Meeting Planner',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Compare multiple global city timezones side-by-side to find optimal cross-border meeting slots.',
    icon: '🌍',
    tags: ['Timezone', 'Meeting', 'Planner', 'UTC', 'Time', 'Global']
  },
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser & Builder',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Visual builder for 5-part cron schedules with human-readable explanations and upcoming run times.',
    icon: '⏲️',
    tags: ['Cron', 'Schedule', 'Parser', 'Builder', 'Time', 'Job']
  },
  {
    id: 'timer-stopwatch',
    name: 'Countdown Timer & Stopwatch',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Precision countdown timer with audio alarms, lap timer stopwatch, and productivity interval presets.',
    icon: '⏱️',
    tags: ['Timer', 'Stopwatch', 'Countdown', 'Lap', 'Alarm', 'Clock']
  },
  {
    id: 'percentage-calc',
    name: 'Percentage & Ratio Calculator',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Calculate percentage changes, margins, discounts, tax additions, and proportion ratios easily.',
    icon: '🔢',
    tags: ['Percentage', 'Ratio', 'Calculator', 'Math', 'Margin', 'Tax']
  },
  {
    id: 'number-base',
    name: 'Number Base Converter',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Convert numbers seamlessly between Decimal, Hexadecimal, Octal, and Binary representations.',
    icon: '🧮',
    tags: ['Number', 'Base', 'Decimal', 'Hex', 'Octal', 'Binary', 'Convert']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter Suite',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Convert units for length, weight, temperature, data storage size, speed, and pressure.',
    icon: '📐',
    tags: ['Unit', 'Converter', 'Length', 'Weight', 'Temperature', 'Data', 'Speed']
  },
  {
    id: 'subnet-calc',
    name: 'Subnet / CIDR Calculator',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'IPv4 and IPv6 subnet mask calculator showing network ID, broadcast IP, host range, and total IPs.',
    icon: '🌐',
    tags: ['Subnet', 'CIDR', 'IP', 'IPv4', 'IPv6', 'Network', 'Calculator']
  },
  {
    id: 'aspect-ratio-calc',
    name: 'Aspect Ratio Calculator',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Calculate missing dimensions for 16:9, 4:3, 1:1, or custom aspect ratio dimensions for design and video.',
    icon: '📐',
    tags: ['Aspect Ratio', 'Dimensions', '16:9', 'Video', 'Design', 'Calculator']
  },
  {
    id: 'color-converter',
    name: 'Color Converter & Picker',
    category: 'tools',
    subcategory: 'Date, Time & Math',
    description: 'Convert color codes between HEX, RGB, HSL, CMYK, and modern OKLCH formats with visual picker.',
    icon: '🎨',
    tags: ['Color', 'Picker', 'HEX', 'RGB', 'HSL', 'CMYK', 'OKLCH', 'Convert']
  },

  // --- 7. Document, PDF & Office Tools ---
  {
    id: 'pdf-merge-split',
    name: 'PDF Merger & Splitter',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Combine multiple PDF files into one master document or split specific page ranges into individual PDFs.',
    icon: '📄',
    tags: ['PDF', 'Merge', 'Split', 'Combine', 'Pages', 'Document']
  },
  {
    id: 'pdf-page-rotate',
    name: 'PDF Page Rotator & Organizer',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Drag-and-drop page organizer to rotate individual pages (90°/180°), delete pages, or reorder page sequences.',
    icon: '🔄',
    tags: ['PDF', 'Rotate', 'Reorder', 'Organize', 'Pages', 'Document']
  },
  {
    id: 'pdf-to-from-images',
    name: 'PDF to Images / Images to PDF Converter',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Export PDF pages as crisp PNG/JPG image files, or bundle a folder of photo images into a single PDF.',
    icon: '🖼️',
    tags: ['PDF', 'Images', 'PNG', 'JPG', 'Convert', 'Bundle']
  },
  {
    id: 'pdf-watermarker',
    name: 'PDF Watermarker',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Stamp customized text or confidential diagonal watermark labels across PDF document pages.',
    icon: '🏷️',
    tags: ['PDF', 'Watermark', 'Stamp', 'Confidential', 'Label']
  },
  {
    id: 'pdf-redactor',
    name: 'PDF Text & Image Redactor',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Black out sensitive personal text, financial numbers, or photos securely from PDF documents.',
    icon: '⬛',
    tags: ['PDF', 'Redact', 'Blackout', 'Secure', 'Privacy', 'Hide']
  },
  {
    id: 'markdown-pdf-exporter',
    name: 'Markdown to PDF / HTML to PDF Exporter',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Render Markdown notes or HTML markup into clean print-formatted PDF documents.',
    icon: '🖨️',
    tags: ['Markdown', 'HTML', 'PDF', 'Export', 'Print', 'Document']
  },
  {
    id: 'spreadsheet-viewer',
    name: 'Spreadsheet Viewer (Excel / CSV / ODS)',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Inspect and search tabular data in Excel (.xlsx), CSV, and ODS spreadsheet files locally in-browser.',
    icon: '📊',
    tags: ['Spreadsheet', 'Excel', 'CSV', 'ODS', 'View', 'Table', 'XLSX']
  },
  {
    id: 'resume-parser',
    name: 'Resume / CV Builder Text Parser',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Parse resume text, analyze keyword matches against job descriptions, and extract formatting suggestions.',
    icon: '👔',
    tags: ['Resume', 'CV', 'Parser', 'Keywords', 'Job', 'Match', 'Career']
  },
  {
    id: 'resume-builder',
    name: 'Interactive Resume Builder',
    category: 'tools',
    subcategory: 'Documents & PDF',
    description: 'Full-featured standard resume builder with structured form sections, theme styling, and PDF print export.',
    icon: '💼',
    tags: ['Resume', 'Builder', 'CV', 'Career', 'PDF', 'Job', 'Templates']
  },

  // --- 8. Design & CSS Generators ---
  {
    id: 'css-gradient',
    name: 'CSS Gradient Generator',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Visual gradient builder for linear, radial, and mesh gradients with ready CSS output.',
    icon: '🌈',
    tags: ['CSS', 'Gradient', 'Linear', 'Radial', 'Mesh', 'Design', 'Generator']
  },
  {
    id: 'css-shadow',
    name: 'CSS Box Shadow Generator',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Build layered box shadows, drop shadows, and glow effects with live visual feedback.',
    icon: '🔳',
    tags: ['CSS', 'Box Shadow', 'Glow', 'Drop Shadow', 'Design', 'Generator']
  },
  {
    id: 'border-radius',
    name: 'CSS Border Radius Visualizer',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Interactive visualizer for complex multi-corner 8-point percentage border radius shapes.',
    icon: '🟢',
    tags: ['CSS', 'Border Radius', 'Corners', 'Shape', 'Visualizer']
  },
  {
    id: 'glass-neumorphism',
    name: 'Glassmorphism & Neumorphism CSS Generator',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Generate modern frosted glass and soft extruded neumorphic CSS UI component styles.',
    icon: '🪞',
    tags: ['Glassmorphism', 'Neumorphism', 'CSS', 'UI', 'Frosted Glass', 'Design']
  },
  {
    id: 'svg-blob',
    name: 'SVG Blob & Organic Shape Generator',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Generate smooth organic vector SVG blob shapes with randomness controls and SVG code copy.',
    icon: '💧',
    tags: ['SVG', 'Blob', 'Organic', 'Shape', 'Vector', 'Generator']
  },
  {
    id: 'cubic-bezier',
    name: 'Cubic-Bezier Easing Animation Generator',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Interactive bezier curve handle editor with side-by-side transition preview and cubic-bezier CSS snippet.',
    icon: '📈',
    tags: ['Cubic Bezier', 'Easing', 'CSS', 'Animation', 'Transition', 'Curve']
  },
  {
    id: 'wcag-contrast',
    name: 'WCAG Color Contrast Checker',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Check foreground and background color combinations against WCAG 2.1 AA/AAA accessibility standards.',
    icon: '♿',
    tags: ['WCAG', 'Contrast', 'Accessibility', 'Color', 'AA', 'AAA', 'Checker']
  },
  {
    id: 'flexbox-grid',
    name: 'CSS Flexbox & Grid Playground',
    category: 'tools',
    subcategory: 'Design & CSS',
    description: 'Interactive visual layout builder to test CSS Flexbox alignments and CSS Grid template columns.',
    icon: '🧱',
    tags: ['Flexbox', 'Grid', 'CSS', 'Layout', 'Playground', 'Design']
  },

  // --- 9. Network & Web Diagnostics ---
  {
    id: 'what-is-my-ip',
    name: 'What Is My IP & Browser Inspector',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Displays public IP, local network capabilities, browser user agent details, and HTTP headers.',
    icon: '🌐',
    tags: ['IP', 'Lookup', 'Headers', 'User Agent', 'Network', 'My IP']
  },
  {
    id: 'dns-lookup',
    name: 'DNS Record Lookup',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Query domain A, AAAA, MX, TXT, NS, and CNAME DNS records via Web DNS APIs.',
    icon: '🔍',
    tags: ['DNS', 'Lookup', 'MX', 'TXT', 'A Record', 'Domain', 'Network']
  },
  {
    id: 'url-parser',
    name: 'URL Parser & Inspector',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Break down complex URLs into protocol, hostname, port, pathname, search params table, and hash.',
    icon: '🔗',
    tags: ['URL', 'Parser', 'Inspector', 'Host', 'Params', 'Query']
  },
  {
    id: 'http-status-guide',
    name: 'HTTP Status Code Reference Guide',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Searchable directory of all HTTP status codes (2xx, 3xx, 4xx, 5xx) with descriptions and fixes.',
    icon: '📚',
    tags: ['HTTP', 'Status Code', 'Reference', '404', '500', '200', 'Guide']
  },
  {
    id: 'user-agent-parser',
    name: 'User-Agent Parser',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Decode browser user-agent strings to identify browser family, operating system, device type, and engine.',
    icon: '💻',
    tags: ['User-Agent', 'Browser', 'OS', 'Device', 'Decode', 'Inspector']
  },
  {
    id: 'robots-sitemap-validator',
    name: 'Robots.txt & Sitemap Validator',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Parse robots.txt rules and XML sitemap URLs for crawl errors, disallow blocks, and broken links.',
    icon: '🤖',
    tags: ['Robots', 'Sitemap', 'SEO', 'Validator', 'Crawl', 'XML']
  },
  {
    id: 'open-graph-inspector',
    name: 'Open Graph (OG) Meta Tag Inspector',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Preview how website links look when shared on Twitter/X, Facebook, LinkedIn, and Discord social cards.',
    icon: '🎴',
    tags: ['Open Graph', 'OG', 'Social', 'Meta', 'Preview', 'Card', 'Twitter']
  },
  {
    id: 'meta-tags-gen',
    name: 'HTML Meta Tags Generator',
    category: 'tools',
    subcategory: 'Network & Web',
    description: 'Generate SEO-friendly HTML meta title, description, viewport, robots, and social share tags.',
    icon: '🏷️',
    tags: ['Meta', 'Tags', 'SEO', 'HTML', 'Title', 'Description', 'Generator']
  },

  // --- 10. Fun, Niche & Productivity Extras ---
  {
    id: 'cps-reaction-test',
    name: 'Clicks Per Second (CPS) & Reaction Time Test',
    category: 'tools',
    subcategory: 'Productivity & Fun',
    description: 'Benchmark your mouse click speed (CPS) and visual reaction time in milliseconds.',
    icon: '⚡',
    tags: ['CPS', 'Click', 'Reaction', 'Benchmark', 'Speed', 'Test']
  },
  {
    id: 'kanban-board',
    name: 'Kanban / Sticky Notes Board',
    category: 'tools',
    subcategory: 'Productivity & Fun',
    description: 'In-browser local storage task management board with drag-and-drop columns and color sticky notes.',
    icon: '📋',
    tags: ['Kanban', 'Sticky Notes', 'Task', 'Board', 'Productivity', 'Notes']
  }
];
