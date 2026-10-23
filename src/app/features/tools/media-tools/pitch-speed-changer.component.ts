import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pitch-speed-changer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎛️ Audio Pitch & Speed Changer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Modify audio playback tempo/speed (0.5x to 2.0x) and shift pitch keys with real-time Web Audio rendering and downloadable modified audio tracks.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎛️</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Audio File to Change Pitch & Speed' }}
          </p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Playback Speed: {{ playbackRate() }}x</label>
                  <input type="range" min="0.5" max="2.0" step="0.05" [ngModel]="playbackRate()" (ngModelChange)="onRateChange($event)"
                         class="w-full accent-indigo-500">
                </div>

                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Pitch Shift (Semitones): {{ semitones() }}</label>
                  <input type="range" min="-12" max="12" step="1" [ngModel]="semitones()" (ngModelChange)="onSemitonesChange($event)"
                         class="w-full accent-indigo-500">
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-700">
                <button (click)="processAndRender()" [disabled]="isProcessing()"
                        class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>{{ isProcessing() ? '⚡ Rendering Modified Audio...' : '⚙️ Render Modified Audio Track' }}</span>
                </button>

                @if (downloadUrl()) {
                  <a [href]="downloadUrl()" download="modified-audio.wav"
                     class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                    <span>⬇️ Download Modified Audio (WAV)</span>
                  </a>
                }
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio #audioEl [src]="audioSrc()" controls class="w-full max-w-md"></audio>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PitchSpeedChangerComponent {
  selectedFile = signal<File | null>(null);
  audioSrc = signal<string | null>(null);
  playbackRate = signal<number>(1.0);
  semitones = signal<number>(0);
  isProcessing = signal<boolean>(false);
  downloadUrl = signal<string | null>(null);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.audioSrc.set(URL.createObjectURL(file));
    this.downloadUrl.set(null);
  }

  onRateChange(r: number) {
    this.playbackRate.set(r);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    if (audio) {
      audio.playbackRate = r;
    }
  }

  onSemitonesChange(s: number) {
    this.semitones.set(s);
  }

  async processAndRender() {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const buffer = await file.arrayBuffer();
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(buffer);

      const rate = this.playbackRate();
      const pitchRatio = Math.pow(2, this.semitones() / 12);
      const totalRate = rate * pitchRatio;

      const outputLength = Math.ceil(decoded.length / totalRate);
      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        outputLength,
        decoded.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.value = totalRate;

      source.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = this.audioBufferToWav(renderedBuffer);
      this.downloadUrl.set(URL.createObjectURL(wavBlob));
    } catch (e) {
      alert('Error processing audio changes: ' + e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      result = new Float32Array(left.length + right.length);
      for (let i = 0; i < left.length; i++) {
        result[i * 2] = left[i];
        result[i * 2 + 1] = right[i];
      }
    } else {
      result = buffer.getChannelData(0);
    }

    const dataLength = result.length * (bitDepth / 8);
    const wavBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < result.length; i++) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }
}
