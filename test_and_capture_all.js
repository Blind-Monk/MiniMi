const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const gameIds = [
  'pvz',
  'turbo-speed',
  'chess3d',
  'card-clash',
  'snakes-ladders',
  'mario3d',
  'fps3d',
  'horror3d',
  'city-sprint',
  'snake',
  '2048',
  'blockfall',
  'maze-muncher'
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4200...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });

  // Ensure output folders exist
  if (!fs.existsSync('all games')) fs.mkdirSync('all games', { recursive: true });
  if (!fs.existsSync('all_games')) fs.mkdirSync('all_games', { recursive: true });

  for (const gameId of gameIds) {
    console.log(`Testing and capturing screenshot for game: ${gameId}`);

    // Return home first if an item is already selected
    const closeButton = await page.$('button:has-text("✕ Close")');
    if (closeButton) {
      await closeButton.click();
      await page.waitForTimeout(300);
    }

    // Click on the game card
    const cardSelector = `div:has(h3:has-text("${gameId}"))`;
    // Find card by matching text or clicking catalog item
    await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div.bg-slate-800'));
      for (const c of cards) {
        if (c.innerText.toLowerCase().includes(id.toLowerCase())) {
          c.click();
          return;
        }
      }
    }, gameId);

    await page.waitForTimeout(1500); // Wait for canvas / game rendering & animation

    const screenshotPath = path.join('all games', `${gameId}.png`);
    const screenshotPathUnderscore = path.join('all_games', `${gameId}.png`);
    await page.screenshot({ path: screenshotPath });
    await page.screenshot({ path: screenshotPathUnderscore });
    console.log(`Saved screenshot to ${screenshotPath}`);
  }

  await browser.close();
  console.log('All game screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
