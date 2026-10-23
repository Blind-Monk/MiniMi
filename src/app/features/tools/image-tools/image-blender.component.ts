import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-blender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎨 Image Morpher / Blender</span>
        </h3>
        <p class="text-xs text-slate-400">
          Blend two images together using blend modes (multiply, screen, overlay) and opacity blend sliders.
        </p>

        <!-- Two Image Upload Inputs -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50"
               (click)="fileInput1.click()">
            <input #fileInput1 type="file" accept="image/*" class="hidden" (change)="onFileSelected($event, 1)">
            <p class="text-xs font-semibold text-slate-300">Base Image A</p>
            @if (imgA()) {
              <img [src]="imgA()" class="max-h-24 mx-auto mt-2 rounded">
            } @else {
              <span class="text-2xl block my-2">🖼️</span>
            }
          </div>

          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50"
               (click)="fileInput2.click()">
            <input #fileInput2 type="file" accept="image/*" class="hidden" (change)="onFileSelected($event, 2)">
            <p class="text-xs font-semibold text-slate-300">Overlay Image B</p>
            @if (imgB()) {
              <img [src]="imgB()" class="max-h-24 mx-auto mt-2 rounded">
            } @else {
              <span class="text-2xl block my-2">🌌</span>
            }
          </div>
        </div>

        @if (imgA() && imgB()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Blend Mode</label>
                <select [ngModel]="blendMode()" (ngModelChange)="onBlendModeChange($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option value="source-over">Normal / Opacity</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                  <option value="color-dodge">Color Dodge</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Overlay Opacity: {{ opacity() * 100 }}%</label>
                <input type="range" min="0" max="1" step="0.05" [ngModel]="opacity()" (ngModelChange)="onOpacityChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px]">
              @if (blendedSrc()) {
                <img [src]="blendedSrc()" class="max-h-80 object-contain rounded-lg shadow-xl">
              }
            </div>

            @if (blendedSrc()) {
              <div class="flex justify-end">
                <a [href]="blendedSrc()" download="blended-image.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                  <span>⬇️ Download Blended Result</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageBlenderComponent {
  imgA = signal<string | null>(null);
  imgB = signal<string | null>(null);
  blendedSrc = signal<string | null>(null);
  blendMode = signal<GlobalCompositeOperation>('multiply');
  opacity = signal<number>(0.5);

  private loadedA: HTMLImageElement | null = null;
  private loadedB: HTMLImageElement | null = null;

  onFileSelected(event: Event, slot: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (slot === 1) {
          this.imgA.set(src);
          this.loadedA = img;
        } else {
          this.imgB.set(src);
          this.loadedB = img;
        }
        this.blend();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onBlendModeChange(mode: GlobalCompositeOperation) {
    this.blendMode.set(mode);
    this.blend();
  }

  onOpacityChange(val: number) {
    this.opacity.set(val);
    this.blend();
  }

  blend() {
    if (!this.loadedA || !this.loadedB) return;

    const canvas = document.createElement('canvas');
    canvas.width = this.loadedA.width;
    canvas.height = this.loadedA.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(this.loadedA, 0, 0);

    ctx.globalAlpha = this.opacity();
    ctx.globalCompositeOperation = this.blendMode();
    ctx.drawImage(this.loadedB, 0, 0, canvas.width, canvas.height);

    this.blendedSrc.set(canvas.toDataURL('image/png'));
  }
}
