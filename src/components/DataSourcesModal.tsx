import React from 'react';
import { X, CheckCircle2, AlertTriangle, PowerOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { DataSourcesConfig, DataSourceStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sources: DataSourcesConfig;
  onUpdateSourceStatus: (key: keyof DataSourcesConfig, status: DataSourceStatus) => void;
  onRefreshSources: () => void;
}

export const DataSourcesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sources,
  onUpdateSourceStatus,
  onRefreshSources,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f141c] border border-cyan-500/30 w-full max-w-2xl rounded-xl p-6 shadow-2xl shadow-cyan-950/40 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">DATA SOURCES & INTEGRATION INTEGRITY</h2>
              <p className="text-xs text-slate-400">Strict transparency rule: The agent never simulates data if a source is disconnected.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5">
          {(Object.entries(sources) as [keyof DataSourcesConfig, any][]).map(([key, item]) => {
            const isLive = item.status === 'LIVE';
            const isMock = item.status === 'MOCK';
            const isDisconnected = item.status === 'DISCONNECTED';

            return (
              <div
                key={key}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{item.name}</span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        isLive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isMock
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.info}</p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => onUpdateSourceStatus(key, 'LIVE')}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                      isLive
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    LIVE
                  </button>
                  <button
                    onClick={() => onUpdateSourceStatus(key, 'MOCK')}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                      isMock
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    MOCK
                  </button>
                  <button
                    onClick={() => onUpdateSourceStatus(key, 'DISCONNECTED')}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                      isDisconnected
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    DISCONNECTED
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onRefreshSources}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1.5 rounded bg-cyan-950/40 border border-cyan-800/50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Live Latencies
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
