import React, { useState } from 'react';
import { Activity, Radio, ShieldAlert } from 'lucide-react';
import { AgentSignal, DataSourceStatus, TokenOpportunity } from '../types';
import type { XAdapterEvent } from '../lib/api';

interface Props {
  tokens: TokenOpportunity[];
  onSelectToken: (token: TokenOpportunity) => void;
  selectedToken: TokenOpportunity | null;
  signal: AgentSignal | null;
  marketStatus: DataSourceStatus;
  xStatus: DataSourceStatus;
  lastScanAt: number | null;
  xSignals: XAdapterEvent[];
}

export const FomoAndXRadar: React.FC<Props> = ({
  tokens, onSelectToken, selectedToken, signal, marketStatus, xStatus, lastScanAt, xSignals,
}) => {
  const [activeTab, setActiveTab] = useState<'FOMO' | 'X_RADAR'>('FOMO');
  return (
    <section className="bg-[#0c111d] border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col h-full" aria-label="Market and social signal radar">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex gap-2" role="tablist" aria-label="Radar views">
          <button type="button" role="tab" aria-selected={activeTab === 'FOMO'} onClick={() => setActiveTab('FOMO')}
            className={`rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${activeTab === 'FOMO' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}>FOMO / RUNNERS</button>
          <button type="button" role="tab" aria-selected={activeTab === 'X_RADAR'} onClick={() => setActiveTab('X_RADAR')}
            className={`rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${activeTab === 'X_RADAR' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}>X RADAR</button>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{activeTab === 'FOMO' ? marketStatus : xStatus}</span>
      </div>
      {activeTab === 'FOMO' ? (
        <div role="tabpanel" className="mt-3 space-y-3">
          <div className="flex justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>Solana opportunities · {tokens.length} tokens</span>
            <span>{lastScanAt ? `Updated ${new Date(lastScanAt).toLocaleTimeString()}` : 'Awaiting scan'}</span>
          </div>
          {marketStatus !== 'LIVE' && <p role="status" className="rounded-lg bg-amber-950/40 border border-amber-700/40 p-2 text-xs text-amber-200">Market feed: {marketStatus}. Demo or stale prices are not verified live quotes.</p>}
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {tokens.length === 0 && <p className="text-xs text-slate-400 py-4">No market opportunities available.</p>}
            {tokens.map(token => (
              <button type="button" key={token.address || token.symbol} onClick={() => onSelectToken(token)}
                aria-pressed={selectedToken?.address === token.address}
                className={`w-full text-left p-3 rounded-lg border flex justify-between gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${selectedToken?.address === token.address ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}`}>
                <span className="min-w-0"><strong className="text-xs">${token.symbol}</strong><span className="block text-[11px] text-slate-400 truncate">{token.name}</span><span className="block text-[10px] text-slate-400">Liquidity ${Number(token.liquidity).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}</span></span>
                <span className="text-right shrink-0"><strong className="block text-xs font-mono">${Number(token.priceUsd).toPrecision(4)}</strong><span className={`text-[11px] ${token.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>5m {token.change5m >= 0 ? '+' : ''}{token.change5m.toFixed(1)}%</span></span>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-3 text-xs">
            <div className="flex gap-2 items-center text-slate-300"><Activity className="w-4 h-4 text-amber-400"/>Latest agent signal</div>
            {signal ? <div className="mt-2 rounded-lg bg-slate-900 border border-slate-800 p-3"><strong>{signal.signalType} · ${signal.token.symbol} · {signal.score}/100</strong><p className="text-slate-400 mt-1">{signal.reasons.join(' · ')}</p><p className="text-slate-500 mt-1 text-[10px]">{new Date(signal.detectedAt).toLocaleString()}</p></div> : <p className="mt-2 text-slate-400">No current actionable signal.</p>}
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold"><Radio className="w-4 h-4"/>X signal stream</div>
          {xSignals.length ? <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto">{xSignals.map((event, index) => <div key={`${event.tokenAddress}-${event.detectedAt}-${index}`} className="rounded-lg border border-slate-700 bg-slate-950/70 p-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs text-cyan-200">${event.tokenSymbol}</strong><span className="text-[10px] text-slate-400">{new Date(event.detectedAt).toLocaleTimeString()}</span></div><p className="text-[11px] text-slate-300 mt-1">Adapter source: {event.source}</p>{event.score !== null && <p className="text-[10px] text-cyan-300 mt-1">Reported score: {event.score}/100</p>}{event.reasons.length > 0 && <p className="text-[11px] text-slate-400 mt-2">{event.reasons.join(' · ')}</p>}</div>)}</div> : <p className="text-sm text-slate-300 mt-2">{xStatus === 'LIVE' ? 'X adapter is reachable, but has no recent token-address-matched events to display.' : 'No current X adapter events. Configure X_SIGNAL_URL to enable this feed.'}</p>}
          <p className="text-xs text-slate-400 mt-2 flex gap-2"><ShieldAlert className="w-4 h-4 shrink-0"/>Events are reported by the configured adapter; MEME OS does not independently verify accounts, engagement or authenticity.</p>
        </div>
      )}
    </section>
  );
};
