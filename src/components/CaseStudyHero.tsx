import React from 'react';
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  Percent,
  Calculator,
  Shield,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { WalletState, ActivePosition } from '../types';

interface Props {
  wallet: WalletState;
  activePosition: ActivePosition | null;
  totalTrades: number;
  winningTrades: number;
  realizedPnL: number;
  totalFeesUsd: number;
  avgSlippageBps: number;
  maxDrawdownPercent: number;
  expectancyUsd: number;
  targetAchieved: boolean;
  stoppedAtLoss: boolean;
  onOpenCaseStudyModal: () => void;
}

export const CaseStudyHero: React.FC<Props> = ({
  wallet,
  activePosition,
  totalTrades,
  winningTrades,
  realizedPnL,
  totalFeesUsd,
  avgSlippageBps,
  maxDrawdownPercent,
  expectancyUsd,
  targetAchieved,
  stoppedAtLoss,
  onOpenCaseStudyModal,
}) => {
  const initialCapital = 5.0;
  const targetEquity = 10.0;
  const maxLossFloor = 3.5; // Stop loss boundary

  const unrealizedPnL = activePosition ? activePosition.unrealizedPnL : 0;
  const netEquity = wallet.equity;
  const netProfit = netEquity - initialCapital;
  const netReturnPercent = (netProfit / initialCapital) * 100;

  // Calculate progress percent towards $10 (0% at $5.00, 100% at $10.00)
  const progressPercent = Math.min(
    100,
    Math.max(0, ((netEquity - initialCapital) / (targetEquity - initialCapital)) * 100)
  );

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return (
    <div className="bg-gradient-to-b from-[#0c1220] to-[#0a0e17] border border-cyan-500/30 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Target Reached or Stopped Banner */}
      {targetAchieved && (
        <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl flex items-center justify-between gap-3 text-emerald-200">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
            <div>
              <div className="font-extrabold text-sm text-white">TARGET ACHIEVED: $10.00 NET EQUITY REACHED!</div>
              <div className="text-xs text-emerald-300">
                The agent has stopped, locked results, and generated the reproducible Case Study.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenCaseStudyModal}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition"
          >
            VIEW CASE STUDY
          </button>
        </div>
      )}

      {stoppedAtLoss && (
        <div className="mb-4 p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl flex items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <div>
              <div className="font-extrabold text-sm text-white">MAX DRAWDOWN STOP TRIGGERED</div>
              <div className="text-xs text-rose-300">
                Equity dropped below ${maxLossFloor.toFixed(2)} predefined limit. Agent halted, results preserved for case study.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenCaseStudyModal}
            className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg shadow-md transition"
          >
            AUDIT REPORT
          </button>
        </div>
      )}

      {/* Top: Header & Progress bar to $10 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold tracking-wider">
              $5 CASE STUDY OBJECTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              Deterministic 2.0x Capital Multiplication
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
              ${netEquity.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / <span className="text-emerald-400 font-bold">$10.00 TARGET</span>
            </span>
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                netProfit >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}
              ${netProfit.toFixed(2)} ({netReturnPercent >= 0 ? '+' : ''}
              {netReturnPercent.toFixed(1)}%)
            </span>
            <span className="text-xs font-mono text-slate-400">
              Multiplier: <span className="text-cyan-300 font-bold">{(netEquity / initialCapital).toFixed(2)}x</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCaseStudyModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Generate / View Audit Study</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Seed Capital:</span>
            <span className="text-white font-bold">$5.00</span>
          </span>
          <span className="text-cyan-400 font-bold">
            {progressPercent.toFixed(1)}% to $10.00 Target
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Stop-Floor:</span>
            <span className="text-rose-400 font-bold">${maxLossFloor.toFixed(2)} (-30%)</span>
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
          {/* Progress fill */}
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
              progressPercent >= 100
                ? 'from-emerald-500 to-teal-300 shadow-lg shadow-emerald-500/50'
                : 'from-cyan-500 via-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
          />
          {/* Marker at 50% / $7.50 */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 pointer-events-none"
            style={{ left: '50%' }}
            title="$7.50 (+50%)"
          />
        </div>
      </div>

      {/* Track Everything: Comprehensive Case Study Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-4">
        {/* Metric 1: Realized P&L */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Realized P&L</span>
          <span
            className={`text-sm font-black font-mono block mt-0.5 ${
              realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toFixed(2)}
          </span>
        </div>

        {/* Metric 2: Unrealized P&L */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Unrealized P&L</span>
          <span
            className={`text-sm font-black font-mono block mt-0.5 ${
              unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
          </span>
        </div>

        {/* Metric 3: Fees Incurred */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Solana Fees</span>
          <span className="text-sm font-black font-mono block mt-0.5 text-slate-300">
            ${totalFeesUsd.toFixed(4)}
          </span>
        </div>

        {/* Metric 4: Slippage */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Avg Slippage</span>
          <span className="text-sm font-black font-mono block mt-0.5 text-slate-300">
            {avgSlippageBps} bps ({(avgSlippageBps / 100).toFixed(2)}%)
          </span>
        </div>

        {/* Metric 5: Number of Trades */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Trades Count</span>
          <span className="text-sm font-black font-mono block mt-0.5 text-white">
            {totalTrades} <span className="text-[10px] text-slate-400 font-normal">({winningTrades}W / {totalTrades - winningTrades}L)</span>
          </span>
        </div>

        {/* Metric 6: Win Rate */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Win Rate</span>
          <span className="text-sm font-black font-mono block mt-0.5 text-cyan-400">
            {winRate.toFixed(1)}%
          </span>
        </div>

        {/* Metric 7: Expectancy */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Expectancy</span>
          <span
            className={`text-sm font-black font-mono block mt-0.5 ${
              expectancyUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {expectancyUsd >= 0 ? '+' : ''}${expectancyUsd.toFixed(3)}
          </span>
        </div>

        {/* Metric 8: Max Drawdown */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Max Drawdown</span>
          <span className="text-sm font-black font-mono block mt-0.5 text-amber-400">
            {maxDrawdownPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
