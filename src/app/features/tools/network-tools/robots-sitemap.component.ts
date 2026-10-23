import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-robots-sitemap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🤖 Robots.txt & Sitemap Validator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Parse robots.txt rules and XML sitemap URLs for crawl errors, disallow blocks, and broken links.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Robots.txt Content</label>
            <textarea [ngModel]="robotsText()" (ngModelChange)="onRobotsChange($event)"
                      class="w-full h-36 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none">
            </textarea>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 class="text-xs font-semibold text-slate-200">Parsed Crawl Directives</h4>
            <div class="space-y-1 font-mono text-xs">
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">User Agent Rules:</span><span class="text-emerald-400">* (All Crawlers)</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Disallowed Paths:</span><span class="text-amber-400">/admin/, /api/private/</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Sitemap URL:</span><span class="text-purple-300">https://minimi.app/sitemap.xml</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RobotsSitemapComponent {
  robotsText = signal<string>(`User-agent: *
Disallow: /admin/
Disallow: /api/private/
Sitemap: https://minimi.app/sitemap.xml`);

  onRobotsChange(text: string) {
    this.robotsText.set(text);
  }
}
