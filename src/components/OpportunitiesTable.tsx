import React, { useMemo, useState } from 'react';
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
  maxPositionSizeUsd: number;
  isLoading: boolean;
}

export const OpportunitiesTable: React.FC<Props> = ({
  tokens,
  onSelectToken,
  selectedToken,
  onExecuteTrade,
  onAnalyzeWithAI,
  isAnalyzing,
  canExecute,
  maxPositionSizeUsd,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'volume' | 'liquidity' | 'momentum'>('volume');
  const visible = useMemo(() => tokens.filter(token => `${token.symbol} ${token.name} ${token.address}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sort === 'volume' ? b.volume24h - a.volume24h : sort === 'liquidity' ? b.liquidity - a.liquidity : b.change5m - a.change5m), [tokens, query, sort]);
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
                AI / HEURISTIC
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Market opportunities · heuristic scores are not verified safety guarantees
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="opportunity-search" className="sr-only">Search opportunities by name, symbol or address</label>
        <input id="opportunity-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search symbol or address" className="min-w-0 flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400" />
        <label htmlFor="opportunity-sort" className="sr-only">Sort opportunities</label>
        <select id="opportunity-sort" value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200"><option value="volume">24h volume</option><option value="liquidity">Liquidity</option><option value="momentum">5m momentum</option></select>
      </div>
      {/* Opportunities List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1 scrollbar-thin">
        {isLoading && tokens.length === 0 && <div role="status" aria-label="Loading market opportunities" className="space-y-3 animate-pulse">{[0, 1, 2].map(n => <div key={n} className="h-28 rounded-xl bg-slate-800/70" />)}</div>}
        {!isLoading && visible.length === 0 && <p role="status" className="text-sm text-slate-400 p-4">{tokens.length ? 'No opportunities match your search.' : 'No market opportunities available. Check data source status.'}</p>}
        {visible.map((token, idx) => {
          const isSelected =
            selectedToken?.address && token.address
              ? selectedToken.address === token.address
              : selectedToken?.symbol === token.symbol;
          const score = token.narrativeScore ?? token.xVelocity;
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
                    <span>{token.narrativeScore == null ? 'HEURISTIC' : 'NARRATIVE'}: {score}/100</span>
                  </div>

                  {/* Liquidity-based risk proxy; token security is not independently verified. */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[10px] font-bold ${
                      isSafe
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                    }`}
                  >
                    {isSafe ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <ShieldAlert className="w-3 h-3 text-amber-400" />}
                    <span>{token.riskLevel} · EST.</span>
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
                    {token.top10HoldingPercent > 0 && token.analysisSource === 'LIVE' ? `${token.top10HoldingPercent}% (reported)` : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Row 3: AI Thesis / Narrative */}
              <div className="bg-[#090d16] border border-cyan-500/20 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{token.analysisSource === 'LIVE' ? 'Gemini narrative analysis' : token.analysisSource === 'MOCK' ? 'Heuristic narrative (no AI)' : 'Market narrative (unverified)'}:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {token.aiThesis || token.narrative}
                </p>
                {token.expectedUpside && token.expectedUpside !== 'Not estimated' && (
                  <div className="mt-1 text-[10px] font-mono text-emerald-400">
                    Model scenario (unverified): {token.expectedUpside}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-amber-300">Risk indicator is a liquidity-based heuristic; mint/freeze authorities and holder concentration have not been verified by this feed.</p>
              {/* Row 4: Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button type="button" onClick={() => { onSelectToken(token); document.getElementById('token-inspector')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-xs rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-cyan-600">Inspect</button>
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
                  <span>Paper buy (up to ${maxPositionSizeUsd.toFixed(2)})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
