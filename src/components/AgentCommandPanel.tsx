import React, { useState } from 'react';
import { Bot, Send, Radio } from 'lucide-react';
import { AgentConfig, AgentSignal } from '../types';

interface Props {
  config: AgentConfig;
  signal: AgentSignal | null;
  onCommand: (command: string) => void;
}

export const AgentCommandPanel: React.FC<Props> = ({ config, signal, onCommand }) => {
  const [input, setInput] = useState('');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    onCommand(command);
    setInput('');
  };
  return (
    <section className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Agent Command</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Deterministic / cached</span>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Follow @account · runners ON · $25 per trade" className="min-w-0 flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500" />
        <button className="px-3 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400" title="Send command"><Send className="w-4 h-4" /></button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">X: {config.followedAccounts.length}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">FOMO: {config.followedFomoTraders.length}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Wallets: {config.copiedWallets.length}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Coins: {config.watchedCoins.length}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Runners: {config.dailyRunners ? 'ON' : 'OFF'}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Size: ${config.positionSizeUsd.toFixed(2)}</span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Daily: ${config.maxDailySpendUsd.toFixed(2)}</span>
      </div>
      {signal && <div className="mt-3 p-2 rounded-lg border border-emerald-700/40 bg-emerald-950/30 text-[11px] font-mono"><div className="flex items-center gap-1 text-emerald-300"><Radio className="w-3 h-3" /> {signal.signalType} ${signal.token.symbol} · {signal.score}/100</div><div className="text-slate-400 mt-1">{signal.reasons.join(' · ')}</div></div>}
    </section>
  );
};
