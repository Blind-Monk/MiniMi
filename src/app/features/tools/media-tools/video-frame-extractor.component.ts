import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-frame-extractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🖼️ Video Frame Extractor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Extract crisp high-resolution PNG image frames from video files at exact timestamps or frame steps.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🖼️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Video File to Extract Frames</p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Play or scrub video to target timestamp, then capture frame</span>
              <button (click)="captureCurrentFrame()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                📸 Capture Current Frame
              </button>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <video #videoEl [src]="videoSrc()" controls class="max-h-72 rounded-lg shadow-lg border border-slate-800"></video>
            </div>

            <!-- Captured Frames Gallery -->
            @if (capturedFrames().length > 0) {
              <div class="space-y-3">
                <h4 class="text-xs font-semibold text-slate-300">Captured High-Res Frames ({{ capturedFrames().length }})</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  @for (frame of capturedFrames(); track $index) {
                    <div class="bg-slate-800 p-2 rounded-xl border border-slate-700 text-center space-y-2">
                      <img [src]="frame" class="max-h-32 object-contain mx-auto rounded">
                      <a [href]="frame" [download]="'frame-' + ($index + 1) + '.png'"
                         class="text-[10px] font-bold text-indigo-400 hover:underline block">
                        Download PNG
                      </a>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class VideoFrameExtractorComponent {
  videoSrc = signal<string | null>(null);
  capturedFrames = signal<string[]>([]);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoSrc.set(URL.createObjectURL(file));
    this.capturedFrames.set([]);
  }

  captureCurrentFrame() {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      this.capturedFrames.set([...this.capturedFrames(), dataUrl]);
    }
  }
}
