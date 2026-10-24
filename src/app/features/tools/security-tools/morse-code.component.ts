import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-morse-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📻 Morse Code Translator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Translate text to Morse code dots and dashes with real-time audio beep playback.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="textToMorse()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                Text ➔ Morse
              </button>
              <button (click)="playMorseBeeps()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                🔊 Play Audio Beeps
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Text</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Morse Code Output</label>
              <textarea readonly [value]="outputText()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-amber-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MorseCodeComponent {
  inputText = signal<string>('SOS MINIMI');
  outputText = signal<string>('... --- ... / -- .. -. .. -- ..');
  copyStatus = signal<string>('Copy Morse Code');

  private morseMap: Record<string, string> = {
    a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
    i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
    q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
    y: '-.--', z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };

  constructor() {
    this.textToMorse();
  }

  textToMorse() {
    const raw = this.inputText().toLowerCase();
    const result = raw.split('').map(c => c === ' ' ? '/' : (this.morseMap[c] || c)).join(' ');
    this.outputText.set(result);
  }

  async playMorseBeeps() {
    const code = this.outputText();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    for (const char of code) {
      if (char === '.') {
        this.beep(ctx, 600, 0.1);
        await new Promise(r => setTimeout(r, 150));
      } else if (char === '-') {
        this.beep(ctx, 600, 0.3);
        await new Promise(r => setTimeout(r, 350));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  beep(ctx: AudioContext, freq: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Morse Code'), 2000);
  }
}
