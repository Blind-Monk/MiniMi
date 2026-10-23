import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { CATALOG_ITEMS } from './core/models/catalog.model';
import { App } from './app';

describe('App Component', () => {
  let component: App;

  beforeEach(() => {
    component = new App();
  });

  it('should create the app instance', () => {
    expect(component).toBeTruthy();
  });

  it('should default to games category', () => {
    expect(component.activeCategory()).toBe('games');
  });

  it('should filter catalog items by query', () => {
    component.searchQuery.set('Groaners');
    expect(component.filteredItems().length).toBeGreaterThan(0);
    expect(component.filteredItems()[0].id).toBe('pvz');
  });

  it('should support fuzzy synonym search', () => {
    component.selectCategory('tools');
    component.searchQuery.set('pdf size');
    expect(component.filteredItems().length).toBeGreaterThan(0);
  });

  it('should toggle favorites', () => {
    const mockEvent = new MouseEvent('click');
    component.toggleFavorite('snake', mockEvent);
    expect(component.isFav('snake')).toBe(true);
  });

  it('should contain all 100 tools in catalog', () => {
    const tools = CATALOG_ITEMS.filter(item => item.category === 'tools');
    expect(tools.length).toBeGreaterThanOrEqual(100);
  });
});
