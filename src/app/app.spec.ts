import { describe, it, expect, beforeEach } from 'vitest';
import { CATALOG_ITEMS } from './core/models/catalog.model';

describe('App Catalog', () => {
  it('should include pvz in catalog items', () => {
    const pvzItem = CATALOG_ITEMS.find(item => item.id === 'pvz');
    expect(pvzItem).toBeTruthy();
    expect(pvzItem?.name).toContain('Garden');
  });
});
