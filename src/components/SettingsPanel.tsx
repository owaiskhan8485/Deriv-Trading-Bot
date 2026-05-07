
import React from 'react';
import { useBot } from '../context/BotContext';
import { 
  Key, 
  ShieldCheck, 
  Target, 
  AlertTriangle,
  Lock,
  Zap,
  BrainCircuit,
  Activity,
  Globe
} from 'lucide-react';
import { AccountMode, ExecutionMode } from '../types/trading';
import { derivService } from '../services/derivService';

export const SettingsPanel: React.FC = React.memo(() => {
  const { config, updateConfig } = useBot();

  const handleInput = (key: keyof typeof config, val: any) => {
    updateConfig({ [key]: val });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Strategy & Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategy Selection */}
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="text-purple-400" size={20} />
              <h3 className="font-bold text-slate-200">Intelligence Core</h3>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 mb-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="text-cyan-400" size={18} />
                    <div>
                       <p className="text-xs font-bold text-slate-200">Neural Filter (Gemini AI)</p>
                       <p className="text-[10px] text-slate-500 font-medium">Safeguard entries with AI analysis</p>
                    </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.useNeuralFilter}
                      onChange={(e) => handleInput('useNeuralFilter', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                 </label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => handleInput('strategyId', 'inqilaab_alpha')}
                    className={`p-6 rounded-2xl border flex flex-col items-start gap-2 transition-all text-left ${
                      config.strategyId === 'inqilaab_alpha'
                        ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                     <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-slate-200">Inqilaab Spectrum Alpha (R100)</span>
                        {config.strategyId === 'inqilaab_alpha' && (
                          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        )}
                     </div>
                     <p className="text-[10px] text-purple-500 uppercase font-black tracking-widest flex items-center gap-2">
                        <Zap size={12} />
                        2026 INQILAAB SPECTRUM
                     </p>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Optimized for Volatility 100 Index. Detects liquidity vacuums and identifies high-probability pulse reversals using triple-horizon RSI spectrum.
                     </p>
                  </button>

                  <button 
                    onClick={() => handleInput('strategyId', 'price_action_pro')}
                    className={`p-6 rounded-2xl border flex flex-col items-start gap-2 transition-all text-left ${
                      config.strategyId === 'price_action_pro'
                        ? 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                     <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-slate-200">Price Action Pro (V5.1 Core)</span>
                        {config.strategyId === 'price_action_pro' && (
                          <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                        )}
                     </div>
                     <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest flex items-center gap-2">
                        <Target size={12} />
                        Active Neural Core Optimized
                     </p>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Enhanced model using EMA cross-validation, RSI momentum surges, and institutional pattern rejection. 
                     </p>
                  </button>

                  <button 
                    onClick={() => handleInput('strategyId', 'quantum_pulse')}
                    className={`p-6 rounded-2xl border flex flex-col items-start gap-2 transition-all text-left ${
                      config.strategyId === 'quantum_pulse'
                        ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                     <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-slate-200">Quantum Pulse Aggressor</span>
                        {config.strategyId === 'quantum_pulse' && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        )}
                     </div>
                     <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest flex items-center gap-2">
                        <Zap size={12} />
                        Ultra Aggressive Pulse
                     </p>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Hyper-active momentum pulse using 7-period RSI and 5/13 EMA. Unleashed for maximum trade frequency on micro-trends.
                     </p>
                  </button>
              </div>
           </div>
        </div>

        {/* Execution Mode */}
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <Zap className="text-amber-400" size={20} />
              <h3 className="font-bold text-slate-200">Execution Engine</h3>
           </div>

           <div className="space-y-4 pt-2 border-b border-slate-800/50 pb-6 mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider flex items-center gap-2">
                     <Target size={14} className="text-cyan-400" />
                     Trade Duration (Expiration)
                  </label>
                  <span className="text-cyan-400 font-mono text-[10px] font-bold">
                    {config.durationSeconds} {config.durationUnit === 't' ? 'Ticks' : (config.durationUnit === 'm' ? 'Minutes' : 'Seconds')}
                  </span>
                </div>
                <select 
                  value={`${config.durationSeconds}${config.durationUnit}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = val.endsWith('t') ? 't' : (val.endsWith('m') ? 'm' : 's');
                    const num = parseInt(val);
                    updateConfig({ durationSeconds: num, durationUnit: unit as any });
                  }}
                  className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200 cursor-pointer"
                >
                   <option value="5t">5 Ticks (Hyper Speed)</option>
                   <option value="15s">15 Seconds (Scalper)</option>
                   <option value="30s">30 Seconds</option>
                   <option value="1m">1 Minute (Standard)</option>
                   <option value="2m">2 Minutes</option>
                   <option value="5m">5 Minutes</option>
                   <option value="10m">10 Minutes</option>
                   <option value="15m">15 Minutes</option>
                </select>
             </div>

             <div className="space-y-4 pt-2 border-b border-slate-800/50 pb-6 mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider flex items-center gap-2">
                     <Activity size={14} className="text-purple-400" />
                     Analysis Granularity (Candle)
                  </label>
                  <span className="text-purple-400 font-mono text-[10px] font-bold">{config.candleInterval}s</span>
                </div>
                <select 
                  value={config.candleInterval}
                  onChange={(e) => handleInput('candleInterval', parseInt(e.target.value))}
                  className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs outline-none focus:ring-1 focus:ring-purple-500 text-slate-200 cursor-pointer"
                >
                   <option value={60}>1 Minute (Standard)</option>
                   <option value={300}>5 Minutes</option>
                </select>
             </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => handleInput('executionMode', ExecutionMode.COMPOUND)}
                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all text-center ${
                  config.executionMode === ExecutionMode.COMPOUND 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                 <span className="text-xs font-bold uppercase tracking-wider">Compound</span>
                 <span className="text-[8px] opacity-70">Single + Martingale</span>
              </button>

              <button 
                onClick={() => handleInput('executionMode', ExecutionMode.FIRE)}
                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all text-center ${
                  config.executionMode === ExecutionMode.FIRE 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                 <span className="text-xs font-bold uppercase tracking-wider">Fire Trades</span>
                 <span className="text-[8px] opacity-70">Batch Entry Burst</span>
              </button>

              <button 
                onClick={() => handleInput('executionMode', ExecutionMode.PROFIT_TAKER)}
                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all text-center ${
                  config.executionMode === ExecutionMode.PROFIT_TAKER 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                 <span className="text-xs font-bold uppercase tracking-wider">Profit Taker</span>
                 <span className="text-[8px] opacity-70">Instant Sell on Gain</span>
              </button>
           </div>

           {(config.executionMode === ExecutionMode.FIRE || config.executionMode === ExecutionMode.PROFIT_TAKER) && (
             <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Batch Size (Trades per signal)</label>
                   <span className="text-rose-400 font-mono font-bold text-xs">{config.fireBatchSize}</span>
                </div>
                <input 
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={config.fireBatchSize}
                  onChange={(e) => handleInput('fireBatchSize', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
             </div>
           )}

           <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-3 text-[10px] text-amber-400">
              <Activity size={14} className="shrink-0" />
              <p>Warning: Batch execution dramatically increases risk. Ensure your balance covers the full batch volume.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Settings */}
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <Globe className="text-cyan-400" size={20} />
              <h3 className="font-bold text-slate-200">Market Settings</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Primary Trading Symbol</label>
                 <select 
                   value={config.symbol}
                   onChange={(e) => handleInput('symbol', e.target.value)}
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200"
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
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Scanner Symbols (Multi-Scan)</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    {['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ10V', '1HZ25V', '1HZ100V', 'JD10', 'JD100'].map(sym => (
                      <label key={sym} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={config.scannerSymbols.includes(sym as any)}
                          onChange={(e) => {
                            const newSymbols = e.target.checked 
                              ? [...config.scannerSymbols, sym]
                              : config.scannerSymbols.filter(s => s !== sym);
                            handleInput('scannerSymbols', newSymbols);
                          }}
                          className="w-3 h-3 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                        />
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors uppercase">{sym.replace('R_', 'VOL_')}</span>
                      </label>
                    ))}
                 </div>
                 <p className="text-[9px] text-slate-600 italic">Scanner staggers requests to professional API-Safe intervals.</p>
              </div>
           </div>
        </div>

        {/* Token Management */}
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <Key className="text-cyan-400" size={20} />
              <h3 className="font-bold text-slate-200">API Credentials</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Demo Token</label>
                 <input 
                   type="password"
                   value={config.demoToken}
                   onChange={(e) => handleInput('demoToken', e.target.value)}
                   placeholder="Enter Deriv Demo Token (required)"
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Real Token</label>
                 <input 
                   type="password"
                   value={config.realToken}
                   onChange={(e) => handleInput('realToken', e.target.value)}
                   placeholder="Enter Deriv Real Token (optional)"
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                 />
              </div>
           </div>
           
           <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex gap-3 text-xs text-rose-300">
              <AlertTriangle size={16} className="shrink-0" />
              <p>Keep your tokens secure. Never share them with anyone. The bot saves these locally in your browser storage.</p>
           </div>
           
           <button 
              onClick={() => {
                const token = config.mode === AccountMode.REAL ? config.realToken : config.demoToken;
                if (token && token.trim().length > 5) {
                  derivService.authorize(token);
                } else {
                  alert('Please enter a valid API Token first.');
                }
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest flex items-center justify-center gap-3 mt-6"
           >
              <Lock size={18} />
              Validate & Authorize
           </button>
        </div>

        {/* Risk Management */}
        <div className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-400" size={20} />
              <h3 className="font-bold text-slate-200">Risk & Compounding</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Initial Trade ($)</label>
                 <input 
                   type="number"
                   value={config.initialTrade}
                   onChange={(e) => handleInput('initialTrade', parseFloat(e.target.value))}
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Max Recovery (Levels)</label>
                 <select 
                   value={config.maxRecoveryLevel}
                   onChange={(e) => handleInput('maxRecoveryLevel', parseInt(e.target.value))}
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                 >
                    <option value={2}>2 (Ultra Safe)</option>
                    <option value={3}>3 (Safe)</option>
                    <option value={4}>4 (Recommended)</option>
                    <option value={5}>5 (High Reward)</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Target Profit %</label>
                 <input 
                   type="number"
                   value={config.targetProfitPercent}
                   onChange={(e) => handleInput('targetProfitPercent', parseFloat(e.target.value))}
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Min Confidence %</label>
                 <input 
                   type="number"
                   value={config.minConfidence}
                   onChange={(e) => handleInput('minConfidence', parseInt(e.target.value))}
                   className="w-full bg-[#07111f] border border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                 />
              </div>
           </div>

           <div className="flex items-center gap-4 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={config.autoTrade}
                   onChange={(e) => handleInput('autoTrade', e.target.checked)}
                   className="sr-only peer" 
                 />
                 <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                 <span className="ms-3 text-sm font-bold text-slate-300">Enable Bot Auto-Execution</span>
              </label>
           </div>
        </div>
      </div>
    </div>
  );
});
