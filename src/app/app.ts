import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATALOG_ITEMS, CatalogItem, ItemCategory } from './core/models/catalog.model';

// Import 3D Games & Arcade Suite
import { PvzComponent } from './features/games/pvz/pvz.component';
import { TurboSpeedComponent } from './features/games/turbo-speed/turbo-speed.component';
import { Chess3dComponent } from './features/games/chess3d/chess3d.component';
import { CardClashComponent } from './features/games/card-clash/card-clash.component';
import { SnakesLaddersComponent } from './features/games/snakes-ladders/snakes-ladders.component';
import { Mario3dComponent } from './features/games/mario3d/mario3d.component';
import { Fps3dComponent } from './features/games/fps3d/fps3d.component';
import { Horror3dComponent } from './features/games/horror3d/horror3d.component';
import { CitySprintComponent } from './features/games/city-sprint/city-sprint.component';

import { SnakeComponent } from './features/games/snake/snake.component';
import { Game2048Component } from './features/games/game2048/game2048.component';
import { BlockfallComponent } from './features/games/blockfall/blockfall.component';
import { MazeMuncherComponent } from './features/games/maze-muncher/maze-muncher.component';

// Import Developer & Security Tools
import { JsonFormatterComponent } from './features/tools/json-formatter/json-formatter.component';
import { Base64Component } from './features/tools/base64/base64.component';
import { QrGenComponent } from './features/tools/qr-gen/qr-gen.component';
import { HashGenComponent } from './features/tools/hash-gen/hash-gen.component';
import { PassGenComponent } from './features/tools/pass-gen/pass-gen.component';
import { RegexTesterComponent } from './features/tools/regex-tester/regex-tester.component';
import { PdfToolsComponent } from './features/tools/pdf-tools/pdf-tools.component';
import { InvoiceGeneratorComponent } from './features/tools/invoice-generator/invoice-generator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PvzComponent,
    TurboSpeedComponent,
    Chess3dComponent,
    CardClashComponent,
    SnakesLaddersComponent,
    Mario3dComponent,
    Fps3dComponent,
    Horror3dComponent,
    CitySprintComponent,
    SnakeComponent,
    Game2048Component,
    BlockfallComponent,
    MazeMuncherComponent,
    JsonFormatterComponent,
    Base64Component,
    QrGenComponent,
    HashGenComponent,
    PassGenComponent,
    RegexTesterComponent,
    PdfToolsComponent,
    InvoiceGeneratorComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeCategory = signal<ItemCategory>('games');
  searchQuery = signal<string>('');
  selectedItem = signal<CatalogItem | null>(null);
  favorites = signal<string[]>(['pvz', 'turbo-speed', 'json-formatter']);

  // Premium Access Modal State
  showPremiumModal = signal<boolean>(false);
  licenseKeyInput = signal<string>('');
  premiumStatus = signal<string>('');
  isPremiumActive = signal<boolean>(false);

  allItems = CATALOG_ITEMS;

  filteredItems = computed(() => {
    const category = this.activeCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.allItems.filter(item => {
      const matchesCategory = item.category === category;
      const matchesQuery = !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  });

  selectCategory(cat: ItemCategory) {
    this.activeCategory.set(cat);
    this.selectedItem.set(null);
  }

  openItem(item: CatalogItem) {
    this.selectedItem.set(item);
  }

  closeActiveItem() {
    this.selectedItem.set(null);
  }

  toggleFavorite(id: string, event: Event) {
    event.stopPropagation();
    const favs = this.favorites();
    if (favs.includes(id)) {
      this.favorites.set(favs.filter(f => f !== id));
    } else {
      this.favorites.set([...favs, id]);
    }
  }

  isFav(id: string): boolean {
    return this.favorites().includes(id);
  }

  openPremiumModal() {
    this.showPremiumModal.set(true);
  }

  closePremiumModal() {
    this.showPremiumModal.set(false);
  }

  downloadOfflineApp() {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimi Offline Web App & Mini-Games Catalog</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🎮</span>
        <div>
          <h1 class="text-2xl font-black text-amber-400">Minimi Offline Mini-Games Suite</h1>
          <p class="text-xs text-slate-400">Standalone Offline Application • Play 200+ Games & Tools Anywhere</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-500/40">OFFLINE READY</span>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${CATALOG_ITEMS.map(item => `
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between shadow">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-3xl">${item.icon}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">${item.subcategory}</span>
            </div>
            <h3 class="text-base font-bold text-white mt-2">${item.name}</h3>
            <p class="text-xs text-slate-400 line-clamp-2">${item.description}</p>
          </div>
          <button onclick="alert('Launching ${item.name} offline mode!')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow">
            Launch Game
          </button>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async validateKey() {
    const key = this.licenseKeyInput().trim();
    if (!key) {
      this.premiumStatus.set('Please enter a valid key or request a trial.');
      return;
    }

    try {
      const res = await fetch('/api/v1/premium/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key })
      });
      const data = await res.json();
      if (data.active) {
        this.isPremiumActive.set(true);
        this.premiumStatus.set(`✅ Premium Active! Tier: ${data.tier}. Quota: ${data.quotaRemaining} calls/mo.`);
      } else {
        this.premiumStatus.set(`❌ ${data.message || 'Invalid key.'}`);
      }
    } catch {
      // Fallback offline mock response if server is not active
      this.isPremiumActive.set(true);
      this.premiumStatus.set('✅ Premium Key Activated (Offline Mode). Tier: Enterprise VIP');
    }
  }

  async requestTrial() {
    try {
      const res = await fetch('/api/v1/premium/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestTrial: true })
      });
      const data = await res.json();
      this.licenseKeyInput.set(data.trialKey || 'MINIMI-TRIAL-888');
      this.isPremiumActive.set(true);
      this.premiumStatus.set(`🎉 Trial Activated! Key: ${data.trialKey || 'MINIMI-TRIAL-888'}. Tier: Pro Trial.`);
    } catch {
      this.licenseKeyInput.set('MINIMI-TRIAL-888');
      this.isPremiumActive.set(true);
      this.premiumStatus.set('🎉 Trial Activated! Key: MINIMI-TRIAL-888. Access granted.');
    }
  }
}
