import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';
import { CAR_ROSTER, TRACK_ROSTER, CarData, TrackData } from './turbo-speed-data';
import { TurboSpeedAudioEngine } from './turbo-speed-audio';

interface PlayerConfig {
  id: number;
  name: string;
  color: string;
  active: boolean;
  useGamepad: boolean;
  gamepadIndex: number;
  keys: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
}

interface CarState {
  x: number;
  z: number;
  y: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  steer: number;
  gear: number;
  lap: number;
  checkpoint: number;
  mesh: THREE.Group;
  color: string;
  isAI: boolean;
  isCop?: boolean;
  isTraffic?: boolean;
  headlights?: THREE.SpotLight[];
  data: CarData;
}

@Component({
  selector: 'app-turbo-speed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turbo-speed.component.html',
  styleUrl: './turbo-speed.component.css'
})
export class TurboSpeedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('showcaseCanvas') showcaseCanvasRef?: ElementRef<HTMLCanvasElement>;

  // Game UI State Signals
  activeView = signal<'main-menu' | 'showcase' | 'race-setup' | 'racing' | 'tournament-standings' | 'cheat-modal'>('main-menu');
  selectedCarIndex = signal<number>(0);
  selectedTrackIndex = signal<number>(0);
  selectedClassFilter = signal<string>('All Classes');
  gameMode = signal<'single' | 'head-to-head' | 'timetrial' | 'tournament'>('single');
  timeOfDay = signal<'Morning' | 'Midday' | 'Evening'>('Midday');
  trafficEnabled = signal<boolean>(true);
  copPursuitEnabled = signal<boolean>(true);
  cameraMode = signal<'chase' | 'close' | 'hood' | 'dashboard'>('chase');
  playerCount = signal<number>(1);
  raceWinner = signal<string | null>(null);
  showKeyModal = signal<boolean>(false);
  showcaseInterior = signal<boolean>(false);
  showIntroModal = signal<boolean>(false);

  // In-Race HUD Telemetry Signals
  countdownText = signal<string>('');
  radarDistance = signal<number>(0);
  policeChatterText = signal<string>('');

  // Tournament State
  tournamentPoints = signal<{ [carId: string]: number }>({});
  tournamentRound = signal<number>(1);

  // Cheat State
  cheatInput = signal<string>('');
  cheatMessage = signal<string>('');

  // Audio Engine
  audioEngine = new TurboSpeedAudioEngine();
  isMuted = signal<boolean>(false);

  // Roster lists
  carRoster = CAR_ROSTER;
  trackRoster = TRACK_ROSTER;

  playerConfigs: PlayerConfig[] = [
    { id: 0, name: 'P1 Racer', color: '#ef4444', active: true, useGamepad: false, gamepadIndex: 0, keys: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' } },
    { id: 1, name: 'P2 Racer', color: '#3b82f6', active: false, useGamepad: false, gamepadIndex: 1, keys: { up: 'w', down: 's', left: 'a', right: 'd' } },
    { id: 2, name: 'P3 Racer', color: '#eab308', active: false, useGamepad: false, gamepadIndex: 2, keys: { up: 'i', down: 'k', left: 'j', right: 'l' } },
    { id: 3, name: 'P4 Racer', color: '#22c55e', active: false, useGamepad: false, gamepadIndex: 3, keys: { up: '8', down: '5', left: '4', right: '6' } }
  ];

  cars: CarState[] = [];
  trafficCars: CarState[] = [];
  copCars: CarState[] = [];

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number = 0;
  private activeKeys = new Set<string>();

  private showcaseScene?: THREE.Scene;
  private showcaseRenderer?: THREE.WebGLRenderer;
  private showcaseMesh?: THREE.Group;
  private showcaseAnimId: number = 0;

  private asphaltTexture!: THREE.CanvasTexture;
  private grassTexture!: THREE.CanvasTexture;
  private dirLight!: THREE.DirectionalLight;
  private ambLight!: THREE.AmbientLight;

  private currentTrackCurve?: THREE.CatmullRomCurve3;

  ngAfterViewInit() {
    this.asphaltTexture = TextureGenerator.createAsphaltTexture();
    this.grassTexture = TextureGenerator.createGrassTexture();
    this.audioEngine.startMusic();
  }

  filteredCarRoster(): CarData[] {
    const filter = this.selectedClassFilter();
    if (filter === 'All Classes') return this.carRoster;
    return this.carRoster.filter(c => c.class === filter);
  }

  selectCarByData(car: CarData) {
    const idx = this.carRoster.findIndex(c => c.id === car.id);
    if (idx !== -1) {
      this.selectCar(idx);
    }
  }

  // --- View Navigation & Sound ---
  playClick() {
    this.audioEngine.playMenuClick();
  }

  playIntroCinematic() {
    this.playClick();
    this.showIntroModal.set(true);
  }

  closeIntroModal() {
    this.playClick();
    this.showIntroModal.set(false);
  }

  toggleMute() {
    const muted = this.audioEngine.toggleMute();
    this.isMuted.set(muted);
  }

  openShowcase() {
    this.playClick();
    this.activeView.set('showcase');
    setTimeout(() => this.initShowcase3D(), 50);
  }

  closeShowcase() {
    this.playClick();
    cancelAnimationFrame(this.showcaseAnimId);
    this.activeView.set('main-menu');
  }

  openRaceSetup(mode: 'single' | 'head-to-head' | 'timetrial' | 'tournament') {
    this.playClick();
    this.gameMode.set(mode);
    if (mode === 'tournament') {
      this.initTournament();
    }
    this.activeView.set('race-setup');
  }

  openCheatModal() {
    this.playClick();
    this.cheatMessage.set('');
    this.activeView.set('cheat-modal');
  }

  closeCheatModal() {
    this.playClick();
    this.activeView.set('main-menu');
  }

  applyCheat() {
    const code = this.cheatInput().trim().toUpperCase();
    if (code === 'WARRIOR' || code === 'NFSWARRIOR') {
      const warrior = this.carRoster.find(c => c.id === 'warrior');
      if (warrior) warrior.isUnlocked = true;
      this.cheatMessage.set('⚡ CHEAT ACTIVATED: Warrior Jet-Car Unlocked!');
    } else if (code === 'FZR2000' || code === 'FZR') {
      const fzr = this.carRoster.find(c => c.id === 'fzr2000');
      if (fzr) fzr.isUnlocked = true;
      this.cheatMessage.set('⚡ CHEAT ACTIVATED: FZR 2000 Secret Car Unlocked!');
    } else if (code === 'LOSTVEGAS' || code === 'VEGAS') {
      const vegas = this.trackRoster.find(t => t.id === 'lost-vegas');
      if (vegas) vegas.isUnlocked = true;
      this.cheatMessage.set('🎰 CHEAT ACTIVATED: Lost Vegas Track Unlocked!');
    } else {
      this.cheatMessage.set('❌ Invalid Cheat Code. Try WARRIOR, FZR2000, or LOSTVEGAS.');
    }
    this.playClick();
  }

  selectCar(idx: number) {
    if (this.carRoster[idx].isSecret && !this.carRoster[idx].isUnlocked) return;
    this.playClick();
    this.selectedCarIndex.set(idx);
    if (this.activeView() === 'showcase') {
      this.updateShowcaseCar();
    }
  }

  selectTrack(idx: number) {
    if (this.trackRoster[idx].isSecretBonus && !this.trackRoster[idx].isUnlocked) return;
    this.playClick();
    this.selectedTrackIndex.set(idx);
    this.timeOfDay.set(this.trackRoster[idx].defaultTimeOfDay);
  }

  setPlayerCount(count: number) {
    this.playClick();
    this.playerCount.set(count);
    this.playerConfigs.forEach((cfg, idx) => cfg.active = idx < count);
  }

  setCameraMode(mode: 'chase' | 'close' | 'hood' | 'dashboard') {
    this.playClick();
    this.cameraMode.set(mode);
  }

  testEngineSound() {
    this.audioEngine.startEngineSound();
    this.audioEngine.updateEngineRPM(0.9, 4);
    setTimeout(() => {
      this.audioEngine.stopEngineSound();
    }, 1500);
  }

  // --- 3D Showcase Section ---
  private initShowcase3D() {
    if (!this.showcaseCanvasRef) return;
    const canvas = this.showcaseCanvasRef.nativeElement;
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 350;

    this.showcaseScene = new THREE.Scene();
    this.showcaseScene.background = new THREE.Color(0x09090b);

    this.showcaseRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.showcaseRenderer.setSize(width, height);
    this.showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    this.showcaseScene.add(amb);

    const spot = new THREE.SpotLight(0xffedd5, 3);
    spot.position.set(0, 15, 10);
    this.showcaseScene.add(spot);

    const stageGeo = new THREE.CylinderGeometry(5, 5, 0.2, 32);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.1;
    this.showcaseScene.add(stage);

    this.updateShowcaseCar();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0.8, 0);

    const animateShowcase = () => {
      this.showcaseAnimId = requestAnimationFrame(animateShowcase);
      if (this.showcaseMesh && !this.showcaseInterior()) {
        this.showcaseMesh.rotation.y += 0.008;
      }
      this.showcaseRenderer?.render(this.showcaseScene!, camera);
    };
    animateShowcase();
  }

  private updateShowcaseCar() {
    if (!this.showcaseScene) return;
    if (this.showcaseMesh) {
      this.showcaseScene.remove(this.showcaseMesh);
    }
    const carData = this.carRoster[this.selectedCarIndex()];
    this.showcaseMesh = this.createDetailedCarMesh(carData);
    this.showcaseMesh.position.set(0, 0.1, 0);
    this.showcaseScene.add(this.showcaseMesh);
  }

  toggleShowcaseInterior() {
    this.playClick();
    this.showcaseInterior.update(v => !v);
  }

  // --- Tournament Management ---
  private initTournament() {
    const pts: { [carId: string]: number } = {};
    this.carRoster.forEach(c => pts[c.id] = 0);
    this.tournamentPoints.set(pts);
    this.tournamentRound.set(1);
  }

  startRace() {
    this.playClick();
    this.raceWinner.set(null);
    this.activeView.set('racing');
    setTimeout(() => {
      this.initRaceWorld();
      this.runRaceCountdownSequence();
    }, 50);
  }

  private runRaceCountdownSequence() {
    const steps = ['3', '2', '1', 'GO!'];
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < steps.length) {
        this.countdownText.set(steps[idx]);
        this.audioEngine.playCountdownTone(idx === steps.length - 1);
        idx++;
      } else {
        this.countdownText.set('');
        clearInterval(timer);
        this.audioEngine.startEngineSound();
        this.startRaceLoop();
      }
    }, 800);
  }

  restartRace() {
    this.playClick();
    this.raceWinner.set(null);
    this.runRaceCountdownSequence();
    this.resetCarsToStart();
  }

  exitToMenu() {
    this.playClick();
    cancelAnimationFrame(this.animFrameId);
    this.audioEngine.stopEngineSound();
    this.audioEngine.stopPoliceSiren();
    this.audioEngine.startMusic();
    this.activeView.set('main-menu');
  }

  toggleKeyConfigModal() {
    this.showKeyModal.update(v => !v);
  }

  toggleFullscreen() {
    if (!this.containerRef) return;
    const elem = this.containerRef.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  }

  // --- 3D Track & Environment Rendering Engine ---
  private initRaceWorld() {
    if (!this.canvasRef || !this.containerRef) return;
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    const track = this.trackRoster[this.selectedTrackIndex()];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(track.skyColor);
    this.scene.fog = new THREE.FogExp2(track.fogColor, 0.003);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setScissorTest(true);

    this.ambLight = new THREE.AmbientLight(0xffffff, track.ambientLight);
    this.scene.add(this.ambLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    this.dirLight.position.set(...track.sunPosition);
    this.scene.add(this.dirLight);

    this.build3DTrackEnvironment(track);
    this.initCarsAndTraffic(track);
  }

  private build3DTrackEnvironment(track: TrackData) {
    const curvePoints = track.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const isClosed = track.type === 'Circuit';
    this.currentTrackCurve = new THREE.CatmullRomCurve3(curvePoints, isClosed);

    const points = this.currentTrackCurve.getPoints(200);

    const shape = new THREE.Shape();
    shape.moveTo(-6, 0);
    shape.lineTo(6, 0);
    shape.lineTo(6, -0.2);
    shape.lineTo(-6, -0.2);

    const extrudeSettings = { steps: 200, extrudePath: this.currentTrackCurve, bevelEnabled: false };
    const roadGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const roadMat = new THREE.MeshStandardMaterial({ map: this.asphaltTexture, roughness: 0.5 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(roadMesh);

    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.MeshStandardMaterial({ color: track.groundColor, map: this.grassTexture, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    this.scene.add(ground);

    this.addSceneryProps(track, points);
  }

  private addSceneryProps(track: TrackData, pathPoints: THREE.Vector3[]) {
    pathPoints.forEach((pt, idx) => {
      if (idx % 6 !== 0) return;

      const norm = this.currentTrackCurve?.getTangentAt(idx / pathPoints.length) || new THREE.Vector3(1, 0, 0);
      const perp = new THREE.Vector3(-norm.z, 0, norm.x).normalize();

      if (track.scenery === 'city' || track.scenery === 'industrial' || track.scenery === 'vegas') {
        const buildingMat = new THREE.MeshStandardMaterial({
          color: track.scenery === 'vegas' ? (idx % 2 === 0 ? 0xf43f5e : 0x06b6d4) : 0x334155,
          metalness: 0.5
        });
        const height = 15 + (idx % 5) * 10;
        const bGeo = new THREE.BoxGeometry(10, height, 10);

        const leftB = new THREE.Mesh(bGeo, buildingMat);
        leftB.position.copy(pt).addScaledVector(perp, 25);
        leftB.position.y += height / 2;
        this.scene.add(leftB);

        const rightB = new THREE.Mesh(bGeo, buildingMat);
        rightB.position.copy(pt).addScaledVector(perp, -25);
        rightB.position.y += height / 2;
        this.scene.add(rightB);
      } else if (track.scenery === 'coastal' || track.scenery === 'forest' || track.scenery === 'alpine' || track.scenery === 'mystic') {
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const leavesGeo = new THREE.ConeGeometry(2, 5, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: track.scenery === 'alpine' || track.scenery === 'mystic' ? 0xe0f2fe : 0x15803d });

        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 4;
        treeGroup.add(trunk, leaves);

        const posLeft = pt.clone().addScaledVector(perp, 12 + Math.random() * 5);
        treeGroup.position.copy(posLeft);
        this.scene.add(treeGroup);
      }
    });
  }

  // --- Cars, Traffic & Police Setup ---
  private initCarsAndTraffic(track: TrackData) {
    this.cars = [];
    this.trafficCars = [];
    this.copCars = [];

    const pCount = this.playerCount();
    const selectedCar = this.carRoster[this.selectedCarIndex()];

    const totalRacers = this.gameMode() === 'head-to-head' ? 2 : (this.gameMode() === 'timetrial' ? pCount : 8);

    for (let i = 0; i < totalRacers; i++) {
      const isPlayer = i < pCount;
      const carData = isPlayer ? selectedCar : this.carRoster[i % this.carRoster.length];
      const color = isPlayer ? this.playerConfigs[i].color : carData.primaryColor;

      const mesh = this.createDetailedCarMesh(carData, color);
      this.scene.add(mesh);

      const isNight = this.timeOfDay() === 'Evening';
      let headlights: THREE.SpotLight[] | undefined;
      if (isNight) {
        headlights = this.addHeadlights(mesh);
      }

      this.cars.push({
        x: (i % 2 === 0 ? -2.5 : 2.5),
        z: -10 - i * 8,
        y: 0.2,
        angle: 0,
        speed: 0,
        maxSpeed: (carData.topSpeedKmH / 300) * 1.1,
        accel: carData.accelRate,
        steer: carData.maxSteer,
        gear: 1,
        lap: 1,
        checkpoint: 0,
        mesh,
        color,
        isAI: !isPlayer,
        headlights,
        data: carData
      });
    }

    if (this.trafficEnabled() && track.hasTrafficByDefault) {
      for (let i = 0; i < 6; i++) {
        const trafficData = this.carRoster[3];
        const mesh = this.createDetailedCarMesh(trafficData, '#64748b');
        this.scene.add(mesh);
        this.trafficCars.push({
          x: (i % 2 === 0 ? -3 : 3),
          z: 50 + i * 40,
          y: 0.2,
          angle: 0,
          speed: 0.4,
          maxSpeed: 0.5,
          accel: 0.01,
          steer: 0,
          gear: 1,
          lap: 1,
          checkpoint: 0,
          mesh,
          color: '#64748b',
          isAI: true,
          isTraffic: true,
          data: trafficData
        });
      }
    }

    if (this.copPursuitEnabled() && track.hasPoliceByDefault) {
      const copData = this.carRoster[1];
      const copMesh = this.createPoliceCarMesh();
      this.scene.add(copMesh);

      this.copCars.push({
        x: 0,
        z: -40,
        y: 0.2,
        angle: 0,
        speed: 0,
        maxSpeed: 1.2,
        accel: 0.03,
        steer: 0.045,
        gear: 1,
        lap: 1,
        checkpoint: 0,
        mesh: copMesh,
        color: '#000000',
        isAI: true,
        isCop: true,
        data: copData
      });
      this.audioEngine.startPoliceSiren();
      this.policeChatterText.set('Dispatch: Unit 12 in pursuit of speeder on sector 1!');
    }
  }

  private resetCarsToStart() {
    this.cars.forEach((car, i) => {
      car.x = (i % 2 === 0 ? -2.5 : 2.5);
      car.z = -10 - i * 8;
      car.y = 0.2;
      car.angle = 0;
      car.speed = 0;
      car.gear = 1;
      car.lap = 1;
      car.checkpoint = 0;
      car.mesh.position.set(car.x, car.y, car.z);
      car.mesh.rotation.y = car.angle;
    });
  }

  private addHeadlights(carMesh: THREE.Group): THREE.SpotLight[] {
    const spot1 = new THREE.SpotLight(0xffedd5, 4, 30, Math.PI / 6);
    spot1.position.set(-0.6, 0.4, 1.5);
    spot1.target.position.set(-0.6, 0, 10);

    const spot2 = new THREE.SpotLight(0xffedd5, 4, 30, Math.PI / 6);
    spot2.position.set(0.6, 0.4, 1.5);
    spot2.target.position.set(0.6, 0, 10);

    carMesh.add(spot1, spot1.target, spot2, spot2.target);
    return [spot1, spot2];
  }

  private createDetailedCarMesh(carData: CarData, colorHex?: string): THREE.Group {
    const group = new THREE.Group();
    const primaryColor = colorHex || carData.primaryColor;

    const bodyGeo = new THREE.BoxGeometry(1.8, 0.55, 3.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.8,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    group.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.3, 0.45, 1.6);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.75, -0.2);
    group.add(cabin);

    const spoilerGeo = new THREE.BoxGeometry(1.7, 0.08, 0.3);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 0.8, -1.5);
    group.add(spoiler);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.35, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const positions = [[-0.9, 0.32, 1.1], [0.9, 0.32, 1.1], [-0.9, 0.32, -1.1], [0.9, 0.32, -1.1]];
    positions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      group.add(wheel);
    });

    return group;
  }

  private createPoliceCarMesh(): THREE.Group {
    const group = this.createDetailedCarMesh(this.carRoster[1], '#09090b');

    const barGeo = new THREE.BoxGeometry(0.8, 0.15, 0.25);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 0.95, -0.2);
    group.add(bar);

    return group;
  }

  // --- Physics, AI & Game Loop ---
  private startRaceLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updateRacePhysics();
      this.renderSplitScreenViewports();
    };
    loop();
  }

  private updateRacePhysics() {
    if (this.raceWinner() || this.countdownText()) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    this.cars.forEach((car, idx) => {
      if (!car.isAI && idx < this.playerCount()) {
        const cfg = this.playerConfigs[idx];
        let accelInput = false;
        let brakeInput = false;
        let leftInput = false;
        let rightInput = false;

        if (cfg.useGamepad && gamepads[cfg.gamepadIndex]) {
          const gp = gamepads[cfg.gamepadIndex]!;
          accelInput = gp.buttons[0]?.pressed || gp.axes[1] < -0.2;
          brakeInput = gp.buttons[1]?.pressed || gp.axes[1] > 0.2;
          leftInput = gp.axes[0] < -0.2;
          rightInput = gp.axes[0] > 0.2;
        } else {
          accelInput = this.activeKeys.has(cfg.keys.up);
          brakeInput = this.activeKeys.has(cfg.keys.down);
          leftInput = this.activeKeys.has(cfg.keys.left);
          rightInput = this.activeKeys.has(cfg.keys.right);
        }

        if (accelInput) {
          car.speed = Math.min(car.maxSpeed, car.speed + car.accel);
        } else if (brakeInput) {
          car.speed = Math.max(-car.maxSpeed * 0.4, car.speed - car.accel * 1.5);
        } else {
          car.speed *= 0.98;
        }

        if (leftInput) car.angle += car.steer * (car.speed >= 0 ? 1 : -1);
        if (rightInput) car.angle -= car.steer * (car.speed >= 0 ? 1 : -1);

        const oldGear = car.gear;
        car.gear = Math.min(6, Math.max(1, Math.floor(Math.abs(car.speed) / (car.maxSpeed / 5)) + 1));
        if (car.gear !== oldGear && idx === 0) {
          this.audioEngine.playGearShift();
        }

        if (idx === 0) {
          this.audioEngine.updateEngineRPM(car.speed / car.maxSpeed, car.gear);
        }
      } else {
        car.speed = car.maxSpeed * 0.88;
        car.z += car.speed * 2;
      }

      car.x += Math.sin(car.angle) * car.speed;
      car.z += Math.cos(car.angle) * car.speed;

      car.mesh.position.set(car.x, car.y, car.z);
      car.mesh.rotation.y = car.angle;

      if (car.z > car.checkpoint * 100 + 50) {
        car.checkpoint++;
        if (car.checkpoint >= 3) {
          car.lap++;
          car.checkpoint = 0;
          if (car.lap > 3 && !this.raceWinner()) {
            this.handleRaceFinish(car, idx);
          }
        }
      }
    });

    this.trafficCars.forEach(tCar => {
      tCar.z += tCar.speed * 1.5;
      tCar.mesh.position.set(tCar.x, tCar.y, tCar.z);
    });

    if (this.copCars.length > 0 && this.cars[0]) {
      const pCar = this.cars[0];
      this.copCars.forEach(cop => {
        const dx = pCar.x - cop.x;
        const dz = pCar.z - cop.z;
        const dist = Math.hypot(dx, dz);

        this.radarDistance.set(Math.round(dist * 10));

        if (dist > 1.5) {
          cop.x += (dx / dist) * 0.3;
          cop.z += (dz / dist) * 0.3 + 0.2;
          cop.angle = Math.atan2(dx, dz);
        } else {
          this.audioEngine.playCollision();
        }

        cop.mesh.position.set(cop.x, cop.y, cop.z);
        cop.mesh.rotation.y = cop.angle;
      });
    }
  }

  private handleRaceFinish(winningCar: CarState, pIdx: number) {
    const winnerName = winningCar.isAI ? `AI Driver (${winningCar.data.name})` : `PLAYER ${pIdx + 1}`;
    this.raceWinner.set(winnerName);
    this.audioEngine.stopEngineSound();
    this.audioEngine.stopPoliceSiren();

    if (this.gameMode() === 'tournament') {
      const pts = { ...this.tournamentPoints() };
      pts[winningCar.data.id] = (pts[winningCar.data.id] || 0) + 10;
      this.tournamentPoints.set(pts);

      if (this.tournamentRound() >= 3) {
        const vegas = this.trackRoster.find(t => t.id === 'lost-vegas');
        if (vegas) vegas.isUnlocked = true;
        const warrior = this.carRoster.find(c => c.id === 'warrior');
        if (warrior) warrior.isUnlocked = true;
      }
    }
  }

  nextTournamentRound() {
    this.tournamentRound.update(r => r + 1);
    this.selectedTrackIndex.set((this.selectedTrackIndex() + 1) % this.trackRoster.length);
    this.startRace();
  }

  // --- Rendering Viewports & 3D Dashboard Camera ---
  private renderSplitScreenViewports() {
    if (!this.renderer || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const pCount = this.playerCount();

    for (let i = 0; i < pCount; i++) {
      const car = this.cars[i];
      if (!car) continue;

      let vx = 0, vy = 0, vw = w, vh = h;
      if (pCount === 2) {
        vw = w / 2;
        vx = i * vw;
      } else if (pCount >= 3) {
        vw = w / 2;
        vh = h / 2;
        vx = (i % 2) * vw;
        vy = i < 2 ? vh : 0;
      }

      this.renderer.setViewport(vx, vy, vw, vh);
      this.renderer.setScissor(vx, vy, vw, vh);

      const cam = new THREE.PerspectiveCamera(60, vw / vh, 0.1, 400);

      const mode = this.cameraMode();
      if (mode === 'chase') {
        const camX = car.x - Math.sin(car.angle) * 8;
        const camZ = car.z - Math.cos(car.angle) * 8;
        cam.position.set(camX, car.y + 3.5, camZ);
        cam.lookAt(car.x, car.y + 1, car.z + 5);
      } else if (mode === 'close') {
        const camX = car.x - Math.sin(car.angle) * 5;
        const camZ = car.z - Math.cos(car.angle) * 5;
        cam.position.set(camX, car.y + 2, camZ);
        cam.lookAt(car.x, car.y + 0.8, car.z + 6);
      } else if (mode === 'hood') {
        cam.position.set(car.x, car.y + 0.9, car.z + 1.2);
        cam.lookAt(car.x, car.y + 0.9, car.z + 20);
      } else if (mode === 'dashboard') {
        cam.position.set(car.x - 0.3, car.y + 0.75, car.z - 0.2);
        cam.lookAt(car.x, car.y + 0.75, car.z + 15);
      }

      this.renderer.render(this.scene, cam);
    }
  }

  getDisplaySpeed(pIdx: number): number {
    if (!this.cars[pIdx]) return 0;
    return Math.round(Math.abs(this.cars[pIdx].speed) * 220);
  }

  getPosition(pIdx: number): number {
    if (!this.cars[pIdx]) return 1;
    const pCar = this.cars[pIdx];
    let pos = 1;
    this.cars.forEach((other, idx) => {
      if (idx !== pIdx) {
        if (other.lap > pCar.lap || (other.lap === pCar.lap && other.checkpoint > pCar.checkpoint)) {
          pos++;
        }
      }
    });
    return pos;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    this.activeKeys.add(e.key);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    this.activeKeys.delete(e.key);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    cancelAnimationFrame(this.showcaseAnimId);
    if (this.renderer) this.renderer.dispose();
    if (this.showcaseRenderer) this.showcaseRenderer.dispose();
    this.audioEngine.stopEngineSound();
    this.audioEngine.stopPoliceSiren();
    this.audioEngine.stopMusic();
  }
}
