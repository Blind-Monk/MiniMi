import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Generates a realistic grass/lawn texture with variable blade noise
   */
  static createGrassTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base lawn green
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);

    // BladeNoise
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 3 + Math.random() * 8;
      const greenVal = Math.floor(100 + Math.random() * 120);
      ctx.strokeStyle = `rgb(20, ${greenVal}, 40)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y - len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates a realistic asphalt track texture with grain noise and race track markings
   */
  static createAsphaltTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark Asphalt base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Grain noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 25;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // White dashed center line
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // Red-white kerb border
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 16, 512);
    ctx.fillRect(496, 0, 16, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates a realistic wood grain texture for furniture/chessboards
   */
  static createWoodTexture(isDark = false): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isDark ? '#451a03' : '#b45309';
    ctx.fillRect(0, 0, 512, 512);

    // Wood rings / grain lines
    ctx.strokeStyle = isDark ? '#270e02' : '#78350f';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      const y = i * 12 + Math.sin(i) * 5;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + 10, 340, y - 10, 512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates a polished marble texture for 3D chess board
   */
  static createMarbleTexture(isDark = false): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    // Marble veins
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 512) {
        x += (Math.random() - 0.5) * 30;
        y += 20 + Math.random() * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates weathered brick/concrete texture for horror/FPS walls
   */
  static createBrickTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Mortar grey background
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 512, 512);

    // Red/brown brick blocks
    ctx.fillStyle = '#7f1d1d';
    const brickH = 32;
    const brickW = 64;

    for (let r = 0; r < 512 / brickH; r++) {
      const offsetX = (r % 2) * (brickW / 2);
      for (let c = -1; c < (512 / brickW) + 1; c++) {
        const x = c * brickW + offsetX;
        const y = r * brickH;
        ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
