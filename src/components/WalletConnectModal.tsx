import React from 'react';
import { X, Wallet, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnectRealPhantom: () => Promise<void>;
  onConnectSandbox: () => void;
  isConnecting: boolean;
  error?: string | null;
}

export const WalletConnectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConnectRealPhantom,
  onConnectSandbox,
  isConnecting,
  error,
}) => {
  if (!isOpen) return null;

  const hasPhantomExtension = typeof window !== 'undefined' && 'solana' in window && (window as any).solana?.isPhantom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f1422] border border-purple-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-purple-950/50 text-slate-100">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white shadow">
              👻
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">CONNECT PHANTOM WALLET</h2>
              <p className="text-[11px] text-slate-400">One wallet. One agent. Ready on GO.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="py-4 space-y-3">
          {/* Option 1: Real Phantom Extension */}
          <div
            onClick={onConnectRealPhantom}
            className="p-3.5 bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 rounded-xl cursor-pointer transition group shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                  👻
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition flex items-center gap-1.5">
                    <span>Phantom Browser Wallet</span>
                    {hasPhantomExtension && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect real Solana mainnet wallet via Phantom provider
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Option 2: 1-Click $5 Funded Sandbox Wallet */}
          <div
            onClick={onConnectSandbox}
            className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 rounded-xl cursor-pointer transition group shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                    <span>Deterministic $5 Sandbox Wallet</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-mono font-bold">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Funded with $5.00 (0.0278 SOL) to test the reproducible case study immediately
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] font-mono text-slate-500 text-center">
          Permissions: read public key and sign deterministic transactions. No private keys stored.
        </div>
      </div>
    </div>
  );
};
