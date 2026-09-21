import React, { useState } from 'react';
import { Bot, Radio, ShieldCheck, Users } from 'lucide-react';
import type { AgentConfig, AgentSignal } from '../types';

interface Props {
  config: AgentConfig;
  signal: AgentSignal | null;
  onCommand: (command: string) => Promise<void>;
}

export const AgentCommandPanel: React.FC<Props> = ({ config, signal, onCommand }) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (command: string) => {
    if (busy || !command.trim()) return;
    setBusy(true); setError(null);
    try { await onCommand(command.trim()); setInput(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Command failed'); }
    finally { setBusy(false); }
  };
  const submit = (event: React.FormEvent) => { event.preventDefault(); void run(input); };
  return (
    <section className="dashboard-card p-4 sm:p-5 text-slate-100" aria-label="Agent controls">
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div><p className="text-[11px] font-mono uppercase text-cyan-400 tracking-widest">Automation</p><h2 className="text-base font-bold flex items-center gap-2"><Bot className="w-5 h-5" />Agent control center</h2></div>
        <span className="text-[10px] font-mono rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-slate-400">Cached signal engine · paper execution</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-300 flex gap-2 items-center mb-2"><Radio className="w-4 h-4 text-cyan-400" /> Runner tracking</div>
          <p className="text-[11px] text-slate-400 mb-3">Evaluate drawdown and momentum re-acceleration patterns.</p>
          <button type="button" disabled={busy} onClick={() => void run(config.dailyRunners ? 'runners off' : 'runners on')} aria-pressed={config.dailyRunners} className={`rounded-lg border px-3 py-2 text-xs font-semibold w-full ${config.dailyRunners ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>Runners {config.dailyRunners ? 'ON' : 'OFF'} · Toggle</button>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-300 flex gap-2 items-center mb-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Signal sensitivity</div>
          <p className="text-[11px] text-slate-400 mb-3">Controls the existing deterministic score threshold.</p>
          <button type="button" disabled={busy} onClick={() => void run(config.aggressive ? 'trade conservatively' : 'trade aggressively')} aria-pressed={config.aggressive} className={`rounded-lg border px-3 py-2 text-xs font-semibold w-full ${config.aggressive ? 'bg-amber-950/40 border-amber-700 text-amber-200' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>{config.aggressive ? 'Aggressive' : 'Conservative'} · Change</button>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-300 flex gap-2 items-center mb-2"><Users className="w-4 h-4 text-purple-400" /> Followed intelligence</div>
          <p className="text-[11px] text-slate-400 mb-2">Sources are only usable when their adapters are connected.</p>
          <div className="flex gap-2 flex-wrap text-[10px] font-mono text-slate-300"><span>X: {config.followedAccounts.length}</span><span>FOMO: {config.followedFomoTraders.length}</span><span>Wallets: {config.copiedWallets.length}</span><span>Coins: {config.watchedCoins.length}</span></div>
        </div>
      </div>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <label htmlFor="agent-command" className="sr-only">Agent command</label>
        <input id="agent-command" value={input} disabled={busy} onChange={e => setInput(e.target.value)} placeholder="Follow @account · watch coin ADDRESS · $1.50 per trade" className="min-w-[180px] flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono placeholder:text-slate-500" />
        <button type="submit" disabled={busy || !input.trim()} className="px-4 py-2 rounded-lg bg-cyan-500 disabled:opacity-50 hover:bg-cyan-400 text-slate-950 font-bold text-xs">{busy ? 'Applying…' : 'Apply command'}</button>
      </form>
      {error && <p role="alert" className="text-rose-300 text-xs mt-2">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-mono text-slate-400"><span>Size: ${config.positionSizeUsd.toFixed(2)}</span><span>· Daily spend cap: ${config.maxDailySpendUsd.toFixed(2)}</span><span>· Open exposure: ${config.maxOpenExposureUsd.toFixed(2)}</span></div>
      {signal && <div className="mt-3 rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-3 text-xs"><strong className="text-cyan-300">{signal.signalType} · ${signal.token.symbol} · score {signal.score}/100</strong><p className="text-slate-400 mt-1">{signal.reasons.join(' · ')}</p></div>}
    </section>
  );
};
