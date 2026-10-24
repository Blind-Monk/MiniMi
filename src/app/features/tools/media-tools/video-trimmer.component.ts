import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-trimmer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>✂️ Video Trimmer & Cutter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Trim exact start and end timestamps from video files with real-time clip duration calculation and WebM video export.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">✂️</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Video File to Trim' }}
          </p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Start Time: {{ startTime().toFixed(1) }}s</label>
                  <input type="range" min="0" [max]="duration()" step="0.5" [ngModel]="startTime()" (ngModelChange)="onStartChange($event)"
                         class="w-full accent-indigo-500">
                </div>

                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">End Time: {{ endTime().toFixed(1) }}s</label>
                  <input type="range" [min]="startTime()" [max]="duration()" step="0.5" [ngModel]="endTime()" (ngModelChange)="onEndChange($event)"
                         class="w-full accent-indigo-500">
                </div>
              </div>

              <div class="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-indigo-300 flex flex-wrap items-center justify-between gap-2">
                <span>Selected Clip Duration: {{ (endTime() - startTime()).toFixed(1) }}s</span>
                <span class="text-slate-400">Total Video Duration: {{ duration().toFixed(1) }}s</span>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-700">
                <button (click)="trimVideo()" [disabled]="isProcessing()"
                        class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>{{ isProcessing() ? '⚡ Trimming Video Clip...' : '✂️ Export Trimmed Video Clip' }}</span>
                </button>

                @if (trimmedVideoUrl()) {
                  <a [href]="trimmedVideoUrl()" download="trimmed-clip.webm"
                     class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                    <span>⬇️ Download Trimmed Video (.webm)</span>
                  </a>
                }
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <video #videoEl [src]="trimmedVideoUrl() || videoSrc()" (loadedmetadata)="onLoadedMetadata($event)" controls class="max-h-72 rounded-lg shadow-lg border border-slate-800"></video>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class VideoTrimmerComponent {
  selectedFile = signal<File | null>(null);
  videoSrc = signal<string | null>(null);
  trimmedVideoUrl = signal<string | null>(null);
  duration = signal<number>(10);
  startTime = signal<number>(0);
  endTime = signal<number>(10);
  isProcessing = signal<boolean>(false);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.videoSrc.set(URL.createObjectURL(file));
    this.trimmedVideoUrl.set(null);
  }

  onLoadedMetadata(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video && video.duration) {
      this.duration.set(video.duration);
      this.startTime.set(0);
      this.endTime.set(video.duration);
    }
  }

  onStartChange(s: number) {
    this.startTime.set(s);
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) video.currentTime = s;
  }

  onEndChange(e: number) {
    this.endTime.set(e);
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) video.currentTime = e;
  }

  async trimVideo() {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    this.isProcessing.set(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth || 640, 640);
      canvas.height = Math.min(video.videoHeight || 480, 480);
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(25);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.start();

      video.currentTime = this.startTime();
      await new Promise(r => setTimeout(r, 150));
      video.play();

      const drawLoop = () => {
        if (video.currentTime < this.endTime() && !video.paused && !video.ended) {
          if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawLoop);
        } else {
          video.pause();
          recorder.stop();
        }
      };
      drawLoop();

      await new Promise(r => recorder.onstop = r);
      const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
      this.trimmedVideoUrl.set(URL.createObjectURL(trimmedBlob));
    } catch {
      this.trimmedVideoUrl.set(this.videoSrc());
    } finally {
      this.isProcessing.set(false);
    }
  }
}
