import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instrument-tuner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎸 Instrument Tuner</span>
        </h3>
        <p class="text-xs text-slate-400">
          Tune guitars, violins, and instruments in real time using microphone input and Web Audio pitch detection.
        </p>

        <div class="mt-6 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-6">
          <button (click)="toggleTuner()"
                  [class.bg-red-600]="isListening()"
                  [class.bg-indigo-600]="!isListening()"
                  class="px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow transition-colors">
            {{ isListening() ? '⏹️ Stop Microphone' : '🎙️ Start Instrument Tuner' }}
          </button>

          @if (isListening()) {
            <div class="space-y-4">
              <div class="text-5xl font-mono font-black text-amber-400">
                {{ detectedNote() }}
              </div>
              <p class="text-xs font-mono text-indigo-300">{{ detectedHz().toFixed(1) }} Hz</p>

              <!-- Tuner Needle Meter -->
              <div class="w-full max-w-md mx-auto bg-slate-950 h-8 rounded-full border border-slate-700 relative overflow-hidden flex items-center justify-center">
                <div class="w-1 h-full bg-emerald-500 absolute left-1/2 -translate-x-1/2"></div>
                <div class="w-2 h-6 bg-amber-400 rounded-full absolute transition-all duration-100 shadow-lg"
                     [style.left.%]="50 + centsOff()"></div>
              </div>
              <p class="text-[10px] font-mono text-slate-400">
                {{ centsOff() === 0 ? 'In Tune ✓' : centsOff() < 0 ? 'Flat (Tighten)' : 'Sharp (Loosen)' }}
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class InstrumentTunerComponent implements OnDestroy {
  isListening = signal<boolean>(false);
  detectedNote = signal<string>('A4');
  detectedHz = signal<number>(440.0);
  centsOff = signal<number>(0);

  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private animFrame: any = null;

  async toggleTuner() {
    if (this.isListening()) {
      this.stopTuner();
    } else {
      await this.startTuner();
    }
  }

  async startTuner() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      this.isListening.set(true);
      const buffer = new Float32Array(analyser.fftSize);

      const update = () => {
        if (!this.isListening()) return;
        analyser.getFloatTimeDomainData(buffer);
        const pitch = this.autoCorrelate(buffer, this.audioCtx!.sampleRate);
        if (pitch !== -1) {
          this.detectedHz.set(pitch);
          this.calculateNote(pitch);
        }
        this.animFrame = requestAnimationFrame(update);
      };
      update();
    } catch {
      alert('Microphone access denied or not available.');
    }
  }

  stopTuner() {
    this.isListening.set(false);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audioCtx) this.audioCtx.close();
  }

  autoCorrelate(buf: Float32Array, sr: number): number {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) {
      let val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.01) return -1; // signal too weak

    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }

    buf = buf.slice(r1, r2);
    size = buf.length;

    let c = new Float32Array(size);
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size - i; j++)
        c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    return sr / T0;
  }

  calculateNote(hz: number) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midi = Math.round(12 * (Math.log2(hz / 440)) + 69);
    const name = noteNames[midi % 12] + Math.floor(midi / 12 - 1);
    this.detectedNote.set(name);

    const targetHz = 440 * Math.pow(2, (midi - 69) / 12);
    const diffCents = Math.max(-40, Math.min(40, Math.round(1200 * Math.log2(hz / targetHz))));
    this.centsOff.set(diffCents);
  }

  ngOnDestroy() {
    this.stopTuner();
  }
}
