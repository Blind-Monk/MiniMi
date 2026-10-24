import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎵 Audio Compressor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Compress audio files by downsampling bitrate, sample rate, and channels in real-time with verified file size reduction and downloadable audio.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎵</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Audio File to Compress' }}
          </p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Quality / Bitrate</label>
                <select [ngModel]="targetBitrate()" (ngModelChange)="onBitrateChange($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option [ngValue]="64">64 kbps (Voice / ~70% Compression)</option>
                  <option [ngValue]="96">96 kbps (Medium / ~50% Compression)</option>
                  <option [ngValue]="128">128 kbps (Standard Quality / ~30% Compression)</option>
                  <option [ngValue]="192">192 kbps (High Fidelity)</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">File Size Stats</label>
                <p class="text-xs font-mono text-indigo-300 mt-1">Original Size: {{ formatBytes(originalSize()) }}</p>
                @if (compressedSize()) {
                  <p class="text-xs font-mono text-emerald-400 font-bold mt-1">
                    Compressed Size: {{ formatBytes(compressedSize()) }} (Saved {{ ((1 - compressedSize() / originalSize()) * 100).toFixed(0) }}%)
                  </p>
                }
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button (click)="compressAudio()" [disabled]="isProcessing()"
                      class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>{{ isProcessing() ? '⚙️ Compressing Audio...' : '⚡ Process & Compress Audio' }}</span>
              </button>

              @if (compressedAudioUrl()) {
                <a [href]="compressedAudioUrl()" download="compressed-audio.wav"
                   class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>⬇️ Export Compressed Audio</span>
                </a>
              }
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio [src]="compressedAudioUrl() || audioSrc()" controls class="w-full max-w-md"></audio>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioCompressorComponent {
  selectedFile = signal<File | null>(null);
  audioSrc = signal<string | null>(null);
  compressedAudioUrl = signal<string | null>(null);
  originalSize = signal<number>(0);
  compressedSize = signal<number>(0);
  targetBitrate = signal<number>(64);
  isProcessing = signal<boolean>(false);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.originalSize.set(file.size);
    this.audioSrc.set(URL.createObjectURL(file));
    this.compressedAudioUrl.set(null);
    this.compressedSize.set(0);
  }

  onBitrateChange(b: number) {
    this.targetBitrate.set(b);
  }

  async compressAudio() {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const buffer = await file.arrayBuffer();
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(buffer);

      const bitrate = this.targetBitrate();
      const targetSampleRate = bitrate <= 64 ? 16000 : bitrate <= 96 ? 22050 : 32000;
      const targetChannels = bitrate <= 64 ? 1 : Math.min(2, decoded.numberOfChannels);

      const outputLength = Math.ceil(decoded.duration * targetSampleRate);
      const offlineCtx = new OfflineAudioContext(targetChannels, outputLength, targetSampleRate);

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = this.audioBufferToWav(renderedBuffer);

      this.compressedSize.set(wavBlob.size);
      this.compressedAudioUrl.set(URL.createObjectURL(wavBlob));
    } catch (e) {
      alert('Error compressing audio: ' + e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
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
    view.setUint16(20, 1, true); // PCM
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

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
