
import React from 'react';
import { useBot } from '../context/BotContext';
import { format } from 'date-fns';
import { Search, RefreshCw, Layers, TableProperties, BarChart2, FileText } from 'lucide-react';
import { TradeTableComponent } from './TradeTableComponent';

interface LogsPanelProps {
  initialView?: 'trades' | 'statement' | 'positions' | 'grid';
}

export const LogsPanel: React.FC<LogsPanelProps> = React.memo(({ initialView = 'trades' }) => {
  const { state, syncTradeHistory, syncStatement, syncPortfolio, isAuthorized } = useBot();
  const [view, setView] = React.useState<'trades' | 'statement' | 'positions' | 'grid'>(initialView);

  const refresh = () => {
    if (view === 'trades') syncTradeHistory();
    else if (view === 'statement') syncStatement();
    else if (view === 'positions') syncPortfolio();
  };

  const tabs = [
    { id: 'positions', label: 'Open Positions', icon: Layers, colorClass: 'bg-indigo-500 shadow-indigo-500/20' },
    { id: 'grid', label: 'Trade Grid', icon: TableProperties, colorClass: 'bg-amber-500 shadow-amber-500/20' },
    { id: 'trades', label: 'History', icon: BarChart2, colorClass: 'bg-cyan-500 shadow-cyan-500/20' },
    { id: 'statement', label: 'Statement', icon: FileText, colorClass: 'bg-cyan-500 shadow-cyan-500/20' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === tab.id 
                  ? `${tab.colorClass} ${tab.id === 'positions' || tab.id === 'grid' ? 'text-white' : 'text-slate-900'} shadow-lg` 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={refresh}
          disabled={!isAuthorized}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all group active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isAuthorized ? "group-hover:rotate-180 transition-transform duration-500" : ""} />
          SYNC DATA
        </button>
      </div>

      <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6">
        {view === 'grid' ? (
          <TradeTableComponent />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                {view === 'trades' && (
                  <>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Ref. ID</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Timestamp</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Symbol</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Type</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Stake</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Profit</th>
                  </>
                )}
                {view === 'statement' && (
                  <>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Trans. ID</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Time</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Action</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Description</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Amount</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Balance</th>
                  </>
                )}
                {view === 'positions' && (
                  <>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Contract ID</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Symbol</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Type</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Stake</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Buy Time</th>
                    <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Expiry</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {view === 'trades' && (
                state.trades.length > 0 ? (
                  state.trades.map((trade, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {trade.referenceId || '--'}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">
                        {format(new Date(trade.timestamp), 'dd MMM HH:mm:ss')}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-200">{trade.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction === 'CALL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-200">${trade.stake.toFixed(2)}</td>
                      <td className={`p-4 text-xs font-bold text-right font-mono ${trade.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.won ? `+$${trade.profit.toFixed(2)}` : `-$${Math.abs(trade.profit).toFixed(2)}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                       <div className="flex flex-col items-center gap-2">
                          <Search size={40} className="text-slate-800" />
                          <p className="text-sm font-medium">No trades recorded yet</p>
                       </div>
                    </td>
                  </tr>
                )
              )}
              {view === 'statement' && (
                state.statement.length > 0 ? (
                  state.statement.map((entry, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {entry.referenceId}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">
                        {format(new Date(entry.timestamp), 'dd MMM HH:mm:ss')}
                      </td>
                      <td className="p-4 text-xs font-bold">
                        <span className={`uppercase font-black tracking-tighter ${entry.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {entry.actionType}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400 max-w-xs truncate" title={entry.description}>
                        {entry.description}
                      </td>
                      <td className={`p-4 text-xs font-mono font-bold ${entry.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-200 text-right font-bold">
                        ${entry.balanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                       <div className="flex flex-col items-center gap-2">
                          <Search size={40} className="text-slate-800" />
                          <p className="text-sm font-medium">No account activity recorded yet</p>
                       </div>
                    </td>
                  </tr>
                )
              )}
              {view === 'positions' && (
                state.openPositions.length > 0 ? (
                  state.openPositions.map((pos, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {pos.contractId}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-200">
                        {pos.symbol}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.direction === 'CALL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {pos.direction}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-200">
                        ${pos.stake.toFixed(2)}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">
                        {format(new Date(pos.purchaseTime), 'dd MMM HH:mm:ss')}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400 text-right">
                        {pos.expiryTime ? format(new Date(pos.expiryTime), 'HH:mm:ss') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                       <div className="flex flex-col items-center gap-2">
                          <Search size={40} className="text-slate-800" />
                          <p className="text-sm font-medium">No open positions found</p>
                       </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
});
