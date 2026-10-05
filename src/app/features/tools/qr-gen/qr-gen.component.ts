import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 text-white max-w-2xl mx-auto space-y-6">
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

          <!-- Center Logo Upload -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Center Logo Overlay (Optional)</label>
            <div class="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                (change)="onLogoUpload($event)"
                class="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 cursor-pointer">
              @if (logoSrc) {
                <button (click)="removeLogo()" class="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-slate-800 rounded">✕</button>
              }
            </div>
          </div>

          <!-- Background Image Upload -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Background Image (Optional)</label>
            <div class="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                (change)="onBgUpload($event)"
                class="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 cursor-pointer">
              @if (bgSrc) {
                <button (click)="removeBg()" class="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-slate-800 rounded">✕</button>
              }
            </div>
          </div>
        </div>

        <!-- Canvas Preview Area -->
        <div class="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <label class="text-xs text-slate-400 mb-2 font-mono">Live Preview</label>
          <div class="p-3 bg-white rounded-xl shadow-2xl inline-block border border-slate-700">
            <canvas #qrCanvas width="250" height="250" class="rounded"></canvas>
          </div>
          <p class="text-[11px] text-slate-500 mt-3 text-center">
            High error correction enabled (Level H) for center logos and custom backgrounds.
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
  logoSrc: string | null = null;
  bgSrc: string | null = null;

  ngAfterViewInit() {
    this.renderQR();
  }

  async renderQR() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 250;
    canvas.width = size;
    canvas.height = size;

    // 1. Generate Base QR to an offscreen canvas
    const tempCanvas = document.createElement('canvas');
    await QRCode.toCanvas(tempCanvas, this.qrData || 'Minimi', {
      errorCorrectionLevel: 'H',
      width: size,
      margin: 2,
      color: {
        dark: this.fgColor,
        light: this.bgColor
      }
    });

    // 2. Clear main canvas
    ctx.clearRect(0, 0, size, size);

    // 3. Draw background image if provided
    if (this.bgSrc) {
      await new Promise<void>((resolve) => {
        const bgImg = new Image();
        bgImg.onload = () => {
          ctx.globalAlpha = 0.3; // Semitransparent background
          ctx.drawImage(bgImg, 0, 0, size, size);
          ctx.globalAlpha = 1.0;
          resolve();
        };
        bgImg.onerror = () => resolve();
        bgImg.src = this.bgSrc!;
      });
    }

    // 4. Draw QR Code on top
    ctx.drawImage(tempCanvas, 0, 0);

    // 5. Overlay center logo if provided
    if (this.logoSrc) {
      await new Promise<void>((resolve) => {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = size * 0.22; // 22% of QR size
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Background white circle for logo contrast
          ctx.fillStyle = this.bgColor;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 4, 0, Math.PI * 2);
          ctx.fill();

          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve();
        };
        logoImg.onerror = () => resolve();
        logoImg.src = this.logoSrc!;
      });
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
