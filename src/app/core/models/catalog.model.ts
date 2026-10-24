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
