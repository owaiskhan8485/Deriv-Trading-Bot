
import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { Activity, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { derivService } from '../services/derivService';
import { PriceActionStrategy } from '../strategies/priceAction';

export const MarketScanner: React.FC = () => {
  const { config, isAuthorized } = useBot();
  const [scanResults, setScanResults] = useState<any[]>([]);
  const strategy = new PriceActionStrategy();

  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.msg_type === 'candles') {
        const analysis = strategy.analyze(data.candles);
        setScanResults(prev => {
           const filtered = prev.filter(r => r.symbol !== data.echo_req.ticks_history);
           return [{
             symbol: data.echo_req.ticks_history,
             ...analysis,
             timestamp: new Date()
           }, ...filtered].slice(0, 10);
        });
      }
    };

    const unsubscribe = derivService.onMessage(handleMessage);
    
    // Initial scan of symbols
    config.scannerSymbols.forEach((s, i) => {
      setTimeout(() => derivService.getCandles(s), i * 1000);
    });

    const runScan = () => {
       config.scannerSymbols.forEach((s, i) => {
         // Stagger requests to avoid connection spikes
         setTimeout(() => {
           if (isAuthorized) derivService.getCandles(s);
         }, i * 2000); 
       });
    };

    runScan();
    const interval = setInterval(runScan, 30000); // Scan every 30s instead of 15s for stability

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [config.scannerSymbols]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="font-bold text-slate-200">Global Market Scanner</h3>
            <p className="text-xs text-slate-500">Live multi-symbol analysis for high-confidence opportunities</p>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            <Activity size={12} className="animate-pulse" />
            SCANNING {config.scannerSymbols.length} INSTRUMENTS
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scanResults.length > 0 ? (
          scanResults.sort((a, b) => b.confidence - a.confidence).map((res, i) => (
            <motion.div 
               key={res.symbol}
               layout
               className="bg-[#0d1b2f] border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-colors group"
            >
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-200">{res.symbol}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">CONF: {res.confidence}%</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${res.signal === 'CALL' ? 'bg-emerald-500/10 text-emerald-400' : res.signal === 'PUT' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                    {res.signal}
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                     <span>RSI (14)</span>
                     <span className={res.indicators.rsi > 60 ? 'text-emerald-400' : res.indicators.rsi < 40 ? 'text-rose-400' : ''}>
                        {res.indicators.rsi.toFixed(2)}
                     </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                     <div 
                        className="bg-cyan-500 h-full transition-all duration-1000" 
                        style={{ width: `${res.confidence}%` }} 
                     />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    {res.reason || 'Waiting for confirmation...'}
                  </p>
               </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="inline-block p-6 rounded-full bg-slate-900 border border-slate-800 animate-pulse">
                <Search size={48} className="text-slate-800" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-400">Scanner Initializing</p>
                <p className="text-xs text-slate-600">Gathering market intelligence across global indexes</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
