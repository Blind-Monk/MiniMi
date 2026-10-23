import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';
import { CAR_ROSTER, TRACK_ROSTER, CarData, TrackData } from './turbo-speed-data';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

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
  progress: number; // 0.0 to 1.0 along track curve
  laneOffset: number; // -5.0 (left side) to +5.0 (right side)
  speed: number;
  maxSpeed: number;
  accel: number;
  steer: number;
  gear: number;
  lap: number;
  mesh: THREE.Group;
  bodyMesh?: THREE.Mesh;
  brakeLightMat?: THREE.MeshStandardMaterial;
  color: string;
  isAI: boolean;
  isCop?: boolean;
  isTraffic?: boolean;
  headlights?: THREE.SpotLight[];
  data: CarData;
  pos: THREE.Vector3;
  tangent: THREE.Vector3;
  steeringAngle: number;
  pitchAngle: number;
  rollAngle: number;
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

  private audioService = inject(AudioService);

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

  // Mobile Touch Steering States
  touchAccel = signal<boolean>(false);
  touchBrake = signal<boolean>(false);
  touchSteerLeft = signal<boolean>(false);
  touchSteerRight = signal<boolean>(false);

  // Tournament State
  tournamentPoints = signal<{ [carId: string]: number }>({});
  tournamentRound = signal<number>(1);

  // Cheat State
  cheatInput = signal<string>('');
  cheatMessage = signal<string>('');

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

  private currentTrackCurve!: THREE.CatmullRomCurve3;

  ngAfterViewInit() {
    this.asphaltTexture = TextureGenerator.createAsphaltTexture();
    this.grassTexture = TextureGenerator.createGrassTexture();
    this.audioService.startPlaylist('high-energy');
    this.isMuted.set(this.audioService.getMuted());
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
    this.audioService.playClickSound();
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
    const muted = this.audioService.toggleMute();
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
    this.audioService.playBoingSound();
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
    this.showcaseRenderer.setPixelRatio(ResponsiveUtil.getClampedPixelRatio());

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
    this.showcaseMesh = this.createDetailedCarMesh(carData).group;
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
        this.audioService.playCoinSound();
        idx++;
      } else {
        this.countdownText.set('');
        clearInterval(timer);
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
    this.audioService.startPlaylist('high-energy');
    this.activeView.set('main-menu');
  }

  toggleKeyConfigModal() {
    this.showKeyModal.update(v => !v);
  }

  toggleFullscreen() {
    if (!this.containerRef) return;
    ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement).then(() => {
      setTimeout(() => this.onWindowResize(), 100);
    }).catch(err => console.error(err));
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.renderer || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.renderer.setSize(w, h);

    if (this.activeView() === 'showcase') {
      this.initShowcase3D();
    }
  }

  // --- Spline 3D Track & Detailed Environment Engine ---
  private initRaceWorld() {
    if (!this.canvasRef || !this.containerRef) return;
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    const track = this.trackRoster[this.selectedTrackIndex()];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(track.skyColor);
    this.scene.fog = new THREE.FogExp2(track.fogColor, 0.002);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(ResponsiveUtil.getClampedPixelRatio());
    this.renderer.setScissorTest(true);

    this.ambLight = new THREE.AmbientLight(0xffffff, track.ambientLight);
    this.scene.add(this.ambLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    this.dirLight.position.set(...track.sunPosition);
    this.scene.add(this.dirLight);

    this.build3DTrackEnvironment(track);
    this.initCarsAndTraffic(track);
    this.renderSplitScreenViewports();
  }

  private build3DTrackEnvironment(track: TrackData) {
    const curvePoints = track.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const isClosed = track.type === 'Circuit';
    this.currentTrackCurve = new THREE.CatmullRomCurve3(curvePoints, isClosed);

    const points = this.currentTrackCurve.getPoints(300);

    const roadGeo = this.buildRoadGeometry(this.currentTrackCurve, 400, 12);
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTexture,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(roadMesh);

    const groundGeo = new THREE.PlaneGeometry(1500, 1500);
    const groundMat = new THREE.MeshStandardMaterial({ color: track.groundColor, map: this.grassTexture, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    this.scene.add(ground);

    this.addSceneryProps(track, points);
  }

  private buildRoadGeometry(curve: THREE.CatmullRomCurve3, steps: number = 400, width: number = 12): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const halfWidth = width / 2;
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = curve.getPointAt(t);
      const tang = curve.getTangentAt(t).normalize();

      let side = new THREE.Vector3().crossVectors(up, tang).normalize();
      if (side.lengthSq() < 0.0001) {
        side.set(1, 0, 0);
      }

      const norm = new THREE.Vector3().crossVectors(tang, side).normalize();

      const leftPt = pt.clone().addScaledVector(side, -halfWidth);
      const rightPt = pt.clone().addScaledVector(side, halfWidth);

      positions.push(leftPt.x, leftPt.y, leftPt.z);
      positions.push(rightPt.x, rightPt.y, rightPt.z);

      normals.push(norm.x, norm.y, norm.z);
      normals.push(norm.x, norm.y, norm.z);

      const v = t * 40;
      uvs.push(0, v);
      uvs.push(1, v);

      if (i < steps) {
        const iLeft = i * 2;
        const iRight = i * 2 + 1;
        const iNextLeft = (i + 1) * 2;
        const iNextRight = (i + 1) * 2 + 1;

        indices.push(iLeft, iNextLeft, iRight);
        indices.push(iRight, iNextLeft, iNextRight);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return geo;
  }

  private addSceneryProps(track: TrackData, pathPoints: THREE.Vector3[]) {
    const up = new THREE.Vector3(0, 1, 0);
    pathPoints.forEach((pt, idx) => {
      if (idx % 4 !== 0) return;

      const norm = this.currentTrackCurve.getTangentAt(idx / pathPoints.length).normalize();
      let perp = new THREE.Vector3().crossVectors(up, norm).normalize();
      if (perp.lengthSq() < 0.0001) perp.set(1, 0, 0);

      // Guard Rails along edges
      const railGeo = new THREE.BoxGeometry(0.3, 0.8, 4);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.position.copy(pt).addScaledVector(perp, 6.4);
      leftRail.position.y += 0.4;
      leftRail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);

      const rightRail = new THREE.Mesh(railGeo, railMat);
      rightRail.position.copy(pt).addScaledVector(perp, -6.4);
      rightRail.position.y += 0.4;
      rightRail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);

      this.scene.add(leftRail, rightRail);

      // Scenery Specific Props
      if (track.scenery === 'city' || track.scenery === 'industrial' || track.scenery === 'vegas') {
        const height = 18 + (idx % 6) * 8;
        const bGeo = new THREE.BoxGeometry(12, height, 12);
        const buildingMat = new THREE.MeshStandardMaterial({
          color: track.scenery === 'vegas' ? (idx % 2 === 0 ? 0xf43f5e : 0x06b6d4) : 0x334155,
          metalness: 0.6,
          roughness: 0.3
        });

        const leftB = new THREE.Mesh(bGeo, buildingMat);
        leftB.position.copy(pt).addScaledVector(perp, 24);
        leftB.position.y += height / 2;
        this.scene.add(leftB);

        const rightB = new THREE.Mesh(bGeo, buildingMat);
        rightB.position.copy(pt).addScaledVector(perp, -24);
        rightB.position.y += height / 2;
        this.scene.add(rightB);
      } else if (track.scenery === 'coastal' || track.scenery === 'forest' || track.scenery === 'alpine' || track.scenery === 'mystic') {
        const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const leavesGeo = new THREE.ConeGeometry(2.4, 5.5, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: track.scenery === 'alpine' || track.scenery === 'mystic' ? 0xe0f2fe : 0x15803d });

        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.75;
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 4.5;
        treeGroup.add(trunk, leaves);

        const posLeft = pt.clone().addScaledVector(perp, 13 + Math.random() * 6);
        treeGroup.position.copy(posLeft);
        this.scene.add(treeGroup);
      }
    });
  }

  // --- Detailed 3D Car Model Generator & Physics ---
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

      const carBuild = this.createDetailedCarMesh(carData, color);
      this.scene.add(carBuild.group);

      const isNight = this.timeOfDay() === 'Evening';
      let headlights: THREE.SpotLight[] | undefined;
      if (isNight) {
        headlights = this.addHeadlights(carBuild.group);
      }

      const initialProgress = Math.max(0, 0.05 - (i * 0.008));
      const laneOffset = (i % 2 === 0 ? -2.0 : 2.0);

      const carState: CarState = {
        progress: initialProgress,
        laneOffset,
        speed: 0,
        maxSpeed: (carData.topSpeedKmH / 220) * 0.0018,
        accel: carData.accelRate * 0.0001,
        steer: carData.maxSteer * 2.5,
        gear: 1,
        lap: 1,
        mesh: carBuild.group,
        bodyMesh: carBuild.bodyMesh,
        brakeLightMat: carBuild.brakeLightMat,
        color,
        isAI: !isPlayer,
        headlights,
        data: carData,
        pos: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        steeringAngle: 0,
        pitchAngle: 0,
        rollAngle: 0
      };
      this.updateCarSplineTransform(carState);
      this.cars.push(carState);
    }

    if (this.trafficEnabled() && track.hasTrafficByDefault) {
      for (let i = 0; i < 5; i++) {
        const trafficData = this.carRoster[3];
        const carBuild = this.createDetailedCarMesh(trafficData, '#64748b');
        this.scene.add(carBuild.group);
        const tState: CarState = {
          progress: 0.15 + i * 0.15,
          laneOffset: (i % 2 === 0 ? -2.5 : 2.5),
          speed: 0.0006,
          maxSpeed: 0.0008,
          accel: 0.00001,
          steer: 0,
          gear: 1,
          lap: 1,
          mesh: carBuild.group,
          color: '#64748b',
          isAI: true,
          isTraffic: true,
          data: trafficData,
          pos: new THREE.Vector3(),
          tangent: new THREE.Vector3(),
          steeringAngle: 0,
          pitchAngle: 0,
          rollAngle: 0
        };
        this.updateCarSplineTransform(tState);
        this.trafficCars.push(tState);
      }
    }

    if (this.copPursuitEnabled() && track.hasPoliceByDefault) {
      const copData = this.carRoster[1];
      const copMesh = this.createPoliceCarMesh();
      this.scene.add(copMesh);

      const copState: CarState = {
        progress: 0.01,
        laneOffset: 0,
        speed: 0,
        maxSpeed: 0.0022,
        accel: 0.00012,
        steer: 0.1,
        gear: 1,
        lap: 1,
        mesh: copMesh,
        color: '#000000',
        isAI: true,
        isCop: true,
        data: copData,
        pos: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        steeringAngle: 0,
        pitchAngle: 0,
        rollAngle: 0
      };
      this.updateCarSplineTransform(copState);
      this.copCars.push(copState);
      this.policeChatterText.set('Dispatch: Unit 12 in pursuit of speeder on sector 1!');
    }
  }

  private resetCarsToStart() {
    this.cars.forEach((car, i) => {
      car.progress = Math.max(0, 0.05 - (i * 0.008));
      car.laneOffset = (i % 2 === 0 ? -2.0 : 2.0);
      car.speed = 0;
      car.gear = 1;
      car.lap = 1;
      this.updateCarSplineTransform(car);
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

  private createDetailedCarMesh(carData: CarData, colorHex?: string): { group: THREE.Group; bodyMesh: THREE.Mesh; brakeLightMat: THREE.MeshStandardMaterial } {
    const group = new THREE.Group();
    const primaryColor = colorHex || carData.primaryColor;

    // Streamlined Metallic Chassis Body
    const bodyGeo = new THREE.BoxGeometry(1.85, 0.55, 3.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.85,
      roughness: 0.15
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.38;
    group.add(body);

    // Glass Roof Cockpit
    const cabinGeo = new THREE.BoxGeometry(1.35, 0.48, 1.7);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.05, metalness: 0.9 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.78, -0.2);
    group.add(cabin);

    // Aerodynamic Rear Wing / Spoiler
    const spoilerGeo = new THREE.BoxGeometry(1.8, 0.08, 0.35);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 0.82, -1.55);
    group.add(spoiler);

    // Brake Light Strip
    const brakeLightGeo = new THREE.BoxGeometry(1.4, 0.12, 0.1);
    const brakeLightMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0x000000 });
    const brakeLight = new THREE.Mesh(brakeLightGeo, brakeLightMat);
    brakeLight.position.set(0, 0.5, -1.76);
    group.add(brakeLight);

    // Chrome Alloy Wheels with Brake Discs
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.38, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.39, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 });

    const positions = [[-0.92, 0.34, 1.15], [0.92, 0.34, 1.15], [-0.92, 0.34, -1.15], [0.92, 0.34, -1.15]];
    positions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);

      group.add(wheel);
    });

    return { group, bodyMesh: body, brakeLightMat };
  }

  private createPoliceCarMesh(): THREE.Group {
    const build = this.createDetailedCarMesh(this.carRoster[1], '#09090b');
    const group = build.group;

    const barGeo = new THREE.BoxGeometry(0.85, 0.18, 0.28);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 0.98, -0.2);
    group.add(bar);

    return group;
  }

  // --- Physics, AI & Body Motion ---
  private startRaceLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updateRacePhysics();
      this.renderSplitScreenViewports();
    };
    loop();
  }

  private updateRacePhysics() {
    if (this.raceWinner() || this.countdownText() || !this.currentTrackCurve) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    this.cars.forEach((car, idx) => {
      if (!car.isAI && idx < this.playerCount()) {
        const cfg = this.playerConfigs[idx];
        let accelInput = false;
        let brakeInput = false;
        let leftInput = false;
        let rightInput = false;

        if (idx === 0) {
          accelInput = accelInput || this.touchAccel();
          brakeInput = brakeInput || this.touchBrake();
          leftInput = leftInput || this.touchSteerLeft();
          rightInput = rightInput || this.touchSteerRight();
        }

        if (cfg.useGamepad && gamepads[cfg.gamepadIndex]) {
          const gp = gamepads[cfg.gamepadIndex]!;
          accelInput = accelInput || gp.buttons[0]?.pressed || gp.axes[1] < -0.2;
          brakeInput = brakeInput || gp.buttons[1]?.pressed || gp.axes[1] > 0.2;
          leftInput = leftInput || gp.axes[0] < -0.2;
          rightInput = rightInput || gp.axes[0] > 0.2;
        } else {
          accelInput = accelInput || this.activeKeys.has(cfg.keys.up);
          brakeInput = brakeInput || this.activeKeys.has(cfg.keys.down);
          leftInput = leftInput || this.activeKeys.has(cfg.keys.left);
          rightInput = rightInput || this.activeKeys.has(cfg.keys.right);
        }

        if (accelInput) {
          car.speed = Math.min(car.maxSpeed, car.speed + car.accel);
          car.pitchAngle = THREE.MathUtils.lerp(car.pitchAngle, -0.05, 0.1);
          if (car.brakeLightMat) car.brakeLightMat.emissive.setHex(0x000000);
        } else if (brakeInput) {
          car.speed = Math.max(-car.maxSpeed * 0.4, car.speed - car.accel * 1.5);
          car.pitchAngle = THREE.MathUtils.lerp(car.pitchAngle, 0.08, 0.1);
          if (car.brakeLightMat) car.brakeLightMat.emissive.setHex(0xef4444);
        } else {
          car.speed *= 0.985;
          car.pitchAngle = THREE.MathUtils.lerp(car.pitchAngle, 0, 0.1);
          if (car.brakeLightMat) car.brakeLightMat.emissive.setHex(0x000000);
        }

        if (leftInput) {
          car.laneOffset = Math.max(-5.0, car.laneOffset - car.steer);
          car.rollAngle = THREE.MathUtils.lerp(car.rollAngle, 0.08, 0.1);
          car.steeringAngle = THREE.MathUtils.lerp(car.steeringAngle, 0.35, 0.1);
        } else if (rightInput) {
          car.laneOffset = Math.min(5.0, car.laneOffset + car.steer);
          car.rollAngle = THREE.MathUtils.lerp(car.rollAngle, -0.08, 0.1);
          car.steeringAngle = THREE.MathUtils.lerp(car.steeringAngle, -0.35, 0.1);
        } else {
          car.rollAngle = THREE.MathUtils.lerp(car.rollAngle, 0, 0.1);
          car.steeringAngle = THREE.MathUtils.lerp(car.steeringAngle, 0, 0.1);
        }

        car.gear = Math.min(6, Math.max(1, Math.floor(Math.abs(car.speed) / (car.maxSpeed / 5)) + 1));
      } else {
        car.speed = car.maxSpeed * 0.88;
      }

      car.progress += car.speed;

      if (car.progress >= 1.0) {
        car.progress -= 1.0;
        car.lap++;
        if (car.lap > 3 && !this.raceWinner()) {
          this.handleRaceFinish(car, idx);
        }
      }

      this.updateCarSplineTransform(car);
    });

    this.trafficCars.forEach(tCar => {
      tCar.progress += tCar.speed;
      if (tCar.progress >= 1.0) tCar.progress -= 1.0;
      this.updateCarSplineTransform(tCar);
    });

    if (this.copCars.length > 0 && this.cars[0]) {
      const pCar = this.cars[0];
      this.copCars.forEach(cop => {
        cop.speed = Math.min(cop.maxSpeed, cop.speed + cop.accel);
        if (cop.progress < pCar.progress) {
          cop.progress += cop.speed * 1.1;
        } else {
          cop.progress += cop.speed * 0.9;
        }

        if (cop.progress >= 1.0) cop.progress -= 1.0;

        const dist = Math.abs(pCar.progress - cop.progress) * 1000;
        this.radarDistance.set(Math.round(dist));

        if (dist < 5) {
          this.audioService.playExplosionSound();
        }

        cop.laneOffset = THREE.MathUtils.lerp(cop.laneOffset, pCar.laneOffset, 0.05);
        this.updateCarSplineTransform(cop);
      });
    }
  }

  private updateCarSplineTransform(car: CarState) {
    if (!this.currentTrackCurve) return;
    const normT = Math.min(0.999, Math.max(0, car.progress % 1.0));

    car.pos = this.currentTrackCurve.getPointAt(normT);
    car.tangent = this.currentTrackCurve.getTangentAt(normT).normalize();

    const up = new THREE.Vector3(0, 1, 0);
    let perp = new THREE.Vector3().crossVectors(up, car.tangent).normalize();
    if (perp.lengthSq() < 0.0001) perp.set(1, 0, 0);

    const finalPos = car.pos.clone().addScaledVector(perp, car.laneOffset);

    car.mesh.position.copy(finalPos);
    car.mesh.position.y += 0.2;

    const angle = Math.atan2(car.tangent.x, car.tangent.z);
    car.mesh.rotation.y = angle + car.steeringAngle * 0.15;
    car.mesh.rotation.x = car.pitchAngle;
    car.mesh.rotation.z = car.rollAngle;
  }

  private handleRaceFinish(winningCar: CarState, pIdx: number) {
    const winnerName = winningCar.isAI ? `AI Driver (${winningCar.data.name})` : `PLAYER ${pIdx + 1}`;
    this.raceWinner.set(winnerName);
    this.audioService.playCoinSound();

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
    if (!this.renderer || !this.containerRef || !this.currentTrackCurve) return;
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
      const carPos = car.mesh.position.clone();
      const tang = car.tangent.clone().normalize();

      if (mode === 'chase') {
        const camPos = carPos.clone().addScaledVector(tang, -10);
        camPos.y += 3.8;
        cam.position.copy(camPos);
        const lookTarget = carPos.clone().addScaledVector(tang, 10);
        lookTarget.y += 1.0;
        cam.lookAt(lookTarget);
      } else if (mode === 'close') {
        const camPos = carPos.clone().addScaledVector(tang, -6);
        camPos.y += 2.2;
        cam.position.copy(camPos);
        const lookTarget = carPos.clone().addScaledVector(tang, 12);
        lookTarget.y += 0.8;
        cam.lookAt(lookTarget);
      } else if (mode === 'hood') {
        const camPos = carPos.clone().addScaledVector(tang, 1.2);
        camPos.y += 0.9;
        cam.position.copy(camPos);
        const lookTarget = carPos.clone().addScaledVector(tang, 25);
        cam.lookAt(lookTarget);
      } else if (mode === 'dashboard') {
        const camPos = carPos.clone();
        camPos.y += 0.75;
        cam.position.copy(camPos);
        const lookTarget = carPos.clone().addScaledVector(tang, 20);
        cam.lookAt(lookTarget);
      }

      this.renderer.render(this.scene, cam);
    }
  }

  getDisplaySpeed(pIdx: number): number {
    if (!this.cars[pIdx]) return 0;
    return Math.round((this.cars[pIdx].speed / this.cars[pIdx].maxSpeed) * this.cars[pIdx].data.topSpeedKmH);
  }

  getPosition(pIdx: number): number {
    if (!this.cars[pIdx]) return 1;
    const pCar = this.cars[pIdx];
    let pos = 1;
    this.cars.forEach((other, idx) => {
      if (idx !== pIdx) {
        if (other.lap > pCar.lap || (other.lap === pCar.lap && other.progress > pCar.progress)) {
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
  }
}
