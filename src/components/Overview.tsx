import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CandleChart } from './CandleChart';
import { 
  CheckCircle2,
  XCircle,
  TrendingUp, 
  TrendingDown, 
  Target, 
  Layers, 
  Zap, 
  RotateCcw,
  BarChart3,
  Activity,
  Cpu,
  Flame,
  Sparkles,
  Repeat,
  Globe
} from 'lucide-react';
import { useBot } from '../context/BotContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Overview: React.FC = React.memo(() => {
  const { state, resetSequence, config, updateConfig, toggleAutoPivot, toggleAutoReverse } = useBot();

  const sessionTrades = useMemo(() => {
    if (!state.sessionStartTime) return state.trades;
    return state.trades.filter(t => new Date(t.timestamp).getTime() >= (state.sessionStartTime || 0));
  }, [state.trades, state.sessionStartTime]);

  const winStreak = useMemo(() => {
    let streak = 0;
    for (const t of sessionTrades) {
      if (t.won) streak++;
      else break;
    }
    return streak;
  }, [sessionTrades]);

  const stats = [
    { 
      label: 'Session Profit', 
      value: (sessionTrades.reduce((acc, t) => {
        const val = typeof t.profit === 'number' ? t.profit : parseFloat(String(t.profit));
        return acc + (isNaN(val) ? 0 : val);
      }, 0)).toFixed(2), 
      icon: BarChart3, 
      color: 'text-cyan-400' 
    },
    { label: 'Win / Loss', value: `${sessionTrades.filter(t => t.won).length}W / ${sessionTrades.filter(t => !t.won).length}L`, icon: sessionTrades.filter(t => t.won).length >= sessionTrades.filter(t => !t.won).length ? CheckCircle2 : XCircle, color: 'text-amber-400' },
    { label: 'Auto-Reverse', value: state.isReversed ? 'Active 🔄' : 'Normal Logic', icon: Repeat, color: state.isReversed ? 'text-orange-400' : 'text-slate-500' },
    { label: 'Backtest Score', value: state.backtestResult ? `${state.backtestResult.score}/100` : '--', icon: Cpu, color: 'text-emerald-400' },
  ];

  const chartData = useMemo(() => {
    let balance = 0; // Relative session balance for chart
    return [...sessionTrades].reverse().map((t, i) => {
      const val = typeof t.profit === 'number' ? t.profit : parseFloat(String(t.profit));
      balance += isNaN(val) ? 0 : val;
      return { name: i + 1, profit: balance };
    });
  }, [sessionTrades]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Analysis Overlay */}
      <AnimatePresence>
        {state.isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="max-w-md w-full space-y-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center mx-auto">
                   <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                   <span className="text-4xl font-black text-white">{state.analysisCountdown}s</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Calibrating Neural Core</h2>
                <p className="text-slate-400 font-mono text-sm leading-relaxed">
                   Executing pre-flight diagnostic on <span className="text-cyan-400 font-bold">{config.symbol}</span>. 
                   Optimizing <span className="text-white font-bold">{config.strategyId === 'quantum_pulse' ? 'Quantum Pulse Aggressor' : 'Price Action Pro'}</span> against real-time 
                   liquidity patterns to ensure trend synchronization.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Market State</p>
                    <p className="text-sm font-bold text-emerald-400">ACTIVE</p>
                 </div>
                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Threads</p>
                    <p className="text-sm font-bold text-cyan-400">OPTIMIZING</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-[10px] text-slate-600 font-mono italic animate-pulse">
                <Activity size={12} />
                Scanning historical order blocks for inversion detection...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info with Streak */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 flex-wrap">
              QUANTUM TERMINAL
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/20 font-mono animate-pulse">SYSTEM LIVE</span>
              {state.isReversed && (
                <span className="bg-rose-500/10 text-rose-400 text-xs px-3 py-2 rounded-full border border-rose-500/20 font-mono flex items-center gap-2">
                  <RotateCcw size={12} className="animate-spin" />
                  LOGIC REVERSED
                </span>
              )}
           </h1>
           <p className="text-slate-500 font-mono mt-1 flex items-center gap-2">
              <Globe size={14} />
              TRADING ON {config.symbol} | {config.strategyId === 'quantum_pulse' ? 'QUANTUM PULSE v2.0' : 'PRICE ACTION PRO V5.1'} | {config.executionMode}
           </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <button 
               onClick={() => toggleAutoReverse()}
               className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 state.isAutoReverseEnabled 
                   ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                   : 'bg-slate-800 text-slate-500 border border-slate-700'
               }`}
            >
              <Repeat size={14} className={state.isAutoReverseEnabled ? 'animate-spin' : ''} />
              {state.isAutoReverseEnabled ? 'Reverse On' : 'Reverse Off'}
            </button>

            <button 
               onClick={() => toggleAutoPivot()}
               className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 state.isAutoPivotEnabled 
                   ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                   : 'bg-slate-800 text-slate-500 border border-slate-700'
               }`}
            >
              <Cpu size={14} className={state.isAutoPivotEnabled ? 'animate-pulse' : ''} />
              {state.isAutoPivotEnabled ? 'Auto-Pilot On' : 'Auto-Pilot Off'}
            </button>

            <button 
              onClick={() => updateConfig({ autoTrade: !config.autoTrade })}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                config.autoTrade ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.autoTrade ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {config.autoTrade ? 'Auto-Trade' : 'Manual'}
            </button>
          </div>

          {winStreak > 0 && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 text-orange-500"
            >
              <Flame size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{winStreak} WIN STREAK</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#0d1b2f] border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">{stat.label}</p>
                <h3 className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.label.includes('Profit') ? '$' : ''}{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-slate-900 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <AnimatePresence>
               {(state.activeTrades && state.activeTrades.length > 0) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                       <div className="flex items-center gap-3">
                          <span className="flex h-3 w-3 relative">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                          </span>
                          <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">Active Execution Flight ({state.activeTrades.length})</h3>
                       </div>
                       <div className="text-[10px] font-mono text-slate-500">REAL-TIME QUANTUM SYNC</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {state.activeTrades.map((trade) => (
                        <motion.div 
                          key={trade.contractId}
                          layout
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-[#0a121e] border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-400/60 transition-all duration-300"
                        >
                           <div className="flex justify-between items-start relative z-10">
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-cyan-400 tracking-wider uppercase">{trade.symbol}</span>
                                 </div>
                                 <h4 className={`text-base font-black ${trade.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {trade.direction} <span className="text-slate-400 text-xs font-mono ml-1">${trade.stake}</span>
                                 </h4>
                              </div>
                              <div className="text-right">
                                 <h3 className={`text-lg font-mono font-black tracking-tighter ${(trade.profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {(trade.profit || 0) >= 0 ? '+' : ''}${trade.profit?.toFixed(2) || '0.00'}
                                 </h3>
                              </div>
                           </div>

                           <div className="flex justify-between items-center mt-3 text-[9px] font-mono relative z-10">
                              <div className="flex gap-3">
                                 <div className="flex flex-col">
                                    <span className="text-slate-500 uppercase font-bold">Entry</span>
                                    <span className="text-slate-300">{trade.entrySpot}</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-slate-500 uppercase font-bold">Live</span>
                                    <span className={`${
                                       (trade.direction === 'CALL' && (trade.currentSpot || 0) > trade.entrySpot) ||
                                       (trade.direction === 'PUT' && (trade.currentSpot || 0) < trade.entrySpot)
                                       ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                       {trade.currentSpot || '--'}
                                    </span>
                                 </div>
                              </div>
                              <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                                 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                    {trade.direction === 'CALL' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
                                 </div>
                              </div>
                           </div>
    
                           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800/50">
                              <motion.div 
                                 key={`${trade.contractId}-timer`}
                                 className="h-full bg-cyan-500"
                                 initial={{ width: '100%' }}
                                 animate={{ width: '0%' }}
                                 transition={{ 
                                    duration: Math.max(0, (trade.expiryTime || 0) - Math.floor(Date.now() / 1000)), 
                                    ease: 'linear' 
                                 }}
                              />
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
               )}
            </AnimatePresence>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-6 overflow-hidden relative group">
                 <div className="flex flex-col gap-6 items-start relative z-10">
                    <div className="flex items-center justify-between w-full">
                       <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 flex items-center gap-2">
                          <Activity size={12} className={config.useNeuralFilter ? "animate-pulse" : ""} />
                          NEURAL CORE v5.0 {config.useNeuralFilter ? (state.aiReport?.isQuotaError ? '(QUOTA BYPASS)' : '') : '(DISABLED)'}
                       </div>
                       <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AI Market Brain</span>
                    </div>

                    <div className="flex items-center gap-8 w-full">
                       <div className="flex flex-col items-center">
                          <div className={`w-20 h-20 rounded-full border-4 ${!config.useNeuralFilter || state.aiReport?.isQuotaError ? 'border-slate-800' : 'border-slate-800'} flex items-center justify-center relative`}>
                             {config.useNeuralFilter && !state.aiReport?.isQuotaError && (
                               <div 
                                  className="absolute inset-0 rounded-full border-4 border-cyan-500 opacity-30 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                                  style={{ clipPath: `inset(${100 - (state.aiReport?.safetyScore || 0)}% 0 0 0)` }}
                               />
                             )}
                             <span className={`text-xl font-black ${(!config.useNeuralFilter || state.aiReport?.isQuotaError) ? 'text-slate-600' : 'text-white'}`}>
                                {config.useNeuralFilter ? (state.aiReport?.isQuotaError ? 'BP' : (state.aiReport?.safetyScore || '--')) : 'OFF'}%
                             </span>
                          </div>
                          <span className="text-[8px] text-slate-500 uppercase mt-2 font-black tracking-widest">Neural Score</span>
                       </div>
                       
                       <div className="flex-1 space-y-2">
                          <h4 className={`text-2xl font-black flex items-center gap-2 ${!config.useNeuralFilter || state.aiReport?.isQuotaError ? 'text-slate-600' : (state.aiReport?.marketSentiment === 'Bullish' ? 'text-emerald-400' : state.aiReport?.marketSentiment === 'Bearish' ? 'text-rose-400' : 'text-slate-300')}`}>
                             {!config.useNeuralFilter || state.aiReport?.isQuotaError ? <Activity size={24} /> : (state.aiReport?.marketSentiment === 'Bullish' ? <TrendingUp size={24} /> : state.aiReport?.marketSentiment === 'Bearish' ? <TrendingDown size={24} /> : <Activity size={24} />)}
                             {config.useNeuralFilter ? (state.aiReport?.isQuotaError ? 'QUOTA BYPASS ACTIVE' : (state.aiReport?.marketSentiment?.toUpperCase() || 'SCANNING...')) : 'AI FILTER OFF'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${!config.useNeuralFilter || state.aiReport?.isQuotaError ? 'bg-slate-800 text-slate-600' : (state.aiReport?.recommendation === 'TRADE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500')}`}>
                                {config.useNeuralFilter ? (state.aiReport?.isQuotaError ? 'Bypassed' : (state.aiReport?.recommendation || 'Wait')) : 'Technical Only'}
                             </span>
                             <span className="text-[10px] text-slate-500 font-mono italic">
                                Action Priority: {!config.useNeuralFilter || state.aiReport?.isQuotaError ? 'BYPASS' : (state.aiReport?.recommendation === 'TRADE' ? 'HIGH' : 'LOW')}
                             </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono italic leading-relaxed line-clamp-2 mt-2">
                             {!config.useNeuralFilter ? 'Advanced neural safeguards are disabled. Trading strictly based on high-probability technical patterns.' : 
                              (state.aiReport?.isQuotaError ? 'Notice: AI Quota limit reached. The system has automatically bypassed the neural filter to prevent execution deadlock. Trading safely via Technical Core.' :
                              (state.aiReport?.insight || 'Awaiting deep market neural mapping data...'))}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

           <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={14} className="text-yellow-400" />
                       Market Pulse
                    </h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                       <span className="text-[8px] text-emerald-400 font-bold uppercase">Streaming live</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-[9px] mb-1.5 font-bold">
                          <span className="text-slate-500 uppercase">Liquidity Depth</span>
                          <span className="text-cyan-400">OPTIMAL</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <motion.div 
                             className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                             initial={{ width: '0%' }}
                             animate={{ width: '85%' }}
                          />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[9px] mb-1.5 font-bold">
                          <span className="text-slate-500 uppercase">Success Probability</span>
                          <span className="text-emerald-400">HIGH (82%)</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <motion.div 
                             className="h-full bg-emerald-500" 
                             initial={{ width: '0%' }}
                             animate={{ width: '74%' }}
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Activity className="text-cyan-400" size={24} />
                    Live Market: {config.symbol}
                 </h2>
                 {state.activeTrade && (
                    <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] font-black text-rose-400 animate-pulse">
                       MONITORING {state.activeTrade.direction} @ {state.activeTrade.entrySpot}
                    </div>
                 )}
              </div>
              
              <div className="h-[300px] w-full relative">
                 <CandleChart data={state.marketData} activeTrade={state.activeTrade} />
              </div>
           </div>

           <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 h-[360px]">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                       <TrendingUp className="text-cyan-400" size={24} />
                       Profit Trajectory
                    </h2>
                 </div>
              </div>
              
              <div className="h-[220px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                       <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                          labelStyle={{ color: '#475569', fontSize: '10px' }}
                       />
                       <Area type="monotone" dataKey="profit" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" animationDuration={2000} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-200">Terminal Control</h3>
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Stake</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={config.initialTrade}
                        onChange={(e) => updateConfig({ initialTrade: parseFloat(e.target.value) || 0 })}
                        className="w-12 bg-transparent text-[10px] font-bold text-emerald-400 outline-none"
                      />
                   </div>
                   <select 
                     value={config.symbol}
                     onChange={(e) => updateConfig({ symbol: e.target.value as any })}
                     className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-400 outline-none focus:ring-1 focus:ring-cyan-500"
                   >
                     <optgroup label="Volatility Indices">
                       <option value="R_10">VOL_10</option>
                       <option value="R_25">VOL_25</option>
                       <option value="R_50">VOL_50</option>
                       <option value="R_75">VOL_75</option>
                       <option value="R_100">VOL_100</option>
                     </optgroup>
                     <optgroup label="Volatility (1s) Indices">
                       <option value="1HZ10V">VOL_10 (1s)</option>
                       <option value="1HZ25V">VOL_25 (1s)</option>
                       <option value="1HZ50V">VOL_50 (1s)</option>
                       <option value="1HZ75V">VOL_75 (1s)</option>
                       <option value="1HZ100V">VOL_100 (1s)</option>
                     </optgroup>
                     <optgroup label="Jump Indices">
                       <option value="JD10">JUMP_10</option>
                       <option value="JD25">JUMP_25</option>
                       <option value="JD50">JUMP_50</option>
                       <option value="JD75">JUMP_75</option>
                       <option value="JD100">JUMP_100</option>
                     </optgroup>
                   </select>
                   <button 
                     onClick={resetSequence}
                     className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                   >
                     <RotateCcw size={14} />
                     Reset
                   </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">In Seq</p>
                    <p className="text-xl font-black text-white">#{state.currentSequence}</p>
                 </div>
                 <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Mode</p>
                    <p className="text-xl font-black text-cyan-400">{config.mode}</p>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-1 text-[10px] font-mono text-slate-400">
                <p>• Payout Mode: {Math.round(config.payoutRate * 100)}% FIX</p>
                <p>• Risk Limit: T{config.maxRecoveryLevel} STOP-LOSS</p>
                <p className="text-cyan-400 font-bold">√ SMART ANTI-WASH ACTIVE</p>
                <p>• Accuracy Threshold: {config.minConfidence}%</p>
              </div>
           </div>

           <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-6 h-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" />
                    Terminal Activity
                 </h3>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{state.isRunning ? 'Streaming...' : 'Terminal Idle'}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide font-mono text-[10px]">
                 {state.logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                       <p className="text-slate-600">Waiting for Quantum Engine boot sequence...</p>
                    </div>
                 ) : (
                    state.logs.map((log) => (
                       <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-2 p-1 border-l-2 ${
                            log.type === 'success' ? 'border-emerald-500 text-emerald-400' : 
                            log.type === 'error' ? 'border-rose-500 text-rose-400' :
                            log.type === 'warning' ? 'border-amber-500 text-amber-400' :
                            log.type === 'trade' ? 'border-purple-500 text-purple-400' : 'border-slate-700 text-slate-400'
                          }`}
                       >
                          <span className="opacity-40 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span className="leading-tight">{log.message}</span>
                       </motion.div>
                    ))
                 )}
              </div>

              {/* Real-time Flow Status Bar */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div className="flex flex-col">
                       <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Quantum Flow</span>
                       <span className="text-[10px] font-mono text-emerald-400 font-bold mt-1 uppercase">
                          {state.isRunning ? 'STABLE SYNC' : 'TERMINAL SUSPENDED'}
                       </span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-right">
                    <div>
                       <span className="text-[8px] text-slate-500 uppercase font-black block">Status</span>
                       <span className="text-[10px] font-mono text-cyan-400 font-black">ONLINE</span>
                    </div>
                    <div>
                       <span className="text-[8px] text-slate-500 uppercase font-black block">Logic</span>
                       <span className="text-[10px] font-mono font-black text-emerald-400">
                          {state.isReversed ? 'REVERSED' : 'NORMAL'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
});
