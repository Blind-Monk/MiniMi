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
          Amplify quiet audio and video files up to 500% gain with Web Audio API amplification, real-time gain node processing, and downloadable boosted files.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*,video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📢</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Quiet Audio or Video File' }}
          </p>
        </div>

        @if (mediaUrl()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Volume Gain Multiplier: {{ gainPercent() }}% ({{ (gainPercent() / 100).toFixed(1) }}x)</label>
                <input type="range" min="100" max="500" step="25" [ngModel]="gainPercent()" (ngModelChange)="onGainChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-700">
                <button (click)="processAndRender()" [disabled]="isProcessing()"
                        class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>{{ isProcessing() ? '⚙️ Amplifying Audio & Rendering...' : '⚡ Apply Gain & Generate Download' }}</span>
                </button>

                @if (boostedDownloadUrl()) {
                  <a [href]="boostedDownloadUrl()" [download]="downloadFilename"
                     class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                    <span>⬇️ Download Boosted File</span>
                  </a>
                }
              </div>
            </div>

            <!-- Preview Player -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              @if (isVideo) {
                <video #videoEl [src]="mediaUrl()" controls class="w-full max-w-lg rounded-lg shadow-lg"></video>
              } @else {
                <audio #audioEl [src]="mediaUrl()" controls class="w-full max-w-md"></audio>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioBoosterComponent {
  selectedFile = signal<File | null>(null);
  mediaUrl = signal<string | null>(null);
  gainPercent = signal<number>(250);
  isProcessing = signal<boolean>(false);
  boostedDownloadUrl = signal<string | null>(null);

  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;

  get isVideo(): boolean {
    return !!this.selectedFile()?.type.startsWith('video');
  }

  get downloadFilename(): string {
    const name = this.selectedFile()?.name || 'boosted-media';
    return `boosted-${name}`;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.mediaUrl.set(URL.createObjectURL(file));
    this.boostedDownloadUrl.set(null);
  }

  onGainChange(pct: number) {
    this.gainPercent.set(pct);
    if (this.gainNode) {
      this.gainNode.gain.value = pct / 100;
    }
  }

  async processAndRender() {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const buffer = await file.arrayBuffer();
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(buffer);

      const gainFactor = this.gainPercent() / 100;
      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        decoded.length,
        decoded.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;

      const gain = offlineCtx.createGain();
      gain.gain.value = gainFactor;

      source.connect(gain);
      gain.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = this.audioBufferToWav(renderedBuffer);
      this.boostedDownloadUrl.set(URL.createObjectURL(wavBlob));
    } catch (e) {
      alert('Error processing audio gain: ' + e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
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
    const bufferHeaderLength = 44;
    const wavBuffer = new ArrayBuffer(bufferHeaderLength + dataLength);
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
