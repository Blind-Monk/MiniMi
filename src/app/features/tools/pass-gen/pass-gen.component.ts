import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pass-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 text-white max-w-lg mx-auto space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-700 pb-3">
        <h3 class="text-xl font-bold text-teal-400 flex items-center space-x-2">
          <span>🔑</span>
          <span>Advanced Password & Entropy Generator</span>
        </h3>
        <button
          (click)="generate()"
          class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 font-bold rounded-lg text-xs transition-all flex items-center space-x-1 shadow">
          <span>🔄 Regenerate</span>
        </button>
      </div>

      <!-- Generated Password Field with Copy Button -->
      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-300">Generated Password</label>
        <div class="flex items-center space-x-2">
          <input
            readonly
            [value]="password"
            class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 font-mono text-sm sm:text-base text-teal-300 focus:outline-none select-all">
          <button
            (click)="copyPassword()"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 shadow">
            <span>{{ copied ? '✅ Copied!' : '📋 Copy' }}</span>
          </button>
        </div>
      </div>

      <!-- Password Strength & Real-time Entropy Bar -->
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <div class="flex justify-between items-center text-xs">
          <span class="font-semibold text-slate-300">Strength: <strong [style.color]="strengthColor">{{ strengthLabel }}</strong></span>
          <span class="font-mono text-slate-400">{{ entropyBits.toFixed(1) }} bits of entropy</span>
        </div>
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300 rounded-full"
            [style.width.%]="strengthPercent"
            [style.background-color]="strengthColor">
          </div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>Pool Size: <strong class="text-slate-200 font-mono">{{ poolSize }} chars</strong></span>
          <span>Crack Time: <strong class="text-slate-200 font-mono">{{ crackTimeEstimate }}</strong></span>
        </div>
      </div>

      <!-- Customization Controls -->
      <div class="space-y-4 text-xs">
        <!-- Length Slider -->
        <div class="space-y-1">
          <div class="flex justify-between items-center font-semibold text-slate-300">
            <span>Password Length</span>
            <span class="font-mono text-teal-400 text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{{ length }} characters</span>
          </div>
          <input
            type="range"
            min="4"
            max="128"
            [(ngModel)]="length"
            (ngModelChange)="generate()"
            class="w-full accent-teal-500 cursor-pointer">
        </div>

        <!-- Character Class Toggles -->
        <div class="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="useUpper" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Uppercase (A-Z)</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="useLower" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Lowercase (a-z)</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="useNumbers" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Numbers (0-9)</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="useSymbols" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Symbols (!@#$%^&*)</span>
          </label>
        </div>

        <!-- Advanced Exclusion Filters -->
        <div class="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="excludeSimilar" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Exclude Similar Characters (e.g. <code>i, l, 1, L, o, 0, O</code>)</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer hover:text-teal-300">
            <input type="checkbox" [(ngModel)]="excludeAmbiguous" (ngModelChange)="generate()" class="rounded accent-teal-500">
            <span>Exclude Ambiguous Symbols (e.g. <code>{{ '{' }}, {{ '}' }}, [ ], ( ), / \\ ' " ~ , ; :</code>)</span>
          </label>
        </div>
      </div>
    </div>
  `
})
export class PassGenComponent {
  password = '';
  length = 20;

  useUpper = true;
  useLower = true;
  useNumbers = true;
  useSymbols = true;
  excludeSimilar = false;
  excludeAmbiguous = false;

  copied = false;

  poolSize = 0;
  entropyBits = 0;
  strengthPercent = 0;
  strengthLabel = 'Strong';
  strengthColor = '#10B981';
  crackTimeEstimate = 'Instantly';

  constructor() {
    this.generate();
  }

  generate() {
    let pool = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let nums = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (this.excludeSimilar) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[il1o]/g, '');
      nums = nums.replace(/[01]/g, '');
    }

    if (this.excludeAmbiguous) {
      symbols = '!@#$%^&*-+=?';
    }

    if (this.useUpper) pool += upper;
    if (this.useLower) pool += lower;
    if (this.useNumbers) pool += nums;
    if (this.useSymbols) pool += symbols;

    if (!pool) {
      pool = lower; // Fallback
    }

    this.poolSize = pool.length;

    // Cryptographically secure random selection
    let res = '';
    const array = new Uint32Array(this.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < this.length; i++) {
      res += pool.charAt(array[i] % pool.length);
    }

    this.password = res;
    this.copied = false;
    this.calculateEntropy();
  }

  calculateEntropy() {
    // Entropy formula: E = length * log2(poolSize)
    if (this.poolSize <= 1 || this.length <= 0) {
      this.entropyBits = 0;
    } else {
      this.entropyBits = this.length * Math.log2(this.poolSize);
    }

    // Determine strength rating
    if (this.entropyBits < 36) {
      this.strengthLabel = 'Very Weak';
      this.strengthColor = '#EF4444'; // Red
      this.strengthPercent = 20;
    } else if (this.entropyBits < 60) {
      this.strengthLabel = 'Weak';
      this.strengthColor = '#F59E0B'; // Amber
      this.strengthPercent = 40;
    } else if (this.entropyBits < 80) {
      this.strengthLabel = 'Fair';
      this.strengthColor = '#EAB308'; // Yellow
      this.strengthPercent = 65;
    } else if (this.entropyBits < 100) {
      this.strengthLabel = 'Strong';
      this.strengthColor = '#10B981'; // Green
      this.strengthPercent = 85;
    } else {
      this.strengthLabel = 'Ultra Secure';
      this.strengthColor = '#06B6D4'; // Cyan
      this.strengthPercent = 100;
    }

    // Estimate crack time assuming 100 billion guesses per second
    const combinations = Math.pow(this.poolSize, this.length);
    const guessesPerSec = 1e11;
    const seconds = combinations / guessesPerSec;

    if (seconds < 1) {
      this.crackTimeEstimate = 'Instantly';
    } else if (seconds < 60) {
      this.crackTimeEstimate = `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
      this.crackTimeEstimate = `${Math.round(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
      this.crackTimeEstimate = `${Math.round(seconds / 3600)} hours`;
    } else if (seconds < 31536000) {
      this.crackTimeEstimate = `${Math.round(seconds / 86400)} days`;
    } else if (seconds < 31536000 * 100) {
      this.crackTimeEstimate = `${Math.round(seconds / 31536000)} years`;
    } else if (seconds < 31536000 * 1e6) {
      this.crackTimeEstimate = `${(seconds / 31536000 / 1e3).toFixed(0)}k years`;
    } else {
      this.crackTimeEstimate = 'Trillions of years';
    }
  }

  copyPassword() {
    if (!this.password) return;
    navigator.clipboard.writeText(this.password).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
