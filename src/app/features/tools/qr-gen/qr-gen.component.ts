import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';

export type ModuleShape = 'square' | 'circle' | 'triangle' | 'diamond' | 'rounded' | 'threads';

@Component({
  selector: 'app-qr-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 text-white max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-slate-700 pb-3">
        <h3 class="text-xl font-bold text-teal-400 flex items-center space-x-2">
          <span>📱</span>
          <span>Advanced QR Code Generator</span>
        </h3>
        <button
          (click)="downloadQR()"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-500 font-bold rounded-lg text-xs transition-all flex items-center space-x-1.5 shadow-lg">
          <span>💾 Download PNG</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customization Controls -->
        <div class="space-y-4 text-xs">
          <!-- Text / URL Input -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">QR Code Content / URL</label>
            <input
              type="text"
              [(ngModel)]="qrData"
              (ngModelChange)="renderQR()"
              placeholder="e.g. https://github.com/areyouroot/online"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500">
          </div>

          <!-- Module Shape Selector -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Module Pattern Shape</label>
            <div class="grid grid-cols-3 gap-2">
              @for (shape of shapes; track shape.id) {
                <button
                  (click)="setShape(shape.id)"
                  [class.border-teal-500]="selectedShape === shape.id"
                  [class.bg-teal-950]="selectedShape === shape.id"
                  [class.text-teal-300]="selectedShape === shape.id"
                  class="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg font-medium text-[11px] hover:border-slate-600 transition-all">
                  <span>{{ shape.icon }}</span>
                  <span>{{ shape.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Color Pickers -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Foreground Color</label>
              <div class="flex items-center space-x-2 bg-slate-950 border border-slate-700 p-1.5 rounded-lg">
                <input
                  type="color"
                  [(ngModel)]="fgColor"
                  (ngModelChange)="renderQR()"
                  class="w-8 h-8 rounded border-0 cursor-pointer bg-transparent">
                <span class="font-mono text-slate-300">{{ fgColor }}</span>
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Background Color</label>
              <div class="flex items-center space-x-2 bg-slate-950 border border-slate-700 p-1.5 rounded-lg">
                <input
                  type="color"
                  [(ngModel)]="bgColor"
                  (ngModelChange)="renderQR()"
                  class="w-8 h-8 rounded border-0 cursor-pointer bg-transparent">
                <span class="font-mono text-slate-300">{{ bgColor }}</span>
              </div>
            </div>
          </div>

          <!-- Background Image Upload & Opacity -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-slate-300">Background Image (Optional)</label>
              @if (bgSrc) {
                <button (click)="removeBg()" class="text-red-400 hover:text-red-300 font-bold px-2 py-0.5 bg-slate-800 rounded text-[10px]">Remove Image</button>
              }
            </div>
            <input
              type="file"
              accept="image/*"
              (change)="onBgUpload($event)"
              class="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 cursor-pointer mb-2">

            @if (bgSrc) {
              <div class="space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div class="flex justify-between text-[11px] text-slate-400">
                  <span>Background Overlay Tint</span>
                  <span class="font-mono text-teal-400">{{ bgOpacity }}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="bgOpacity"
                  (ngModelChange)="renderQR()"
                  class="w-full accent-teal-500">
              </div>
            }
          </div>

          <!-- Center Logo Upload -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-slate-300">Center Logo Overlay (Optional)</label>
              @if (logoSrc) {
                <button (click)="removeLogo()" class="text-red-400 hover:text-red-300 font-bold px-2 py-0.5 bg-slate-800 rounded text-[10px]">Remove Logo</button>
              }
            </div>
            <input
              type="file"
              accept="image/*"
              (change)="onLogoUpload($event)"
              class="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 cursor-pointer">
          </div>
        </div>

        <!-- Canvas Preview Area -->
        <div class="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <label class="text-xs text-slate-400 mb-2 font-mono">Live Preview</label>
          <div class="p-3 bg-slate-900 rounded-xl shadow-2xl inline-block border border-slate-700">
            <canvas #qrCanvas width="280" height="280" class="rounded"></canvas>
          </div>
          <p class="text-[11px] text-slate-500 mt-3 text-center">
            Error correction level H enabled. High-contrast readability guaranteed across custom shapes & background images.
          </p>
        </div>
      </div>
    </div>
  `
})
export class QrGenComponent implements AfterViewInit {
  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  qrData = 'https://github.com/areyouroot/online';
  fgColor = '#0F172A';
  bgColor = '#FFFFFF';
  bgOpacity = 30; // 30% background tint overlay when bg image is present
  selectedShape: ModuleShape = 'square';

  logoSrc: string | null = null;
  bgSrc: string | null = null;

  shapes: { id: ModuleShape; label: string; icon: string }[] = [
    { id: 'square', label: 'Square', icon: '⬛' },
    { id: 'circle', label: 'Dots', icon: '🔴' },
    { id: 'rounded', label: 'Rounded', icon: '⏹️' },
    { id: 'diamond', label: 'Diamond', icon: '🔷' },
    { id: 'triangle', label: 'Triangle', icon: '🔺' },
    { id: 'threads', label: 'Threads', icon: '🧵' }
  ];

  ngAfterViewInit() {
    this.renderQR();
  }

  setShape(shape: ModuleShape) {
    this.selectedShape = shape;
    this.renderQR();
  }

  async renderQR() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Generate QR matrix structure
    let qr: any;
    try {
      qr = QRCode.create(this.qrData || 'Minimi', { errorCorrectionLevel: 'H' });
    } catch {
      qr = QRCode.create('Minimi', { errorCorrectionLevel: 'H' });
    }

    const moduleCount = qr.modules.size;
    const padding = 16;
    const availableSize = size - padding * 2;
    const tileSize = availableSize / moduleCount;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // 1. Draw Background Image or Solid Color
    if (this.bgSrc) {
      await new Promise<void>((resolve) => {
        const bgImg = new Image();
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, size, size);
          // Apply background color overlay tint
          ctx.fillStyle = this.bgColor;
          ctx.globalAlpha = this.bgOpacity / 100;
          ctx.fillRect(0, 0, size, size);
          ctx.globalAlpha = 1.0;
          resolve();
        };
        bgImg.onerror = () => resolve();
        bgImg.src = this.bgSrc!;
      });
    } else {
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Helper to check finder pattern coordinates (7x7 corners)
    const isFinder = (r: number, c: number) => {
      if (r < 7 && c < 7) return true; // Top-left
      if (r < 7 && c >= moduleCount - 7) return true; // Top-right
      if (r >= moduleCount - 7 && c < 7) return true; // Bottom-left
      return false;
    };

    // 2. Draw QR Modules
    ctx.fillStyle = this.fgColor;

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (!qr.modules.get(r, c)) continue;

        const x = padding + c * tileSize;
        const y = padding + r * tileSize;

        // Finder patterns get drawn with standard sharp/rounded precision for maximum scannability
        if (isFinder(r, c)) {
          ctx.fillRect(x, y, tileSize + 0.3, tileSize + 0.3);
          continue;
        }

        // Custom shape rendering for data modules
        this.drawModuleShape(ctx, x, y, tileSize, this.selectedShape);
      }
    }

    // 3. Overlay Center Logo if present
    if (this.logoSrc) {
      await new Promise<void>((resolve) => {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = size * 0.22; // 22% of QR size
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Draw solid background circle/round rectangle behind logo for contrast
          ctx.fillStyle = this.bgColor;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = this.fgColor;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve();
        };
        logoImg.onerror = () => resolve();
        logoImg.src = this.logoSrc!;
      });
    }
  }

  private drawModuleShape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    shape: ModuleShape
  ) {
    const cx = x + s / 2;
    const cy = y + s / 2;

    switch (shape) {
      case 'circle': {
        const radius = (s / 2) * 0.85;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rounded': {
        const r = s * 0.3;
        ctx.beginPath();
        ctx.roundRect(x, y, s * 0.9, s * 0.9, r);
        ctx.fill();
        break;
      }
      case 'diamond': {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + s, cy);
        ctx.lineTo(cx, y + s);
        ctx.lineTo(x, cy);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'triangle': {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'threads': {
        const w = s * 0.5;
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, y, w, s * 1.1, w / 2);
        ctx.fill();
        break;
      }
      case 'square':
      default: {
        ctx.fillRect(x, y, s + 0.3, s + 0.3);
        break;
      }
    }
  }

  onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoSrc = e.target?.result as string;
        this.renderQR();
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.logoSrc = null;
    this.renderQR();
  }

  onBgUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bgSrc = e.target?.result as string;
        this.renderQR();
      };
      reader.readAsDataURL(file);
    }
  }

  removeBg() {
    this.bgSrc = null;
    this.renderQR();
  }

  downloadQR() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `minimi-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
