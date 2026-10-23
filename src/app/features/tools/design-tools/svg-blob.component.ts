import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BlobPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-svg-blob',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💧 SVG Blob & Organic Shape Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate unique organic shapes seeded by high-precision microsecond timestamps. Click and drag control points directly on the preview to sculpt custom vector shapes!
        </p>

        <div class="mt-4 space-y-6">
          <!-- Controls Bar -->
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Vertices: {{ numPoints() }}</label>
              <input type="range" min="3" max="12" [ngModel]="numPoints()" (ngModelChange)="onPointsChange($event)"
                     class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Organic Randomness: {{ randomness() }}%</label>
              <input type="range" min="10" max="90" [ngModel]="randomness()" (ngModelChange)="onRandomnessChange($event)"
                     class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Fill Color</label>
              <div class="flex items-center space-x-2">
                <input type="color" [ngModel]="fillColor()" (ngModelChange)="fillColor.set($event)"
                       class="w-8 h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer">
                <span class="text-xs font-mono text-slate-300">{{ fillColor() }}</span>
              </div>
            </div>

            <div class="flex flex-col justify-end space-y-2">
              <button (click)="generateBlob()" class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5">
                <span>🎲 Randomize (Microsecond Seed)</span>
              </button>
            </div>
          </div>

          <!-- Interactive SVG Preview Canvas -->
          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
            <p class="text-xs text-indigo-400 font-medium mb-3">💡 Tip: Drag the glowing control handles to reshape the organic curve!</p>

            <div class="relative select-none border border-slate-800 rounded-2xl bg-slate-900/50 p-4">
              <svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg"
                   (pointermove)="onPointerMove($event)"
                   (pointerup)="onPointerUp()"
                   (pointerleave)="onPointerUp()"
                   class="drop-shadow-2xl overflow-visible touch-none cursor-crosshair">
                <!-- Blob Path -->
                <path [attr.d]="svgPath()" [attr.fill]="fillColor()" />

                <!-- Control Points -->
                @for (pt of points(); track $index) {
                  <g>
                    <!-- Outer guide ring -->
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="10" fill="transparent"
                            stroke="rgba(99, 102, 241, 0.4)" stroke-width="1.5" class="animate-pulse" />
                    <!-- Drag handle -->
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="6"
                            fill="#6366f1" stroke="#ffffff" stroke-width="2"
                            (pointerdown)="onPointerDown($index, $event)"
                            class="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform" />
                  </g>
                }
              </svg>
            </div>
          </div>

          <!-- Output Actions & Code -->
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-300">Generated SVG Code</label>
              <button (click)="copySvg()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors">
                {{ copyStatus() }}
              </button>
            </div>
            <textarea readonly [value]="fullSvgCode()"
                      class="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:outline-none">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SvgBlobComponent {
  numPoints = signal<number>(6);
  randomness = signal<number>(50);
  fillColor = signal<string>('#6366f1');
  points = signal<BlobPoint[]>([]);
  svgPath = signal<string>('');
  copyStatus = signal<string>('Copy SVG Code');

  private activePointIndex: number | null = null;

  constructor() {
    this.generateBlob();
  }

  onPointsChange(num: number) {
    this.numPoints.set(num);
    this.generateBlob();
  }

  onRandomnessChange(val: number) {
    this.randomness.set(val);
    this.generateBlob();
  }

  // Microsecond pseudo-random generator
  private getMicrosecondSeed(): number {
    const perf = typeof performance !== 'undefined' ? performance.now() : Math.random() * 1000;
    return (Date.now() % 1000000) * 1000 + (perf * 1000) % 1000;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  generateBlob() {
    let seed = this.getMicrosecondSeed();
    const count = this.numPoints();
    const randFactor = this.randomness() / 100;

    const center = 140;
    const baseRadius = 80;
    const pts: BlobPoint[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * (2 * Math.PI);
      seed += 13.37;
      const rVariance = (this.seededRandom(seed) - 0.5) * 2 * (baseRadius * randFactor * 0.7);
      const radius = Math.max(20, baseRadius + rVariance);

      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }

    this.points.set(pts);
    this.updatePathFromPoints(pts);
  }

  onPointerDown(index: number, event: PointerEvent) {
    this.activePointIndex = index;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (this.activePointIndex === null) return;

    const svgElem = (event.currentTarget as HTMLElement).closest('svg');
    if (!svgElem) return;

    const rect = svgElem.getBoundingClientRect();
    const x = Math.max(10, Math.min(270, ((event.clientX - rect.left) / rect.width) * 280));
    const y = Math.max(10, Math.min(270, ((event.clientY - rect.top) / rect.height) * 280));

    const currentPts = [...this.points()];
    currentPts[this.activePointIndex] = {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };

    this.points.set(currentPts);
    this.updatePathFromPoints(currentPts);
  }

  onPointerUp() {
    this.activePointIndex = null;
  }

  // Smooth Catmull-Rom spline / Cubic Bezier curve algorithm
  private updatePathFromPoints(pts: BlobPoint[]) {
    if (pts.length < 3) return;

    const len = pts.length;
    let d = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < len; i++) {
      const p0 = pts[(i - 1 + len) % len];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % len];
      const p3 = pts[(i + 2) % len];

      // Control points for smooth cubic Bezier segment between p1 and p2
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
    }

    d += ' Z';
    this.svgPath.set(d);
  }

  get fullSvgCode(): string {
    return `<svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">\n  <path d="${this.svgPath()}" fill="${this.fillColor()}"/>\n</svg>`;
  }

  copySvg() {
    navigator.clipboard.writeText(this.fullSvgCode);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy SVG Code'), 2000);
  }
}
