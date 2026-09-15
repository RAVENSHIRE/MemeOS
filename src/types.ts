export type DataSourceStatus = 'LIVE' | 'MOCK' | 'DISCONNECTED';

export interface DataSourcesConfig {
  dexscreener: { status: DataSourceStatus; name: string; info: string };
  solanaRpc: { status: DataSourceStatus; name: string; info: string };
  xRadar: { status: DataSourceStatus; name: string; info: string };
  gemini: { status: DataSourceStatus; name: string; info: string };
  jupiter: { status: DataSourceStatus; name: string; info: string };
}

export type AgentLoopStep =
  | 'CONNECT'
  | 'OBSERVE'
  | 'FOMO_WATCHLIST'
  | 'MARKET_SCAN'
  | 'X_NARRATIVE_SCAN'
  | 'SCORE'
  | 'WATCH'
  | 'NARRATIVE_PROOF'
  | 'TRADE_CANDIDATE'
  | 'RISK_CHECK'
  | 'EXECUTE'
  | 'MONITOR'
  | 'EXIT'
  | 'LEARN';

export interface TokenOpportunity {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change5m: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  fdv: number;
  narrative: string;
  xVelocity: number;
  xMentions1h: number;
  holdersCount: number;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
  rugScore: number;
  mintDisabled: boolean;
  freezeDisabled: boolean;
  top10HoldingPercent: number;
  icon: string;
  narrativeScore?: number;
  aiThesis?: string;
  viralVelocity?: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  recommendedAction?: 'TRADE_CANDIDATE' | 'WATCHLIST' | 'REJECT';
  expectedUpside?: string;
}

export interface ActivePosition {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  tokenIcon: string;
  entryPrice: number;
  currentPrice: number;
  tokenAmount: number;
  investedUsd: number;
  currentValueUsd: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  entryTime: number;
  exitCondition: string;
  stopLossPrice: number;
  takeProfitPrice: number;
  trailingPeakPrice: number;
  targetTakeProfitPercent: number;
  targetStopLossPercent: number;
}

export interface TradeRecord {
  id: string;
  type: 'BUY' | 'SELL';
  tokenSymbol: string;
  tokenName: string;
  priceUsd: number;
  tokenAmount: number;
  totalUsd: number;
  feeUsd: number;
  slippageBps: number;
  realizedPnL?: number;
  pnlPercent?: number;
  timestamp: number;
  reason: string;
  txSignature: string;
}

export interface WalletState {
  connected: boolean;
  address: string;
  solBalance: number;
  solUsdPrice: number;
  solUsdValue: number;
  cashUsd: number; // Liquid dollar balance for trading
  positionsValue: number;
  equity: number;
  isSimulated: boolean;
}

export interface AgentRiskSettings {
  maxPositionSizeUsd: number; // e.g., $1.50
  stopLossPercent: number; // e.g., -15%
  takeProfitPercent: number; // e.g., +40%
  minNarrativeScore: number; // e.g., 75
  minLiquidityUsd: number; // e.g., $50,000
  maxSlippagePercent: number; // e.g., 1.5%
  autoExecute: boolean;
}

export interface CaseStudyReport {
  title: string;
  timestamp: string;
  executiveSummary: string;
  metricsTable: {
    initialCapital: string;
    finalEquity: string;
    netProfitLoss: string;
    totalTrades: number;
    winRate: string;
    expectancy: string;
    totalFees: string;
    avgSlippage: string;
    maxDrawdown: string;
  };
  narrativeAnalysis?: string;
  tradeExecutionAudit?: string;
  keyTakeaways: string[];
  verifiedReproducibility: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  step: AgentLoopStep;
  message: string;
  type: 'info' | 'success' | 'warning' | 'trade' | 'alert';
}

export interface Meme420Stats {
  burnedSolEquivalent: number;
  totalBurnedTokens: number;
  timeToNext420Utc: string;
  halvingProgressPercent: number;
  jointStatus: 'Lit 🔥' | 'Rolling 💨' | 'Passed 🚀' | 'Smoked ⚡';
}
