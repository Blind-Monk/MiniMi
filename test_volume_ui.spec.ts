import { test } from '@playwright/test';
import * as path from 'path';

test('capture game modal with volume toolbar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });

  // Click on Garden vs Groaners 3D card
  const card = page.locator('div.bg-slate-800:has-text("Garden vs Groaners 3D")').first();
  await card.click();
  await page.waitForTimeout(1000);

  const screenshotPath = path.join('all_games', 'pvz_volume_menu.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${screenshotPath}`);
});
