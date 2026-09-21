import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { FALLBACK_SOLANA_TOKENS } from './src/server/fallbackTokens';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '64kb' }));

// Helper to clean JSON string from LLM responses
function cleanAndParseJson<T>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    return JSON.parse(clean);
  } catch (e) {
    return fallback;
  }
}

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Fallback curated Solana memecoins with live-like realistic mechanics
// Curated MOCK tokens live in their own fixture module.

// Endpoint: Fetch live Solana tokens (DexScreener + Fallback)
app.get('/api/market/solana-tokens', async (req, res) => {
  try {
    // Attempt DexScreener search for Solana memecoins
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const dsResponse = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=solana%20pump',
      { signal: controller.signal }
    ).catch(() => null);

    clearTimeout(timeoutId);

    if (dsResponse && dsResponse.ok) {
      const data = await dsResponse.json();
      if (data && Array.isArray(data.pairs) && data.pairs.length > 0) {
        // Filter Solana pairs with a valid base token symbol
        const solanaPairs = data.pairs.filter(
          (p: any) => p.chainId === 'solana' && p.baseToken?.symbol
        );

        // Sort descending by 24h volume to retain highest quality pool per token
        solanaPairs.sort((a: any, b: any) => {
          const volA = parseFloat(a.volume?.h24) || 0;
          const volB = parseFloat(b.volume?.h24) || 0;
          return volB - volA;
        });

        // Deduplicate pairs by symbol and baseToken address to prevent duplicate keys
        const seenSymbols = new Set<string>();
        const seenAddresses = new Set<string>();
        const uniquePairs: any[] = [];

        for (const p of solanaPairs) {
          const sym = (p.baseToken?.symbol || '').toUpperCase().trim();
          const addr = (p.baseToken?.address || p.pairAddress || '').trim();
          if (!sym) continue;
          if (seenSymbols.has(sym)) continue;
          if (addr && seenAddresses.has(addr)) continue;

          seenSymbols.add(sym);
          if (addr) seenAddresses.add(addr);
          uniquePairs.push(p);

          if (uniquePairs.length >= 10) break;
        }

        if (uniquePairs.length > 0) {
          const liveTokens = uniquePairs.map((p: any, idx: number) => {
            const price = parseFloat(p.priceUsd) || 0.001;
            const vol24 = parseFloat(p.volume?.h24) || 50000;
            const liq = parseFloat(p.liquidity?.usd) || 25000;
            const change5m = parseFloat(p.priceChange?.m5) || 0;
            const change1h = parseFloat(p.priceChange?.h1) || 0;
            const change24h = parseFloat(p.priceChange?.h24) || 0;
            const symbol = p.baseToken.symbol.toUpperCase();
            const address = p.baseToken.address || p.pairAddress || `${symbol}-${idx}`;

            return {
              address,
              symbol,
              name: p.baseToken.name || symbol,
              priceUsd: price,
              change5m,
              change1h,
              change24h,
              volume24h: vol24,
              liquidity: liq,
              fdv: parseFloat(p.fdv) || (price * 1000000000),
              narrative: `${symbol} Solana DEX pair active on ${p.dexId || 'Raydium/Pump'}.`,
              xVelocity: Math.min(99, Math.max(50, Math.floor(70 + (change5m > 0 ? change5m * 2 : 0)))),
              xMentions1h: 0, // X metrics cannot be inferred from DEX volume
              holdersCount: 0, // no holder-index API in current adapter
              riskLevel: liq > 50000 ? 'LOW' : 'MEDIUM', // liquidity-only heuristic, not an audit
              rugScore: liq > 50000 ? 94 : 82, // legacy heuristic; NOT independently verified
              mintDisabled: false, // unknown, must not be represented as verified
              freezeDisabled: false, // unknown, must not be represented as verified
              top10HoldingPercent: 0, // unavailable; never invent concentration data
              icon: ['🔥', '⚡', '🚀', '💎', '🎯', '🐾', '🤖', '🐶', '🧢', '🌟'][idx % 10],
            };
          });

          return res.json({
            source: 'LIVE',
            provider: 'DexScreener API',
            count: liveTokens.length,
            tokens: liveTokens,
          });
        }
      }
    }

    // Fallback if DexScreener is unreachable/blocked
    res.json({
      source: 'MOCK',
      provider: 'MEME OS Curated Solana Adapter (Fallback)',
      count: FALLBACK_SOLANA_TOKENS.length,
      tokens: FALLBACK_SOLANA_TOKENS,
    });
  } catch (error: any) {
    res.json({
      source: 'MOCK',
      provider: 'MEME OS Local Fallback',
      count: FALLBACK_SOLANA_TOKENS.length,
      tokens: FALLBACK_SOLANA_TOKENS,
    });
  }
});

type AgentConfig = {
  followedAccounts: string[];
  copiedWallets: string[];
  followedFomoTraders: string[];
  sourceModes: Record<string, 'FOLLOW' | 'SIGNAL' | 'COPY'>;
  watchedCoins: string[];
  dailyRunners: boolean;
  aggressive: boolean;
  positionSizeUsd: number;
  maxDailySpendUsd: number;
  maxOpenExposureUsd: number;
  maxPositions: number;
  maxHoldingDays: number;
  maxMarketCapUsd?: number;
};
type Snapshot = { price: number; volume: number; liquidity: number; high: number; at: number };
const agentConfig: AgentConfig = {
  followedAccounts: [], copiedWallets: [], followedFomoTraders: [], sourceModes: {}, watchedCoins: [],
  dailyRunners: true, aggressive: false, positionSizeUsd: 1.5, maxDailySpendUsd: 25,
  maxOpenExposureUsd: 5, maxPositions: 1, maxHoldingDays: 120,
};
const marketCache: { expiresAt: number; tokens: any[]; source: 'LIVE' | 'MOCK' | 'DISCONNECTED'; fetchedAt: number } = { expiresAt: 0, tokens: [], source: 'DISCONNECTED', fetchedAt: 0 };
const externalCache: { expiresAt: number; payload: any } = { expiresAt: 0, payload: {} };
const jupiterCache: { expiresAt: number; prices: Record<string, number> } = { expiresAt: 0, prices: {} };
const history = new Map<string, Snapshot[]>();
const lastSignalAt = new Map<string, number>();
const historyPath = path.join(process.cwd(), 'data', 'runner-history.json');
let lastHistoryPersist = 0;
try {
  const saved = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  Object.entries(saved).forEach(([key, value]) => history.set(key, value as Snapshot[]));
} catch { /* first run or unavailable filesystem */ }

function persistHistory() {
  if (Date.now() - lastHistoryPersist < 15000) return;
  try {
    fs.mkdirSync(path.dirname(historyPath), { recursive: true });
    fs.writeFileSync(historyPath, JSON.stringify(Object.fromEntries(history)), 'utf8');
    lastHistoryPersist = Date.now();
  } catch { /* persistence is best effort; live signals continue */ }
}

function cleanList(values: unknown): string[] {
  return Array.isArray(values) ? values.map((v) => String(v).trim()).filter(Boolean).slice(0, 50) : [];
}

function buildSignals(tokens: any[]) {
  const now = Date.now();
  return tokens.map((token) => {
    const key = token.address || token.symbol;
    const previous = history.get(key) || [];
    const last = previous.at(-1);
    const high = Math.max(token.priceUsd, ...(previous.map((x) => x.high).filter(Number.isFinite)));
    const priceFromHigh = high > 0 ? token.priceUsd / high : 1;
    const volumeAcceleration = last?.volume ? token.volume24h / last.volume : 1;
    const reasons: string[] = [];
    let score = 0;
    let signalType: 'FOMO' | 'RUNNER' | 'MOMENTUM' = 'MOMENTUM';
    if (token.liquidity >= 50000) { score += 20; reasons.push('liquidity floor passed'); }
    if (token.change5m >= 2 || token.change1h >= 8) { score += 25; reasons.push('short-term momentum'); }
    if (volumeAcceleration >= 1.35) { score += 25; reasons.push(`volume acceleration ${volumeAcceleration.toFixed(1)}x`); }
    if (agentConfig.dailyRunners && priceFromHigh < 0.75 && priceFromHigh > 0.35 && volumeAcceleration >= 1.15) {
      score += 25; signalType = 'RUNNER'; reasons.push('drawdown and re-acceleration runner pattern');
    }
    if (token.change5m >= 4 && token.xVelocity >= 85) { score += 15; signalType = 'FOMO'; reasons.push('fast price-derived momentum proxy (not verified X activity)'); }
    if (agentConfig.maxMarketCapUsd && token.fdv > agentConfig.maxMarketCapUsd) score = 0;
    const samples = [...previous, { price: token.priceUsd, volume: token.volume24h, liquidity: token.liquidity, high, at: now }].slice(-24);
    history.set(key, samples);
    return { token, score: Math.min(100, score), signalType, reasons, confidence: Math.min(0.99, score / 100), detectedAt: now };
  }).filter((signal) => signal.score >= (agentConfig.aggressive ? 55 : 70));
}

app.get('/api/agent/config', (_req, res) => res.json({ config: agentConfig }));
app.post('/api/agent/config', (req, res) => {
  const body = req.body || {};
  agentConfig.followedAccounts = cleanList(body.followedAccounts ?? agentConfig.followedAccounts);
  agentConfig.copiedWallets = cleanList(body.copiedWallets ?? agentConfig.copiedWallets);
  agentConfig.followedFomoTraders = cleanList(body.followedFomoTraders ?? agentConfig.followedFomoTraders);
  agentConfig.watchedCoins = cleanList(body.watchedCoins ?? agentConfig.watchedCoins);
  if (body.sourceModes && typeof body.sourceModes === 'object') {
    agentConfig.sourceModes = Object.fromEntries(Object.entries(body.sourceModes).filter(([, mode]) => ['FOLLOW', 'SIGNAL', 'COPY'].includes(String(mode))).slice(0, 100)) as AgentConfig['sourceModes'];
  }
  if (typeof body.dailyRunners === 'boolean') agentConfig.dailyRunners = body.dailyRunners;
  if (typeof body.aggressive === 'boolean') agentConfig.aggressive = body.aggressive;
  if (Number.isFinite(body.positionSizeUsd)) agentConfig.positionSizeUsd = Math.max(0.5, Math.min(1000, Number(body.positionSizeUsd)));
  if (Number.isFinite(body.maxDailySpendUsd)) agentConfig.maxDailySpendUsd = Math.max(0.5, Math.min(100000, Number(body.maxDailySpendUsd)));
  if (Number.isFinite(body.maxOpenExposureUsd)) agentConfig.maxOpenExposureUsd = Math.max(0.5, Math.min(100000, Number(body.maxOpenExposureUsd)));
  if (Number.isFinite(body.maxPositions)) agentConfig.maxPositions = Math.max(1, Math.min(20, Math.floor(Number(body.maxPositions))));
  if (Number.isFinite(body.maxHoldingDays)) agentConfig.maxHoldingDays = Math.max(1, Math.min(120, Math.floor(Number(body.maxHoldingDays))));
  if (body.maxMarketCapUsd === null) delete agentConfig.maxMarketCapUsd;
  else if (Number.isFinite(body.maxMarketCapUsd)) agentConfig.maxMarketCapUsd = Math.max(0, Number(body.maxMarketCapUsd));
  res.json({ config: agentConfig });
});

app.get('/api/agent/scan', async (_req, res) => {
  const now = Date.now();
  try {
  if (marketCache.expiresAt <= now) {
    const response = await fetch(`http://127.0.0.1:${PORT}/api/market/solana-tokens`, { signal: AbortSignal.timeout(6500) }).catch(() => null);
    if (response?.ok) {
      const data = await response.json();
      marketCache.tokens = Array.isArray(data.tokens) ? data.tokens.filter((token: any) => typeof token?.address === 'string' && Number.isFinite(token.priceUsd) && token.priceUsd > 0 && Number.isFinite(token.liquidity)) : [];
      marketCache.source = data.source === 'LIVE' ? 'LIVE' : data.source === 'MOCK' ? 'MOCK' : 'DISCONNECTED';
      marketCache.fetchedAt = now;
      marketCache.expiresAt = now + 15000;
    } else {
      marketCache.source = 'DISCONNECTED';
      marketCache.tokens = [];
      marketCache.expiresAt = now + 5000;
    }
  }
  if (externalCache.expiresAt <= now) {
    const feeds = [
      { kind: 'x', url: process.env.X_SIGNAL_URL },
      { kind: 'onChain', url: process.env.ONCHAIN_SIGNAL_URL },
      { kind: 'pumpSwap', url: process.env.PUMPSWAP_SIGNAL_URL },
    ].filter((feed): feed is { kind: string; url: string } => Boolean(feed.url));
    const results = await Promise.all(feeds.map(async ({ kind, url }) => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
        return response.ok ? { kind, data: await response.json() } : null;
      } catch { return null; }
    }));
    const received = results.filter((result): result is { kind: string; data: any } => result !== null);
    externalCache.payload = {
      configured: feeds.length,
      responses: received.map(result => result.data),
      kinds: received.map(result => result.kind),
      xSignals: received.find(result => result.kind === 'x')?.data?.signals || [],
    };
    externalCache.expiresAt = now + 15000;
  }
  if (jupiterCache.expiresAt <= now && marketCache.tokens.length) {
    const ids = marketCache.tokens.map((token) => token.address).filter(Boolean).slice(0, 20).join(',');
    try {
      jupiterCache.prices = {};
      const response = await fetch(`https://lite-api.jup.ag/price/v2?ids=${encodeURIComponent(ids)}`, { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        const data = await response.json();
        jupiterCache.prices = Object.fromEntries(Object.entries(data.data || {}).map(([address, quote]: [string, any]) => [address, Number(quote?.price)]).filter(([, price]) => Number.isFinite(price)));
      }
    } catch { /* DexScreener remains the cached fallback */ }
    jupiterCache.expiresAt = now + 15000;
  }
  marketCache.tokens = marketCache.tokens.map((token) => jupiterCache.prices[token.address] ? { ...token, priceUsd: jupiterCache.prices[token.address] } : token);
  // Demo and disconnected market data must never generate executable signals.
  const signals = marketCache.source === 'LIVE' ? buildSignals(marketCache.tokens) : [];
  persistHistory();
  const externalSignals = (marketCache.source === 'LIVE' ? externalCache.payload.responses : []).flatMap((payload: any) => Array.isArray(payload?.signals) ? payload.signals : []).map((event: any) => {
    const token = marketCache.tokens.find((item) => item.address === event.tokenAddress || (!event.tokenAddress && item.symbol === event.symbol));
    if (!token) return null;
    const source = String(event.source || event.trader || event.account || 'external');
    const mode = agentConfig.sourceModes[source] || (agentConfig.copiedWallets.includes(source) ? 'COPY' : 'SIGNAL');
    if (mode === 'FOLLOW') return null;
    const rawScore = Number(event.score);
    const score = Math.min(100, Math.max(mode === 'COPY' ? 90 : 0, Number.isFinite(rawScore) ? rawScore : 80));
    return { token, score, signalType: event.signalType === 'FOMO' ? 'FOMO' : 'MOMENTUM', reasons: [mode === 'COPY' ? `copy source ${source}` : `external signal ${source}`, ...(Array.isArray(event.reasons) ? event.reasons.filter((reason: unknown) => typeof reason === 'string').slice(0, 5) : [])], confidence: score / 100, detectedAt: now };
  }).filter(Boolean);
  const xSignals = (Array.isArray(externalCache.payload.xSignals) ? externalCache.payload.xSignals : []).slice(0, 20).map((event: any) => {
    const detectedAt = Number(event.detectedAt || event.timestamp || 0);
    const tokenAddress = String(event.tokenAddress || '');
    if (!tokenAddress || !Number.isFinite(detectedAt) || detectedAt <= 0 || detectedAt > now || now - detectedAt > 5 * 60_000) return null;
    const token = marketCache.tokens.find(item => item.address === tokenAddress);
    if (!token) return null;
    return { tokenAddress, tokenSymbol: token.symbol, source: String(event.source || event.account || 'X adapter').slice(0, 80), score: Number.isFinite(Number(event.score)) ? Math.min(100, Math.max(0, Number(event.score))) : null, detectedAt, reasons: Array.isArray(event.reasons) ? event.reasons.filter((reason: unknown) => typeof reason === 'string').slice(0, 3) : [] };
  }).filter(Boolean);
  const freshSignals = [...externalSignals, ...signals].filter((signal) => now - (lastSignalAt.get(signal.token.address) || 0) > 30000);
  freshSignals.forEach((signal) => lastSignalAt.set(signal.token.address, now));
  res.json({ source: marketCache.source, fetchedAt: marketCache.fetchedAt, tokens: marketCache.tokens, signals: freshSignals.slice(0, 5), config: agentConfig, xSignals, feeds: { dexScreener: marketCache.source === 'LIVE', jupiter: Object.keys(jupiterCache.prices).length > 0, x: externalCache.payload.kinds?.includes('x') || false, onChain: externalCache.payload.kinds?.includes('onChain') || false, pumpSwap: externalCache.payload.kinds?.includes('pumpSwap') || false }, external: { configured: externalCache.payload.configured || 0, received: externalCache.payload.responses?.length || 0 }, cacheExpiresAt: Math.min(marketCache.expiresAt, jupiterCache.expiresAt || marketCache.expiresAt) });
  } catch (error) {
    console.error('Agent scan failed:', error);
    res.status(503).json({ source: 'DISCONNECTED', tokens: [], signals: [], error: 'Agent scan temporarily unavailable' });
  }
});

// Endpoint: Check system integration statuses
app.get('/api/market/sources-status', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    dexscreener: { status: marketCache.source, lastSync: marketCache.fetchedAt ? new Date(marketCache.fetchedAt).toISOString() : null },
    solanaRpc: { status: process.env.SOLANA_RPC_URL ? 'LIVE' : 'DISCONNECTED', cluster: 'mainnet-beta' },
    xRadar: { status: externalCache.payload.kinds?.includes('x') ? 'LIVE' : 'DISCONNECTED', tracker: externalCache.payload.kinds?.includes('x') ? 'X adapter responded' : process.env.X_SIGNAL_URL ? 'Configured; awaiting successful X adapter response' : 'Configure X_SIGNAL_URL' },
    gemini: {
      status: hasGemini ? 'LIVE' : 'MOCK',
      model: 'gemini-3.6-flash',
      mode: hasGemini ? 'Active Server Intelligence' : 'Heuristic Engine (Mock)',
    },
    jupiter: { status: Object.keys(jupiterCache.prices).length ? 'LIVE' : 'DISCONNECTED', router: 'Cached price enrichment; paper route only' },
  });
});

// Endpoint: AI Narrative Scoring & Conviction Thesis via Gemini
app.post('/api/gemini/analyze-narrative', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token data is required' });
  }

  const ai = getGeminiClient();

  // If no Gemini key, return deterministic calculated heuristic analysis
  if (!ai) {
    const calcScore = Math.min(
      98,
      Math.max(
        55,
        Math.floor(
          (token.xVelocity || 75) * 0.45 +
          (token.rugScore || 90) * 0.35 +
          (token.change5m > 0 ? 12 : -5) +
          (token.liquidity > 1000000 ? 8 : 4)
        )
      )
    );

    return res.json({
      source: 'MOCK',
      tokenSymbol: token.symbol,
      narrativeScore: calcScore,
      viralVelocity: calcScore > 85 ? 'EXTREME' : calcScore > 75 ? 'HIGH' : 'MODERATE',
      aiThesis: `Heuristic market summary for ${token.symbol}: 5m price change ${Number(token.change5m || 0).toFixed(2)}%, reported DEX liquidity ${Number(token.liquidity || 0).toFixed(0)}. Social engagement and on-chain security are not independently verified.`,
      riskCheck: {
        passed: false,
        honeypotSafe: false,
        mintRevoked: Boolean(token.mintDisabled),
        freezeRevoked: Boolean(token.freezeDisabled),
        liquidityRisk: token.liquidity > 100000 ? 'MODERATE' : 'HIGH',
      },
      recommendedAction: calcScore >= 78 ? 'TRADE_CANDIDATE' : 'WATCHLIST',
      expectedUpside: 'Not estimated',
    });
  }

  try {
    const prompt = `You are the lead memetic quantitative strategist of MEME OS, an autonomous Solana trading terminal.
Analyze this Solana memecoin:
Symbol: ${token.symbol}
Name: ${token.name}
Price: $${token.priceUsd}
5m Change: ${token.change5m}%
24h Volume: $${token.volume24h?.toLocaleString()}
Liquidity: $${token.liquidity?.toLocaleString()}
Narrative: ${token.narrative}
X Velocity: ${token.xVelocity}/100
RugScore: ${token.rugScore}/100

Respond strictly in JSON matching this format:
{
  "narrativeScore": number (0-100),
  "viralVelocity": "EXTREME" | "HIGH" | "MODERATE" | "LOW",
  "aiThesis": "Punchy, rigorous 2-sentence thesis assessing virality, meme stickiness, and holder conviction.",
  "riskCheck": {
    "passed": boolean,
    "honeypotSafe": boolean,
    "mintRevoked": boolean,
    "freezeRevoked": boolean,
    "liquidityRisk": "SAFE" | "MODERATE" | "HIGH"
  },
  "recommendedAction": "TRADE_CANDIDATE" | "WATCHLIST" | "REJECT",
  "expectedUpside": "e.g. +35% to +80%"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = cleanAndParseJson(response.text, {});
    return res.json({
      source: 'LIVE',
      tokenSymbol: token.symbol,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Gemini Narrative Analysis Error:', error);
    return res.json({
      source: 'MOCK',
      tokenSymbol: token.symbol,
      narrativeScore: 0,
      viralVelocity: 'LOW',
      aiThesis: `Gemini analysis unavailable for ${token.symbol}. Retry to obtain an AI thesis; this is not a verified risk assessment.`,
      riskCheck: {
        passed: false,
        honeypotSafe: false,
        mintRevoked: false,
        freezeRevoked: false,
        liquidityRisk: 'HIGH',
      },
      recommendedAction: 'WATCHLIST',
      expectedUpside: 'Not estimated',
    });
  }
});

// Endpoint: Generate Definitive $5 -> $10 Case Study Audit Report
app.post('/api/case-study/generate', async (req, res) => {
  const { sessionStats, trades, finalStatus } = req.body;
  const ai = getGeminiClient();

  const fallbackReport = {
    title: `MEME OS $5 Case Study Audit: ${finalStatus === 'TARGET_REACHED' ? 'TARGET ACHIEVED ($10 NET EQUITY)' : 'CAPITAL PRESERVED'}`,
    timestamp: new Date().toISOString(),
    executiveSummary: `The paper-trading agent started with $5.00 simulated capital. Orders and fees in this report are simulated rather than on-chain transactions. The session recorded ${trades?.length || 0} trade records. Final simulated equity: ${Number(sessionStats?.equity ?? 5).toFixed(2)}.`,
    metricsTable: {
      initialCapital: '$5.00',
      finalEquity: `${Number(sessionStats?.equity ?? 5).toFixed(2)}`,
      netProfitLoss: `${(Number(sessionStats?.equity ?? 5) - 5).toFixed(2)} (${((Number(sessionStats?.equity ?? 5) - 5) / 5 * 100).toFixed(1)}%)`,
      totalTrades: trades?.length || 0,
      winRate: `${sessionStats?.winRate ?? 'N/A'}%`,
      expectancy: `${Number(sessionStats?.expectancy ?? 0).toFixed(3)} / trade`,
      totalFees: `${Number(sessionStats?.totalFees ?? 0).toFixed(4)}`,
      avgSlippage: `${sessionStats?.slippageBps ?? 'N/A'} bps`,
      maxDrawdown: `${sessionStats?.maxDrawdown ?? 'N/A'}%`,
    },
    keyTakeaways: [
      'Risk scores and inferred social velocity are heuristics, not verified on-chain security or X measurements.',
      'Position limits constrain simulated exposure; they do not eliminate market risk.',
      'Fees and slippage in the ledger are simulated assumptions, not venue-confirmed fills.',
      'Stop-loss and trailing exits depend on quote freshness and execution assumptions.',
    ],
    verifiedReproducibility: 'Not independently verified. Paper-trading results do not establish mainnet execution reproducibility.',
  };

  if (!ai) {
    return res.json({
      source: 'MOCK',
      report: fallbackReport,
    });
  }

  try {
    const prompt = `You are the quantitative auditor for MEME OS, an autonomous Solana memecoin trading system.
A $5 simulated paper-trading case study run has concluded with status: ${finalStatus}. Never call this live trading or claim independently verified safety.
Session Metrics:
Initial Capital: $5.00
Final Equity: $${sessionStats?.equity?.toFixed(2)}
Realized P&L: $${sessionStats?.realizedPnL?.toFixed(2)}
Number of Trades: ${trades?.length || 0}
Win Rate: ${sessionStats?.winRate}%
Expectancy: $${sessionStats?.expectancy?.toFixed(3)}
Total Fees: $${sessionStats?.totalFees?.toFixed(4)}
Max Drawdown: ${sessionStats?.maxDrawdown}%
Trades Log: ${JSON.stringify(trades || [])}

Generate a comprehensive, Wall Street / high-frequency crypto fund grade Case Study report in JSON format:
{
  "title": string,
  "timestamp": string,
  "executiveSummary": string,
  "metricsTable": {
    "initialCapital": string,
    "finalEquity": string,
    "netProfitLoss": string,
    "totalTrades": number,
    "winRate": string,
    "expectancy": string,
    "totalFees": string,
    "avgSlippage": string,
    "maxDrawdown": string
  },
  "narrativeAnalysis": string,
  "tradeExecutionAudit": string,
  "keyTakeaways": [string, string, string, string],
  "verifiedReproducibility": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = cleanAndParseJson(response.text, fallbackReport) as Record<string, any>;
    return res.json({
      source: 'LIVE',
      report: {
        ...fallbackReport,
        executiveSummary: fallbackReport.executiveSummary,
        metricsTable: fallbackReport.metricsTable,
        narrativeAnalysis: typeof parsed.narrativeAnalysis === 'string' ? parsed.narrativeAnalysis : undefined,
        tradeExecutionAudit: typeof parsed.tradeExecutionAudit === 'string' ? parsed.tradeExecutionAudit : undefined,
        keyTakeaways: fallbackReport.keyTakeaways,
        verifiedReproducibility: fallbackReport.verifiedReproducibility,
      },
    });
  } catch (error) {
    console.error('Gemini Case Study generation error:', error);
    return res.json({
      source: 'MOCK',
      report: fallbackReport,
    });
  }
});

// Vite middleware in dev; static dist in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MEME OS server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
