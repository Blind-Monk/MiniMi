import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.setTimeout(120000);

const games = [
  { id: 'pvz', name: 'Garden vs Groaners 3D' },
  { id: 'turbo-speed', name: 'Turbo Speed II SE 3D' },
  { id: 'chess3d', name: '3D Battle Chess' },
  { id: 'card-clash', name: 'Card Clash' },
  { id: 'snakes-ladders', name: '3D Snakes & Ladders' },
  { id: 'mario3d', name: 'Super Plumber 3D' },
  { id: 'fps3d', name: 'Project Vanguard' },
  { id: 'horror3d', name: 'Midnight Asylum' },
  { id: 'city-sprint', name: 'City Sprint' },
  { id: 'snake', name: 'Coil Snake' },
  { id: '2048', name: '2048 Zen' },
  { id: 'blockfall', name: 'Blockfall' },
  { id: 'maze-muncher', name: 'Maze Muncher' }
];

test('capture screenshots for all 13 interactive games', async ({ page }) => {
  if (!fs.existsSync('all_games')) fs.mkdirSync('all_games', { recursive: true });
  if (!fs.existsSync('all games')) fs.mkdirSync('all games', { recursive: true });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });

  for (const game of games) {
    console.log(`Launching game: ${game.name} (${game.id})...`);

    // Close any currently opened game modal
    const closeBtn = page.locator('button:has-text("✕ Close")');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // Click game card
    const card = page.locator(`div.bg-slate-800:has-text("${game.name}")`).first();
    await card.click();
    await page.waitForTimeout(1000);

    // Save screenshots to both 'all games' and 'all_games' folders
    const path1 = path.join('all games', `${game.id}.png`);
    const path2 = path.join('all_games', `${game.id}.png`);
    await page.screenshot({ path: path1, fullPage: true });
    await page.screenshot({ path: path2, fullPage: true });
    console.log(`Saved screenshots for ${game.id}`);
  }
});
