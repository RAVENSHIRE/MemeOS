import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  FileText,
  Wallet,
  Activity,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { WalletState, DataSourcesConfig } from '../types';

interface Props {
  wallet: WalletState;
  isAgentActive: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onToggleAgent: () => void;
  onKillSwitch: () => void;
  onResetStudy: () => void;
  onOpenSettings: () => void;
  onOpenCaseStudy: () => void;
  onOpenDataSources: () => void;
  sources: DataSourcesConfig;
  targetAchieved: boolean;
  stoppedAtLoss: boolean;
}

export const HeaderBar: React.FC<Props> = ({
  wallet,
  isAgentActive,
  onConnectWallet,
  onDisconnectWallet,
  onToggleAgent,
  onKillSwitch,
  onResetStudy,
  onOpenSettings,
  onOpenCaseStudy,
  onOpenDataSources,
  sources,
  targetAchieved,
  stoppedAtLoss,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0a0e17]/95 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-950/50 border border-purple-400/40 text-xl font-black">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xl tracking-tight">MEME OS</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SOLANA AGENT v1.0
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isAgentActive ? 'LOOP ACTIVE' : 'IDLE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1">
              <span>ONE WALLET.</span>
              <span className="text-slate-600">•</span>
              <span>ONE AGENT.</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">$5 → $10 NET EQUITY RUN</span>
            </p>
          </div>
        </div>

        {/* Center: Data Sources Integrity Ribbon (Clickable) */}
        <div
          onClick={onOpenDataSources}
          className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2.5 transition group"
          title="Click to inspect and toggle live data sources"
        >
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-semibold">
            <Activity className="w-3 h-3 text-cyan-400" />
            Integrations:
          </span>
          <div className="flex items-center gap-2">
            {(Object.entries(sources) as [keyof DataSourcesConfig, any][]).map(([key, src]) => {
              const isLive = src.status === 'LIVE';
              const isMock = src.status === 'MOCK';
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase hidden lg:inline">
                    {key === 'dexscreener' ? 'DEX' : key === 'solanaRpc' ? 'RPC' : key === 'xRadar' ? 'X' : key === 'gemini' ? 'AI' : 'JUP'}:
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isLive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                        : isMock
                        ? 'bg-amber-950 text-amber-400 border border-amber-600/40'
                        : 'bg-rose-950 text-rose-400 border border-rose-600/40'
                    }`}
                  >
                    {src.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Wallet & Master GO Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Configure Autonomous Risk Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Case Study Audit Report Trigger */}
          <button
            onClick={onOpenCaseStudy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Case Study</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-[10px] font-mono">
              ${wallet.equity.toFixed(2)}
            </span>
          </button>

          {/* Wallet State */}
          {!wallet.connected ? (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>CONNECT PHANTOM</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-purple-500/40 rounded-lg pl-3 pr-1.5 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="text-left">
                  <div className="text-[11px] font-mono font-bold text-white flex items-center gap-1">
                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                    {wallet.isSimulated && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">
                        SANDBOX
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {wallet.solBalance.toFixed(3)} SOL (${wallet.equity.toFixed(2)})
                  </div>
                </div>
              </div>
              <button
                onClick={onDisconnectWallet}
                className="text-[10px] text-slate-500 hover:text-rose-400 ml-2 px-1.5 py-0.5 rounded hover:bg-slate-800 transition"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Master GO / Action Button */}
          {wallet.connected && (
            <button
              onClick={onKillSwitch}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-[10px] font-bold transition"
              title="Immediately halt the agent and exit the paper position"
            >
              KILL SWITCH
            </button>
          )}
          {!wallet.connected ? (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed opacity-80"
              disabled
            >
              <span>CONNECT FIRST → GO</span>
            </button>
          ) : targetAchieved || stoppedAtLoss ? (
            <button
              onClick={onResetStudy}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/50 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET $5 CASE STUDY</span>
            </button>
          ) : (
            <button
              onClick={onToggleAgent}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-black text-xs transition shadow-lg active:scale-95 ${
                isAgentActive
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 shadow-amber-950/50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 font-black animate-pulse'
              }`}
            >
              {isAgentActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE AGENT</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>PRESS GO</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
