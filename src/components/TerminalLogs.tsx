import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, Sparkles, Filter, Trash2, Pause, Play } from 'lucide-react';
import { TelemetryLog } from '../types';

interface Props {
  logs: TelemetryLog[];
  onClearLogs: () => void;
}

export const TerminalLogs: React.FC<Props> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'trade' | 'ai' | 'risk'>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'trade') return log.type === 'trade';
    if (filter === 'ai') return log.step === 'NARRATIVE_PROOF' || log.step === 'SCORE';
    if (filter === 'risk') return log.step === 'RISK_CHECK';
    return true;
  });

  return (
    <div className="bg-[#080c14] border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col font-mono text-xs text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 tracking-wide">
            AGENT REASONING & TELEMETRY STREAM
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filters */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${
                filter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter('trade')}
              className={`px-2 py-0.5 rounded ${
                filter === 'trade' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              TRADES
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-2 py-0.5 rounded ${
                filter === 'ai' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI THESIS
            </button>
            <button
              onClick={() => setFilter('risk')}
              className={`px-2 py-0.5 rounded ${
                filter === 'risk' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              RISK
            </button>
          </div>

          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`p-1 rounded text-slate-400 hover:text-white ${
              isAutoScroll ? 'text-emerald-400' : 'text-slate-600'
            }`}
            title={isAutoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            {isAutoScroll ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="mt-2 h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin text-[11px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 py-6 text-center italic">
            Connecting Phantom and starting loop to stream live telemetry...
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isTrade = log.type === 'trade';
            const isAlert = log.type === 'alert';
            const isSuccess = log.type === 'success';

            return (
              <div
                key={log.id}
                className={`px-2 py-1 rounded flex items-start gap-2 leading-relaxed transition ${
                  isTrade
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200'
                    : isAlert
                    ? 'bg-rose-950/40 border border-rose-800/40 text-rose-200'
                    : isSuccess
                    ? 'bg-cyan-950/30 text-cyan-200'
                    : 'text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                <span className="text-slate-500 text-[10px] select-none shrink-0">
                  [{log.timestamp}]
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800/80 text-[10px] font-bold text-slate-300 shrink-0 uppercase border border-slate-700">
                  {log.step}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
