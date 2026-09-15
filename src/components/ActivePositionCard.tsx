import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Clock,
  Zap,
  AlertTriangle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ActivePosition } from '../types';

interface Props {
  position: ActivePosition | null;
  onEmergencyExit: () => void;
  isAgentActive: boolean;
}

export const ActivePositionCard: React.FC<Props> = ({
  position,
  onEmergencyExit,
  isAgentActive,
}) => {
  if (!position) {
    return (
      <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col justify-center items-center text-center min-h-[220px]">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
          <Target className="w-5 h-5 text-slate-400" />
        </div>
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          NO OPEN POSITION
        </span>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Agent is in capital preservation mode. Allocates $1.50 per trade strictly after narrative proof and liquidity verification.
        </p>
      </div>
    );
  }

  const isProfit = position.unrealizedPnL >= 0;
  const timeOpenMinutes = Math.max(1, Math.floor((Date.now() - position.entryTime) / 60000));

  return (
    <div className="bg-[#0b101c] border border-cyan-500/40 rounded-xl p-4 shadow-xl text-slate-100 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{position.tokenIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-white">
                ${position.tokenSymbol}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {position.tokenName}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE POSITION
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Open {timeOpenMinutes}m
              </span>
              <span className="text-slate-600">•</span>
              <span>Tokens: {position.tokenAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Big P&L Display */}
        <div className="text-right">
          <div
            className={`text-lg font-mono font-black ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}{position.unrealizedPnLPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-left font-mono text-[11px]">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
          <span className="text-slate-500 uppercase text-[10px] block">Entry Price</span>
          <span className="text-white font-bold block mt-0.5">
            ${position.entryPrice < 0.01 ? position.entryPrice.toFixed(6) : position.entryPrice.toFixed(4)}
          </span>
          <span className="text-[10px] text-slate-400">Allocated: ${position.investedUsd.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
          <span className="text-slate-500 uppercase text-[10px] block">Current Price</span>
          <span className="text-cyan-300 font-bold block mt-0.5">
            ${position.currentPrice < 0.01 ? position.currentPrice.toFixed(6) : position.currentPrice.toFixed(4)}
          </span>
          <span className="text-[10px] text-slate-400">Value: ${position.currentValueUsd.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
          <span className="text-slate-500 uppercase text-[10px] block">Trailing Peak</span>
          <span className="text-amber-300 font-bold block mt-0.5">
            ${position.trailingPeakPrice < 0.01 ? position.trailingPeakPrice.toFixed(6) : position.trailingPeakPrice.toFixed(4)}
          </span>
          <span className="text-[10px] text-slate-400">High Watermark</span>
        </div>
      </div>

      {/* Deterministic Exit Conditions */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold mb-1.5">
          Deterministic Exit Conditions
        </span>
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Take-Profit Target:</span>
            </span>
            <span className="text-emerald-400 font-bold">
              +{position.targetTakeProfitPercent}% (${position.takeProfitPrice < 0.01 ? position.takeProfitPrice.toFixed(6) : position.takeProfitPrice.toFixed(4)})
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop-Loss Limit:</span>
            </span>
            <span className="text-rose-400 font-bold">
              {position.targetStopLossPercent}% (${position.stopLossPrice < 0.01 ? position.stopLossPrice.toFixed(6) : position.stopLossPrice.toFixed(4)})
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Trailing Lock:</span>
            </span>
            <span className="text-amber-400 font-bold">
              Exit if -10% from peak
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400">
          Agent monitoring order book live...
        </span>
        <button
          onClick={onEmergencyExit}
          className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>MARKET EXIT NOW</span>
        </button>
      </div>
    </div>
  );
};
