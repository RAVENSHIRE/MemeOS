import React, { useState, useEffect } from 'react';
import { Flame, Clock, Scissors, Sparkles, Cigarette } from 'lucide-react';
import { Meme420Stats } from '../types';

interface Props {
  onTriggerBurn?: () => void;
}

export const Meme420Module: React.FC<Props> = ({ onTriggerBurn }) => {
  const [stats, setStats] = useState<Meme420Stats>({
    burnedSolEquivalent: 0.042,
    totalBurnedTokens: 4200690,
    timeToNext420Utc: '03:41:20',
    halvingProgressPercent: 78.4,
    jointStatus: 'Lit 🔥',
  });

  const [jointState, setJointState] = useState<'Lit 🔥' | 'Rolling 💨' | 'Passed 🚀' | 'Smoked ⚡'>('Lit 🔥');
  const [burnNotice, setBurnNotice] = useState<string | null>(null);

  // Live 4:20 UTC countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target next 04:20 or 16:20 UTC
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();

      let targetHour = 4;
      if (utcHours >= 16 || (utcHours === 16 && utcMinutes >= 20)) {
        targetHour = 28; // 4 tomorrow
      } else if (utcHours >= 4 || (utcHours === 4 && utcMinutes >= 20)) {
        targetHour = 16; // 16 today
      }

      const currentTotalSec = utcHours * 3600 + utcMinutes * 60 + utcSeconds;
      const targetTotalSec = targetHour * 3600 + 20 * 60;
      const diffSec = (targetTotalSec - currentTotalSec + 86400) % 86400;

      const hrs = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      setStats((prev) => ({
        ...prev,
        timeToNext420Utc: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      }));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePuffAndPass = () => {
    const states: ('Lit 🔥' | 'Rolling 💨' | 'Passed 🚀' | 'Smoked ⚡')[] = [
      'Lit 🔥',
      'Passed 🚀',
      'Rolling 💨',
      'Smoked ⚡',
    ];
    const nextIdx = (states.indexOf(jointState) + 1) % states.length;
    const nextState = states[nextIdx];
    setJointState(nextState);

    // Increase burn count slightly
    setStats((prev) => ({
      ...prev,
      totalBurnedTokens: prev.totalBurnedTokens + 4200,
      burnedSolEquivalent: prev.burnedSolEquivalent + 0.00042,
      jointStatus: nextState,
    }));

    setBurnNotice(`💨 Joint ${nextState}! 4,200 tokens burned to 1111...`);
    setTimeout(() => setBurnNotice(null), 2500);

    if (onTriggerBurn) onTriggerBurn();
  };

  return (
    <div className="bg-[#0e1422] border border-amber-500/30 rounded-xl p-4 shadow-lg text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
            🌿
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
              420 MEMETIC METRICS
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Solana Cultural Halving & Burn Radar
            </span>
          </div>
        </div>
        <button
          onClick={handlePuffAndPass}
          className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition active:scale-95"
        >
          <span>Puff & Pass</span>
        </button>
      </div>

      {burnNotice && (
        <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-1 rounded text-center animate-fade-in">
          {burnNotice}
        </div>
      )}

      {/* Grid of 420 Elements */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {/* 1. Burn Tracker */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Total Burned</span>
          </div>
          <div className="text-xs font-mono font-extrabold text-white mt-1">
            {stats.totalBurnedTokens.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">MEME</span>
          </div>
          <div className="text-[10px] font-mono text-amber-400">
            ≈ {stats.burnedSolEquivalent.toFixed(4)} SOL ($
            {(stats.burnedSolEquivalent * 180).toFixed(2)})
          </div>
        </div>

        {/* 2. 4:20 Countdown */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>4:20 UTC Countdown</span>
          </div>
          <div className="text-xs font-mono font-black text-cyan-300 mt-1 tracking-wider">
            {stats.timeToNext420Utc}
          </div>
          <div className="text-[10px] font-mono text-slate-400">Next Memetic Epoch</div>
        </div>

        {/* 3. 4/4 Halving Cycle */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
            <Scissors className="w-3 h-3 text-purple-400" />
            <span>4/4 Halving Meter</span>
          </div>
          <div className="text-xs font-mono font-bold text-purple-300 mt-1">
            {stats.halvingProgressPercent}% <span className="text-[10px] text-slate-400">Phase 3/4</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${stats.halvingProgressPercent}%` }}
            />
          </div>
        </div>

        {/* 4. Joint Status */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Joint Status</span>
          </div>
          <div className="mt-1">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {jointState}
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-1">Solana Community Hash</div>
        </div>
      </div>
    </div>
  );
};
