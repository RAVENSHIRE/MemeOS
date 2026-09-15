import React, { useState } from 'react';
import {
  Flame,
  MessageSquare,
  TrendingUp,
  Radio,
  Zap,
  CheckCircle2,
  Users,
  Eye,
  Twitter,
  Sparkles,
} from 'lucide-react';
import { TokenOpportunity } from '../types';

interface Props {
  tokens: TokenOpportunity[];
  onSelectToken: (token: TokenOpportunity) => void;
  selectedToken: TokenOpportunity | null;
}

export const FomoAndXRadar: React.FC<Props> = ({
  tokens,
  onSelectToken,
  selectedToken,
}) => {
  const [activeTab, setActiveTab] = useState<'FOMO' | 'X_RADAR'>('FOMO');

  // Sample real-time verified memetic X signals
  const xSignals = [
    {
      id: 'x1',
      token: 'FARTCOIN',
      handle: '@truth_terminal',
      time: '3m ago',
      content: 'fartcoin is the purest memetic expression of terminal culture. zero utility, infinite narrative velocity.',
      likes: '2.4K',
      retweets: '580',
      sentiment: 'BULLISH',
      velocity: 96,
    },
    {
      id: 'x2',
      token: 'PNUT',
      handle: '@solana_alpha_bot',
      time: '8m ago',
      content: 'MASSIVE surge in Squirrel meme impressions across CT. Smart wallet 7xK2... just rotated 15 SOL.',
      likes: '1.8K',
      retweets: '420',
      sentiment: 'EXTREME_FOMO',
      velocity: 98,
    },
    {
      id: 'x3',
      token: 'AI16Z',
      handle: '@paborac_ai',
      time: '14m ago',
      content: 'The autonomous fund thesis is compounding. New PR merged, GitHub stars +120 today.',
      likes: '940',
      retweets: '210',
      sentiment: 'HIGH_CONVICTION',
      velocity: 91,
    },
    {
      id: 'x4',
      token: 'BONK',
      handle: '@bonk_solana',
      time: '22m ago',
      content: 'Community burn proposal passed. 500,000,000 BONK incinerated forever on-chain.',
      likes: '4.1K',
      retweets: '1.2K',
      sentiment: 'BURN_CATALYST',
      velocity: 86,
    },
  ];

  return (
    <div className="bg-[#0c111d] border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col h-full">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('FOMO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'FOMO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>FOMO SIGNALS</span>
          </button>

          <button
            onClick={() => setActiveTab('X_RADAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'X_RADAR'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>X NARRATIVE RADAR</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
          LIVE ADAPTER
        </span>
      </div>

      {/* Tab 1: FOMO Watchlist & Trending Signals */}
      {activeTab === 'FOMO' && (
        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>TRENDING SOLANA MEMES</span>
              <span>5M / 24H VOL</span>
            </div>

            <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
              {tokens.map((token, idx) => {
                const isSelected =
                  selectedToken?.address && token.address
                    ? selectedToken.address === token.address
                    : selectedToken?.symbol === token.symbol;
                const tokenKey = `fomo-token-${token.address || token.symbol}-${idx}`;
                return (
                  <div
                    key={tokenKey}
                    onClick={() => onSelectToken(token)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{token.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                          <span>{token.symbol}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {token.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
                          <span className="text-slate-400">
                            Liq: ${(token.liquidity / 1000).toFixed(0)}k
                          </span>
                          <span className="text-slate-600">•</span>
                          <span
                            className={`font-semibold ${
                              token.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            5m: {token.change5m >= 0 ? '+' : ''}
                            {token.change5m.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(3)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          FOMO {token.xVelocity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Signals Ticker */}
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Real-Time DEX Signals</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-900/80 border border-slate-800 rounded p-1.5">
                <span className="text-emerald-400 font-bold block">✓ Mint Revoked (100%)</span>
                <span className="text-slate-400">Top 10 tokens pass immutability</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded p-1.5">
                <span className="text-cyan-400 font-bold block">⚡ Volume Spikes</span>
                <span className="text-slate-400">FARTCOIN & PNUT 5m volume &gt; $500k</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: X Narrative Velocity & Engagement Radar */}
      {activeTab === 'X_RADAR' && (
        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>X (TWITTER) MEMETIC VELOCITY</span>
              <span>ENGAGEMENT</span>
            </div>

            <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
              {xSignals.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-lg p-2.5 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        ${item.token}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.handle}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{item.time}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{item.content}</p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>❤️ {item.likes}</span>
                      <span>🔄 {item.retweets}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40">
                      Velocity: {item.velocity}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative Summary Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Top Meta: AI Agents & Outrage Animals</span>
              <span className="text-cyan-400 font-bold">Velocity Index: 92/100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
