import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-open-graph-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎴 Open Graph (OG) Meta Tag Inspector</span>
        </h3>
        <p class="text-xs text-slate-400">
          Preview how website links look when shared on Twitter/X, Facebook, LinkedIn, and Discord social cards.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">OG Title (og:title)</label>
              <input type="text" [ngModel]="ogTitle()" (ngModelChange)="ogTitle.set($event)"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">OG Description (og:description)</label>
              <input type="text" [ngModel]="ogDesc()" (ngModelChange)="ogDesc.set($event)"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white">
            </div>
          </div>

          <!-- Social Card Preview -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto space-y-3">
            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Social Card Preview</span>
            <div class="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div class="h-36 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white">
                Minimi Social Banner
              </div>
              <div class="p-3 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 block">minimi.app</span>
                <h4 class="text-sm font-bold text-white">{{ ogTitle() }}</h4>
                <p class="text-xs text-slate-400 line-clamp-2">{{ ogDesc() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OpenGraphInspectorComponent {
  ogTitle = signal<string>('Minimi — Ultimate 100 Tools Suite');
  ogDesc = signal<string>('Fast, privacy-focused, zero-latency developer and media Swiss Army knife application.');
}
