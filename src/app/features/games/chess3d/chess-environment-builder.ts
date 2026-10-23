import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

export type BoardTheme = 'marble' | 'battlefield' | 'arcane' | 'classic';

export class ChessEnvironmentBuilder {
  static createBoardTiles(theme: BoardTheme): { tiles: THREE.Mesh[]; boardGroup: THREE.Group } {
    const boardGroup = new THREE.Group();
    const tiles: THREE.Mesh[] = [];

    const lightTexture = TextureGenerator.createMarbleTexture(false);
    const darkTexture = TextureGenerator.createMarbleTexture(true);

    // Inner board base plate (gives thin gold grid lines in tiny tile gaps)
    const boardBaseGeo = new THREE.BoxGeometry(8.05, 0.18, 8.05);
    const boardBaseMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Gold inlay accent grid
      metalness: 0.8,
      roughness: 0.2
    });
    const boardBase = new THREE.Mesh(boardBaseGeo, boardBaseMat);
    boardBase.position.set(0, -0.11, 0);
    boardGroup.add(boardBase);

    // Tiles geometry - slightly smaller than 1.0 (0.98) to show gold grid lines between squares
    const tileGeo = new THREE.BoxGeometry(0.97, 0.2, 0.97);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        let mat: THREE.Material;

        if (theme === 'battlefield') {
          mat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x18181b : 0xa1a1aa,
            roughness: 0.8,
            metalness: 0.2
          });
        } else if (theme === 'arcane') {
          mat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x0f172a : 0x4338ca,
            roughness: 0.3,
            metalness: 0.6,
            emissive: isDark ? 0x020617 : 0x1e1b4b
          });
        } else if (theme === 'classic') {
          const woodTex = TextureGenerator.createWoodTexture(isDark);
          mat = new THREE.MeshStandardMaterial({
            map: woodTex,
            color: isDark ? 0x451a03 : 0xfde047,
            roughness: 0.4
          });
        } else {
          // Marble default (White Marble vs Black Onyx)
          mat = new THREE.MeshStandardMaterial({
            map: isDark ? darkTexture : lightTexture,
            color: isDark ? 0x111827 : 0xffffff,
            roughness: 0.15,
            metalness: 0.1
          });
        }

        const tile = new THREE.Mesh(tileGeo, mat);
        tile.position.set(c - 3.5, -0.09, r - 3.5);
        tile.receiveShadow = true;
        tile.userData = { row: r, col: c };

        tiles.push(tile);
        boardGroup.add(tile);
      }
    }

    // Outer Ornate Board Border Frame
    const frameGeo = new THREE.BoxGeometry(9.2, 0.3, 9.2);
    const frameMat = new THREE.MeshStandardMaterial({
      color: theme === 'arcane' ? 0x4c1d95 : 0x78350f,
      roughness: 0.3,
      metalness: 0.7
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, -0.16, 0);
    frame.receiveShadow = true;
    boardGroup.add(frame);

    // Ornate Gold Outer Trim
    const trimGeo = new THREE.BoxGeometry(9.4, 0.1, 9.4);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.21, 0);
    boardGroup.add(trim);

    return { tiles, boardGroup };
  }

  static setupLighting(scene: THREE.Scene, theme: BoardTheme) {
    // Ambient Light
    const ambLight = new THREE.AmbientLight(0xffffff, theme === 'arcane' ? 0.5 : 0.8);
    scene.add(ambLight);

    // Main Directional Sun Light
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(6, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Rim Light for crisp piece silhouettes
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-8, 10, -8);
    scene.add(rimLight);

    if (theme === 'arcane') {
      const pointLight = new THREE.PointLight(0xa855f7, 2, 15);
      pointLight.position.set(0, 3, 0);
      scene.add(pointLight);
    }
  }
}
