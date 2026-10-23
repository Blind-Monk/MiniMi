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
  scenery: 'city' | 'coastal' | 'alpine' | 'desert' | 'forest' | 'canyon' | 'industrial' | 'vegas' | 'mystic' | 'outback';
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
  // CLASS A - EXOTICS (NFS II SE & NFS I SE)
  {
    id: 'mclaren-f1',
    name: 'McLaren F1 (NFS II SE Flagship)',
    class: 'Class A (Exotics)',
    classKey: 'A',
    topSpeedMph: 240,
    accel060: 3.2,
    horsepower: 627,
    torque: '479 lb-ft @ 5600 rpm',
    weightLbs: 2509,
    engine: '6.1L BMW S70/2 Naturally Aspirated V12',
    transmission: '6-Speed Manual Central Driver Seat',
    primaryColor: '#f97316', // Papaya Orange
    secondaryColor: '#09090b',
    handlingScore: 9.9,
    topSpeedKmH: 386,
    accelRate: 0.038,
    maxSteer: 0.052,
    specsNarrative: 'The crown jewel supercar of Need for Speed II SE. Gold-lined engine bay, central driving position, and a top speed of 240 mph.',
    historyNarrative: 'Designed by Gordon Murray, the McLaren F1 stood for over a decade as the world fastest production car and the ultimate dream car of NFS II SE.'
  },
  {
    id: 'ferrari-f50',
    name: 'Ferrari F50',
    class: 'Class A (Exotics)',
    classKey: 'A',
    topSpeedMph: 202,
    accel060: 3.7,
    horsepower: 513,
    torque: '347 lb-ft @ 6500 rpm',
    weightLbs: 2712,
    engine: '4.7L F1-Derived Naturally Aspirated V12',
    transmission: '6-Speed Manual Gated Shifter',
    primaryColor: '#dc2626', // Rosso Corsa
    secondaryColor: '#0f172a',
    handlingScore: 9.6,
    topSpeedKmH: 325,
    accelRate: 0.032,
    maxSteer: 0.048,
    specsNarrative: 'Built to celebrate Ferrari 50th anniversary, the F50 packs a formula 1 derived 4.7-liter V12 bolted directly to a carbon fiber chassis.',
    historyNarrative: 'Unveiled in 1995, the F50 brought raw Formula 1 racing technology to public highways, immortalized in Need for Speed II.'
  },
  {
    id: 'diablo',
    name: 'Lamborghini Diablo VT / SV',
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
    handlingScore: 9.0,
    topSpeedKmH: 325,
    accelRate: 0.028,
    maxSteer: 0.042,
    specsNarrative: 'The Diablo VT pairs a ferocious 5.7-liter mid-mounted V12 engine with viscous traction all-wheel drive, launching from 0 to 60 mph in 4.1 seconds.',
    historyNarrative: 'Designed by Marcello Gandini and refined by Chrysler design team, the Diablo succeeded the legendary Countach as Lamborghini flagship supercar in 1990.'
  },
  {
    id: 'ford-gt90',
    name: 'Ford GT90 Concept',
    class: 'Class A (Exotics)',
    classKey: 'A',
    topSpeedMph: 253,
    accel060: 3.1,
    horsepower: 720,
    torque: '660 lb-ft @ 4000 rpm',
    weightLbs: 3197,
    engine: '6.0L Quad-Turbocharged V12',
    transmission: '5-Speed Manual',
    primaryColor: '#f8fafc', // Bright White
    secondaryColor: '#2563eb', // Blue Accents
    handlingScore: 9.2,
    topSpeedKmH: 407,
    accelRate: 0.040,
    maxSteer: 0.044,
    specsNarrative: 'The world mightiest concept car featured in NFS II SE, boasting a quad-turbo 720 HP V12 engine and ceramic exhaust heat shields.',
    historyNarrative: 'Built in 1995 as a modern successor to the GT40, the GT90 debuted Ford New Edge design philosophy and supercar power.'
  },

  // CLASS B - MUSCLE & GT
  {
    id: 'jaguar-xj220',
    name: 'Jaguar XJ220',
    class: 'Class B (Muscle & GT)',
    classKey: 'B',
    topSpeedMph: 217,
    accel060: 3.6,
    horsepower: 542,
    torque: '475 lb-ft @ 4500 rpm',
    weightLbs: 3241,
    engine: '3.5L Twin-Turbocharged V6',
    transmission: '5-Speed Manual Rear-Wheel Drive',
    primaryColor: '#0d9488', // British Racing Teal
    secondaryColor: '#ffffff',
    handlingScore: 8.8,
    topSpeedKmH: 349,
    accelRate: 0.030,
    maxSteer: 0.043,
    specsNarrative: 'A sleek aluminum supercar capable of 217 mph, powered by a twin-turbocharged group B race-derived V6 engine.',
    historyNarrative: 'Held the Nürburgring production car lap record for 8 years and starred in Need for Speed II SE.'
  },
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
    primaryColor: '#e0e7ff',
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
    primaryColor: '#2563eb',
    secondaryColor: '#f8fafc',
    handlingScore: 8.2,
    topSpeedKmH: 288,
    accelRate: 0.024,
    maxSteer: 0.041,
    specsNarrative: 'Nicknamed "King of the Hill", the ZR-1 features an aluminum 32-valve DOHC LT5 V8 co-developed with Lotus, capable of sustained high-speed endurance.',
    historyNarrative: 'The C4 ZR-1 shattered world endurance records in 1990, driving over 4,200 miles at an average speed above 175 mph.'
  },

  // CLASS C - SPORTS
  {
    id: 'lotus-esprit',
    name: 'Lotus Esprit V8',
    class: 'Class C (Sports)',
    classKey: 'C',
    topSpeedMph: 175,
    accel060: 4.4,
    horsepower: 350,
    torque: '295 lb-ft @ 4250 rpm',
    weightLbs: 3042,
    engine: '3.5L Twin-Turbocharged V8',
    transmission: '5-Speed Manual Mid-Engine',
    primaryColor: '#16a34a', // Lotus Green
    secondaryColor: '#eab308',
    handlingScore: 9.7,
    topSpeedKmH: 282,
    accelRate: 0.026,
    maxSteer: 0.051,
    specsNarrative: 'Lightweight fiberglass wedge body shell paired with Lotus custom twin-turbo V8 engine for telepathic track agility.',
    historyNarrative: 'A fan favorite in Need for Speed II, combining British handling precision with twin-turbo V8 muscle.'
  },
  {
    id: 'nsx',
    name: 'Acura / Honda NSX',
    class: 'Class C (Sports)',
    classKey: 'C',
    topSpeedMph: 168,
    accel060: 5.7,
    horsepower: 270,
    torque: '210 lb-ft @ 5400 rpm',
    weightLbs: 3010,
    engine: '3.0L VTEC DOHC V6',
    transmission: '5-Speed Manual Mid-Engine',
    primaryColor: '#ef4444',
    secondaryColor: '#000000',
    handlingScore: 9.8,
    topSpeedKmH: 270,
    accelRate: 0.021,
    maxSteer: 0.050,
    specsNarrative: 'Built with an all-aluminum monocoque chassis and tuned with input from F1 legend Ayrton Senna, the NSX redefined supercar daily usability.',
    historyNarrative: 'Honda launched the NSX in 1990 to prove that world-class mid-engine performance could be combined with rock-solid Japanese reliability.'
  },

  // BONUS / SECRET
  {
    id: 'fzr2000',
    name: 'FZR 2000 (NFS II SE Secret)',
    class: 'Bonus / Secret',
    classKey: 'Bonus',
    topSpeedMph: 250,
    accel060: 2.2,
    horsepower: 1000,
    torque: '850 lb-ft @ 8000 rpm',
    weightLbs: 2200,
    engine: 'Quad-Rotor Turbo Hybrid',
    transmission: 'Single-Speed Direct Drive',
    primaryColor: '#8b5cf6', // Electric Purple
    secondaryColor: '#f43f5e',
    handlingScore: 10,
    topSpeedKmH: 402,
    accelRate: 0.042,
    maxSteer: 0.056,
    isSecret: true,
    isUnlocked: false,
    specsNarrative: 'The iconic secret bonus vehicle in Need for Speed II SE, boasting extreme top speed and razor-sharp grip.',
    historyNarrative: 'Unlocked via tournament victory or the secret cheat code "FZR2000" in Need for Speed II Special Edition.'
  },
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
    primaryColor: '#06b6d4',
    secondaryColor: '#f43f5e',
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
    name: 'Coastal Highway / Pacific Spirit',
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
    id: 'mystic-peaks',
    name: 'Mystic Peaks (NFS II SE)',
    type: 'Circuit',
    scenery: 'mystic',
    lengthKm: 7.8,
    defaultTimeOfDay: 'Evening',
    isExclusiveSE: true,
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'Icy snow-capped mountain circuit from NFS II SE featuring high-speed icy turns and mountain avalanches.',
    skyColor: 0x38bdf8,
    fogColor: 0xe0f2fe,
    groundColor: 0xf1f5f9,
    roadColor: 0x475569,
    ambientLight: 0.85,
    sunPosition: [40, 100, 20],
    points: createAlpinePath()
  },

  // CIRCUIT TRACKS
  {
    id: 'proving-grounds',
    name: 'Proving Grounds (NFS II SE Oval)',
    type: 'Circuit',
    scenery: 'desert',
    lengthKm: 3.8,
    defaultTimeOfDay: 'Midday',
    hasTrafficByDefault: false,
    hasPoliceByDefault: false,
    description: 'High-speed banked test track oval designed for maximum top speed trials in NFS II SE.',
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
    name: 'Autumn Valley / North Country',
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
    id: 'transtropolis',
    name: 'Transtropolis / Monolithic Studios',
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

  // BONUS UNLOCKABLE TRACK
  {
    id: 'lost-vegas',
    name: 'Lost Vegas / Last Resort (Secret Bonus)',
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

function createCityPath(): { x: number; z: number; y: number }[] {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const z = -200 + t * 400;
    const x = Math.sin(t * Math.PI * 4) * 40 + Math.cos(t * Math.PI * 2) * 20;
    const y = (i > 20 && i < 35) ? -5 : 0;
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
    const y = Math.sin(t * Math.PI) * 25;
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
