import React, { useState } from 'react';
import {
  X,
  Trophy,
  AlertTriangle,
  Download,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CaseStudyReport, TradeRecord, WalletState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: CaseStudyReport | null;
  wallet: WalletState;
  trades: TradeRecord[];
  isTargetAchieved: boolean;
  isStoppedAtLoss: boolean;
  onRegenerateReport: () => void;
  isGenerating: boolean;
}

export const CaseStudyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  report,
  wallet,
  trades,
  isTargetAchieved,
  isStoppedAtLoss,
  onRegenerateReport,
  isGenerating,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `
# ${report.title}
**Generated:** ${report.timestamp}

## Executive Summary
${report.executiveSummary}

## Quantitative Performance Table
- **Initial Capital:** ${report.metricsTable.initialCapital}
- **Final Net Equity:** ${report.metricsTable.finalEquity}
- **Net Return:** ${report.metricsTable.netProfitLoss}
- **Total Trades:** ${report.metricsTable.totalTrades}
- **Win Rate:** ${report.metricsTable.winRate}
- **Trade Expectancy:** ${report.metricsTable.expectancy}
- **Total Fees Incurred:** ${report.metricsTable.totalFees}
- **Average Slippage:** ${report.metricsTable.avgSlippage}
- **Maximum Drawdown:** ${report.metricsTable.maxDrawdown}

## Key Takeaways
${report.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Reproducibility Verdict
${report.verifiedReproducibility}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const data = {
      report,
      wallet,
      trades,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MEME_OS_Case_Study_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b101d] border border-cyan-500/40 w-full max-w-4xl rounded-2xl p-6 shadow-2xl shadow-cyan-950/60 text-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                $5 MEME OS CASE STUDY AUDIT REPORT
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic capital experiment: $5.00 Live Capital → $10.00 Net Equity Target
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-mono text-slate-300 transition"
              title="Copy Markdown report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-mono text-cyan-400 transition"
              title="Download JSON audit file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 mt-4 scrollbar-thin">
          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isTargetAchieved
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                : isStoppedAtLoss
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                : 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isTargetAchieved ? (
                <Trophy className="w-6 h-6 text-emerald-400" />
              ) : isStoppedAtLoss ? (
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              ) : (
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              )}
              <div>
                <div className="font-extrabold text-sm text-white">
                  {isTargetAchieved
                    ? 'GOAL ACCOMPLISHED: $10.00 NET EQUITY LOCKED'
                    : isStoppedAtLoss
                    ? 'STOP-LOSS PRESERVATION TRIGGERED'
                    : 'EXPERIMENT IN PROGRESS: LIVE RUN AUDIT'}
                </div>
                <div className="text-xs opacity-90">
                  {isTargetAchieved
                    ? 'The autonomous agent multiplied capital by 2.0x without exceeding risk parameters.'
                    : isStoppedAtLoss
                    ? 'Capital preserved at stop threshold. No automatic additional funding permitted.'
                    : 'Real-time telemetry and ledger tracking active on Solana.'}
                </div>
              </div>
            </div>
            <button
              onClick={onRegenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-mono text-white transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isGenerating ? 'Synthesizing...' : 'Refresh AI Audit'}</span>
            </button>
          </div>

          {/* Metrics Table Grid */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              Audited Performance Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Starting Capital</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">
                  {report?.metricsTable.initialCapital || '$5.00'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Final Net Equity</span>
                <span className="text-sm font-black font-mono text-cyan-300 mt-1 block">
                  {report?.metricsTable.finalEquity || `$${wallet.equity.toFixed(2)}`}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Net P&L Return</span>
                <span
                  className={`text-sm font-black font-mono mt-1 block ${
                    wallet.equity >= 5 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {report?.metricsTable.netProfitLoss ||
                    `${wallet.equity >= 5 ? '+' : ''}$${(wallet.equity - 5).toFixed(2)}`}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Win Rate</span>
                <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">
                  {report?.metricsTable.winRate || '0.0%'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Trade Expectancy</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">
                  {report?.metricsTable.expectancy || '$0.00 / trade'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Solana Fees</span>
                <span className="text-sm font-black font-mono text-slate-300 mt-1 block">
                  {report?.metricsTable.totalFees || '$0.00'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Average Slippage</span>
                <span className="text-sm font-black font-mono text-slate-300 mt-1 block">
                  {report?.metricsTable.avgSlippage || '0 bps'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Maximum Drawdown</span>
                <span className="text-sm font-black font-mono text-amber-400 mt-1 block">
                  {report?.metricsTable.maxDrawdown || '0.0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {report?.executiveSummary && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Summary & Strategy Audit</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {report.executiveSummary}
              </p>
            </div>
          )}

          {/* Complete Trade Ledger */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              Trade Execution Ledger ({trades.length} Trades)
            </h3>
            {trades.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center text-xs font-mono text-slate-500">
                No closed trades yet. Press GO to begin the autonomous search loop.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Token</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Fee</th>
                      <th className="p-2.5">Slippage</th>
                      <th className="p-2.5">Net P&L</th>
                      <th className="p-2.5">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {trades.map((t) => {
                      const isProfit = (t.realizedPnL || 0) >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-slate-500 whitespace-nowrap">
                            {new Date(t.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-2.5 font-bold text-white whitespace-nowrap">
                            ${t.tokenSymbol}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.type === 'BUY'
                                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                                  : 'bg-purple-950 text-purple-400 border border-purple-800/40'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            ${t.priceUsd < 0.01 ? t.priceUsd.toFixed(6) : t.priceUsd.toFixed(4)}
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-slate-400">
                            ${t.totalUsd.toFixed(2)}
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-slate-400">
                            ${t.feeUsd.toFixed(4)}
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-slate-400">
                            {t.slippageBps} bps
                          </td>
                          <td className="p-2.5 whitespace-nowrap font-bold">
                            {t.realizedPnL !== undefined ? (
                              <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                                {isProfit ? '+' : ''}${t.realizedPnL.toFixed(2)} ({isProfit ? '+' : ''}
                                {t.pnlPercent?.toFixed(1)}%)
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                            {t.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Key Takeaways */}
          {report?.keyTakeaways && report.keyTakeaways.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-2">
                Quantitative & Memetic Key Learnings
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reproducibility Verdict */}
          {report?.verifiedReproducibility && (
            <div className="bg-[#090e17] border border-cyan-800/40 rounded-xl p-3.5 text-xs text-slate-400 font-mono">
              <span className="text-cyan-300 font-bold block uppercase mb-1">
                Deterministic Reproducibility Standard:
              </span>
              <span>{report.verifiedReproducibility}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            One wallet. One agent. Reproducible capital experiment.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
