import React, { useState } from 'react';
import { Wallet, Copy, ExternalLink, Check, RefreshCw, Coins, ArrowUpRight } from 'lucide-react';
import { WalletState, ActivePosition } from '../types';

interface Props {
  wallet: WalletState;
  activePosition: ActivePosition | null;
  onRefreshBalance: () => void;
  onConnectWallet: () => void;
}

export const WalletCard: React.FC<Props> = ({
  wallet,
  activePosition,
  onRefreshBalance,
  onConnectWallet,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const cashPercent = wallet.equity > 0 ? (wallet.cashUsd / wallet.equity) * 100 : 100;
  const tokenPercent = 100 - cashPercent;

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                WALLET & CAPITAL
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {wallet.isSimulated ? 'Deterministic $5 Sandbox' : 'Solana Mainnet Phantom'}
              </span>
            </div>
          </div>
          <button
            onClick={onRefreshBalance}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh balance"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Row */}
        {wallet.connected ? (
          <div className="mt-3 flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-white transition rounded"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`https://solscan.io/account/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-cyan-400 transition rounded"
                title="View on Solscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-center">
            <p className="text-xs text-purple-300 mb-2">Phantom Wallet not connected</p>
            <button
              onClick={onConnectWallet}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded transition"
            >
              Connect Phantom / $5 Sandbox
            </button>
          </div>
        )}

        {/* Balances Summary */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-left">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SOL Balance</span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">
              {wallet.solBalance.toFixed(3)} SOL
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ${(wallet.solBalance * wallet.solUsdPrice).toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Liquid Cash</span>
            <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
              ${wallet.cashUsd.toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {cashPercent.toFixed(0)}% free
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Net Equity</span>
            <span className="text-xs font-mono font-black text-cyan-300 block mt-0.5">
              ${wallet.equity.toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {(wallet.equity / 5.0).toFixed(2)}x initial
            </span>
          </div>
        </div>

        {/* Capital Allocation Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Cash: ${wallet.cashUsd.toFixed(2)}</span>
            <span>Positions: ${wallet.positionsValue.toFixed(2)}</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${cashPercent}%` }}
              title={`Cash: ${cashPercent.toFixed(1)}%`}
            />
            <div
              className="bg-cyan-400 transition-all duration-300"
              style={{ width: `${tokenPercent}%` }}
              title={`Open Tokens: ${tokenPercent.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Current Active Token Position Snippet */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
            <span>Current Token Holdings</span>
            <span className="text-cyan-400 font-bold">
              {activePosition ? '1 ACTIVE POSITION' : '0 POSITIONS (ALL CASH)'}
            </span>
          </div>

          {activePosition ? (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{activePosition.tokenIcon}</span>
                <div>
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    {activePosition.tokenSymbol}
                    <span className="text-[10px] text-slate-400">({activePosition.tokenName})</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {activePosition.tokenAmount.toLocaleString()} tokens
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">
                  ${activePosition.currentValueUsd.toFixed(2)}
                </div>
                <div
                  className={`text-[10px] font-mono font-bold ${
                    activePosition.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activePosition.unrealizedPnL >= 0 ? '+' : ''}
                  ${activePosition.unrealizedPnL.toFixed(2)} ({activePosition.unrealizedPnLPercent >= 0 ? '+' : ''}
                  {activePosition.unrealizedPnLPercent.toFixed(1)}%)
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-slate-900 rounded-lg p-2.5 text-center text-xs font-mono text-slate-500">
              Agent observing Solana DEX pools for high-conviction narrative trigger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
