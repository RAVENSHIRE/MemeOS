import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySpendUsd, ledgerMetrics, remainingDailyLossBudget } from '../src/lib/trading';
import { isFreshLiveMarket } from '../src/lib/api';
import type { TradeRecord } from '../src/types';

const buy: TradeRecord = {
  id: 'buy-1', type: 'BUY', tokenSymbol: 'TEST', tokenName: 'Test', priceUsd: 1,
  tokenAmount: 1, totalUsd: 1.5, feeUsd: 0.0025, slippageBps: 40,
  timestamp: new Date('2026-09-21T12:00:00Z').getTime(), reason: 'test', txSignature: 'paper-buy',
};
const sell: TradeRecord = {
  ...buy, id: 'sell-1', type: 'SELL', totalUsd: 1.7, realizedPnL: 0.2,
  feeUsd: 0.0025, slippageBps: 60, timestamp: new Date('2026-09-21T13:00:00Z').getTime(),
};

test('win rate and expectancy use closed positions rather than BUY and SELL event count', () => {
  const stats = ledgerMetrics([buy, sell]);
  assert.equal(stats.closedCount, 1);
  assert.equal(stats.wins, 1);
  assert.equal(stats.winRate, 100);
  assert.equal(stats.realizedPnL, 0.2);
  assert.equal(stats.expectancy, 0.2);
  assert.equal(stats.totalFees, 0.005);
  assert.equal(stats.avgSlippageBps, 50);
});

test('no completed trades produces finite zero metrics', () => {
  const stats = ledgerMetrics([buy]);
  assert.equal(stats.winRate, 0);
  assert.equal(stats.expectancy, 0);
  assert.equal(stats.closedCount, 0);
});

test('daily spend counts BUY orders in local session day only', () => {
  const now = new Date('2026-09-21T14:00:00Z');
  assert.equal(dailySpendUsd([buy, sell], now), 1.5);
  assert.equal(dailySpendUsd([buy, sell], new Date('2026-09-22T14:00:00Z')), 0);
});

test('daily loss budget cannot fall below zero', () => {
  assert.equal(remainingDailyLossBudget(1.5, -0.5), 1);
  assert.equal(remainingDailyLossBudget(1.5, -2), 0);
  assert.equal(remainingDailyLossBudget(1.5, 2), 1.5);
});

test('only recent actual LIVE market observations authorize entries', () => {
  const now = 100000;
  assert.equal(isFreshLiveMarket('LIVE', now - 1000, now), true);
  assert.equal(isFreshLiveMarket('MOCK', now - 1000, now), false);
  assert.equal(isFreshLiveMarket('DISCONNECTED', now - 1000, now), false);
  assert.equal(isFreshLiveMarket('LIVE', now - 61000, now), false);
  assert.equal(isFreshLiveMarket('LIVE', now + 1000, now), false);
  assert.equal(isFreshLiveMarket('LIVE', null, now), false);
});
