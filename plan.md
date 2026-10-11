# Minimi — Open-Source Angular Front-End App Plan

> **Tagline:** "100 games. 100 tools. Zero backend."
> **Repository:** `minimi` (Main Source) / Deployment target repository: `online`
> **License:** MIT (Code) + CC0 1.0 (Art/Audio Assets generated/packaged in-house)

---

## 1. Project Identity & Mobile Compatibility

### 1.1 Brand Identity
* **Name:** Minimi (derived from *minimal* + *mini-tools* + *mini-games*)
* **Plan Name:** Minimi App Plan
* **Icon Concept:** Rounded square with a lowercase **m** formed by two overlapping vector arcs (a game controller arc intersecting a wrench arc). Built with a vibrant gradient from `#6C5CE7` (indigo) to `#00CEC9` (teal). Simple, flat, memorable, and 100% original SVG vector artwork with zero resemblance to existing trademarks.
* **Color Palette:**
  * **Primary:** `#6C5CE7` (Indigo)
  * **Accent:** `#00CEC9` (Teal)
  * **Surface:** Dark `#0F172A` / Light `#F8FAFC`
  * **Warning:** `#FDCB6E`
  * **Danger:** `#FF7675`
* **License:** MIT License for all source code; CC0 1.0 Universal for original game assets and icons.

### 1.2 Phone & Mobile Compatibility Specifications
Minimi is engineered from the ground up to be **100% mobile and phone compatible**.

* **Mobile-First Responsive Layout:**
  * Viewport setting: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`.
  * Mobile bottom navigation bar for quick access to Home, Search, Games, Tools, and Favorites on small screens, switching to a left rail on desktop screens (`≥768px`).
  * Dynamic grid systems scaling smoothly from 1 column on mobile phones (`<640px`), 2 columns on tablets, to 4+ columns on wide screens.
* **Touch & Mobile Controls for Games:**
  * Custom touch control layer for arcade, platformer, action, and physics games:
    * **Virtual On-Screen D-Pad / Analog Joystick:** Rendered using lightweight HTML5 Canvas or SVG overlay.
    * **Action Buttons:** Large touch targets (`≥48×48px`) with touch haptic feedback (`navigator.vibrate(10)`).
    * **Swipe & Drag Gestures:** Native touch event handlers (`touchstart`, `touchmove`, `touchend`) with passive event listeners for smooth 60fps interaction.
  * **Orientation Support:** Automatic detection and lock prompts for games optimized for Landscape (e.g. Garden vs Groaners, Side Scrollers) or Portrait mode (e.g. Desert Dash, Tetris/Blockfall).
* **Touch Target & Accessibility Rules:**
  * Minimum hit area of `44×44px` (or `48×48px` on mobile screens) for all buttons, toggles, and tool inputs.
  * Prevention of unwanted mobile double-tap zoom (`touch-action: manipulation`) and elastic scrolling bouncing (`overscroll-behavior-y: contain`).
* **PWA (Progressive Web App) Mobile Experience:**
  * Web App Manifest (`manifest.webmanifest`) configured with `display: standalone` for full-screen immersive feel without browser address bars.
  * Service Worker offline caching via `@angular/pwa`, enabling full offline usability for both games and tools on iOS Safari and Android Chrome.

---

## 2. Legal & Copyright Safety Rules (Non-Negotiable)

To ensure **zero copyright or trademark infringement**, all games are "genre clones" of mechanics only—never using proprietary intellectual property, trade dress, protected artwork, or trademarked names.

### 2.1 IP Transformation Mapping

| Protected IP / Inspiration | Generic Name in Minimi | Original Asset & Visual Strategy |
| :--- | :--- | :--- |
| **Pac-Man** | **Maze Muncher** | Generic round yellow pursuer blob eating energy dots; original ghost AI with 4 distinct personality states. |
| **Super Mario** | **Jumpman Pip** | Original character "Pip"; generic geometric tilemaps and generic enemy critters. |
| **Sonic the Hedgehog** | **Blitz Runner** | Original fast blue-ish creature design; slope physics and momentum loops. |
| **Tetris** | **Blockfall** | Standard polyomino mechanics (un-copyrightable game rule) using original block styling and SRS rotation logic. |
| **Plants vs. Zombies** | **Garden vs. Groaners** | Sunblooms (sun generators), Pelt-Pods (seed shooters), Bark Blocks (defensive walls), Shamblers/Runners/Brutes (enemies). |
| **Angry Birds** | **Sling Beasts** | Original round fuzzballs with Matter.js physics; destructible wooden/stone structures. |
| **Flappy Bird** | **Floppy Finch** | Original bird sprite navigating moving stone pillars. |
| **Chrome Dino** | **Desert Dash** | Pixelated desert runner with cacti and flying lizards. |
| **Candy Crush** | **Sweet Swap** | Match-3 mechanics using geometric gems and candies. |
| **Wordle** | **Five-Letter** | Date-seeded 5-letter word guessing game. |
| **Beat Saber** | **Slash Beat** | Slice incoming blocks on beat in 3D using touch/mouse slicing gestures. |

### 2.2 Asset Sourcing & License Policy
1. **Art & Graphics:** Procedurally generated SVG/Canvas vector art or CC0 (Public Domain) asset packs (e.g., from Kenney.nl, OpenGameArt with strict CC0 filter).
2. **Audio & Sound Effects:** Web Audio API sound synthesizers (oscillators/procedural audio) or CC0 audio samples.
3. **Typography:** SIL Open Font License (OFL) fonts: Inter, JetBrains Mono, Rubik.
4. **Third-Party Libraries:** Exclusively MIT, Apache-2.0, or BSD licensed dependencies.
5. **Attribution File:** A dedicated `LEGAL.md` file in the repository root will document every asset, font, and dependency alongside its license text.

---

## 3. Architecture & Tech Stack

Minimi is built using **Angular 18+** with standalone components, Signals, and zero backend requirement.

* **Runtime & Package Managers:** Full support for both **Bun** (`bun` / `~/.bun/bin/bun`) and **Node.js** (`npm` / `npx`). Bun is supported as a high-performance JavaScript runtime, package manager, and test runner.
* **Core Framework:** Angular 18+ (Standalone Components, Zoneless support, Angular Signals for reactive state management).
* **State Management:** `@ngrx/signals` (NgRx SignalStore) for feature-level state management.
* **Routing:** Angular Router with lazy `loadComponent` route-level code splitting. Every game and tool resides in its own lazily loaded bundle chunk.
* **Styling & UI:** Tailwind CSS + Angular CDK (a11y, overlay, drag-drop, virtual scroll).
* **2D Game Engine / Rendering:** Phaser 3 or HTML5 Raw Canvas / WebGL 2D primitives.
* **3D Engine:** Three.js + WebGL.
* **Physics Engines:** Matter.js (2D Physics), Rapier WASM (3D Physics).
* **Audio System:** Web Audio API procedural sound engine & Howler.js wrapper.
* **Data Processing Libraries:** `pdf-lib`, `pdfjs-dist`, `jspdf`, `squoosh` WASM (Image processing), Web Crypto API.
* **Local Storage:** `localStorage` + `IndexedDB` via `idb` wrapper.
* **PWA:** `@angular/pwa` for offline caching and mobile home-screen installation.
* **Build System:** Angular CLI + Esbuild / Vite integration.

---

## 4. Directory Structure

```
minimi/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD build & deployment to 'online' repo
├── scripts/
│   └── deploy.sh               # Manual / automated deployment script to 'online' repo
├── src/
│   ├── app/
│   │   ├── core/               # Singletons: audio, storage, theme, SEO, PWA, touch-haptics
│   │   ├── shared/             # UI kit, virtual controls (joystick, buttons), pipes, directives
│   │   ├── layout/             # Navigation shell, header, sidebar, bottom nav bar, command palette
│   │   ├── features/
│   │   │   ├── arcade/         # Snake, Breakout, Maze Muncher, etc.
│   │   │   ├── puzzle/         # 2048, Blockfall, Sudoku, Five-Letter, etc.
│   │   │   ├── platformer/     # Jumpman Pip, Desert Dash, Blitz Runner
│   │   │   ├── card-board/     # Chess, Solitaire, Checkers, Battleship
│   │   │   ├── sim-idle/       # Cookie Forge, Tiny Town, Farm Plot
│   │   │   ├── physics/        # Sling Beasts, Pinball, Falling Sand
│   │   │   ├── three-d/        # Maze Escape 3D, Bowling 3D, Cube Solve
│   │   │   ├── roguelike/      # Ascii Depths, Deck Rogue, Top-Down Quest
│   │   │   ├── audio-rhythm/   # Fret Hero, Synth Piano, Slash Beat
│   │   │   ├── word-trivia/    # Hangman, Word Grid, Geo Quiz
│   │   │   ├── experimental/   # Life Grid, Garden vs Groaners (PvZ clone)
│   │   │   └── tools/
│   │   │       ├── finance/    # GST/VAT, EMI, Salary, Expense Tracker
│   │   │       ├── media/      # QR Generator/Scanner, Image Cropper/Compressor
│   │   │       ├── pdf/        # PDF Merge, Split, Convert
│   │   │       ├── text/       # Regex, Diff, Markdown, Counters
│   │   │       ├── dev/        # JSON Formatter, Base64, UUID, JWT
│   │   │       ├── crypto/     # Hash, AES, RSA, Password Generator
│   │   │       ├── audio-video/# Audio Cutter, Recorder, Video->GIF
│   │   │       ├── network/    # Subnet Calc, Header Analyzer
│   │   │       ├── unit-math/  # Base Converter, Unit Converter, Matrix Calc
│   │   │       ├── design/     # Color Converter, Contrast Checker, CSS Keyframes
│   │   │       ├── productivity/# Pomodoro, Kanban, Notes, Habit Tracker
│   │   │       └── edu/        # BMI, Sudoku Solver, Typing Test
│   │   └── registry/           # Item Metadata Registry: {id, name, tags, icon, route, isGame}
│   ├── assets/
│   │   ├── icons/              # Clean SVG sprite maps
│   │   ├── audio/              # CC0 sound clips
│   │   └── fonts/              # Inter, JetBrains Mono
│   ├── styles/                 # Tailwind & custom CSS variables
│   └── workers/                # Web Workers for heavy CPU operations (Image, PDF, AI, Sand Sim)
├── plan.md                     # Full Development Plan (this document)
├── LEGAL.md                    # Asset attribution & licenses
├── CONTRIBUTING.md             # IP guidelines & contribution rules
├── LICENSE                     # MIT License
└── angular.json
```

---

## 5. App-Wide Core Features

1. **Command Palette (`Ctrl/⌘ + K` or Mobile Floating Search):** Fuzzy search across all 200+ games and tools with instant keyboard or touch navigation.
2. **Home Grid with Tag Filters:** Filter by Arcade, Puzzle, Tools, 3D, Physics, Multiplayer, Mobile-Optimized.
3. **Favorites & Recents:** Instant one-tap access to bookmarked or recently played items stored in `localStorage`.
4. **PWA Mobile Offline Mode:** Service worker pre-caching enables complete offline functionality without internet connectivity.
5. **Theme Switcher & Accent Picker:** Dark (`#0F172A`), Light (`#F8FAFC`), High-Contrast, and customizable accent color schemes (`#6C5CE7`, `#00CEC9`, etc.).
6. **Virtual Touch Controller Overlay:** Dynamic on-screen joystick and touch buttons for mobile phone players with remappable layouts.
7. **Accessibility (a11y):** Full keyboard navigation, screen reader ARIA live updates for scores and states, reduced motion support, colorblind-friendly modes.
8. **IndexedDB Auto-Save States:** Game progress, high scores, and tool inputs are automatically saved to `IndexedDB` for auto-resume upon reloading.
9. **URL Hash State Sharing:** Share game seeds, custom puzzle levels, or tool configurations via encoded URL hashes with no server required.
10. **P2P Local Multiplayer:** Manual WebRTC offer/answer connection sharing or local split-screen/same-screen touch controls for 2-player games.
11. **Export / Import User Data:** Single-click JSON backup and restore for all user high scores, bookmarks, preferences, and saved states.
12. **100% Client-Side Privacy:** Zero telemetry, zero analytics tracking, zero third-party cookies.

---

## 6. Catalog Specifications

### 6A. Game Catalog (101 Entries)

#### Arcade & Retro
1. **Coil Snake:** Classic snake with power-ups, obstacle levels, wrap-around mode toggle, skins.
2. **Maze Muncher:** Ghost AI with 4 distinct personality behaviors, power pellets, bonus items.
3. **Star Defenders:** Invader waves, destructible shields, mystery ships, boss battles every 5 levels.
4. **Brick Buster:** Multi-ball, laser paddle, indestructible bricks, level designer.
5. **Rock Drifter:** Vector space ship, thrust inertia, wraparound screen, splitting asteroid debris.
6. **Paddle Duel:** 2P local touch / AI difficulty tiers, ball spin physics.
7. **Road Hopper:** Traffic streams, river logs, countdown timer, procedural lanes.
8. **Swarm Squadron:** Space formation shooters, dive-bomb attack vectors.
9. **Barrel Climb:** Ladders, rolling barrels, hammer power-ups, multi-tier platforms.
10. **Millipede:** Segmented insect crawling down mushroom fields, bonus targets.
11. **Floppy Finch:** Tap-to-flap mechanics, day/night cycles, medal achievements.
12. **Moon Lander:** Newtonian gravity simulation, fuel management, wind vector, landing pad scoring.
13. **Sky Jumper:** Procedural platformer, jetpacks, springs, crumbling blocks.
14. **Jungle Runner:** Vines, pit traps, crocodiles, treasure pickups.
15. **Bubble Blaster:** Angle trajectory guide, ceiling bounces, color chain pops.

#### Puzzle & Logic
16. **2048:** Tile merging with undo stack, 4x4, 5x5, 6x6 grid sizes, zen mode.
17. **Blockfall:** Tetris-style polyominoes, SRS rotation rules, hold slot, ghost block, marathon/sprint/ultra.
18. **Mine Sweep:** Flagging, chording, custom mine density, hex-grid variant.
19. **Sudoku:** 6 difficulty levels, pencil mark notes, auto-solver, hint system.
20. **Nonogram:** Picross grid puzzles (5x5 up to 20x20) with hint checking.
21. **Sweet Swap:** Match-3 jewel swap, combo multipliers, target goals.
22. **Crate Push:** Sokoban block pushing, 200 included puzzles, infinite undo.
23. **Five-Letter:** Daily date-seeded word guessing game, hard mode toggle, statistics tracker.
24. **Crossword:** Interactive grid loader, hint reveal, timer.
25. **Pipe Flow:** Rotate pipe segments to form continuous fluid channels.
26. **Memory Flip:** Card matching with icons, shapes, and emojis.
27. **Slide Puzzle:** Sliding tile puzzle with custom image upload option (3x3 to 6x6).
28. **Lights Out:** Toggle grid tiles to turn off all lights, hint solver.
29. **Tower of Hanoi:** Interactive disc stacks (3–8 discs), auto-solve solver mode.
30. **Rush Hour:** Sliding vehicle traffic escape puzzle with 40 level difficulties.

#### Action / Platformer
31. **Jumpman Pip:** Precision AABB platformer, collectibles, level editor.
32. **Desert Dash:** Side-scrolling runner, jump/crouch controls, obstacles.
33. **Blitz Runner:** Fast momentum platforming with loops, ramps, and dash moves.
34. **Arena Crates:** Top-down arena shooter with wave spawns and weapon pick-ups.
35. **Lane Hopper 3D:** Three.js vehicle stream avoidance.
36. **Rhythm Dash:** One-touch jump platformer synced to audio beats.
37. **Blaster Bot:** Boss rush side-scroller with weapon switching mechanics.
38. **Jet Flyer:** Thrust jetpack navigation through obstacle tunnels.
39. **Stealth Vision:** 2D raycasted FOV vision cones, guard patrol paths, distraction mechanics.
40. **Ninja Dash:** Wall jumps, wall slides, dashes, speedrun timer.

#### Card, Board & Strategy
41. **Chess:** PGN import/export, move validation, Stockfish WASM engine option.
42. **Checkers:** 8x8 standard & 10x10 international rules, AI difficulty levels.
43. **Connect Four:** Grid drops, minimax AI engine, 3-in-a-row variants.
44. **Tic-Tac-Zero:** Standard 3x3 and Ultimate 9-board nested Tic-Tac-Toe.
45. **Klondike Solitaire:** 1-card / 3-card draw, auto-complete, move undo.
46. **Spider Solitaire:** 1, 2, or 4 suit game modes.
47. **FreeCell Solitaire:** Standard 1,000,000 deal seeds, undo history.
48. **Blackjack:** Standard 6-deck card shoe, split, double down, insurance.
49. **Video Poker:** Jacks or Better, Deuces Wild rules with payout tables.
50. **Battleship:** 10x10 tactical grid placement, AI targeting algorithms, salvo mode.
51. **Reversi / Othello:** Minimax AI with move highlighting and board evaluation.
52. **Map Conquest:** Territory map graph risk-style board game with bot players.
53. **Turret Defense:** A* pathfinding, 12 upgradeable turret types, wave spawns.

#### Sim, Clicker & Idle
54. **Cookie Forge:** Clicker game, 60 distinct upgrades, prestige multipliers.
55. **Tiny Town:** Grid zoning (Residential, Commercial, Industrial), resource balancing.
56. **Pixel Pet:** Virtual pet simulation, real-time stat decay, evolution branch tree.
57. **Park Tycoon:** Theme park visitor paths, ride pricing, park clean-up.
58. **Farm Plot:** Crop planting cycles, weather seasons, market price fluctuations.
59. **Station Ops:** Life support systems management across space station modules.
60. **Market Sim:** Geometric Brownian Motion stock market trading simulator.
61. **Eco Lab:** Genetic evolutionary creature agent grid.
62. **Ant Colony:** Emergent pheromone trail foraging simulation.

#### Physics & Ballistics
63. **Sling Beasts:** Matter.js physics catapult game, destructible block structures.
64. **Pinball:** Physics flippers, bumpers, ramps, multi-ball events.
65. **Pool Table:** 8-ball and 9-ball pocket billiards with spin/cue ball vectors.
66. **Mini Golf:** Drag-and-release aiming, 18 obstacle holes, custom hole editor.
67. **Ragdoll Play:** Jointed ragdoll physics, gravity controls, force push tools.
68. **Water Sim:** Smooth Particle Hydrodynamics (SPH) fluid simulation.
69. **Falling Sand:** Cellular automata physics sand, water, fire, plant, acid, brush tools.
70. **Orbit Sandbox:** N-body orbital gravity sandbox with pre-configured solar systems.

#### 3D (Three.js WebGL)
71. **Maze Escape 3D:** First-person 3D labyrinth, minimap overlay, seed generator.
72. **Flight Sim:** Flight simulator with terrain generation and flight HUD.
73. **Highway Racer:** 3D highway traffic dodge.
74. **Bowling 3D:** Pin physics collision, hook spin controls, interactive scorecard.
75. **Space Dogfight:** 6DOF space combat flight simulator with radar tracking.
76. **Dungeon Crawl 3D:** Grid-based 3D dungeon exploration with dynamic lighting.
77. **Cube Solve 3D:** Interactive 3x3 Rubik's cube, scramble generator, solver hints.
78. **Ping Pong 3D:** Table tennis simulation with paddle gesture tracking.
79. **Archery Range:** Wind speed vectors, arrow drop, target zoom.
80. **Drone Racer:** 3D gate race tracks, lap timers, ghost replay overlays.

#### Roguelike, RPG & Text
81. **Ascii Depths:** BSP-generated dungeons, line-of-sight FOV, turn-based combat.
82. **Zork-style Adventure:** Interactive text parser, inventory system, room navigation graph.
83. **Turn RPG:** Turn-based party RPG with turn timers and skill trees.
84. **Deck Rogue:** Deckbuilding roguelike, energy points, enemy intention indicators.
85. **Branching Story:** Interactive story branching editor and player runtime.
86. **Top-Down Quest:** Action-adventure sword swings, heart upgrades, key locks, dungeon bosses.

#### Rhythm & Audio
87. **Fret Hero:** Falling rhythmic note tracks, timing hit windows, multiplier streaks.
88. **Synth Piano:** Polyphonic synthesizer keyboard, wave selector, MIDI file export.
89. **Simon Sound:** Audio-visual sequence memory repetition.
90. **Slash Beat:** 3D rhythm block slicing using touch or mouse gestures.
91. **Drum Pad:** 4x4 audio sample drum pad with loop recorder.

#### Word & Trivia
92. **Hangman:** Category word dictionary, gallows vector art, hint support.
93. **Word Grid:** Boggle-style adjacent letter grid word finder.
94. **Math Rush:** Rapid arithmetic mental math speed challenge.
95. **Geo Quiz:** Interactive SVG world map country identification.
96. **Trivia Night:** Customizable JSON trivia deck player.

#### Experimental & Strategy
97. **Life Grid:** Conway's Game of Life + Wolfram 1D cellular automata rules.
98. **Block Stack:** Precision timing drop block stacking tower game.
99. **Epidemic Sim:** SEIR agent-based disease propagation simulator with parameter charts.
100. **Lemming Guide:** Path modification commands (dig, build, block) for walking agents.
101. **Garden vs Groaners (PvZ-Inspired Genre Clone):**
    * **Concept:** Lane-defense strategy game against advancing "Groaners" (Shambler zombies).
    * **Grid Setup:** 5 horizontal lanes, 9 vertical tiles.
    * **Defensive Units (Plants):**
      * *Sunblooms:* Generate solar currency (+25 sun periodically).
      * *Pelt-Pods:* Shoot seed projectiles down the lane at approaching Groaners.
      * *Bark Blocks:* High HP wall units blocking enemy advancement.
      * *Spike Weeds:* Damage enemies walking over ground tiles.
      * *Cherry Bombs / Flame Blooms:* Area-of-effect instant blast units.
    * **Enemy Types (Groaners):**
      * *Shambler:* Standard slow enemy.
      * *Runner:* Fast low-HP enemy.
      * *Brute:* High-HP armored enemy.
    * **Game Modes:** 20 wave campaign mode, Endless mode, Day/Night level environment variants.

---

### 6B. Tool Catalog (100+ Entries)

* **Finance (8 Tools):**
  * GST/VAT Bill & Invoice Generator (Multi-country presets, PDF export).
  * EMI & Loan Amortization Calculator (Visual principal vs interest charts via Chart.js).
  * Compound Interest Visualizer.
  * Currency Converter (Manual rates / offline storage).
  * Take-Home Salary Calculator.
  * Freelance Hourly Rate & Project Estimator.
  * Tip & Bill Splitter.
  * Local Expense Tracker (IndexedDB storage, CSV export).
* **Media & Image Tools (12 Tools):**
  * QR Code Generator & Camera Scanner.
  * Image Cropper & Resizer.
  * Image Compressor (Client-side WebAssembly Squoosh engine).
  * Image Format Converter (PNG, JPEG, WebP, AVIF).
  * Background Remover (Client-side WASM/ONNX model).
  * Color Palette Extractor from Image.
  * Image Watermark Generator.
  * EXIF Data Viewer & Metadata Stripper.
  * Favicon & Icon Pack Generator (.ZIP output).
  * SVG Optimizer (SVGO client-side).
  * Meme Generator.
  * ASCII Art Generator from images.
* **PDF Utility Tools (6 Tools):**
  * PDF Merger (Drag-and-drop page order).
  * PDF Splitter & Page Extractor.
  * PDF Page Rotator & Re-orderer.
  * Page Numbering & Watermarking Tool.
  * PDF to Image Converter.
  * Text / Markdown to PDF Converter.
* **Text & String Processing Tools (11 Tools):**
  * Character, Word, Paragraph & Reading Time Counter.
  * Case Converter (camelCase, snake_case, PascalCase, kebab-case, Title Case).
  * Side-by-Side Text Diff & Patch Utility.
  * Lorem Ipsum & Custom Placeholder Text Generator.
  * Interactive Regex Tester & Visualizer.
  * Live Markdown Editor & HTML Preview.
  * Text Deduplicator & Line Sorter.
  * ROT13 & Cipher Text Encoder/Decoder.
  * Text Reverser & String Manipulator.
  * URL Slug Generator.
  * HTML Entity Encoder/Decoder.
* **Developer & Data Tools (15 Tools):**
  * JSON Formatter, Validator & Tree Inspector.
  * Base64 Encoder/Decoder (Text & Files).
  * UUID / ULID v4 Generator.
  * JWT (JSON Web Token) Decoder & Inspector.
  * CSS Minifier & Un-minifier.
  * JavaScript / TypeScript Formatter.
  * CSS Flexbox & Grid Visual Playground.
  * Box-Shadow & CSS Border-Radius Generator.
  * Gradient Builder & CSS Code Generator.
  * HTML to Markdown Converter.
  * JSON ↔ CSV ↔ XML Data Converter.
  * URL Encoder / Decoder.
  * cURL command to JavaScript `fetch` / Python Converter.
  * SQL Query Formatter.
  * Crontab Syntax Generator & Human-Readable Explainer.
* **Security & Cryptography Tools (6 Tools):**
  * Cryptographic Hash Generator (MD5, SHA-1, SHA-256, SHA-512 via WebCrypto).
  * Secure Password Generator & Entropy Evaluator.
  * Password Strength Meter & Crack Time Estimator.
  * AES Text Encryption / Decryption Tool.
  * RSA Public/Private Keypair Generator.
  * `.htpasswd` & Basic Auth Hash Generator.
* **Audio & Video Utilities (6 Tools):**
  * Audio Trimmer & Waveform Cutter.
  * Browser Voice & Audio Recorder.
  * Sound Frequency & Tone Generator.
  * Interactive Musical Metronome.
  * Video to GIF Converter (In-Worker encoding).
  * Browser Screen & Webcam Recorder.
* **Network & Web Tools (5 Tools):**
  * User-Agent Parser & Device Inspector.
  * IPv4 / IPv6 Subnet & CIDR Calculator.
  * MAC Address Vendor Lookup.
  * HTTP Header Inspector & Analyzer.
  * Screen Resolution, Aspect Ratio & DPI Inspector.
* **Unit & Mathematical Tools (8 Tools):**
  * Number Base Converter (Binary, Octal, Decimal, Hex).
  * Unix Timestamp ↔ Human Date Converter.
  * Data Storage Unit Converter (B, KB, MB, GB, TB).
  * Length, Weight, Temperature & Volume Converter.
  * Aspect Ratio Calculator.
  * Pixel (`px`) ↔ `rem` / `em` Converter.
  * Matrix Mathematics Calculator (Determinant, Inverse, Multiply).
  * Descriptive Statistics Calculator (Mean, Median, Standard Deviation).
* **Design & Styling Tools (5 Tools):**
  * Color Code Converter (HEX, RGB, HSL, HSV, CMYK).
  * Color Contrast & WCAG Accessibility Checker.
  * Glassmorphism & Neumorphism CSS Generator.
  * SVG Background Pattern Generator.
  * CSS Animation Keyframe Builder.
* **Productivity & Utilities (10 Tools):**
  * Pomodoro Focus Timer with audio chimes.
  * Kanban Board with drag-and-drop task columns (IndexedDB).
  * Sticky Notes Board.
  * Habit Tracker with streak visualizers.
  * Precision Stopwatch & Lap Timer.
  * Sketchpad / Digital Whiteboard.
  * World Timezone Converter & Meeting Planner.
  * Decision Matrix & Priority Grid.
  * Random Choice Wheel Spinner.
  * Flashcard Deck Builder & Spaced Repetition Player.
* **Educational & Health Tools (6 Tools):**
  * BMI, BMR & Calorie Calculator.
  * Pregnancy Due Date Calculator.
  * Interactive Unit Circle & Trigonometry Visualizer.
  * Morse Code Translator & Audio Beeper.
  * Touch Typing Speed Test (WPM / Accuracy).
  * Sudoku Solver Step-by-Step Explainer.

---

## 7. Testing Strategy

Minimi implements a comprehensive multi-layered automated testing pipeline:

### 7.1 Unit Testing (Jest / Vitest / Bun)
* **Pure Game Logic (.logic.ts):** Game rules, grid states, solvers, and physics tick functions are extracted into standalone TypeScript files with pure functions.
  * *Snake:* Growth mechanics, border collisions, self-intersections.
  * *2048:* Tile slide/merge rules, random spawn positions, loss detection.
  * *Blockfall:* SRS rotation matrix, line clear evaluation, 7-bag RNG.
  * *Garden vs Groaners:* Sun economy generation, projectile collision detection, zombie HP reduction.
* **Tools Logic:**
  * *Base64 / Hashes:* Known test vectors and round-trip verification.
  * *Unit Converters:* Precision tests across 100+ unit pairs.
* **Coverage Threshold:** ≥80% code coverage required for logic layers.

### 7.2 Component Testing (Angular TestBed)
* Verify that every game and tool component mounts cleanly, handles inputs/outputs, and destroys cleanly without leaking animation frames (`requestAnimationFrame`) or timers (`setInterval`).
* Automated accessibility testing on component templates using `@axe-core/playwright` or `jasmine-axe`.

### 7.3 End-to-End (E2E) Testing (Playwright)
* **Smoke Tests:** Launch application → open command palette (`Ctrl+K`) → navigate to random games/tools → assert rendering without console errors.
* **Mobile Touch Pass:** Emulate mobile devices (iPhone 14, Pixel 7) in Playwright to simulate virtual controller touches and swipe gestures.
* **PWA Offline Reload Pass:** Load app → disallow network connection → reload page → confirm app loads successfully from cache.

### 7.4 CI Performance Budgets
* Initial Home Bundle size budget: ≤ 180 KB gzipped.
* Individual lazy-loaded Game/Tool bundle chunk budget: ≤ 400 KB gzipped.
* Lighthouse Audits: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO ≥ 95.

---

## 8. GitHub Pages Deployment Strategy & Automation

To meet the core requirement: **"when new changes build the app should build and push static pages to a repo called online"**, Minimi uses an automated GitHub Actions deployment workflow alongside a standalone shell deployment script.

### 8.1 GitHub Actions Workflow File (`.github/workflows/deploy.yml`)

```yaml
name: Build and Deploy to Online Repository

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Bun Environment
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies with Bun
        run: bun install

      - name: Run Tests with Bun / Angular CLI
        run: bun run test -- --watch=false --browsers=ChromeHeadless

      - name: Build Angular Static Application with Bun
        run: bun run build -- --configuration production --base-href "/online/"

      - name: Deploy Static Build to 'online' Repository
        env:
          GH_PAT: ${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}
          TARGET_REPO: ${{ github.repository_owner }}/online
        run: |
          cd dist/minimi/browser || cd dist/minimi
          git init
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "deploy: automated static build from ${GITHUB_SHA::8}"
          git branch -M main
          git push -f https://x-access-token:${GH_PAT}@github.com/${TARGET_REPO}.git main:gh-pages
```

### 8.2 Standalone Deployment Shell Script (`scripts/deploy.sh`)

```bash
#!/usr/bin/env bash
set -e

# Detect Bun or fallback to npm/npx
if command -v bun >/dev/null 2>&1; then
  RUNNER="bun"
  EXEC="bunx"
elif [ -f "$HOME/.bun/bin/bun" ]; then
  RUNNER="$HOME/.bun/bin/bun"
  EXEC="$HOME/.bun/bin/bunx"
else
  RUNNER="npm run"
  EXEC="npx"
fi

echo "=== Building Minimi for Production using $RUNNER ==="
$RUNNER build -- --configuration production --base-href "/online/"

DIST_DIR="dist/minimi/browser"
if [ ! -d "$DIST_DIR" ]; then
  DIST_DIR="dist/minimi"
fi

echo "=== Deploying static pages to target repo 'online' ==="
cd "$DIST_DIR"

# Create .nojekyll to bypass GitHub Pages Jekyll processing
touch .nojekyll

git init
git config user.name "Minimi Deployer"
git config user.email "deployer@minimi.local"
git add -A
git commit -m "deploy: static build $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
git branch -M main

# Pushing to the remote 'online' repository (gh-pages branch)
TARGET_REPO_URL="${1:-git@github.com:areyouroot/online.git}"
echo "Pushing to $TARGET_REPO_URL..."
git push -f "$TARGET_REPO_URL" main:gh-pages

echo "=== Deployment to 'online' repository complete! ==="
```

---

## 9. Development Roadmap

1. **Phase 1: Project Bootstrap & Shell Architecture**
   * Angular 18 project initialization with Tailwind CSS, Angular CDK, and PWA configuration.
   * Central metadata registry pattern implementation.
   * Responsive navigation shell (Desktop left rail, mobile bottom navigation bar, command palette modal).
   * GitHub Actions workflow (`.github/workflows/deploy.yml`) setup targeting the `online` repository.
2. **Phase 2: Core Games & Mobile Touch Infrastructure**
   * Implement virtual touch joystick / touch button overlay directives for mobile compatibility.
   * Develop flagship arcade & puzzle games (Coil Snake, Maze Muncher, Blockfall, 2048, Five-Letter).
   * Develop **Garden vs Groaners** (PvZ genre clone with 5 lanes, Sunblooms, Pelt-Pods, Bark Blocks, Shamblers).
3. **Phase 3: Core Tools Implementation**
   * Finance, Media, PDF, Text, Dev/Data, Crypto, and Unit tools.
   * Client-side Web Workers for heavy processing (squoosh WASM, PDF merging, regex).
4. **Phase 4: 3D WebGL Games & Advanced Physics**
   * Three.js 3D games (Maze Escape 3D, Cube Solve 3D, Bowling 3D).
   * Matter.js physics engine integration (Sling Beasts, Falling Sand).
5. **Phase 5: Full Catalog Completion & P2P Features**
   * Complete remainder of 101 games and 100+ tools.
   * IndexedDB state persistence and offline Service Worker caching.
6. **Phase 6: Quality Assurance, Accessibility & Release**
   * Lighthouse performance optimization (all scores ≥ 90-100).
   * Mobile device testing pass across iOS Safari and Android Chrome.
   * Release v1.0 and automated static deployment to the `online` GitHub repository.
