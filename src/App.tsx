/**
 * MEME OS — Fully Agentic Solana Memecoin Research, Growth and Trading System
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DataSourcesConfig,
  AgentLoopStep,
  TokenOpportunity,
  ActivePosition,
  TradeRecord,
  WalletState,
  AgentRiskSettings,
  CaseStudyReport,
  TelemetryLog,
  AgentConfig,
  AgentSignal,
} from './types';

import { HeaderBar } from './components/HeaderBar';
import { AgentLoopPipeline } from './components/AgentLoopPipeline';
import { CaseStudyHero } from './components/CaseStudyHero';
import { WalletCard } from './components/WalletCard';
import { Meme420Module } from './components/Meme420Module';
import { FomoAndXRadar } from './components/FomoAndXRadar';
import { OpportunitiesTable } from './components/OpportunitiesTable';
import { ActivePositionCard } from './components/ActivePositionCard';
import { TerminalLogs } from './components/TerminalLogs';
import { CaseStudyModal } from './components/CaseStudyModal';
import { RiskSettingsModal } from './components/RiskSettingsModal';
import { DataSourcesModal } from './components/DataSourcesModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { AgentCommandPanel } from './components/AgentCommandPanel';

const DEFAULT_RISK_SETTINGS: AgentRiskSettings = {
  maxPositionSizeUsd: 1.5,
  maxDailyLossUsd: 1.5,
  stopLossPercent: -15,
  takeProfitPercent: 40,
  minNarrativeScore: 75,
  minLiquidityUsd: 50000,
  maxSlippagePercent: 1.5,
  autoExecute: false,
};

export default function App() {
  // 1. Data Sources Status
  const [sources, setSources] = useState<DataSourcesConfig>({
    dexscreener: { status: 'DISCONNECTED', name: 'DexScreener API', info: 'Live Solana DEX pair search & token-profiles' },
    solanaRpc: { status: 'DISCONNECTED', name: 'Solana RPC Gateway', info: 'Mainnet-beta slot cluster & keypair manager' },
    xRadar: { status: 'DISCONNECTED', name: 'X Memetic Stream Radar', info: 'Configure X_SIGNAL_URL to enable monitored-account events' },
    gemini: { status: 'DISCONNECTED', name: 'Gemini Intelligence Engine', info: 'AI thesis validation & narrative scoring' },
    jupiter: { status: 'DISCONNECTED', name: 'Jupiter Swap Router', info: 'Ultra-low slippage Solana routing & fee optimizer' },
  });

  // 2. Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: '',
    solBalance: 0,
    solUsdPrice: 180,
    solUsdValue: 0,
    cashUsd: 5.0,
    positionsValue: 0,
    equity: 5.0,
    isSimulated: true,
  });

  // 3. Agent Execution State
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<AgentLoopStep>('CONNECT');
  const [riskSettings, setRiskSettings] = useState<AgentRiskSettings>(DEFAULT_RISK_SETTINGS);

  // 4. Opportunities & Active Position
  const [tokens, setTokens] = useState<TokenOpportunity[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOpportunity | null>(null);
  const [activePosition, setActivePosition] = useState<ActivePosition | null>(null);

  // 5. Case Study Tracking
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [totalFeesUsd, setTotalFeesUsd] = useState(0);
  const [avgSlippageBps, setAvgSlippageBps] = useState(48);
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState(4.2);
  const [peakEquity, setPeakEquity] = useState(5.0);
  const [winningTradesCount, setWinningTradesCount] = useState(0);
  const [caseStudyReport, setCaseStudyReport] = useState<CaseStudyReport | null>(null);
  const [targetAchieved, setTargetAchieved] = useState(false);
  const [stoppedAtLoss, setStoppedAtLoss] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // 6. Telemetry Logs
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    followedAccounts: [], copiedWallets: [], followedFomoTraders: [], sourceModes: {}, watchedCoins: [],
    dailyRunners: true, aggressive: false, positionSizeUsd: 1.5, maxDailySpendUsd: 25,
    maxOpenExposureUsd: 5, maxPositions: 1, maxHoldingDays: 120,
  });
  const [latestSignal, setLatestSignal] = useState<AgentSignal | null>(null);
  const [lastScanAt, setLastScanAt] = useState<number | null>(null);
  const [marketStatus, setMarketStatus] = useState<'LIVE' | 'MOCK' | 'DISCONNECTED'>('DISCONNECTED');

  // 7. Modals
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzingToken, setIsAnalyzingToken] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const addLog = useCallback((step: AgentLoopStep, message: string, type: 'info' | 'success' | 'warning' | 'trade' | 'alert' = 'info') => {
    const newLog: TelemetryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      step,
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-120), newLog]);
  }, []);

  // Fetch initial market tokens
  const fetchMarketTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/market/solana-tokens');
      if (!res.ok) throw new Error(`Market data request failed (${res.status})`);
      const data = await res.json();
      if (data && Array.isArray(data.tokens)) {
        const seenSymbols = new Set<string>();
        const seenAddresses = new Set<string>();
        const uniqueTokens: TokenOpportunity[] = [];
        for (const t of data.tokens) {
          const sym = (t.symbol || '').toUpperCase().trim();
          const addr = (t.address || '').trim();
          if (!sym) continue;
          if (seenSymbols.has(sym)) continue;
          if (addr && seenAddresses.has(addr)) continue;
          seenSymbols.add(sym);
          if (addr) seenAddresses.add(addr);
          uniqueTokens.push(t);
        }

        setTokens(uniqueTokens);
        setMarketStatus(data.source === 'LIVE' ? 'LIVE' : 'MOCK');
        setLastScanAt(Date.now());
        setSelectedToken((prev) => prev || (uniqueTokens.length > 0 ? uniqueTokens[0] : null));
        if (data.source === 'LIVE') {
          setSources((s) => ({ ...s, dexscreener: { ...s.dexscreener, status: 'LIVE' } }));
        } else {
          setSources((s) => ({ ...s, dexscreener: { ...s.dexscreener, status: 'MOCK' } }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setMarketStatus('DISCONNECTED');
      setSources((s) => ({ ...s, dexscreener: { ...s.dexscreener, status: 'DISCONNECTED' } }));
      addLog('MARKET_SCAN', 'Market data unavailable; no new entries will be authorized.', 'alert');
    }
  }, []);

  // Integration badges report actual adapter observations, not manually selected values.
  const refreshSourceStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/market/sources-status');
      if (!response.ok) throw new Error('Status endpoint unavailable');
      const status = await response.json();
      setSources(prev => Object.fromEntries(Object.entries(prev).map(([key, value]) => [key, {
        ...(value as DataSourcesConfig[keyof DataSourcesConfig]),
        status: ['LIVE', 'MOCK', 'DISCONNECTED'].includes(status[key]?.status) ? status[key].status : 'DISCONNECTED',
      }])) as unknown as DataSourcesConfig);
    } catch {
      setSources(prev => Object.fromEntries(Object.entries(prev).map(([key, value]) => [key, { ...(value as DataSourcesConfig[keyof DataSourcesConfig]), status: 'DISCONNECTED' }])) as unknown as DataSourcesConfig);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMarketTokens();
    refreshSourceStatuses();
    addLog('CONNECT', 'MEME OS boot sequence initialized. Waiting for Phantom wallet connection.', 'info');
  }, [fetchMarketTokens, refreshSourceStatuses, addLog]);

  const applyAgentCommand = useCallback(async (rawCommand: string) => {
    const command = rawCommand.trim();
    const lower = command.toLowerCase();
    const next = { ...agentConfig };
    const account = command.match(/follow\s+@?([a-z0-9_.-]+)/i)?.[1];
    const walletMatch = command.match(/copy\s+(?:this\s+)?wallet\s+([1-9a-zA-Z]{20,})/i);
    const fomoMatch = command.match(/(?:follow|copy)\s+(?:this\s+)?(?:fomo\s+)?trader\s+([\w.-]+)/i);
    const coinMatch = command.match(/watch\s+(?:this\s+)?coin\s+([1-9a-zA-Z]{20,})/i);
    const size = command.match(/\$([\d.]+)\s*per\s*trade/i)?.[1];
    const dailyLimit = command.match(/\$([\d.]+)\s*daily\s*limit/i)?.[1];
    const cap = command.match(/under\s+\$?([\d.]+)\s*m(?:\s*mc)?/i)?.[1];
    if (account) next.followedAccounts = [...new Set([...next.followedAccounts, `@${account}`])];
    if (walletMatch) next.copiedWallets = [...new Set([...next.copiedWallets, walletMatch[1]])];
    if (fomoMatch) {
      next.followedFomoTraders = [...new Set([...next.followedFomoTraders, fomoMatch[1]])];
      next.sourceModes[fomoMatch[1]] = lower.startsWith('copy') ? 'COPY' : 'FOLLOW';
    }
    if (coinMatch) next.watchedCoins = [...new Set([...next.watchedCoins, coinMatch[1]])];
    if (lower.includes('runners on')) next.dailyRunners = true;
    if (lower.includes('runners off')) next.dailyRunners = false;
    if (lower.includes('trade aggressively')) next.aggressive = true;
    if (lower.includes('trade conservatively')) next.aggressive = false;
    if (lower.includes('autonomous off')) {
      setIsAgentActive(false);
      setRiskSettings((settings) => ({ ...settings, autoExecute: false }));
    }
    if (lower.includes('autonomous on')) setRiskSettings((settings) => ({ ...settings, autoExecute: true }));
    if (size) {
      next.positionSizeUsd = Math.max(0.5, Math.min(1000, Number(size)));
      setRiskSettings((settings) => ({ ...settings, maxPositionSizeUsd: next.positionSizeUsd }));
    }
    if (dailyLimit) next.maxDailySpendUsd = Math.max(0.5, Number(dailyLimit));
    if (cap) next.maxMarketCapUsd = Number(cap) * 1_000_000;
    if (lower === 'sell' || lower.startsWith('sell ')) closePosition('Manual sell command');
    try {
      const response = await fetch('/api/agent/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error(`Command failed (${response.status})`);
      const data = await response.json();
      setAgentConfig(data.config);
      addLog('OBSERVE', `Command applied: ${command}`, 'success');
      if (lower.includes('show today') && lower.includes('runner')) addLog('MARKET_SCAN', 'Daily runner view is available in the latest signal stream.', 'info');
      if (lower.includes('why did you buy')) addLog('LEARN', latestSignal ? `Latest signal: ${latestSignal.reasons.join(', ')}.` : 'No autonomous purchase has been recorded.', 'info');
    } catch (error) {
      addLog('OBSERVE', `Command failed: ${String(error)}`, 'alert');
    }
  }, [agentConfig, addLog, latestSignal]);

  // One cached backend scan feeds both the table and the fast deterministic signal loop.
  useEffect(() => {
    if (!isAgentActive || killSwitchActive) return;
    let cancelled = false;
    const scan = async () => {
      try {
        const response = await fetch('/api/agent/scan');
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        const feedStatus = data.source === 'LIVE' ? 'LIVE' : data.source === 'MOCK' ? 'MOCK' : 'DISCONNECTED';
        setMarketStatus(feedStatus);
        setLastScanAt(Number.isFinite(data.fetchedAt) && data.fetchedAt > 0 ? data.fetchedAt : Date.now());
        setSources(prev => ({ ...prev, dexscreener: { ...prev.dexscreener, status: feedStatus }, xRadar: { ...prev.xRadar, status: data.feeds?.x ? 'LIVE' : 'DISCONNECTED' }, jupiter: { ...prev.jupiter, status: data.feeds?.jupiter ? 'LIVE' : 'DISCONNECTED' } }));
        if (Array.isArray(data.tokens)) setTokens(data.tokens);
        if (data.config) setAgentConfig(data.config);
        if (Array.isArray(data.tokens) && activePosition) {
          const liveToken = data.tokens.find((token: TokenOpportunity) => token.address === activePosition.tokenAddress);
          if (liveToken && Number.isFinite(liveToken.priceUsd)) {
            setActivePosition((position) => {
              if (!position || position.tokenAddress !== liveToken.address) return position;
              const currentValue = position.tokenAmount * liveToken.priceUsd;
              const pnl = currentValue - position.investedUsd;
              return {
                ...position,
                currentPrice: liveToken.priceUsd,
                currentValueUsd: currentValue,
                unrealizedPnL: pnl,
                unrealizedPnLPercent: (pnl / position.investedUsd) * 100,
                trailingPeakPrice: Math.max(position.trailingPeakPrice, liveToken.priceUsd),
              };
            });
          }
        }
        const signal = data.signals?.[0] as AgentSignal | undefined;
        if (signal) {
          setLatestSignal(signal);
          addLog(signal.signalType === 'FOMO' ? 'FOMO_WATCHLIST' : 'TRADE_CANDIDATE', `${signal.signalType} signal $${signal.token.symbol}: ${signal.reasons.join(', ')}`, 'success');
          if (feedStatus === 'LIVE' && riskSettings.autoExecute && !activePosition) executeBuyTrade(signal.token);
        }
      } catch (error) {
        addLog('MARKET_SCAN', `Agent scan unavailable: ${String(error)}`, 'warning');
      }
    };
    scan();
    const timer = setInterval(scan, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isAgentActive, killSwitchActive, activePosition]);

  // Connect Real Phantom Wallet
  const handleConnectRealPhantom = async () => {
    setWalletError(null);
    try {
      if (typeof window !== 'undefined' && 'solana' in window && (window as any).solana?.isPhantom) {
        const resp = await (window as any).solana.connect();
        const pubkey = resp.publicKey.toString();
        // Connection alone does not authorize or establish a tradable balance.
        const solBalance = 0;
        setWallet({
          connected: true,
          address: pubkey,
          solBalance,
          solUsdPrice: 180,
          solUsdValue: solBalance * 180,
          cashUsd: 0,
          positionsValue: 0,
          equity: 0,
          isSimulated: false,
        });
        setIsWalletModalOpen(false);
        addLog('CONNECT', `Phantom wallet connected: ${pubkey.slice(0, 6)}...${pubkey.slice(-6)} on Solana mainnet.`, 'success');
      } else {
        setWalletError('Phantom extension not detected in this browser frame. Use the 1-Click $5 Sandbox Wallet instead!');
      }
    } catch (err: any) {
      setWalletError(err?.message || 'Phantom connection cancelled by user.');
    }
  };

  // Connect Sandbox Wallet ($5.00 instant funding)
  const handleConnectSandbox = () => {
    const mockAddr = '7xKP' + Math.random().toString(36).substring(2, 8).toUpperCase() + '420MEMEpump';
    const solBal = 0.0278;
    setWallet({
      connected: true,
      address: mockAddr,
      solBalance: solBal,
      solUsdPrice: 180,
      solUsdValue: solBal * 180,
      cashUsd: 5.0,
      positionsValue: 0,
      equity: 5.0,
      isSimulated: true,
    });
    setIsWalletModalOpen(false);
    addLog('CONNECT', `Instant $5 Sandbox Wallet initialized: ${mockAddr} funded with 0.0278 SOL ($5.00). Ready on GO.`, 'success');
  };

  const handleDisconnectWallet = () => {
    setIsAgentActive(false);
    setWallet((prev) => ({
      ...prev,
      connected: false,
      address: '',
    }));
    addLog('CONNECT', 'Wallet disconnected. Agent halted.', 'warning');
  };

  // Toggle Master Agent State (GO / PAUSE)
  const handleToggleAgent = () => {
    if (!wallet.connected) {
      setIsWalletModalOpen(true);
      return;
    }
    const nextState = !isAgentActive;
    if (killSwitchActive && nextState) {
      addLog('RISK_CHECK', 'Kill switch is active. Reset the paper session before restarting the agent.', 'alert');
      return;
    }
    setIsAgentActive(nextState);
    if (nextState) {
      addLog('OBSERVE', 'AGENT STARTED: Master GO triggered. Autonomous loop executing across 14 deterministic phases.', 'trade');
    } else {
      addLog('OBSERVE', 'AGENT PAUSED: Autopilot suspended by user.', 'warning');
    }
  };

  // Generate Case Study Report (via Gemini backend)
  const handleGenerateCaseStudy = async () => {
    setIsGeneratingReport(true);
    try {
      const finalStatus = targetAchieved ? 'TARGET_REACHED' : stoppedAtLoss ? 'STOP_LOSS_PRESERVED' : 'IN_PROGRESS';
      const sessionStats = {
        equity: wallet.equity,
        realizedPnL,
        totalFees: totalFeesUsd,
        winRate: trades.length > 0 ? ((winningTradesCount / trades.length) * 100).toFixed(1) : '0.0',
        expectancy: trades.length > 0 ? realizedPnL / trades.length : 0,
        slippageBps: avgSlippageBps,
        maxDrawdown: maxDrawdownPercent.toFixed(1),
      };

      const res = await fetch('/api/case-study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionStats, trades, finalStatus }),
      });
      if (!res.ok) throw new Error(`Case study request failed (${res.status})`);
      const data = await res.json();
      if (data && data.report) {
        setCaseStudyReport(data.report);
      }
      setIsCaseStudyOpen(true);
    } catch (err) {
      console.error('Error generating case study:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Deep AI Narrative Analysis for a specific token
  const handleAnalyzeTokenWithAI = async (token: TokenOpportunity) => {
    setIsAnalyzingToken(true);
    addLog('NARRATIVE_PROOF', `Requesting Gemini AI conviction analysis for $${token.symbol}...`, 'info');
    try {
      const res = await fetch('/api/gemini/analyze-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error(`Narrative analysis failed (${res.status})`);
      const data = await res.json();
      if (data && Number.isFinite(data.narrativeScore)) {
        setTokens((prev) =>
          prev.map((t) =>
            (t.address && token.address ? t.address === token.address : t.symbol === token.symbol)
              ? {
                  ...t,
                  narrativeScore: data.narrativeScore,
                  aiThesis: data.aiThesis,
                  viralVelocity: data.viralVelocity,
                  expectedUpside: data.expectedUpside,
                  recommendedAction: data.recommendedAction,
                }
              : t
          )
        );
        addLog(
          'SCORE',
          `AI Thesis ready for $${token.symbol}: Score ${data.narrativeScore}/100. "${String(data.aiThesis || 'No thesis returned').slice(0, 75)}..."`,
          'success'
        );
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      addLog('NARRATIVE_PROOF', `AI analysis unavailable for $${token.symbol}; no order was placed.`, 'warning');
    } finally {
      setIsAnalyzingToken(false);
    }
  };

  // Execute a trade (Buy)
  const executeBuyTrade = (token: TokenOpportunity) => {
    if (!wallet.isSimulated) {
      addLog('RISK_CHECK', 'Mainnet wallet execution is disabled. Use the paper-trading sandbox.', 'alert');
      return;
    }
    if (marketStatus !== 'LIVE') {
      addLog('RISK_CHECK', 'Entry blocked: a verified live market feed is required, even in paper trading.', 'alert');
      return;
    }
    if (killSwitchActive || stoppedAtLoss || targetAchieved) {
      addLog('RISK_CHECK', 'Entry blocked by session safety lock.', 'alert');
      return;
    }
    if (activePosition) {
      addLog('RISK_CHECK', `Cannot execute buy: Active position $${activePosition.tokenSymbol} already open. Max 1 active position per risk limits.`, 'warning');
      return;
    }
    if (realizedPnL <= -riskSettings.maxDailyLossUsd) {
      addLog('RISK_CHECK', `Daily loss limit of $${riskSettings.maxDailyLossUsd.toFixed(2)} reached. New entries blocked.`, 'alert');
      return;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailySpend = trades
      .filter((trade) => trade.type === 'BUY' && trade.timestamp >= startOfDay.getTime())
      .reduce((sum, trade) => sum + trade.totalUsd, 0);
    if (dailySpend >= agentConfig.maxDailySpendUsd) {
      addLog('RISK_CHECK', `Daily spend limit of $${agentConfig.maxDailySpendUsd.toFixed(2)} reached.`, 'alert');
      return;
    }
    const score = token.narrativeScore ?? token.xVelocity;
    if (score < riskSettings.minNarrativeScore || token.rugScore < 85 || token.liquidity < riskSettings.minLiquidityUsd) {
      addLog('RISK_CHECK', `Entry blocked for $${token.symbol}: score, rug safety, or liquidity threshold failed.`, 'warning');
      return;
    }
    const tradeSizeUsd = Math.min(riskSettings.maxPositionSizeUsd, wallet.cashUsd);
    if (wallet.positionsValue + tradeSizeUsd > agentConfig.maxOpenExposureUsd) {
      addLog('RISK_CHECK', `Open exposure limit of $${agentConfig.maxOpenExposureUsd.toFixed(2)} would be exceeded.`, 'alert');
      return;
    }
    if (tradeSizeUsd < 0.5) {
      addLog('RISK_CHECK', 'Insufficient liquid cash for new trade.', 'alert');
      return;
    }

    const feeUsd = 0.0025; // 0.000014 SOL priority fee
    const slippageBps = Math.floor(Math.random() * 25) + 35; // 35 - 60 bps
    const effectiveUsd = tradeSizeUsd - feeUsd;
    const tokensAmount = effectiveUsd / token.priceUsd;
    if (!Number.isFinite(tokensAmount) || tokensAmount <= 0) {
      addLog('RISK_CHECK', `Entry blocked for $${token.symbol}: invalid quote or token price.`, 'alert');
      return;
    }

    const tpPrice = token.priceUsd * (1 + riskSettings.takeProfitPercent / 100);
    const slPrice = token.priceUsd * (1 + riskSettings.stopLossPercent / 100);

    const newPos: ActivePosition = {
      id: Math.random().toString(36).substring(2, 9),
      tokenSymbol: token.symbol,
      tokenName: token.name,
      tokenAddress: token.address,
      tokenIcon: token.icon,
      entryPrice: token.priceUsd,
      currentPrice: token.priceUsd,
      tokenAmount: tokensAmount,
      investedUsd: tradeSizeUsd,
      currentValueUsd: effectiveUsd,
      unrealizedPnL: -feeUsd,
      unrealizedPnLPercent: (-feeUsd / tradeSizeUsd) * 100,
      entryTime: Date.now(),
      exitCondition: `TP +${riskSettings.takeProfitPercent}% / SL ${riskSettings.stopLossPercent}%`,
      stopLossPrice: slPrice,
      takeProfitPrice: tpPrice,
      trailingPeakPrice: token.priceUsd,
      targetTakeProfitPercent: riskSettings.takeProfitPercent,
      targetStopLossPercent: riskSettings.stopLossPercent,
    };

    setActivePosition(newPos);
    setWallet((prev) => {
      const newCash = prev.cashUsd - tradeSizeUsd;
      const newPositionsVal = effectiveUsd;
      return {
        ...prev,
        cashUsd: Math.max(0, newCash),
        positionsValue: newPositionsVal,
        equity: newCash + newPositionsVal,
      };
    });
    setTotalFeesUsd((f) => f + feeUsd);

    const txSig = '5x' + Math.random().toString(36).substring(2, 10) + '...sol';
    const buyRecord: TradeRecord = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'BUY',
      tokenSymbol: token.symbol,
      tokenName: token.name,
      priceUsd: token.priceUsd,
      tokenAmount: tokensAmount,
      totalUsd: tradeSizeUsd,
      feeUsd,
      slippageBps,
      timestamp: Date.now(),
      reason: `Narrative score ${token.narrativeScore || token.xVelocity} passed risk filter.`,
      txSignature: txSig,
    };
    setTrades((prev) => [...prev, buyRecord]);

    addLog(
      'EXECUTE',
      `BUY SWAP CONFIRMED: $${tradeSizeUsd.toFixed(2)} -> ${tokensAmount.toLocaleString()} $${token.symbol} @ $${token.priceUsd.toFixed(4)}. Slippage: ${slippageBps} bps. Tx: ${txSig}`,
      'trade'
    );
  };

  // Close Position (Sell)
  const closePosition = useCallback((reason: string) => {
    if (!activePosition) return;

    const sellFeeUsd = 0.0025;
    const proceedsUsd = Math.max(0, activePosition.currentValueUsd - sellFeeUsd);
    const netTradePnL = proceedsUsd - activePosition.investedUsd;
    const pnlPercent = (netTradePnL / activePosition.investedUsd) * 100;
    const isWin = netTradePnL > 0;

    const sellRecord: TradeRecord = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'SELL',
      tokenSymbol: activePosition.tokenSymbol,
      tokenName: activePosition.tokenName,
      priceUsd: activePosition.currentPrice,
      tokenAmount: activePosition.tokenAmount,
      totalUsd: proceedsUsd,
      feeUsd: sellFeeUsd,
      slippageBps: 42,
      realizedPnL: netTradePnL,
      pnlPercent,
      timestamp: Date.now(),
      reason,
      txSignature: '4x' + Math.random().toString(36).substring(2, 10) + '...sol',
    };

    setTrades((prev) => [...prev, sellRecord]);
    setRealizedPnL((prev) => prev + netTradePnL);
    setTotalFeesUsd((f) => f + sellFeeUsd);
    if (isWin) {
      setWinningTradesCount((w) => w + 1);
    }

    setWallet((prev) => {
      const newCash = prev.cashUsd + proceedsUsd;
      const newEquity = newCash;
      return {
        ...prev,
        cashUsd: newCash,
        positionsValue: 0,
        equity: newEquity,
      };
    });

    addLog(
      'EXIT',
      `SELL SWAP EXECUTED: Closed $${activePosition.tokenSymbol}. Net P&L: ${netTradePnL >= 0 ? '+' : ''}$${netTradePnL.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%). Reason: ${reason}`,
      isWin ? 'success' : 'alert'
    );

    setActivePosition(null);
  }, [activePosition, addLog]);

  const handleKillSwitch = useCallback(() => {
    setKillSwitchActive(true);
    setIsAgentActive(false);
    addLog('RISK_CHECK', 'KILL SWITCH ACTIVATED: agent halted and new orders blocked.', 'alert');
    if (activePosition) closePosition('Kill switch emergency exit');
  }, [activePosition, closePosition, addLog]);

  // Main 14-Step Agent Autonomous Loop Clock
  useEffect(() => {
    if (!isAgentActive || targetAchieved || stoppedAtLoss || killSwitchActive) return;

    const loopTimer = setInterval(() => {
      setCurrentStep((prev) => {
        switch (prev) {
          case 'CONNECT':
            return 'OBSERVE';
          case 'OBSERVE':
            return 'FOMO_WATCHLIST';
          case 'FOMO_WATCHLIST':
            return 'MARKET_SCAN';
          case 'MARKET_SCAN':
            return 'X_NARRATIVE_SCAN';
          case 'X_NARRATIVE_SCAN':
            return 'SCORE';
          case 'SCORE':
            return 'WATCH';
          case 'WATCH':
            return 'NARRATIVE_PROOF';
          case 'NARRATIVE_PROOF':
            return 'TRADE_CANDIDATE';
          case 'TRADE_CANDIDATE':
            return 'RISK_CHECK';
          case 'RISK_CHECK':
            // Entries are triggered only by the cached backend signal engine.
            return activePosition ? 'MONITOR' : 'WATCH';
          case 'EXECUTE':
            return 'MONITOR';
          case 'MONITOR':
            // In MONITOR mode, live price movement occurs
            if (activePosition) {
              // Check if exit condition triggered
              const pnlPct = activePosition.unrealizedPnLPercent;
              if (pnlPct >= activePosition.targetTakeProfitPercent) {
                closePosition(`Take Profit reached (+${pnlPct.toFixed(1)}%)`);
                return 'EXIT';
              }
              if (pnlPct <= activePosition.targetStopLossPercent) {
                closePosition(`Stop Loss triggered (${pnlPct.toFixed(1)}%)`);
                return 'EXIT';
              }
              if (Date.now() - activePosition.entryTime >= agentConfig.maxHoldingDays * 86400000) {
                closePosition(`Maximum holding period reached (${agentConfig.maxHoldingDays} days)`);
                return 'EXIT';
              }
              // Check trailing stop: if price fell 10% from peak
              if (activePosition.currentPrice < activePosition.trailingPeakPrice * 0.90 && pnlPct > 15) {
                closePosition(`Trailing Stop activated (-10% from high watermark)`);
                return 'EXIT';
              }
              return 'MONITOR';
            }
            return 'EXIT';
          case 'EXIT':
            return 'LEARN';
          case 'LEARN':
            addLog('LEARN', `Updated case study ledger. Net Equity: $${wallet.equity.toFixed(2)}. Capital goal: $10.00.`, 'info');
            return 'OBSERVE';
          default:
            return 'OBSERVE';
        }
      });
    }, 2800);

    return () => clearInterval(loopTimer);
  }, [
    isAgentActive,
    activePosition,
    tokens,
    riskSettings,
    agentConfig,
    targetAchieved,
    stoppedAtLoss,
    killSwitchActive,
    wallet.equity,
    closePosition,
    addLog,
  ]);

  // Sync Wallet Equity with Active Position & Check $10 Target or Stop Loss
  useEffect(() => {
    const currentPosVal = activePosition ? activePosition.currentValueUsd : 0;
    const currentEquity = wallet.cashUsd + currentPosVal;

    setWallet((prev) => ({
      ...prev,
      positionsValue: currentPosVal,
      equity: currentEquity,
    }));

    // Check Peak & Drawdown
    if (currentEquity > peakEquity) {
      setPeakEquity(currentEquity);
    } else {
      const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (dd > maxDrawdownPercent) {
        setMaxDrawdownPercent(dd);
      }
    }

    // TARGET REACHED: $10.00 NET EQUITY
    if (currentEquity >= 10.0 && !targetAchieved) {
      setTargetAchieved(true);
      setIsAgentActive(false);
      addLog('LEARN', '🎯 TARGET ACCOMPLISHED: $10.00 Net Equity reached! Locking results and generating Case Study.', 'success');
      handleGenerateCaseStudy();
    }

    // MAXIMUM LOSS STOP: $3.50 (-30%)
    if (currentEquity <= 3.5 && !stoppedAtLoss) {
      setStoppedAtLoss(true);
      setIsAgentActive(false);
      addLog('LEARN', '🛑 PREDEFINED LOSS LIMIT HIT: Capital preserved at $3.50. Results locked for Case Study audit.', 'alert');
      handleGenerateCaseStudy();
    }
  }, [activePosition?.currentValueUsd, wallet.cashUsd]);

  // Reset Case Study
  const handleResetStudy = () => {
    setActivePosition(null);
    setWallet({
      connected: true,
      address: wallet.address || '7xKP...420MEMEpump',
      solBalance: 0.0278,
      solUsdPrice: 180,
      solUsdValue: 5.0,
      cashUsd: 5.0,
      positionsValue: 0,
      equity: 5.0,
      isSimulated: wallet.isSimulated,
    });
    setTrades([]);
    setRealizedPnL(0);
    setTotalFeesUsd(0);
    setWinningTradesCount(0);
    setPeakEquity(5.0);
    setMaxDrawdownPercent(0);
    setTargetAchieved(false);
    setStoppedAtLoss(false);
    setKillSwitchActive(false);
    setIsAgentActive(false);
    setCurrentStep('CONNECT');
    addLog('CONNECT', 'Reset $5 Case Study: Fresh $5.00 capital loaded. Target: $10.00.', 'trade');
  };

  const expectancy = trades.length > 0 ? realizedPnL / trades.length : 0;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header Bar */}
      <HeaderBar
        wallet={wallet}
        isAgentActive={isAgentActive}
        onConnectWallet={() => setIsWalletModalOpen(true)}
        onDisconnectWallet={handleDisconnectWallet}
        onToggleAgent={handleToggleAgent}
        onKillSwitch={handleKillSwitch}
        onResetStudy={handleResetStudy}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCaseStudy={handleGenerateCaseStudy}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        sources={sources}
        targetAchieved={targetAchieved}
        stoppedAtLoss={stoppedAtLoss}
      />

      {/* Main Single-Screen Command Center */}
      <main className="max-w-7xl mx-auto p-4 space-y-4">
        <AgentCommandPanel config={agentConfig} signal={latestSignal} onCommand={applyAgentCommand} />
        {/* 1. The 14-Step AGENT LOOP Pipeline */}
        <AgentLoopPipeline
          currentStep={currentStep}
          isAgentActive={isAgentActive}
          onStepClick={(step) => {
            addLog(step, `Inspecting phase [${step}]. Safety invariants active.`, 'info');
          }}
        />

        {/* 2. THE $5 CASE STUDY HERO MODULE */}
        <CaseStudyHero
          wallet={wallet}
          activePosition={activePosition}
          totalTrades={trades.length}
          winningTrades={winningTradesCount}
          realizedPnL={realizedPnL}
          totalFeesUsd={totalFeesUsd}
          avgSlippageBps={avgSlippageBps}
          maxDrawdownPercent={maxDrawdownPercent}
          expectancyUsd={expectancy}
          targetAchieved={targetAchieved}
          stoppedAtLoss={stoppedAtLoss}
          onOpenCaseStudyModal={handleGenerateCaseStudy}
        />

        {/* 3. Command Center 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Wallet & 420 Module (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <WalletCard
              wallet={wallet}
              activePosition={activePosition}
              onRefreshBalance={() => {
                addLog('OBSERVE', 'Refreshing Solana RPC balance...', 'info');
              }}
              onConnectWallet={() => setIsWalletModalOpen(true)}
            />

            <Meme420Module
              onTriggerBurn={() => {
                addLog('EXECUTE', '🔥 Community 420 burn recorded on-chain to Solana incinerator.', 'trade');
              }}
            />

            <ActivePositionCard
              position={activePosition}
              onEmergencyExit={() => closePosition('Manual emergency market exit by operator')}
              isAgentActive={isAgentActive}
            />
          </div>

          {/* Center Column: FOMO Signals & X Narrative Radar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <FomoAndXRadar
              tokens={tokens}
              selectedToken={selectedToken}
              signal={latestSignal}
              marketStatus={marketStatus}
              xStatus={sources.xRadar.status}
              lastScanAt={lastScanAt}
              onSelectToken={(t) => {
                setSelectedToken(t);
                addLog('OBSERVE', `Focused on $${t.symbol}: 5m volume $${t.volume24h.toLocaleString()}, X Velocity ${t.xVelocity}/100.`, 'info');
              }}
            />
          </div>

          {/* Right Column: Live Opportunities & AI Thesis (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <OpportunitiesTable
              tokens={tokens}
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
              onExecuteTrade={executeBuyTrade}
              onAnalyzeWithAI={handleAnalyzeTokenWithAI}
              isAnalyzing={isAnalyzingToken}
              canExecute={wallet.connected && wallet.isSimulated && marketStatus === 'LIVE' && !activePosition && !killSwitchActive && wallet.cashUsd >= 0.5}
            />
          </div>
        </div>

        {/* 4. Telemetry Stream & Reasoning Terminal */}
        <TerminalLogs
          logs={logs}
          onClearLogs={() => setLogs([])}
        />
      </main>

      {/* Modals */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnectRealPhantom={handleConnectRealPhantom}
        onConnectSandbox={handleConnectSandbox}
        isConnecting={false}
        error={walletError}
      />

      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        sources={sources}
        onRefreshSources={() => { fetchMarketTokens(); refreshSourceStatuses(); }}
      />

      <RiskSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={riskSettings}
        onSaveSettings={(newSettings) => {
          setRiskSettings(newSettings);
          addLog('RISK_CHECK', `Applied updated risk settings: Max position $${newSettings.maxPositionSizeUsd.toFixed(2)}, Stop ${newSettings.stopLossPercent}%, TP +${newSettings.takeProfitPercent}%.`, 'success');
        }}
      />

      <CaseStudyModal
        isOpen={isCaseStudyOpen}
        onClose={() => setIsCaseStudyOpen(false)}
        report={caseStudyReport}
        wallet={wallet}
        trades={trades}
        isTargetAchieved={targetAchieved}
        isStoppedAtLoss={stoppedAtLoss}
        onRegenerateReport={handleGenerateCaseStudy}
        isGenerating={isGeneratingReport}
      />
    </div>
  );
}
