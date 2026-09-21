import type { TradeRecord } from '../types';

export function completedTrades(trades: TradeRecord[]): TradeRecord[] {
  return trades.filter(trade => trade.type === 'SELL' && Number.isFinite(trade.realizedPnL));
}

export function ledgerMetrics(trades: TradeRecord[]) {
  const closed = completedTrades(trades);
  const realizedPnL = closed.reduce((sum, trade) => sum + (trade.realizedPnL ?? 0), 0);
  const wins = closed.filter(trade => (trade.realizedPnL ?? 0) > 0).length;
  const totalFees = trades.reduce((sum, trade) => sum + (Number.isFinite(trade.feeUsd) ? trade.feeUsd : 0), 0);
  const avgSlippageBps = trades.length
    ? trades.reduce((sum, trade) => sum + (Number.isFinite(trade.slippageBps) ? trade.slippageBps : 0), 0) / trades.length
    : 0;
  return {
    closedCount: closed.length,
    realizedPnL,
    wins,
    winRate: closed.length ? (wins / closed.length) * 100 : 0,
    expectancy: closed.length ? realizedPnL / closed.length : 0,
    totalFees,
    avgSlippageBps,
  };
}

export function dailySpendUsd(trades: TradeRecord[], date = new Date()): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return trades.filter(trade => trade.type === 'BUY' && trade.timestamp >= start.getTime() && trade.timestamp <= date.getTime())
    .reduce((sum, trade) => sum + trade.totalUsd, 0);
}

export function remainingDailyLossBudget(maxDailyLossUsd: number, todayRealizedPnL: number): number {
  return Math.max(0, maxDailyLossUsd + Math.min(0, todayRealizedPnL));
}

/** Simulated fills are estimates, never actual Jupiter or on-chain executions. */
export function estimatePaperBuy(usd: number, quoteUsd: number, feeUsd = 0.0025, slippageBps = 45) {
  if (![usd, quoteUsd, feeUsd, slippageBps].every(Number.isFinite) ||
      usd <= feeUsd || quoteUsd <= 0 || feeUsd < 0 || slippageBps < 0 || slippageBps >= 10000) {
    throw new Error('Invalid paper buy quote');
  }
  const fillPriceUsd = quoteUsd * (1 + slippageBps / 10000);
  return { fillPriceUsd, tokenAmount: (usd - feeUsd) / fillPriceUsd, feeUsd, slippageBps };
}

/** Selling applies assumed adverse slippage and the stated simulated fee. */
export function estimatePaperSell(tokens: number, quoteUsd: number, feeUsd = 0.0025, slippageBps = 42) {
  if (![tokens, quoteUsd, feeUsd, slippageBps].every(Number.isFinite) ||
      tokens <= 0 || quoteUsd <= 0 || feeUsd < 0 || slippageBps < 0 || slippageBps >= 10000) {
    throw new Error('Invalid paper sell quote');
  }
  const fillPriceUsd = quoteUsd * (1 - slippageBps / 10000);
  return { fillPriceUsd, proceedsUsd: Math.max(0, tokens * fillPriceUsd - feeUsd), feeUsd, slippageBps };
}
