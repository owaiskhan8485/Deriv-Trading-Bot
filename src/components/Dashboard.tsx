
import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  History, 
  Play, 
  Square, 
  Activity, 
  ShieldCheck, 
  Lock,
  Globe,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { useBot } from '../context/BotContext';
import { derivService } from '../services/derivService';
import { AccountMode } from '../types/trading';

import { Overview } from './Overview';
import { SettingsPanel } from './SettingsPanel';
import { LogsPanel } from './LogsPanel';
import { MarketScanner } from './MarketScanner';
import { BacktestingView } from './BacktestingView';

const MemoizedOverview = memo(Overview);
const MemoizedScanner = memo(MarketScanner);
const MemoizedLogs = memo(LogsPanel);
const MemoizedBacktest = memo(BacktestingView);
const MemoizedSettings = memo(SettingsPanel);

export const Dashboard: React.FC = () => {
  const { config, state, startBot, stopBot, isConnected, isAuthorized, updateConfig } = useBot();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs' | 'scanner' | 'backtest' | 'positions'>('overview');

  const handleStartStop = () => {
    if (state.isRunning) stopBot();
    else startBot();
  };

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Terminal' },
    { id: 'scanner', icon: Activity, label: 'Scanner' },
    { id: 'positions', icon: Layers, label: 'Positions' },
    { id: 'logs', icon: History, label: 'History' },
    { id: 'backtest', icon: Cpu, label: 'Backtest' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-[#0d1b2f] border-r border-slate-800 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="text-slate-900" size={24} />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-lg tracking-tight">QUANT VANTAGE</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Global Pro Terminal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="hidden lg:block p-4 rounded-2xl bg-slate-800/50 space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Connection</p>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
               <span className="text-xs font-mono">{isConnected ? 'Server Online' : 'Connecting...'}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className={`w-2 h-2 rounded-full ${isAuthorized ? 'bg-green-500' : 'bg-slate-600'}`} />
               <span className="text-xs font-mono">{isAuthorized ? (config.mode === AccountMode.REAL ? 'REAL ACCOUNT' : 'DEMO ACCOUNT') : 'Not Authorized'}</span>
            </div>
          </div>

          {!isAuthorized && (
            <button
              onClick={() => derivService.authorize(config.mode === AccountMode.REAL ? config.realToken : config.demoToken)}
              className="w-full flex items-center justify-center gap-3 py-4 mb-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-xl shadow-amber-500/20 transition-all duration-300"
            >
              <Lock size={20} />
              <span className="hidden lg:block uppercase tracking-widest text-xs">
                Authorize API
              </span>
            </button>
          )}

          <button
            onClick={handleStartStop}
            disabled={!isAuthorized}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
              state.isRunning 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-900 shadow-cyan-500/20'
            }`}
          >
            {state.isRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="hidden lg:block uppercase tracking-widest text-xs">
              {state.isRunning ? 'Stop Terminal' : 'Start Terminal'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#07111f]">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-[#07111f]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Globe className="text-cyan-400" size={18} />
              <select 
                value={config.symbol}
                onChange={(e) => updateConfig({ symbol: e.target.value as any })}
                className="bg-transparent border-none text-xl font-bold focus:ring-0 cursor-pointer text-slate-100"
              >
                <option value="R_10">Volatility 10</option>
                <option value="R_25">Volatility 25</option>
                <option value="R_50">Volatility 50</option>
                <option value="R_75">Volatility 75</option>
                <option value="R_100">Volatility 100</option>
                <option value="1HZ100V">V100 (1s)</option>
                <option value="JD100">Jump 100</option>
              </select>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">Account Balance</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                {state.balance.toLocaleString('en-US', { style: 'currency', currency: state.currency })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800">
                <button 
                   onClick={() => updateConfig({ mode: AccountMode.DEMO })}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${config.mode === AccountMode.DEMO ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-slate-500'}`}
                >
                   DEMO
                </button>
                <button 
                   onClick={() => updateConfig({ mode: AccountMode.REAL })}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${config.mode === AccountMode.REAL ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500'}`}
                >
                   REAL
                </button>
             </div>
             
             <button 
               onClick={() => derivService.authorize(config.mode === AccountMode.REAL ? config.realToken : config.demoToken)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                 isAuthorized 
                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                   : 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20'
               }`}
             >
               {isAuthorized ? <ShieldCheck size={16} /> : <Lock size={16} />}
               {isAuthorized ? 'Authorized' : 'Authorize API'}
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              {activeTab === 'overview' && <MemoizedOverview />}
              {activeTab === 'scanner' && <MemoizedScanner />}
              {activeTab === 'positions' && <LogsPanel initialView="positions" />}
              {activeTab === 'logs' && <MemoizedLogs />}
              {activeTab === 'backtest' && <MemoizedBacktest />}
              {activeTab === 'settings' && <MemoizedSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
