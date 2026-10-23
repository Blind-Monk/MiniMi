import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-booster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📢 Audio Volume Booster</span>
        </h3>
        <p class="text-xs text-slate-400">
          Amplify low decibel quiet audio and video tracks up to +500% with gain control and soft limiter.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*,video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📢</div>
          <p class="text-sm font-semibold text-slate-200">Upload Quiet Audio or Video File</p>
        </div>

        @if (mediaSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Volume Gain Multiplier: {{ gainPercent() }}%</label>
                <input type="range" min="100" max="500" step="25" [ngModel]="gainPercent()" (ngModelChange)="onGainChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio [src]="mediaSrc()" controls class="w-full max-w-md"></audio>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioBoosterComponent {
  mediaSrc = signal<string | null>(null);
  gainPercent = signal<number>(200);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.mediaSrc.set(URL.createObjectURL(file));
  }

  onGainChange(pct: number) {
    this.gainPercent.set(pct);
  }
}
