import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          Crop aspect ratios (1:1, 16:9, 4:3), flip horizontally/vertically, and rotate freely.
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
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Aspect Ratio</label>
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

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Rotation Angle: {{ rotation() }}°</label>
                <input type="range" min="-180" max="180" step="90" [ngModel]="rotation()" (ngModelChange)="onRotateChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Flip Direction</label>
                <div class="flex space-x-2">
                  <button (click)="toggleFlipH()" [class.bg-indigo-600]="flipH()" class="px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-semibold">
                    ↔️ Flip H
                  </button>
                  <button (click)="toggleFlipV()" [class.bg-indigo-600]="flipV()" class="px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-semibold">
                    ↕️ Flip V
                  </button>
                </div>
              </div>
            </div>

            <!-- Cropped Result Canvas -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 min-h-[260px]">
              @if (croppedSrc()) {
                <img [src]="croppedSrc()" class="max-h-80 object-contain rounded-lg border border-slate-800 shadow-xl">
              }
            </div>

            @if (croppedSrc()) {
              <div class="flex justify-end">
                <a [href]="croppedSrc()" download="cropped-image.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2">
                  <span>⬇️ Download Cropped Image</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageCropperComponent {
  imageSrc = signal<string | null>(null);
  croppedSrc = signal<string | null>(null);
  rotation = signal<number>(0);
  flipH = signal<boolean>(false);
  flipV = signal<boolean>(false);
  selectedRatio = signal<number | null>(null); // null = freeform

  aspectRatios = [
    { label: 'Free', val: null },
    { label: '1:1 Square', val: 1 },
    { label: '16:9 Widescreen', val: 16 / 9 },
    { label: '4:3 Standard', val: 4 / 3 }
  ];

  private loadedImg: HTMLImageElement | null = null;

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
        this.applyTransforms();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  setRatio(val: number | null) {
    this.selectedRatio.set(val);
    this.applyTransforms();
  }

  onRotateChange(angle: number) {
    this.rotation.set(angle);
    this.applyTransforms();
  }

  toggleFlipH() {
    this.flipH.set(!this.flipH());
    this.applyTransforms();
  }

  toggleFlipV() {
    this.flipV.set(!this.flipV());
    this.applyTransforms();
  }

  applyTransforms() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const canvas = document.createElement('canvas');

    let w = img.width;
    let h = img.height;

    const ratio = this.selectedRatio();
    if (ratio) {
      if (w / h > ratio) {
        w = h * ratio;
      } else {
        h = w / ratio;
      }
    }

    const angleRad = (this.rotation() * Math.PI) / 180;
    const isRotated90 = Math.abs(this.rotation()) === 90;

    canvas.width = isRotated90 ? h : w;
    canvas.height = isRotated90 ? w : h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angleRad);
    ctx.scale(this.flipH() ? -1 : 1, this.flipV() ? -1 : 1);

    const sourceX = (img.width - w) / 2;
    const sourceY = (img.height - h) / 2;

    ctx.drawImage(img, sourceX, sourceY, w, h, -w / 2, -h / 2, w, h);

    this.croppedSrc.set(canvas.toDataURL('image/png'));
  }
}
