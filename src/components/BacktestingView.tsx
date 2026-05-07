import React from 'react';
import { motion } from 'motion/react';
import { useBot } from '../context/BotContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Activity,
  History,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const BacktestingView: React.FC = () => {
  const { state, runFullBacktest, runGlobalScanner, updateConfig, config } = useBot();
  const result = state.backtestResult;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            BACKTESTING HUB
            <span className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/20 font-mono">NEURAL SIMULATOR</span>
          </h1>
          <p className="text-slate-500 font-mono mt-1 flex items-center gap-2">
            <History size={14} />
            Analyzing {config.symbol} | 100 Sample Window | Historical Precision Core
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => runGlobalScanner()}
            disabled={state.isBacktestingAll}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
              state.isBacktestingAll 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20 group'
            }`}
          >
            <Activity size={18} className={state.isBacktestingAll ? 'animate-spin' : 'group-hover:scale-110'} />
            {state.isBacktestingAll ? 'SCANNING ALL...' : 'DEEP SCAN ALL MARKETS'}
          </button>
          
          <button 
            onClick={() => runFullBacktest()}
            className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-cyan-500/20 group"
          >
            <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            RERUN CURRENT
          </button>
        </div>
      </div>

      {!result ? (
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="text-slate-600 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Simulation Engine Offline</h2>
          <p className="text-slate-500 font-mono max-w-md mx-auto">
            The neural backtesting core requires active market data to synthesize historical outcomes. 
            Start the bot or click the button above to initialize the simulator.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-8 rounded-3xl border ${result.score >= 60 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'} flex flex-col justify-between h-[180px]`}>
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Accuracy</span>
                  <ShieldCheck size={20} className={result.score >= 60 ? 'text-emerald-400' : 'text-rose-400'} />
               </div>
               <div>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{result.score}%</h3>
                  <p className={`text-xs font-bold mt-1 ${result.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    WIN RATE: {(result.winRate * 100).toFixed(1)}%
                  </p>
               </div>
            </div>

            <div className="p-8 rounded-3xl border bg-slate-900/50 border-slate-800 flex flex-col justify-between h-[180px]">
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Simulation P/L</span>
                  <TrendingUp size={20} className="text-cyan-400" />
               </div>
               <div>
                  <h3 className={`text-5xl font-black tracking-tighter ${result.profit >= 0 ? 'text-white' : 'text-rose-500'}`}>
                    {result.profit >= 0 ? '+' : ''}${result.profit.toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">REALISTIC COMPOUNDED TOTAL</p>
               </div>
            </div>

            <div className="p-8 rounded-3xl border bg-slate-900/50 border-slate-800 flex flex-col justify-between h-[180px]">
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profit Factor</span>
                  <Zap size={20} className="text-amber-400" />
               </div>
               <div>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{result.profitFactor.toFixed(2)}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">{result.wins}W / {result.losses}L RECORDS</p>
               </div>
            </div>

             <div className="p-8 rounded-3xl border bg-slate-900/50 border-slate-800 flex flex-col justify-between h-[180px]">
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Drawdown</span>
                  <BarChart3 size={20} className="text-purple-400" />
               </div>
               <div>
                  <h3 className="text-5xl font-black text-white tracking-tighter">{result.maxDrawdown.toFixed(1)}%</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1 text-uppercase">ACCOUNT STRESS LEVEL</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-white flex items-center gap-3">
                     <Clock className="text-cyan-400" size={24} />
                     SIMULATION LOGS
                   </h3>
                   <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Last 20 Samples</span>
                </div>

                <div className="space-y-3">
                  {result.trades.map((t, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 font-black uppercase">{t.time}</p>
                           <p className={`text-lg font-black ${t.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.direction} {t.won ? 'WIN' : 'LOSS'}
                           </p>
                        </div>
                        <div className="hidden md:block">
                           <p className="text-[10px] text-slate-600 uppercase font-black">Strategy Signal</p>
                           <p className="text-xs text-slate-400 font-mono italic">{t.reason}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-black ${t.won ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.won ? '+$0.85' : '-$1.00'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-4xl p-10 relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <Zap size={24} />
                    <h3 className="text-xl font-black uppercase tracking-tight">AI Strategy Insight</h3>
                  </div>
                  <p className="text-slate-400 font-mono text-sm leading-relaxed italic">
                    "Based on the 100-sample historical window, the <span className="text-white font-bold">Price Action Pro</span> strategy 
                    is currently exhibiting {result.winRate > 0.6 ? 'High stability' : result.winRate > 0.45 ? 'Moderate stability' : 'Poor stability'} 
                    on the {config.symbol} pair. {result.winRate < 0.45 ? 'Logic Inversion is Recommended and has been automatically enabled.' : 'Maintaining standard signal logic is efficient.'}"
                  </p>
                  <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                       <span className="text-slate-500">Volatility Risk</span>
                       <span className="text-rose-400">MODERATE</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-rose-500 w-[45%]" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 blur-[100px] rounded-full" />
              </div>

              {/* Multi-Symbol Scan Results */}
              {Object.keys(state.allMarketScores).length > 0 && (
                <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Activity size={24} />
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Market Hierarchy</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {(Object.entries(state.allMarketScores) as [string, number][])
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([sym, score]) => (
                        <div key={sym} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${score > 60 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                             <span className="font-mono text-sm text-white font-bold">{sym}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${score > 60 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                              {score}%
                            </span>
                            {score > 60 && (
                              <button 
                                onClick={() => updateConfig({ symbol: sym as any })}
                                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-tighter"
                              >
                                PIVOT
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
