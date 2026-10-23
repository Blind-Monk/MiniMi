import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
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

  it('should toggle favorites', () => {
    const mockEvent = new MouseEvent('click');
    component.toggleFavorite('snake', mockEvent);
    expect(component.isFav('snake')).toBe(true);
  });
});
