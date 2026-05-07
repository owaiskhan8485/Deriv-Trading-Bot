
import React from 'react';
import { useBot } from '../context/BotContext';
import { TableProperties, Info } from 'lucide-react';

const TRADE_TABLE = [
  [1.00, 2.30, 4.94, 10.62], [1.20, 2.76, 5.93, 12.74], [1.44, 3.31, 7.12, 15.29],
  [1.73, 3.97, 8.54, 18.35], [2.07, 4.77, 10.25, 22.02], [2.49, 5.72, 12.30, 26.43],
  [2.99, 6.86, 14.75, 31.71], [3.58, 8.24, 17.71, 38.06], [4.30, 9.88, 21.25, 45.67],
  [5.16, 11.86, 25.50, 54.80], [6.19, 14.23, 30.59, 65.76], [7.43, 17.08, 36.71, 78.91],
  [8.92, 20.50, 44.06, 94.70], [10.70, 24.60, 52.87, 113.63], [12.84, 29.52, 63.44, 136.36],
  [15.41, 35.42, 76.13, 163.63], [18.49, 42.50, 91.36, 196.36], [22.19, 51.00, 109.63, 235.63],
  [26.62, 61.20, 131.55, 282.76], [31.95, 73.44, 157.86, 339.31]
];

export const TradeTableComponent: React.FC = () => {
  const { state } = useBot();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-cyan-400">
           <TableProperties size={24} />
           <h3 className="text-xl font-black uppercase tracking-tight text-white">Quantum Stake Grid</h3>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-1.5">
           <Info size={12} className="text-slate-500" />
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Row: {state.currentRow} | Level: {state.currentCol + 1}</span>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 border-r border-slate-800">Row</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">T1</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">T2 (Rec)</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">T3 (Rec)</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">T4 (Stop)</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/20">
              {TRADE_TABLE.map((row, rIdx) => (
                <tr key={rIdx} className={`border-b border-slate-800/50 transition-colors ${state.currentRow === rIdx ? 'bg-cyan-500/5 transition-all' : ''}`}>
                  <td className={`p-4 text-center font-mono text-xs border-r border-slate-800 ${state.currentRow === rIdx ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-600'}`}>
                    {rIdx}
                  </td>
                  {row.map((stake, cIdx) => (
                    <td 
                        key={cIdx} 
                        className={`p-4 text-center transition-all ${state.currentRow === rIdx && state.currentCol === cIdx ? 'relative' : ''}`}
                    >
                       <div className={`p-2 rounded-xl text-xs font-mono font-bold border ${
                         state.currentRow === rIdx && state.currentCol === cIdx 
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 scale-110 shadow-lg shadow-cyan-500/40 z-10' 
                            : (state.currentRow === rIdx ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-transparent border-transparent text-slate-600')
                       }`}>
                         ${stake.toFixed(2)}
                       </div>
                       {state.currentRow === rIdx && state.currentCol === cIdx && (
                         <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
                       )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-2">
         <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} />
            Execution Protocol
         </p>
         <p className="text-xs text-slate-500 font-mono leading-relaxed">
            The bot follows a <span className="text-slate-300">Progressive Sequence Grid</span>. 
            Winning a trade advances the system to the next row (horizontal pivot). 
            Losing a trade moves the system vertically (recovery level). 
            Failing level T4 triggers a total system reset to Row 0.
         </p>
      </div>
    </div>
  );
};
