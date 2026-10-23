import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CropShape = 'rect' | 'circle' | 'triangle' | 'star' | 'hexagon';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>✂️ Image Cropper & Rotator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Click and drag on the canvas to select a custom crop area. Choose custom crop shapes like circle, triangle, star, or hexagon!
        </p>

        <!-- File Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 transition-colors"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">✂️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Crop or Rotate</p>
        </div>

        @if (imageSrc()) {
          <div class="mt-6 space-y-6">
            <!-- Controls Bar -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Aspect Ratio / Freeform -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Preset Ratio</label>
                <div class="flex flex-wrap gap-1.5">
                  @for (ratio of aspectRatios; track ratio.label) {
                    <button
                      (click)="setRatio(ratio.val)"
                      [class.bg-indigo-600]="selectedRatio() === ratio.val"
                      [class.text-white]="selectedRatio() === ratio.val"
                      [class.bg-slate-700]="selectedRatio() !== ratio.val"
                      [class.text-slate-300]="selectedRatio() !== ratio.val"
                      class="px-2.5 py-1 rounded text-[11px] font-semibold">
                      {{ ratio.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Crop Shape -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Crop Shape</label>
                <div class="flex flex-wrap gap-1.5">
                  @for (shape of shapes; track shape.id) {
                    <button
                      (click)="setShape(shape.id)"
                      [class.bg-indigo-600]="selectedShape() === shape.id"
                      [class.text-white]="selectedShape() === shape.id"
                      [class.bg-slate-700]="selectedShape() !== shape.id"
                      [class.text-slate-300]="selectedShape() !== shape.id"
                      class="px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1">
                      <span>{{ shape.icon }}</span>
                      <span>{{ shape.label }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Rotation -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Rotation Angle: {{ rotation() }}°</label>
                <input type="range" min="-180" max="180" step="90" [ngModel]="rotation()" (ngModelChange)="onRotateChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <!-- Flip & Reset -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Flip & Actions</label>
                <div class="flex flex-wrap gap-2">
                  <button (click)="toggleFlipH()" [class.bg-indigo-600]="flipH()" class="px-2.5 py-1 bg-slate-700 text-white rounded text-xs font-semibold">
                    ↔️ Flip H
                  </button>
                  <button (click)="toggleFlipV()" [class.bg-indigo-600]="flipV()" class="px-2.5 py-1 bg-slate-700 text-white rounded text-xs font-semibold">
                    ↕️ Flip V
                  </button>
                  <button (click)="resetSelection()" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold">
                    🔄 Reset Selection
                  </button>
                </div>
              </div>
            </div>

            <!-- Interactive Canvas Area -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <p class="text-xs text-indigo-400 font-medium">💡 Tip: Click and drag on the image below to adjust your crop selection box!</p>

              <div class="relative overflow-hidden rounded-lg border border-slate-700 cursor-crosshair select-none">
                <canvas #editorCanvas
                        (pointerdown)="onPointerDown($event)"
                        (pointermove)="onPointerMove($event)"
                        (pointerup)="onPointerUp($event)"
                        (pointerleave)="onPointerUp($event)"
                        class="max-w-full touch-none block">
                </canvas>
              </div>

              <button (click)="cropImage()"
                      class="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center space-x-2">
                <span>✂️ Apply Crop</span>
              </button>
            </div>

            <!-- Cropped Result -->
            @if (croppedSrc()) {
              <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center space-y-4">
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cropped Result</h4>
                <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center min-h-[160px]">
                  <img [src]="croppedSrc()" class="max-h-72 object-contain rounded-lg shadow-xl">
                </div>
                <div class="flex justify-end w-full">
                  <a [href]="croppedSrc()" download="cropped-image.png"
                     class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2">
                    <span>⬇️ Download Cropped Image</span>
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageCropperComponent {
  @ViewChild('editorCanvas') editorCanvas!: ElementRef<HTMLCanvasElement>;

  imageSrc = signal<string | null>(null);
  croppedSrc = signal<string | null>(null);
  rotation = signal<number>(0);
  flipH = signal<boolean>(false);
  flipV = signal<boolean>(false);
  selectedRatio = signal<number | null>(null);
  selectedShape = signal<CropShape>('rect');

  aspectRatios = [
    { label: 'Free', val: null },
    { label: '1:1 Square', val: 1 },
    { label: '16:9 Widescreen', val: 16 / 9 },
    { label: '4:3 Standard', val: 4 / 3 }
  ];

  shapes: { id: CropShape; label: string; icon: string }[] = [
    { id: 'rect', label: 'Rectangle', icon: '🔲' },
    { id: 'circle', label: 'Circle', icon: '🔴' },
    { id: 'triangle', label: 'Triangle', icon: '🔺' },
    { id: 'star', label: 'Star', icon: '⭐' },
    { id: 'hexagon', label: 'Hexagon', icon: '⬡' }
  ];

  private loadedImg: HTMLImageElement | null = null;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  // Normalized crop selection box relative to transformed image coordinates [0..1]
  private cropBox = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.imageSrc.set(src);

      const img = new Image();
      img.onload = () => {
        this.loadedImg = img;
        this.resetSelection();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  setRatio(val: number | null) {
    this.selectedRatio.set(val);
    this.adjustCropBoxRatio();
    this.redrawCanvas();
  }

  setShape(shape: CropShape) {
    this.selectedShape.set(shape);
    this.redrawCanvas();
  }

  onRotateChange(angle: number) {
    this.rotation.set(angle);
    this.redrawCanvas();
  }

  toggleFlipH() {
    this.flipH.set(!this.flipH());
    this.redrawCanvas();
  }

  toggleFlipV() {
    this.flipV.set(!this.flipV());
    this.redrawCanvas();
  }

  resetSelection() {
    this.cropBox = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
    this.adjustCropBoxRatio();
    this.redrawCanvas();
  }

  private adjustCropBoxRatio() {
    const ratio = this.selectedRatio();
    if (!ratio) return;

    let w = this.cropBox.w;
    let h = w / ratio;
    if (h > 0.9) {
      h = 0.8;
      w = h * ratio;
    }
    this.cropBox.w = Math.min(0.9, Math.max(0.1, w));
    this.cropBox.h = Math.min(0.9, Math.max(0.1, h));
  }

  // Pointer interactions for dragging custom crop area
  onPointerDown(event: PointerEvent) {
    if (!this.editorCanvas) return;
    const canvas = this.editorCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const mouseX = (event.clientX - rect.left) / rect.width;
    const mouseY = (event.clientY - rect.top) / rect.height;

    this.isDragging = true;
    this.dragStartX = mouseX;
    this.dragStartY = mouseY;

    this.cropBox.x = mouseX;
    this.cropBox.y = mouseY;
    this.cropBox.w = 0.01;
    this.cropBox.h = 0.01;
    this.redrawCanvas();
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDragging || !this.editorCanvas) return;
    const canvas = this.editorCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const currX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const currY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    let x = Math.min(this.dragStartX, currX);
    let y = Math.min(this.dragStartY, currY);
    let w = Math.abs(currX - this.dragStartX);
    let h = Math.abs(currY - this.dragStartY);

    const ratio = this.selectedRatio();
    if (ratio) {
      h = w / ratio;
    }

    this.cropBox = {
      x: Math.max(0, Math.min(0.9, x)),
      y: Math.max(0, Math.min(0.9, y)),
      w: Math.max(0.05, Math.min(1 - x, w)),
      h: Math.max(0.05, Math.min(1 - y, h))
    };

    this.redrawCanvas();
  }

  onPointerUp(event: PointerEvent) {
    this.isDragging = false;
  }

  private redrawCanvas() {
    if (!this.loadedImg || !this.editorCanvas) return;

    const img = this.loadedImg;
    const canvas = this.editorCanvas.nativeElement;

    const isRotated90 = Math.abs(this.rotation()) === 90;
    const displayW = isRotated90 ? img.height : img.width;
    const displayH = isRotated90 ? img.width : img.height;

    // Scale canvas to display dimensions, max 800px width
    const maxDimension = 800;
    const scale = Math.min(1, maxDimension / Math.max(displayW, displayH));
    canvas.width = Math.round(displayW * scale);
    canvas.height = Math.round(displayH * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw transformed image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation() * Math.PI) / 180);
    ctx.scale(this.flipH() ? -1 : 1, this.flipV() ? -1 : 1);

    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dark overlay for unselected areas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crop box dimensions in canvas space
    const boxX = this.cropBox.x * canvas.width;
    const boxY = this.cropBox.y * canvas.height;
    const boxW = this.cropBox.w * canvas.width;
    const boxH = this.cropBox.h * canvas.height;

    // Draw active image selection through shape clip
    ctx.save();
    this.applyShapePath(ctx, boxX, boxY, boxW, boxH, this.selectedShape());
    ctx.clip();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation() * Math.PI) / 180);
    ctx.scale(this.flipH() ? -1 : 1, this.flipV() ? -1 : 1);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw crop border & handles
    ctx.save();
    ctx.strokeStyle = '#6366f1'; // Indigo-500
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    this.applyShapePath(ctx, boxX, boxY, boxW, boxH, this.selectedShape());
    ctx.stroke();
    ctx.restore();
  }

  cropImage() {
    if (!this.loadedImg || !this.editorCanvas) return;

    const editorCanvas = this.editorCanvas.nativeElement;
    const boxX = this.cropBox.x * editorCanvas.width;
    const boxY = this.cropBox.y * editorCanvas.height;
    const boxW = this.cropBox.w * editorCanvas.width;
    const boxH = this.cropBox.h * editorCanvas.height;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.round(boxW));
    cropCanvas.height = Math.max(1, Math.round(boxH));

    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    // Apply shape mask to crop canvas
    this.applyShapePath(ctx, 0, 0, boxW, boxH, this.selectedShape());
    ctx.clip();

    // Draw cropped slice from editor canvas
    ctx.drawImage(
      editorCanvas,
      boxX, boxY, boxW, boxH,
      0, 0, boxW, boxH
    );

    this.croppedSrc.set(cropCanvas.toDataURL('image/png'));
  }

  private applyShapePath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, shape: CropShape) {
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;

    switch (shape) {
      case 'circle':
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        break;

      case 'triangle':
        ctx.moveTo(cx, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        break;

      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx + rx * Math.cos(angle);
          const py = cy + ry * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;

      case 'star':
        const points = 5;
        const outerR = Math.min(rx, ry);
        const innerR = outerR * 0.45;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / points) * i - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;

      case 'rect':
      default:
        ctx.rect(x, y, w, h);
        break;
    }
  }
}
