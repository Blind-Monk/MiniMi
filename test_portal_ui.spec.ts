import { test } from '@playwright/test';
import * as path from 'path';

test('capture open-source project portal launch view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });

  // Click on 0 A.D. open source catalog card
  const card = page.locator('div.bg-slate-800:has-text("0 A.D.")').first();
  await card.click();
  await page.waitForTimeout(1000);

  const screenshotPath = path.join('all_games', 'open_source_portal.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${screenshotPath}`);
});
