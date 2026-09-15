import React from 'react';
import { X, Sliders, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AgentRiskSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentRiskSettings;
  onSaveSettings: (settings: AgentRiskSettings) => void;
}

export const RiskSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = React.useState<AgentRiskSettings>(settings);

  React.useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...localSettings,
      maxPositionSizeUsd: Math.max(0.5, Math.min(2.5, localSettings.maxPositionSizeUsd)),
      maxDailyLossUsd: Math.max(0.25, Math.min(5, localSettings.maxDailyLossUsd)),
      stopLossPercent: Math.min(-1, Math.max(-30, localSettings.stopLossPercent)),
      takeProfitPercent: Math.max(5, Math.min(100, localSettings.takeProfitPercent)),
      minNarrativeScore: Math.max(50, Math.min(95, localSettings.minNarrativeScore)),
      minLiquidityUsd: Math.max(10000, Math.min(200000, localSettings.minLiquidityUsd)),
      maxSlippagePercent: Math.max(0.1, Math.min(5, localSettings.maxSlippagePercent)),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f1422] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              AGENT RISK GOVERNANCE & SIZING
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs font-mono">
          {/* Max Position Size */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Max Position Size per Meme:</span>
              <span className="text-cyan-400 font-bold">${localSettings.maxPositionSizeUsd.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="2.50"
              step="0.10"
              value={localSettings.maxPositionSizeUsd}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, maxPositionSizeUsd: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-400"
            />
            <span className="text-[10px] text-slate-500">
              Caps individual trade risk. $1.50 allows 3 concurrent positions or reserves for compounding.
            </span>
          </div>

          {/* Max Daily Loss */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Max Daily Loss:</span>
              <span className="text-rose-400 font-bold">${localSettings.maxDailyLossUsd.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="5"
              step="0.25"
              value={localSettings.maxDailyLossUsd}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, maxDailyLossUsd: parseFloat(e.target.value) })
              }
              className="w-full accent-rose-400"
            />
            <span className="text-[10px] text-slate-500">
              Pauses new entries after realized losses reach this amount.
            </span>
          </div>

          {/* Stop Loss */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Stop Loss Threshold:</span>
              <span className="text-rose-400 font-bold">{localSettings.stopLossPercent}%</span>
            </div>
            <input
              type="range"
              min="-30"
              max="-5"
              step="1"
              value={localSettings.stopLossPercent}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, stopLossPercent: parseInt(e.target.value) })
              }
              className="w-full accent-rose-400"
            />
            <span className="text-[10px] text-slate-500">
              Strict deterministic stop loss triggered immediately if price breaks down.
            </span>
          </div>

          {/* Take Profit Target */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Take Profit Target:</span>
              <span className="text-emerald-400 font-bold">+{localSettings.takeProfitPercent}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={localSettings.takeProfitPercent}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, takeProfitPercent: parseInt(e.target.value) })
              }
              className="w-full accent-emerald-400"
            />
            <span className="text-[10px] text-slate-500">
              Locks profits automatically. Trailing stop protects runners.
            </span>
          </div>

          {/* Min Narrative Score */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Min Narrative Strength Score:</span>
              <span className="text-purple-300 font-bold">{localSettings.minNarrativeScore} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={localSettings.minNarrativeScore}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, minNarrativeScore: parseInt(e.target.value) })
              }
              className="w-full accent-purple-400"
            />
            <span className="text-[10px] text-slate-500">
              Agent filters out weak low-conviction tokens lacking viral X momentum.
            </span>
          </div>

          {/* Min Liquidity */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Min Verified DEX Liquidity:</span>
              <span className="text-amber-300 font-bold">${(localSettings.minLiquidityUsd / 1000).toFixed(0)}k</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={localSettings.minLiquidityUsd}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, minLiquidityUsd: parseInt(e.target.value) })
              }
              className="w-full accent-amber-400"
            />
            <span className="text-[10px] text-slate-500">
              Prevents honey-potting and illiquid exit slippage.
            </span>
          </div>

          {/* Auto-execute toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <span className="text-white font-bold block">Fully Autonomous Execution</span>
              <span className="text-[10px] text-slate-400">
                Agent executes buys & exits without prompting user confirmation
              </span>
            </div>
            <button
              onClick={() =>
                setLocalSettings({ ...localSettings, autoExecute: !localSettings.autoExecute })
              }
              className={`w-12 h-6 rounded-full transition p-0.5 ${
                localSettings.autoExecute ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition transform ${
                  localSettings.autoExecute ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow transition"
          >
            Apply Risk Parameters
          </button>
        </div>
      </div>
    </div>
  );
};
