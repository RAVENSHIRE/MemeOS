import React from 'react';
import { ArrowUpRight, BrainCircuit, Copy, ShieldAlert } from 'lucide-react';
import type { TokenOpportunity, DataSourceStatus } from '../types';

interface Props {
  token: TokenOpportunity | null;
  source: DataSourceStatus;
  onAnalyze: (token: TokenOpportunity) => void;
  isAnalyzing: boolean;
}

const usd = (value: number) => Number.isFinite(value)
  ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  : '—';

export const TokenInspector: React.FC<Props> = ({ token, source, onAnalyze, isAnalyzing }) => {
  if (!token) return <section className="dashboard-card p-5 text-sm text-slate-400" aria-label="Token inspector">Select an opportunity to inspect its market evidence.</section>;
  const metrics = [
    ['Price (USD)', Number(token.priceUsd).toPrecision(5)],
    ['5m move', `${token.change5m >= 0 ? '+' : ''}${token.change5m.toFixed(2)}%`],
    ['1h move', `${token.change1h >= 0 ? '+' : ''}${token.change1h.toFixed(2)}%`],
    ['24h move', `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%`],
    ['24h volume', usd(token.volume24h)],
    ['DEX liquidity', usd(token.liquidity)],
    ['FDV estimate', usd(token.fdv)],
    ['Top 10 holders', source === 'MOCK' || token.top10HoldingPercent <= 0 ? 'Not verified' : `${token.top10HoldingPercent}% (reported)`],
  ];
  return (
    <section className="dashboard-card p-4 sm:p-5 space-y-4" aria-label="Selected token details">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Opportunity inspector · {source}</p>
          <h2 className="text-xl font-bold text-white mt-1">${token.symbol} <span className="text-sm font-normal text-slate-400">{token.name}</span></h2>
          <button type="button" className="text-xs text-slate-400 hover:text-cyan-300 mt-1 font-mono" onClick={() => void navigator.clipboard?.writeText(token.address)} title="Copy token address" aria-label={`Copy ${token.symbol} token address`}><Copy className="w-3 h-3 inline mr-1"/>{token.address.slice(0, 10)}…{token.address.slice(-8)}</button>
        </div>
        <a href={`https://dexscreener.com/solana/${encodeURIComponent(token.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs rounded-lg border border-cyan-800/50 bg-cyan-950/40 text-cyan-200 px-3 py-2 hover:bg-cyan-900/40">DEX details <ArrowUpRight className="w-3 h-3 inline"/></a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{metrics.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"><p className="text-[10px] text-slate-400">{label}</p><p className="font-mono text-sm font-bold text-slate-100 mt-1">{value}</p></div>)}</div>
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h3 className="text-xs text-cyan-300 font-bold flex gap-2 items-center"><BrainCircuit className="h-4 w-4"/> Narrative evidence</h3>
          <button type="button" disabled={isAnalyzing} onClick={() => onAnalyze(token)} className="text-xs rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-2 font-bold disabled:opacity-50">{isAnalyzing ? 'Analyzing…' : 'Analyze with existing Gemini endpoint'}</button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mt-3">{token.aiThesis || token.narrative || 'No narrative data available.'}</p>
        <p className="text-[11px] text-slate-500 mt-2">{token.analysisSource === 'LIVE' ? 'Gemini-generated narrative; not an independent risk audit.' : token.analysisSource === 'MOCK' ? 'Heuristic fallback; Gemini was unavailable.' : 'DEX-derived market narrative; not independently verified.'}</p>
      </div>
      <p className="text-xs text-amber-200 flex items-start gap-2"><ShieldAlert className="h-4 w-4 shrink-0" />On-chain authority, holder concentration and sellability are not independently validated by the current market adapter. Paper execution is simulated.</p>
    </section>
  );
};
