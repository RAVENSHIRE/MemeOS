import React, { useEffect, useState } from 'react';
import { Clock3, Flame, Sparkles } from 'lucide-react';

interface Props { onTriggerBurn?: () => void; }

function next420Countdown(now: Date): string {
  const seconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const first = 4 * 3600 + 20 * 60;
  const second = 16 * 3600 + 20 * 60;
  const next = seconds < first ? first : seconds < second ? second : first + 86400;
  const remaining = next - seconds;
  return [Math.floor(remaining / 3600), Math.floor(remaining % 3600 / 60), remaining % 60].map(value => String(value).padStart(2, '0')).join(':');
}

export const Meme420Module: React.FC<Props> = ({ onTriggerBurn }) => {
  const [countdown, setCountdown] = useState(() => next420Countdown(new Date()));
  const [passes, setPasses] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCountdown(next420Countdown(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="dashboard-card p-4 text-slate-100" aria-label="420 community demo">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div><p className="text-[10px] tracking-widest font-mono uppercase text-amber-300">Community corner · demo</p><h2 className="font-bold text-sm mt-1 flex gap-2 items-center"><Flame className="w-4 h-4 text-amber-400"/>420 meme clock</h2></div>
        <button type="button" onClick={() => { setPasses(n => n + 1); onTriggerBurn?.(); }} className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-900/40">Puff &amp; Pass</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3"><Clock3 className="w-4 h-4 text-cyan-400 mb-2"/><p className="text-[10px] text-slate-400">Next 4:20 UTC</p><p className="font-mono font-bold text-xl text-white metric-value">{countdown}</p></div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3"><Sparkles className="w-4 h-4 text-purple-400 mb-2"/><p className="text-[10px] text-slate-400">This session's passes</p><p className="font-mono font-bold text-xl text-white metric-value">{passes}</p></div>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Purely decorative community interaction. No tokens are burned and no blockchain transaction is submitted.</p>
    </section>
  );
};
