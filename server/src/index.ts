import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-Memory Leaderboard Storage
interface Highscore {
  gameId: string;
  playerName: string;
  score: number;
  date: string;
}

const highscores: Highscore[] = [
  { gameId: 'pvz', playerName: 'GardenMaster', score: 1450, date: new Date().toISOString() },
  { gameId: 'turbo-speed', playerName: 'SpeedRacer', score: 280, date: new Date().toISOString() },
  { gameId: 'chess3d', playerName: 'Grandmaster3D', score: 1200, date: new Date().toISOString() }
];

// Health Check Endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Minimi Tools & Game Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Premium Access API Endpoint
app.post('/api/v1/premium/access', (req: Request, res: Response) => {
  const { apiKey, toolId, userEmail } = req.body;

  if (!apiKey || apiKey !== 'MINIMI-PREMIUM-PRO-2026') {
    return res.status(200).json({
      status: 'success',
      isPremium: false,
      message: 'Free Tier Active. Upgrade to Premium for unthrottled API limits, batch processing, AI models, and high-res vector exports.',
      premiumFeatures: [
        'Unlimited PDF batch conversions & high-DPI compression',
        'Higher AI PDF context window (up to 500 pages)',
        '4K resolution 3D Game texture packs and Unreal Engine WebGPU streaming',
        'Custom SVG / Vector QR Code branding exports',
        'Dedicated low-latency API endpoints with 99.9% SLA'
      ],
      upgradeUrl: '/docs/API_Documentation.pdf',
      trialKey: 'MINIMI-PREMIUM-PRO-2026'
    });
  }

  res.json({
    status: 'success',
    isPremium: true,
    userEmail: userEmail || 'premium_user@minimi.app',
    toolId: toolId || 'all',
    rateLimit: '10,000 requests/min',
    message: 'Premium Access Verified! Full feature set and unthrottled API endpoints unlocked.'
  });
});

// Tool API: PDF Processing Endpoint Simulation
app.post('/api/v1/tools/pdf/process', (req: Request, res: Response) => {
  const { action, fileName, level } = req.body;
  res.json({
    status: 'success',
    action: action || 'compress',
    originalFile: fileName || 'document.pdf',
    processedFile: `processed_${fileName || 'document.pdf'}`,
    compressionRatio: action === 'compress' ? '58% reduction' : 'N/A',
    downloadUrl: `/api/v1/download/pdf-result-mock`,
    processedAt: new Date().toISOString()
  });
});

// Tool API: QR Code Generator Endpoint
app.post('/api/v1/tools/qr/generate', (req: Request, res: Response) => {
  const { text, color, moduleShape } = req.body;
  res.json({
    status: 'success',
    text: text || 'https://minimi.app',
    moduleShape: moduleShape || 'default',
    color: color || '#000000',
    qrDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f59e0b"/></svg>'
  });
});

// Game Highscores API
app.get('/api/v1/games/highscores/:gameId', (req: Request, res: Response) => {
  const gameScores = highscores.filter(h => h.gameId === req.params.gameId);
  res.json({
    gameId: req.params.gameId,
    scores: gameScores.sort((a, b) => b.score - a.score)
  });
});

app.post('/api/v1/games/highscores', (req: Request, res: Response) => {
  const { gameId, playerName, score } = req.body;
  const newScore = {
    gameId: gameId || 'pvz',
    playerName: playerName || 'Anonymous',
    score: Number(score) || 0,
    date: new Date().toISOString()
  };
  highscores.push(newScore);
  res.json({ status: 'success', scoreRecord: newScore });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimi Backend API running at http://localhost:${PORT}`);
});
