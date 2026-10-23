import { test, expect } from '@playwright/test';

test('verify card clash wild modal and maze muncher levels', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000);

  // Click on Card Clash
  const cardClash = page.locator('text=Card Clash (Uno Style)');
  if (await cardClash.isVisible()) {
    await cardClash.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'card_clash_gameplay.png' });

    // Close modal
    const closeBtn = page.locator('button:has-text("✕")');
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Click on Maze Muncher
  const mazeMuncher = page.locator('text=Maze Muncher (Pacman)');
  if (await mazeMuncher.isVisible()) {
    await mazeMuncher.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'maze_muncher_levels.png' });
  }
});
