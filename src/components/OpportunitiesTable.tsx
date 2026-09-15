import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Zap,
  TrendingUp,
  Brain,
  Info,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { TokenOpportunity } from '../types';

interface Props {
  tokens: TokenOpportunity[];
  onSelectToken: (token: TokenOpportunity) => void;
  selectedToken: TokenOpportunity | null;
  onExecuteTrade: (token: TokenOpportunity) => void;
  onAnalyzeWithAI: (token: TokenOpportunity) => void;
  isAnalyzing: boolean;
  canExecute: boolean;
}

export const OpportunitiesTable: React.FC<Props> = ({
  tokens,
  onSelectToken,
  selectedToken,
  onExecuteTrade,
  onAnalyzeWithAI,
  isAnalyzing,
  canExecute,
}) => {
  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                LIVE OPPORTUNITIES & AI THESIS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                GEMINI POWERED
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Ranked by Narrative Strength Score, Liquidity Depth & Rug Risk
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1 scrollbar-thin">
        {tokens.map((token, idx) => {
          const isSelected =
            selectedToken?.address && token.address
              ? selectedToken.address === token.address
              : selectedToken?.symbol === token.symbol;
          const score = token.narrativeScore || token.xVelocity || 80;
          const isSafe = token.rugScore >= 85;
          const tokenKey = `opp-token-${token.address || token.symbol}-${idx}`;

          return (
            <div
              key={tokenKey}
              className={`border rounded-xl p-3 transition flex flex-col gap-2.5 ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Row 1: Token, Price, Narrative Score, Risk Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{token.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-white">
                        ${token.symbol}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {token.name}
                      </span>
                      <a
                        href={`https://dexscreener.com/solana/${token.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-cyan-400 transition"
                        title="Open on DexScreener"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                      <span className="text-white font-bold">
                        ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(3)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span
                        className={`font-semibold ${
                          token.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        5m: {token.change5m >= 0 ? '+' : ''}
                        {token.change5m.toFixed(1)}%
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        24h Vol: ${(token.volume24h / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Badges */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {/* Narrative Score Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-mono font-bold text-xs ${
                      score >= 90
                        ? 'bg-purple-950/70 text-purple-300 border-purple-500/50'
                        : score >= 80
                        ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>SCORE: {score}/100</span>
                  </div>

                  {/* Rug Risk Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[10px] font-bold ${
                      isSafe
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                    }`}
                  >
                    {isSafe ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <ShieldAlert className="w-3 h-3 text-amber-400" />}
                    <span>{token.riskLevel} RISK</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Metrics Strip: Liquidity, Momentum, Top 10% */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block uppercase">Liquidity Pool</span>
                  <span className="text-slate-200 font-bold">
                    ${(token.liquidity / 1000).toFixed(0)}k USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">1h / 24h Trend</span>
                  <span className={token.change1h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {token.change1h >= 0 ? '+' : ''}{token.change1h.toFixed(1)}% / {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Top 10 Holders</span>
                  <span className="text-emerald-400 font-bold">
                    {token.top10HoldingPercent}% (Decentralized)
                  </span>
                </div>
              </div>

              {/* Row 3: AI Thesis / Narrative */}
              <div className="bg-[#090d16] border border-cyan-500/20 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Thesis & Memetic Conviction:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {token.aiThesis || token.narrative}
                </p>
                {token.expectedUpside && (
                  <div className="mt-1 text-[10px] font-mono text-emerald-400">
                    Expected Upside: {token.expectedUpside}
                  </div>
                )}
              </div>

              {/* Row 4: Action Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onAnalyzeWithAI(token)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 transition"
                >
                  <Brain className="w-3 h-3" />
                  <span>Deep AI Narrative Analysis</span>
                </button>

                <button
                  onClick={() => onExecuteTrade(token)}
                  disabled={!canExecute}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-lg transition active:scale-95 ${
                    canExecute
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Snipe Trade ($1.50)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
