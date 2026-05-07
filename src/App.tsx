
import React from 'react';
import { BotProvider } from './context/BotContext';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <BotProvider>
      <div className="min-h-screen bg-[#07111f] text-slate-100 font-sans selection:bg-cyan-500/30">
        <Dashboard />
      </div>
    </BotProvider>
  );
}
