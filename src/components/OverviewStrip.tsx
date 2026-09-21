import React from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock3, ShieldCheck, Wallet } from 'lucide-react';
import type { ActivePosition, AgentRiskSettings, DataSourceStatus, TradeRecord, WalletState } from '../types';
import { isFreshLiveMarket } from '../lib/api';

interface Props {
  wallet: WalletState;
  position: ActivePosition | null;
  trades: TradeRecord[];
  realizedPnL: number;
  risk: AgentRiskSettings;
  marketStatus: DataSourceStatus;
  lastScanAt: number | null;
  isAgentActive: boolean;
  killSwitchActive: boolean;
}

const money = (amount: number) => Number.isFinite(amount)
  ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  : '—';

export const OverviewStrip: React.FC<Props> = ({
  wallet, position, trades, realizedPnL, risk, marketStatus, lastScanAt, isAgentActive, killSwitchActive,
}) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dailySpend = trades.filter(trade => trade.type === 'BUY' && trade.timestamp >= today.getTime())
    .reduce((sum, trade) => sum + trade.totalUsd, 0);
  const remaining = Math.max(0, risk.maxDailyLossUsd + Math.min(0, realizedPnL));
  const fresh = isFreshLiveMarket(marketStatus, lastScanAt);
  const cards = [
    { label: 'Paper equity', value: money(wallet.equity), note: wallet.isSimulated ? 'Simulated USD · starting capital $5' : 'Connected wallet · live execution unavailable', Icon: Wallet },
    { label: 'Realized P&L', value: money(realizedPnL), note: position ? `Open P&L: ${money(position.unrealizedPnL)}` : 'No position open', Icon: realizedPnL >= 0 ? ArrowUpRight : ArrowDownRight },
    { label: 'Open exposure', value: money(wallet.positionsValue), note: `Position cap ${money(risk.maxPositionSizeUsd)}`, Icon: Activity },
    { label: 'Session loss budget', value: money(remaining), note: `Daily spend: ${money(dailySpend)} · loss limit ${money(risk.maxDailyLossUsd)}`, Icon: ShieldCheck },
  ];
  return (
    <section aria-label="Trading session overview" className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[.22em] text-cyan-400">Session overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your trading command center</h1>
          <p className="text-xs text-slate-400 mt-1">Analyze Solana opportunities, control risk and audit simulated results.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold border ${wallet.isSimulated ? 'text-cyan-200 border-cyan-700 bg-cyan-950/50' : 'text-amber-200 border-amber-700 bg-amber-950/40'}`}>
            {wallet.isSimulated ? 'PAPER TRADING' : 'WALLET CONNECTED · READ ONLY'}
          </span>
          <span role="status" className={`rounded-full px-3 py-1.5 text-[11px] font-bold border ${killSwitchActive ? 'text-rose-300 border-rose-700 bg-rose-950/40' : isAgentActive ? 'text-emerald-300 border-emerald-700 bg-emerald-950/40' : 'text-slate-300 border-slate-700 bg-slate-900'}`}>
            {killSwitchActive ? 'KILL SWITCH ACTIVE' : isAgentActive ? 'AGENT RUNNING' : 'AGENT PAUSED'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(({label,value,note,Icon}) => (
          <div key={label} className="dashboard-card p-4 md:p-5 min-w-0">
            <div className="flex items-center justify-between text-slate-400 text-xs"><span>{label}</span><Icon className="h-4 w-4 text-cyan-400" aria-hidden="true" /></div>
            <p className="metric-value text-2xl sm:text-3xl font-bold text-white mt-3">{value}</p>
            <p className="text-[11px] text-slate-400 mt-2">{note}</p>
          </div>
        ))}
      </div>
      <div role="status" className={`flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5 text-xs ${fresh ? 'border-emerald-800/70 bg-emerald-950/20 text-emerald-200' : 'border-amber-800/70 bg-amber-950/20 text-amber-200'}`}>
        {fresh ? <Clock3 className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
        <span>Market: {fresh ? 'recent live feed' : marketStatus === 'MOCK' ? 'demo fallback · entries disabled' : 'offline or stale · entries disabled'}</span>
        {lastScanAt && <span className="opacity-80">· Last update {new Date(lastScanAt).toLocaleTimeString()}</span>}
      </div>
    </section>
  );
};
