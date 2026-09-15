import React from 'react';
import { AgentLoopStep } from '../types';
import {
  Cable,
  Eye,
  Flame,
  Search,
  MessageSquareShare,
  Gauge,
  Binoculars,
  CheckCheck,
  Target,
  ShieldAlert,
  Zap,
  LineChart,
  LogOut,
  BrainCircuit,
  RotateCw,
} from 'lucide-react';

interface Props {
  currentStep: AgentLoopStep;
  isAgentActive: boolean;
  onStepClick?: (step: AgentLoopStep) => void;
}

const LOOP_STEPS: {
  id: AgentLoopStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  { id: 'CONNECT', label: 'CONNECT', icon: Cable, desc: 'Phantom wallet verification & RPC handshake' },
  { id: 'OBSERVE', label: 'OBSERVE', icon: Eye, desc: 'Continuous memetic market state monitoring' },
  { id: 'FOMO_WATCHLIST', label: 'FOMO', icon: Flame, desc: 'Read DEX & Pump.fun volume surges and social spikes' },
  { id: 'MARKET_SCAN', label: 'SCAN', icon: Search, desc: 'Filter liquidity depth, holder distribution, mint authority' },
  { id: 'X_NARRATIVE_SCAN', label: 'X RADAR', icon: MessageSquareShare, desc: 'Track Twitter/X velocity, creator mentions & viral meta' },
  { id: 'SCORE', label: 'SCORE', icon: Gauge, desc: 'Calculate 0-100 narrative strength and meme virality' },
  { id: 'WATCH', label: 'WATCH', icon: Binoculars, desc: 'Rank opportunities into active execution queue' },
  { id: 'NARRATIVE_PROOF', label: 'PROOF', icon: CheckCheck, desc: 'Gemini AI thesis verification & cult retention proof' },
  { id: 'TRADE_CANDIDATE', label: 'CANDIDATE', icon: Target, desc: 'Select top token meeting strict risk criteria' },
  { id: 'RISK_CHECK', label: 'RISK CHECK', icon: ShieldAlert, desc: 'Slippage estimation, max loss boundary, honeypot test' },
  { id: 'EXECUTE', label: 'EXECUTE', icon: Zap, desc: 'Atomic swap execution with deterministic position sizing' },
  { id: 'MONITOR', label: 'MONITOR', icon: LineChart, desc: 'Live price tracking, liquidity shifts, and trailing stop' },
  { id: 'EXIT', label: 'EXIT', icon: LogOut, desc: 'Take-profit lock, stop-loss trigger, or narrative collapse exit' },
  { id: 'LEARN', label: 'LEARN', icon: BrainCircuit, desc: 'Log P&L, slippage, expectancy into persistent case study' },
];

export const AgentLoopPipeline: React.FC<Props> = ({
  currentStep,
  isAgentActive,
  onStepClick,
}) => {
  const currentIndex = LOOP_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 tracking-wide font-mono">
            <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isAgentActive ? 'animate-spin' : ''}`} />
            <span>AGENT AUTONOMOUS LOOP</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            14 DETERMINISTIC PHASES
          </span>
        </div>
        <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
          <span className="text-slate-400">Current Phase:</span>
          <span className="bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded font-bold">
            {LOOP_STEPS[currentIndex]?.label || currentStep} ({currentIndex + 1}/14)
          </span>
        </div>
      </div>

      {/* Pipeline Steps Flow */}
      <div className="overflow-x-auto pb-1.5 scrollbar-thin">
        <div className="flex items-center min-w-max gap-1">
          {LOOP_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = step.id === currentStep;
            const isPassed = isAgentActive && idx < currentIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onStepClick && onStepClick(step.id)}
                  title={`${step.label}: ${step.desc}`}
                  className={`flex flex-col items-center px-2 py-1.5 rounded-lg border transition text-center min-w-[72px] ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 scale-105 z-10'
                      : isPassed
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 animate-pulse'
                        : isPassed
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold tracking-tight whitespace-nowrap ${
                      isCurrent ? 'text-emerald-300 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {idx < LOOP_STEPS.length - 1 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-0.5 select-none ${
                      idx < currentIndex ? 'text-emerald-500/60' : 'text-slate-700'
                    }`}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
          <span className="text-[10px] font-mono text-emerald-500/80 px-1 select-none font-bold">
            ↺
          </span>
        </div>
      </div>
    </div>
  );
};
