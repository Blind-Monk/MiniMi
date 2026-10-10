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
    RegexTesterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeCategory = signal<ItemCategory>('games');
  searchQuery = signal<string>('');
  selectedItem = signal<CatalogItem | null>(null);
  favorites = signal<string[]>(['pvz', 'turbo-speed', 'json-formatter']);

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
}
