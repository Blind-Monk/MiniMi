export interface CarData {
  id: string;
  name: string;
  class: 'Class A (Exotics)' | 'Class B (Muscle & GT)' | 'Class C (Sports)' | 'Bonus / Secret';
  classKey: 'A' | 'B' | 'C' | 'Bonus';
  topSpeedMph: number;
  accel060: number; // seconds
  horsepower: number;
  torque: string;
  weightLbs: number;
  engine: string;
  transmission: string;
  primaryColor: string;
  secondaryColor: string;
  handlingScore: number; // 1-10
  topSpeedKmH: number;
  accelRate: number;
  maxSteer: number;
  isSecret?: boolean;
  isUnlocked?: boolean;
  specsNarrative: string;
  historyNarrative: string;
}

export interface TrackData {
  id: string;
  name: string;
  type: 'Point-to-Point' | 'Circuit';
  scenery: 'city' | 'coastal' | 'alpine' | 'desert' | 'forest' | 'canyon' | 'industrial' | 'vegas';
  lengthKm: number;
  defaultTimeOfDay: 'Morning' | 'Midday' | 'Evening';
  hasTrafficByDefault: boolean;
  hasPoliceByDefault: boolean;
  isExclusiveSE?: boolean;
  isSecretBonus?: boolean;
  isUnlocked?: boolean;
  description: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  roadColor: number;
  ambientLight: number;
  sunPosition: [number, number, number];
  points: { x: number; z: number; y: number }[];
}

export const CAR_ROSTER: CarData[] = [
  // CLASS A - EXOTICS
  {
    id: 'diablo',
    name: 'Lamborghini Diablo VT',
    class: 'Class A (Exotics)',
    classKey: 'A',
    topSpeedMph: 202,
    accel060: 4.1,
    horsepower: 492,
    torque: '428 lb-ft @ 5200 rpm',
    weightLbs: 3583,
    engine: '5.7L Naturally Aspirated V12',
    transmission: '5-Speed Manual All-Wheel Drive',
    primaryColor: '#eab308', // Yellow
    secondaryColor: '#1e293b',
    handlingScore: 9,
    topSpeedKmH: 325,
    accelRate: 0.028,
    maxSteer: 0.042,
    specsNarrative: 'The Diablo VT pairs a ferocious 5.7-liter mid-mounted V12 engine with viscous traction all-wheel drive, launching from 0 to 60 mph in 4.1 seconds.',
    historyNarrative: 'Designed by Marcello Gandini and refined by Chrysler design team, the Diablo succeeded the legendary Countach as Lamborghini flagship supercar in 1990.'
  },
  {
    id: 'ferrari512',
    name: 'Ferrari 512 TR',
    class: 'Class A (Exotics)',
    classKey: 'A',
    topSpeedMph: 195,
    accel060: 4.7,
    horsepower: 428,
    torque: '362 lb-ft @ 5500 rpm',
    weightLbs: 3241,
    engine: '4.9L Flat-12 (180° V12)',
    transmission: '5-Speed Manual Gated Shifter',
    primaryColor: '#dc2626', // Rosso Corsa Red
    secondaryColor: '#0f172a',
    handlingScore: 8.8,
    topSpeedKmH: 314,
    accelRate: 0.026,
    maxSteer: 0.044,
    specsNarrative: 'An evolution of the Testarossa, the 512 TR features a lower engine placement, improved chassis rigidity, and a high-revving 428 hp flat-12 engine.',
    historyNarrative: 'Debuted in 1991, the 512 TR carried the iconic side strakes into the 1990s with improved ergonomics and blistering track performance.'
  },

  // CLASS B - MUSCLE & GT
  {
    id: 'porsche911',
    name: 'Porsche 911 Carrera (993)',
    class: 'Class B (Muscle & GT)',
    classKey: 'B',
    topSpeedMph: 168,
    accel060: 5.2,
    horsepower: 270,
    torque: '243 lb-ft @ 5000 rpm',
    weightLbs: 3020,
    engine: '3.6L Air-Cooled Flat-6',
    transmission: '6-Speed Manual Rear-Wheel Drive',
    primaryColor: '#e0e7ff', // Silver/White
    secondaryColor: '#1e1b4b',
    handlingScore: 9.5,
    topSpeedKmH: 270,
    accelRate: 0.023,
    maxSteer: 0.048,
    specsNarrative: 'The 993 generation represents the pinnacle of air-cooled Porsche engineering, boasting precise multi-link rear suspension and iconic rear-engine balance.',
    historyNarrative: 'Introduced for 1994, the 993 was the last air-cooled 911, making it one of the most revered sports cars in automotive history.'
  },
  {
    id: 'corvette',
    name: 'Chevrolet Corvette ZR-1',
    class: 'Class B (Muscle & GT)',
    classKey: 'B',
    topSpeedMph: 179,
    accel060: 4.4,
    horsepower: 405,
    torque: '385 lb-ft @ 5200 rpm',
    weightLbs: 3465,
    engine: '5.7L LT5 DOHC 32V V8',
    transmission: '6-Speed Manual',
    primaryColor: '#2563eb', // Imperial Blue
    secondaryColor: '#f8fafc',
    handlingScore: 8.2,
    topSpeedKmH: 288,
    accelRate: 0.024,
    maxSteer: 0.041,
    specsNarrative: 'Nicknamed "King of the Hill", the ZR-1 features an aluminum 32-valve DOHC LT5 V8 co-developed with Lotus, capable of sustained high-speed endurance.',
    historyNarrative: 'The C4 ZR-1 shattered world endurance records in 1990, driving over 4,200 miles at an average speed above 175 mph.'
  },
  {
    id: 'viper',
    name: 'Dodge Viper RT/10',
    class: 'Class B (Muscle & GT)',
    classKey: 'B',
    topSpeedMph: 165,
    accel060: 4.5,
    horsepower: 400,
    torque: '465 lb-ft @ 3600 rpm',
    weightLbs: 3290,
    engine: '8.0L Odd-Firing V10',
    transmission: '6-Speed Heavy Duty Manual',
    primaryColor: '#16a34a', // Emerald Green
    secondaryColor: '#ffffff',
    handlingScore: 8.0,
    topSpeedKmH: 266,
    accelRate: 0.025,
    maxSteer: 0.040,
    specsNarrative: 'A raw, uncompromising roadster powered by a massive 8.0-liter V10 engine delivering immense low-end torque with no electronic driver aids.',
    historyNarrative: 'Inspired by the Shelby Cobra, Dodge released the Viper RT/10 in 1992 as a brutal homage to pure American mechanical muscle.'
  },

  // CLASS C - SPORTS
  {
    id: 'nsx',
    name: 'Acura NSX',
    class: 'Class C (Sports)',
    classKey: 'C',
    topSpeedMph: 168,
    accel060: 5.7,
    horsepower: 270,
    torque: '210 lb-ft @ 5400 rpm',
    weightLbs: 3010,
    engine: '3.0L VTEC DOHC V6',
    transmission: '5-Speed Manual Mid-Engine',
    primaryColor: '#ef4444', // Championship Red
    secondaryColor: '#000000',
    handlingScore: 9.8,
    topSpeedKmH: 270,
    accelRate: 0.021,
    maxSteer: 0.050,
    specsNarrative: 'Built with an all-aluminum monocoque chassis and tuned with input from F1 legend Ayrton Senna, the NSX redefined supercar daily usability.',
    historyNarrative: 'Honda launched the NSX in 1990 to prove that world-class mid-engine performance could be combined with rock-solid Japanese reliability.'
  },
  {
    id: 'supra',
    name: 'Toyota Supra Turbo (A80)',
    class: 'Class C (Sports)',
    classKey: 'C',
    topSpeedMph: 155,
    accel060: 4.9,
    horsepower: 320,
    torque: '315 lb-ft @ 4000 rpm',
    weightLbs: 3450,
    engine: '3.0L Sequential Twin-Turbo 2JZ-GTE Inline-6',
    transmission: '6-Speed Getrag Manual',
    primaryColor: '#9333ea', // Deep Purple / Black
    secondaryColor: '#e2e8f0',
    handlingScore: 8.6,
    topSpeedKmH: 250,
    accelRate: 0.022,
    maxSteer: 0.045,
    specsNarrative: 'Powered by the iconic 2JZ-GTE sequential twin-turbo engine, the A80 Supra features active front spoilers and legendary tuning potential.',
    historyNarrative: 'Released in 1993, the fourth-generation Supra became a tuner icon and Japanese sports car benchmark.'
  },
  {
    id: 'rx7',
    name: 'Mazda RX-7 Twin-Turbo (FD3S)',
    class: 'Class C (Sports)',
    classKey: 'C',
    topSpeedMph: 156,
    accel060: 5.1,
    horsepower: 255,
    torque: '217 lb-ft @ 5000 rpm',
    weightLbs: 2800,
    engine: '1.3L 13B-REW Sequential Twin-Turbo Rotary',
    transmission: '5-Speed Manual',
    primaryColor: '#f97316', // Competition Orange
    secondaryColor: '#1e293b',
    handlingScore: 9.7,
    topSpeedKmH: 251,
    accelRate: 0.021,
    maxSteer: 0.052,
    specsNarrative: 'Featuring a lightweight rotary engine placed far behind the front axle, the FD RX-7 achieves a perfect 50:50 weight distribution.',
    historyNarrative: 'The FD generation RX-7 won multiple Car of the Year awards upon its 1992 launch for its organic styling and telepathic handling response.'
  },

  // BONUS / SECRET
  {
    id: 'warrior',
    name: 'Warrior Jet-Car (NFS SE Special)',
    class: 'Bonus / Secret',
    classKey: 'Bonus',
    topSpeedMph: 260,
    accel060: 2.1,
    horsepower: 1200,
    torque: '950 lb-ft @ 9000 rpm',
    weightLbs: 2100,
    engine: 'Twin-Turbine Jet Hybrid',
    transmission: 'Single-Speed Direct Drive',
    primaryColor: '#06b6d4', // Neon Cyan
    secondaryColor: '#f43f5e', // Hot Pink
    handlingScore: 10,
    topSpeedKmH: 420,
    accelRate: 0.045,
    maxSteer: 0.058,
    isSecret: true,
    isUnlocked: false,
    specsNarrative: 'A fictional, ultra-fast futuristic jet-car featuring rocket thrust acceleration and anti-gravity downforce physics.',
    historyNarrative: 'The secret reward vehicle in Need for Speed SE, unlocked via tournament victory or the special secret console cheat.'
  }
];

export const TRACK_ROSTER: TrackData[] = [
  // POINT-TO-POINT TRACKS
  {
    id: 'city',
    name: 'City Highway',
    type: 'Point-to-Point',
    scenery: 'city',
    lengthKm: 14.2,
    defaultTimeOfDay: 'Evening',
    hasTrafficByDefault: true,
    hasPoliceByDefault: true,
    description: 'Urban freeway sprint featuring underground tunnels, elevated overpasses, dense civilian traffic, and active police checkpoints.',
    skyColor: 0x0f172a,
    fogColor: 0x1e293b,
    groundColor: 0x334155,
    roadColor: 0x1e293b,
    ambientLight: 0.6,
    sunPosition: [20, 40, -50],
    points: createCityPath()
  },
  {
    id: 'coastal',
    name: 'Coastal Highway',
    type: 'Point-to-Point',
    scenery: 'coastal',
    lengthKm: 15.8,
    defaultTimeOfDay: 'Morning',
    hasTrafficByDefault: true,
    hasPoliceByDefault: true,
    description: 'Scenic Pacific oceanfront highway with sweeping cliffside curves, sandy beaches, seaside bridges, and morning sea breeze.',
    skyColor: 0x38bdf8,
    fogColor: 0x7dd3fc,
    groundColor: 0x0284c7,
    roadColor: 0x334155,
    ambientLight: 0.9,
    sunPosition: [80, 100, 50],
    points: createCoastalPath()
  },
  {
    id: 'alpine',
    name: 'Alpine Run',
    type: 'Point-to-Point',
    scenery: 'alpine',
    lengthKm: 16.5,
    defaultTimeOfDay: 'Midday',
    hasTrafficByDefault: true,
    hasPoliceByDefault: true,
    description: 'Snow-capped mountain pass with winding steep ascents, icy road turns, timber bridges, and dramatic drop-offs.',
    skyColor: 0x93c5fd,
    fogColor: 0xe0f2fe,
    groundColor: 0x3a5a40,
    roadColor: 0x475569,
    ambientLight: 0.85,
    sunPosition: [50, 120, 30],
    points: createAlpinePath()
  },

  // CIRCUIT TRACKS
  {
    id: 'rusty-springs',
    name: 'Rusty Springs',
    type: 'Circuit',
    scenery: 'desert',
    lengthKm: 3.8,
    defaultTimeOfDay: 'Midday',
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'High-speed desert oval circuit surrounded by red rock canyons, cacti, and dusty desert flats.',
    skyColor: 0xfde047,
    fogColor: 0xfef08a,
    groundColor: 0xb45309,
    roadColor: 0x292524,
    ambientLight: 1.0,
    sunPosition: [100, 150, 20],
    points: createOvalPath(120, 70)
  },
  {
    id: 'autumn-valley',
    name: 'Autumn Valley',
    type: 'Circuit',
    scenery: 'forest',
    lengthKm: 5.2,
    defaultTimeOfDay: 'Morning',
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'Scenic forested circuit winding through golden autumn foliage, wooden bridges, and flowing riverbanks.',
    skyColor: 0xfdba74,
    fogColor: 0xffedd5,
    groundColor: 0x78350f,
    roadColor: 0x334155,
    ambientLight: 0.85,
    sunPosition: [60, 80, -40],
    points: createFigure8Path(100, 60)
  },
  {
    id: 'vertigo-ridge',
    name: 'Vertigo Ridge',
    type: 'Circuit',
    scenery: 'canyon',
    lengthKm: 6.4,
    defaultTimeOfDay: 'Evening',
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'Mountainous terrain with dramatic elevation changes, hairpin mountain turns, and sunset canyon vistas.',
    skyColor: 0xf43f5e,
    fogColor: 0xfbe2e8,
    groundColor: 0x881337,
    roadColor: 0x1c1917,
    ambientLight: 0.7,
    sunPosition: [-100, 40, -80],
    points: createMountainCircuitPath()
  },
  {
    id: 'transtropolis',
    name: 'Transtropolis (SE Exclusive)',
    type: 'Circuit',
    scenery: 'industrial',
    lengthKm: 7.1,
    defaultTimeOfDay: 'Evening',
    isExclusiveSE: true,
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'NFS Special Edition exclusive industrial grid filled with complex 90-degree turns, power plants, and rail line crossings.',
    skyColor: 0x334155,
    fogColor: 0x475569,
    groundColor: 0x0f172a,
    roadColor: 0x1e293b,
    ambientLight: 0.65,
    sunPosition: [30, 60, 60],
    points: createIndustrialPath()
  },
  {
    id: 'burnt-sienna',
    name: 'Burnt Sienna (SE Exclusive)',
    type: 'Circuit',
    scenery: 'desert',
    lengthKm: 6.8,
    defaultTimeOfDay: 'Midday',
    isExclusiveSE: true,
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'NFS Special Edition exclusive canyon race featuring dirt segments, old mining structures, and dusty chicanes.',
    skyColor: 0xf97316,
    fogColor: 0xffedd5,
    groundColor: 0x9a3412,
    roadColor: 0x78350f,
    ambientLight: 0.95,
    sunPosition: [90, 110, -30],
    points: createCanyonPath()
  },

  // BONUS UNLOCKABLE TRACK
  {
    id: 'lost-vegas',
    name: 'Lost Vegas (Secret Bonus Track)',
    type: 'Circuit',
    scenery: 'vegas',
    lengthKm: 8.5,
    defaultTimeOfDay: 'Evening',
    isSecretBonus: true,
    isUnlocked: false,
    hasTrafficByDefault: false,
    hasPoliceByDefault: true,
    description: 'Neon-lit strip racing loop past dazzling casinos, glowing billboards, and palm trees unlocked by winning the Tournament.',
    skyColor: 0x09090b,
    fogColor: 0x18181b,
    groundColor: 0x09090b,
    roadColor: 0x18181b,
    ambientLight: 0.8,
    sunPosition: [0, 50, 100],
    points: createVegasStripPath()
  }
];

// Helper Functions to generate path control points for tracks
function createCityPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const z = -200 + t * 400;
    const x = Math.sin(t * Math.PI * 4) * 40 + Math.cos(t * Math.PI * 2) * 20;
    const y = (i > 20 && i < 35) ? -5 : 0; // tunnel segment
    pts.push({ x, z, y });
  }
  return pts;
}

function createCoastalPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const z = -220 + t * 440;
    const x = Math.cos(t * Math.PI * 3) * 60 + Math.sin(t * Math.PI * 6) * 15;
    const y = Math.sin(t * Math.PI * 2) * 8;
    pts.push({ x, z, y });
  }
  return pts;
}

function createAlpinePath(): { x: number; z: number; y: number }[] {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const z = -250 + t * 500;
    const x = Math.sin(t * Math.PI * 5) * 50;
    const y = Math.sin(t * Math.PI) * 25; // mountain crest
    pts.push({ x, z, y });
  }
  return pts;
}

function createOvalPath(rx: number, rz: number): { x: number; z: number; y: number }[] {
  const pts = [];
  const total = 40;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    pts.push({
      x: Math.cos(angle) * rx,
      z: Math.sin(angle) * rz,
      y: 0
    });
  }
  return pts;
}

function createFigure8Path(rx: number, rz: number): { x: number; z: number; y: number }[] {
  const pts = [];
  const total = 50;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 2;
    const scale = 2 / (3 - Math.cos(2 * t));
    const x = rx * scale * Math.cos(t);
    const z = rz * scale * Math.sin(2 * t) / 2;
    pts.push({ x, z, y: 0 });
  }
  return pts;
}

function createMountainCircuitPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  const total = 50;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const r = 80 + Math.sin(angle * 3) * 25;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.sin(angle * 2) * 12;
    pts.push({ x, z, y });
  }
  return pts;
}

function createIndustrialPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  const grid = [
    { x: -70, z: -70 },
    { x: 70, z: -70 },
    { x: 70, z: 0 },
    { x: 20, z: 0 },
    { x: 20, z: 70 },
    { x: -70, z: 70 }
  ];
  for (let i = 0; i < grid.length; i++) {
    const curr = grid[i];
    const next = grid[(i + 1) % grid.length];
    for (let s = 0; s < 10; s++) {
      const t = s / 10;
      pts.push({
        x: curr.x + (next.x - curr.x) * t,
        z: curr.z + (next.z - curr.z) * t,
        y: 0
      });
    }
  }
  return pts;
}

function createCanyonPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  const total = 50;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const r = 90 + Math.cos(angle * 4) * 20;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = (i > 15 && i < 30) ? -4 : 0;
    pts.push({ x, z, y });
  }
  return pts;
}

function createVegasStripPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  const total = 50;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const rx = 110;
    const rz = 55;
    const x = Math.sin(angle) * rx;
    const z = Math.cos(angle) * rz;
    pts.push({ x, z, y: 0 });
  }
  return pts;
}
