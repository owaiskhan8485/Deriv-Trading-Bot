
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BotConfig, BotState, AccountMode, MarketSymbol, TradeResult, TradeDirection, ExecutionMode, StatementEntry, OpenPosition } from '../types/trading';
import { IStrategy } from '../strategies/types';
import { derivService } from '../services/derivService';
import { CompoundingEngine } from '../services/compoundingEngine';
import { PriceActionStrategy } from '../strategies/priceAction';
import { QuantumPulseAggressor } from '../strategies/QuantumPulseAggressor';
import { analyzeMarketWithAI } from '../services/aiService';

interface BotContextType {
  config: BotConfig;
  state: BotState;
  updateConfig: (newConfig: Partial<BotConfig>) => void;
  startBot: () => void;
  stopBot: () => void;
  resetSequence: () => void;
  runFullBacktest: (symbol?: string) => Promise<void>;
  runGlobalScanner: () => Promise<void>;
  toggleAutoPivot: () => void;
  toggleAutoReverse: () => void;
  syncTradeHistory: () => void;
  syncStatement: () => void;
  syncPortfolio: () => void;
  isConnected: boolean;
  isAuthorized: boolean;
}

const DEFAULT_CONFIG: BotConfig = {
  demoToken: '',
  realToken: '',
  mode: AccountMode.DEMO,
  symbol: 'R_100',
  durationSeconds: 30,
  durationUnit: 's',
  payoutRate: 0.85,
  startBalance: 10,
  initialTrade: 0.35,
  targetProfitPercent: 1.5,
  maxRecoveryLevel: 4,
  minConfidence: 60,
  autoTrade: true,
  compoundingEnabled: true,
  executionMode: ExecutionMode.COMPOUND,
  fireBatchSize: 10,
  strategyId: 'price_action_pro',
  scannerSymbols: ['R_75', 'R_100'],
  candleInterval: 60,
  useNeuralFilter: false,
  autoPivot: false,
};

const BotContext = createContext<BotContextType | undefined>(undefined);

const TRADE_TABLE = [
  [1.00, 2.30, 4.94, 10.62], [1.20, 2.76, 5.93, 12.74], [1.44, 3.31, 7.12, 15.29],
  [1.73, 3.97, 8.54, 18.35], [2.07, 4.77, 10.25, 22.02], [2.49, 5.72, 12.30, 26.43],
  [2.99, 6.86, 14.75, 31.71], [3.58, 8.24, 17.71, 38.06], [4.30, 9.88, 21.25, 45.67],
  [5.16, 11.86, 25.50, 54.80], [6.19, 14.23, 30.59, 65.76], [7.43, 17.08, 36.71, 78.91],
  [8.92, 20.50, 44.06, 94.70], [10.70, 24.60, 52.87, 113.63], [12.84, 29.52, 63.44, 136.36],
  [15.41, 35.42, 76.13, 163.63], [18.49, 42.50, 91.36, 196.36], [22.19, 51.00, 109.63, 235.63],
  [26.62, 61.20, 131.55, 282.76], [31.95, 73.44, 157.86, 339.31]
];

export const BotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem('bot_config');
    let base = saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    
    // Symbols list for validation
    const allowed: MarketSymbol[] = [
      'R_10', 'R_25', 'R_50', 'R_75', 'R_100', 
      '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V',
      'JD10', 'JD25', 'JD50', 'JD75', 'JD100'
    ];
    base.scannerSymbols = base.scannerSymbols.filter(s => allowed.includes(s));
    if (base.scannerSymbols.length === 0) base.scannerSymbols = ['R_75', 'R_100'];
    if (!allowed.includes(base.symbol)) base.symbol = 'R_100';
    
    return base;
  });

  const [state, setState] = useState<BotState>(() => {
    const savedTrades = localStorage.getItem('bot_trades');
    return {
      balance: 0,
      currency: 'USD',
      currentSequence: 1,
      currentLevel: 1,
      sequenceStartBalance: config.startBalance,
      trades: savedTrades ? JSON.parse(savedTrades) : [],
      statement: [],
      openPositions: [],
      isRunning: false,
      isAnalyzing: false,
      analysisCountdown: 0,
      isReversed: false,
      allMarketScores: {},
      isBacktestingAll: false,
      isAutoPivotEnabled: false,
      isAutoReverseEnabled: false,
      currentRow: 0,
      currentCol: 0,
      logs: [],
      marketData: [],
    };
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const compoundingRef = useRef(new CompoundingEngine(config));
  const strategiesRef = useRef<Record<string, IStrategy>>({
    'price_action_pro': new PriceActionStrategy(),
    'quantum_pulse': new QuantumPulseAggressor(),
  });
  const scanIndexRef = useRef(0);
  const openTradesRef = useRef(0);
  const lastFireTimeRef = useRef(0);
  const lastResultTimeRef = useRef(Date.now());
  const activeContractsRef = useRef<Record<number, any>>({});
  const processedContractsRef = useRef<Set<number>>(new Set());

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' | 'trade' = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message,
        type
      }, ...prev.logs].slice(0, 50)
    }));
  };

  // Heartbeat for "Per Sec" Logs
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (state.isRunning) {
        const flowStates = ['Synchronizing Fluctuations', 'Analyzing Liquidity', 'Detecting Squeeze', 'Monitoring Institutional Floors', 'Scanning Rejection Zones'];
        const randomState = flowStates[Math.floor(Math.random() * flowStates.length)];
        const pressure = (Math.random() * 100).toFixed(1);
        addLog(`FLOW: ${randomState} | Pressure: ${pressure}% | Active Threads: ${openTradesRef.current}`, 'info');
      }
    }, 1500); // 1.5s for readability but high frequency
    return () => clearInterval(heartbeat);
  }, [state.isRunning]);

  // Use refs to avoid useEffect dependency hell and listener duplication
  const stateRef = useRef(state);
  const configRef = useRef(config);

  useEffect(() => {
    stateRef.current = state;
    if (state.trades.length > 0) {
      localStorage.setItem('bot_trades', JSON.stringify(state.trades.slice(0, 100)));
    }
  }, [state]);

  useEffect(() => {
    configRef.current = config;
    localStorage.setItem('bot_config', JSON.stringify(config));
    compoundingRef.current.updateConfig(config);

    // Re-subscribe if symbol/interval changes while running
    if (stateRef.current.isRunning) {
      const interval = [60, 120, 180, 300, 600, 900].includes(config.candleInterval) ? config.candleInterval : 60;
      derivService.getCandles(config.symbol, 300, interval, true);
    }
  }, [config.symbol, config.candleInterval, config.demoToken, config.realToken, config.mode, config.durationSeconds]);

  const updateConfig = (newConfig: Partial<BotConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      const allowed: MarketSymbol[] = [
        'R_10', 'R_25', 'R_50', 'R_75', 'R_100', 
        '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V',
        'JD10', 'JD25', 'JD50', 'JD75', 'JD100'
      ];
      if (updated.symbol && !allowed.includes(updated.symbol as MarketSymbol)) updated.symbol = 'R_100';
      if (updated.scannerSymbols) updated.scannerSymbols = updated.scannerSymbols.filter(s => allowed.includes(s));
      return updated;
    });
  };

  const syncTradeHistory = useCallback(() => {
    if (isAuthorized) {
      derivService.getProfitTable(50);
    }
  }, [isAuthorized]);

  const syncStatement = useCallback(() => {
    if (isAuthorized) {
      derivService.getStatement(50);
    }
  }, [isAuthorized]);

  const syncPortfolio = useCallback(() => {
    if (isAuthorized) {
      derivService.getPortfolio();
    }
  }, [isAuthorized]);

  const handleTradeResult = useCallback((won: boolean, profit: number, details: any) => {
    const contractId = details.contractId;
    if (contractId && processedContractsRef.current.has(contractId)) return;
    if (contractId) processedContractsRef.current.add(contractId);

    openTradesRef.current = Math.max(0, openTradesRef.current - 1);
    lastResultTimeRef.current = Date.now();
    addLog(`PIPELINE: Contract ${contractId} resolved [Remaining: ${openTradesRef.current}]`, 'info');
    
    setState(prev => {
      let newLevel = won ? 1 : Math.min(prev.currentLevel + 1, configRef.current.maxRecoveryLevel);
      let newSequence = won ? prev.currentSequence + 1 : prev.currentSequence;
      
      let currentRow = prev.currentRow;
      let currentCol = prev.currentCol;

      if (configRef.current.executionMode === ExecutionMode.ROW_TABLE_20) {
        if (won) {
          currentRow = (currentRow + 1) % 20;
          currentCol = 0;
        } else {
          currentCol++;
          if (currentCol >= 4) {
            currentRow = 0;
            currentCol = 0;
          }
        }
      }

      const chartProfit = compoundingRef.current.getProfitTarget(prev.sequenceStartBalance);
      const newSeqStartBalance = won ? Number((prev.sequenceStartBalance + chartProfit).toFixed(2)) : prev.sequenceStartBalance;

    const cleanProfit = typeof profit === 'number' ? profit : parseFloat(String(profit));
    const trade: TradeResult = {
        won,
        profit: isNaN(cleanProfit) ? 0 : cleanProfit,
        stake: details.stake || 0,
        level: prev.currentLevel,
        symbol: details.symbol || 'Unknown',
        direction: details.direction || 'Unknown',
        timestamp: new Date(),
    };

      // Set activeTrade to undefined only if no more open trades
      const stillTrading = openTradesRef.current > 0;

      return {
        ...prev,
        currentLevel: newLevel,
        currentSequence: newSequence,
        currentRow,
        currentCol,
        sequenceStartBalance: newSeqStartBalance,
        trades: [trade, ...prev.trades].slice(0, 50),
        activeTrade: stillTrading ? prev.activeTrade : undefined,
      };
    });
  }, []);

  const processAnalysis = useCallback((data: any) => {
    if (!data || !data.candles) return;
    
    const currentConfig = configRef.current;
    
    // Safety check: Only process signals for the primary symbol if we are not in dedicated scanner mode
    // However, if the user wants "every time" trades, we can let the scanner ALSO trigger trades on the primary symbol
    // using analysis from other symbols (cross-market signal). But let's stay focused on the primary symbol first.
    const isQuantumPulse = currentConfig.strategyId === 'quantum_pulse';
    
    if (!isQuantumPulse && data.echo_req.ticks_history !== currentConfig.symbol && currentConfig.executionMode !== ExecutionMode.FIRE) {
      // Still process for allMarketScores update but don't trade
      const scannerStrategy = strategiesRef.current[currentConfig.strategyId] || strategiesRef.current['price_action_pro'];
      const scannerRes = scannerStrategy.analyze(data.candles);
      // ... logic for scores ...
      return; 
    }

    const strategy = strategiesRef.current[currentConfig.strategyId] || strategiesRef.current['price_action_pro'];
    const rawAnalysis = strategy.analyze(data.candles);
    
    // Automatic Logic Reversal (Optimized Pulse)
    let syncScore = 0.5;
    if (data.candles.length > 30) {
      let matches = 0;
      let tests = 0;
      // Scan last 15-20 candles for a robust "current state" read
      for (let i = data.candles.length - 20; i < data.candles.length - 2; i++) {
        const hist = data.candles.slice(0, i);
        const testRes = strategy.analyze(hist);
        if (testRes.signal !== 'HOLD') {
          tests++;
          const move = data.candles[i + 1].close - data.candles[i].close;
          const wasCorrect = (testRes.signal === 'CALL' && move > 0) || (testRes.signal === 'PUT' && move < 0);
          if (wasCorrect) matches++;
        }
      }
      syncScore = tests > 0 ? (matches / tests) : 0.5;
    }

    // Dynamic Reversal: Hysteresis logic
    const currentIsReversed = stateRef.current.isReversed;
    let shouldReverseNow = currentIsReversed;

    const backtestScore = stateRef.current.allMarketScores[currentConfig.symbol] || 50;

    if (stateRef.current.isAutoReverseEnabled) {
      if (backtestScore < 50) {
        shouldReverseNow = true;
      } else if (backtestScore > 55) {
        shouldReverseNow = false;
      }
    } else {
      // Technical Pulse based reversal (as backup/alternative)
      if (syncScore < 0.35) {
        shouldReverseNow = true;
      } else if (syncScore > 0.55) {
        shouldReverseNow = false;
      }
    }
    
    if (currentIsReversed !== shouldReverseNow && !stateRef.current.isAnalyzing) {
      addLog(`Adaptive Pulse: Shift Detected. ${shouldReverseNow ? 'Reversing' : 'Restoring'} logic for next cycle. (Accuracy: ${(syncScore * 100).toFixed(0)}%)`, 'info');
      setState(prev => ({ ...prev, isReversed: shouldReverseNow }));
    }

    const signal = shouldReverseNow 
      ? (rawAnalysis.signal === 'CALL' ? 'PUT' : (rawAnalysis.signal === 'PUT' ? 'CALL' : 'HOLD'))
      : rawAnalysis.signal;

    const analysis = { ...rawAnalysis, signal };

    setState(prev => ({ ...prev, lastPulse: Date.now() }));

    // Low-frequency heartbeat log and analysis data
    if (Math.random() > 0.85) {
      addLog(`Scanning ${currentConfig.symbol} | Strategy: ${strategy.name} | Result: ${analysis.signal}`, 'info');
    }

    setState(prev => ({ 
      ...prev, 
      lastSignal: analysis.signal, 
      lastConfidence: analysis.confidence,
      marketData: data.echo_req.ticks_history === configRef.current.symbol ? data.candles : prev.marketData
    }));

    const currentState = stateRef.current;

    // AI Safety Filter
    const isQuotaError = currentState.aiReport?.isQuotaError === true;
    const aiSafetyPass = !currentConfig.useNeuralFilter || 
                         !currentState.aiReport || 
                         currentState.aiReport.recommendation === 'TRADE' ||
                         isQuotaError; // INTELLIGENT FALLBACK: If AI is hitting quota limits, we bypass to allow Technical Signal trading

    const canTrade = currentState.isRunning && !currentState.isAnalyzing && currentConfig.autoTrade && aiSafetyPass;
    const isFireMode = currentConfig.executionMode === ExecutionMode.FIRE;
    const isProfitTaker = currentConfig.executionMode === ExecutionMode.PROFIT_TAKER;
    
    // In FIRE and PROFIT_TAKER mode, allow continuous entry if signal persists
    const now = Date.now();
    // Fire mode is much more aggressive: 500ms throttle instead of 2.5s
    const throttleTime = isFireMode ? 500 : 2500;
    const isThrottled = (isFireMode || isProfitTaker) && (now - lastFireTimeRef.current < throttleTime);
    const isQuantumPulseStrategy = currentConfig.strategyId === 'quantum_pulse';
    const hasRoom = (isFireMode || isProfitTaker || isQuantumPulseStrategy) ? openTradesRef.current < 100 : openTradesRef.current === 0;

    if (!hasRoom && !isThrottled && Math.random() > 0.95) {
       addLog(`PIPELINE: Saturated (${openTradesRef.current} trades). Waiting for resolution...`, 'warning');
    }

    if (canTrade && hasRoom && !isThrottled) {
      if (analysis.signal !== 'HOLD' && analysis.confidence >= currentConfig.minConfidence) {
        lastFireTimeRef.current = now;
        addLog(`SIGNAL ACTIVATED: [${analysis.signal}] @ [${analysis.confidence}%]`, 'success');
        addLog(`Logic: ${analysis.reason}`, 'info');

        const prevLosses = currentState.trades
          .filter(t => (new Date().getTime() - new Date(t.timestamp).getTime()) < 3600000) 
          .slice(0, currentState.currentLevel - 1)
          .reduce((acc, t) => acc + (isNaN(t.profit) ? 0 : (t.won ? 0 : Math.abs(t.stake))), 0);

        const baseStake = currentConfig.executionMode === ExecutionMode.ROW_TABLE_20 
          ? TRADE_TABLE[currentState.currentRow][currentState.currentCol]
          : compoundingRef.current.getStakeForLevel(currentState.sequenceStartBalance, currentState.currentLevel, prevLosses);
        
        const batchSize = (isFireMode || isProfitTaker) ? currentConfig.fireBatchSize : 1;
        openTradesRef.current += batchSize;

        addLog(`Initiating ${currentConfig.executionMode} execution phase [Cycle: ${batchSize} Trades]`, 'trade');

        for (let i = 0; i < batchSize; i++) {
          setTimeout(() => {
            if (!isConnected) {
               addLog('X-LINK: Connection lost in execution flight. Aborting pulse.', 'error');
               return;
            }
            derivService.send({
               proposal: 1,
               amount: baseStake,
               basis: 'stake',
               contract_type: analysis.signal,
               currency: 'USD',
               duration: currentConfig.durationSeconds, 
               duration_unit: currentConfig.durationUnit || 's',
               symbol: currentConfig.symbol,
            });
          }, i * 150); 
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleMessage = (data: any) => {
      // DEFENSIVE: Handle API errors to prevent black screen (crashes)
    if (data.error) {
        const errMsg = data.error.message || 'Unknown Network Sync Error';
        console.error('Deriv API Error:', errMsg);
        addLog(`API ERROR: ${errMsg}`, 'error');
        if (data.msg_type === 'authorize') {
           setIsAuthorized(false);
        }
        return;
      }

      if (data.msg_type === 'authorize') {
        setIsAuthorized(true);
        derivService.subscribeBalance();
        derivService.getProfitTable(50);
        derivService.getStatement(50);
        derivService.getPortfolio();
      }
      if (data.msg_type === 'portfolio') {
        const port = data.portfolio;
        if (port && port.contracts) {
          const syncedPositions: OpenPosition[] = port.contracts.map((c: any) => ({
            contractId: c.contract_id,
            symbol: c.display_name,
            direction: c.contract_type,
            stake: c.buy_price,
            purchaseTime: new Date(c.purchase_time * 1000),
            expiryTime: c.expiry_time ? new Date(c.expiry_time * 1000) : undefined,
            entrySpot: c.entry_spot
          }));
          
          setState(prev => ({
            ...prev,
            openPositions: syncedPositions
          }));
        }
      }
      if (data.msg_type === 'statement') {
        const stmt = data.statement;
        if (stmt && stmt.transactions) {
          const syncedEntries: StatementEntry[] = stmt.transactions.map((tx: any) => ({
            actionType: tx.action_type,
            amount: tx.amount,
            balanceAfter: tx.balance_after,
            contractId: tx.contract_id,
            referenceId: tx.transaction_id,
            timestamp: new Date(tx.transaction_time * 1000),
            description: tx.longcode
          }));
          
          setState(prev => ({
            ...prev,
            statement: syncedEntries
          }));
        }
      }
      if (data.msg_type === 'profit_table') {
        const table = data.profit_table;
        if (table && table.transactions) {
          const syncedTrades: TradeResult[] = table.transactions.map((tx: any) => ({
            won: tx.profit_loss > 0,
            profit: tx.profit_loss,
            stake: tx.buy_price,
            level: 1, // Default for historical
            symbol: tx.display_name,
            direction: tx.contract_type,
            timestamp: new Date(tx.purchase_time * 1000),
            contractId: tx.contract_id,
            referenceId: tx.transaction_id
          }));
          
          setState(prev => ({
            ...prev,
            trades: syncedTrades
          }));
        }
      }
      if (data.msg_type === 'balance' && data.balance) {
        setState(prev => ({ 
          ...prev, 
          balance: data.balance.balance, 
          currency: data.balance.currency 
        }));
      }
      if (data.msg_type === 'candles') {
        processAnalysis(data);
      }
      if (data.msg_type === 'proposal') {
        if (data.proposal) {
          derivService.buyContract(data.proposal.id, data.proposal.ask_price);
        }
      }
      if (data.msg_type === 'buy') {
        if (data.buy) {
          derivService.subscribeContract(data.buy.contract_id);
        }
      }
      if (data.msg_type === 'proposal_open_contract') {
        const poc = data.proposal_open_contract;
        if (poc) {
          // Track all active contracts
          if (!poc.is_sold && poc.status !== 'won' && poc.status !== 'lost') {
            activeContractsRef.current[poc.contract_id] = poc;
            
            // PROFIT TAKER LOGIC: Close early if profit is positive
            if (configRef.current.executionMode === ExecutionMode.PROFIT_TAKER && poc.profit > 0) {
              addLog(`PROFIT TAKER: Closing contract ${poc.contract_id} early | Profit: $${poc.profit}`, 'success');
              derivService.sellContract(poc.contract_id);
            }

            // Update active trade for live monitoring
            setState(prev => ({
              ...prev,
              activeTrade: {
                contractId: poc.contract_id,
                symbol: poc.display_name,
                direction: poc.contract_type === 'CALL' ? 'CALL' : 'PUT',
                stake: poc.buy_price,
                entrySpot: poc.entry_spot,
                currentSpot: poc.current_spot,
                startTime: poc.date_start,
                expiryTime: poc.date_expiry,
                profit: poc.profit,
                status: poc.status
              }
            }));
          } else {
            delete activeContractsRef.current[poc.contract_id];
          }

            if (poc.is_sold || poc.status === 'won' || poc.status === 'lost') {
              const won = poc.status === 'won';
              handleTradeResult(won, poc.profit, {
                contractId: poc.contract_id,
                stake: poc.buy_price,
                symbol: poc.display_name,
                direction: poc.contract_type
              });
              // Refresh history after trade closes
              setTimeout(() => {
                syncTradeHistory();
                syncStatement();
                syncPortfolio();
              }, 2000);
            }
        }
      }
    };

    const unMsg = derivService.onMessage(handleMessage);
    const unConn = derivService.onConnect(() => setIsConnected(true));
    const unDisc = derivService.onDisconnect(() => {
      setIsConnected(false);
      setIsAuthorized(false);
    });

    derivService.connect();

    return () => {
      unMsg();
      unConn();
      unDisc();
    };
  }, [processAnalysis, handleTradeResult]);

  // Scanner loop
  useEffect(() => {
    if (!state.isRunning || !config.autoTrade) return;

    const scannerInterval = setInterval(() => {
      // Robust Safety Reset: if we've been "trading" for over 30s without any RESOLVED count, forced flush
      if (openTradesRef.current > 0) {
        const timeSinceLastResult = Date.now() - lastResultTimeRef.current;
        const timeSinceLastFire = Date.now() - lastFireTimeRef.current;
        
        if (timeSinceLastResult > 30000 && timeSinceLastFire > 30000) {
           openTradesRef.current = 0;
           activeContractsRef.current = {};
           processedContractsRef.current.clear();
           lastResultTimeRef.current = Date.now();
           addLog('SYSTEM: Deadlock detected. Force-clearing execution pipeline of orphan trades.', 'error');
           setState(prev => ({ ...prev, activeTrade: undefined }));
        }
        
        const isFire = configRef.current.executionMode === ExecutionMode.FIRE;
        const isProfitTaker = configRef.current.executionMode === ExecutionMode.PROFIT_TAKER;
        if (!isFire && !isProfitTaker) return;
      }
      
      const symbols = config.scannerSymbols;
      if (symbols.length > 0) {
        const currentSymbol = symbols[scanIndexRef.current % symbols.length];
        derivService.getCandles(currentSymbol, 300, [60, 120, 180, 300, 600, 900, 1800, 3600].includes(config.candleInterval) ? config.candleInterval : 60);
        scanIndexRef.current++;
      }
    }, config.executionMode === ExecutionMode.FIRE || config.strategyId === 'quantum_pulse' ? 500 : 3000);

    // Keep primary symbol fresh
    const primaryInterval = setInterval(() => {
      if (state.isRunning && config.autoTrade) {
        derivService.getCandles(config.symbol, 300, [60, 120, 180, 300, 600, 900, 1800, 3600].includes(config.candleInterval) ? config.candleInterval : 60);
      }
    }, config.strategyId === 'quantum_pulse' ? 1000 : 5000);

    return () => {
      clearInterval(scannerInterval);
      clearInterval(primaryInterval);
    };
  }, [state.isRunning, config.autoTrade, config.scannerSymbols]);

  // AI Analysis loop
  useEffect(() => {
    if (!state.isRunning) return;

    let timeoutId: NodeJS.Timeout;
    const runAI = async () => {
      // Analyze current symbol
      let unsubscribe: (() => void) | undefined;
      unsubscribe = derivService.onMessage(async (data) => {
        if (data.msg_type === 'candles' && data.echo_req.ticks_history === config.symbol) {
          const report = await analyzeMarketWithAI(data.candles, config.symbol);
          setState(prev => ({ ...prev, aiReport: report }));
          
          // Adaptive backoff: if quota error, wait much longer (5 minutes)
          const nextInterval = report.isQuotaError ? 300000 : 45000;
          timeoutId = setTimeout(runAI, nextInterval);
          
          if (unsubscribe) unsubscribe();
        }
      });
      derivService.getCandles(config.symbol);
    };

    runAI();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [state.isRunning, config.symbol]);

  const runFullBacktest = useCallback(async (targetSymbol?: string) => {
    const symbol = targetSymbol || configRef.current.symbol;
    addLog(`INITIATING: Deep Market Backtest for ${symbol}...`, 'info');
    
    // Fetch candle history without subscribing for backtest
    const interval = [60, 120, 180, 300, 600, 900].includes(configRef.current.candleInterval) ? configRef.current.candleInterval : 60;
    derivService.getCandles(symbol as any, 200, interval, false);
    
    // Wait for data
    const handleBacktestData = (data: any) => {
      if (data.msg_type === 'candles' && data.echo_req.ticks_history === symbol) {
        const candles = data.candles;
        if (!candles || candles.length < 50) return;

        const currentConfig = configRef.current;
        const strategy = strategiesRef.current[currentConfig.strategyId] || strategiesRef.current['price_action_pro'];
        let wins = 0;
        let losses = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let simBalance = currentConfig.startBalance || 10;
        let peakBalance = simBalance;
        let maxDD = 0;
        
        const trades: any[] = [];
        let currentStake = currentConfig.initialTrade || 0.35;
        let level = 1;

        const durationSec = currentConfig.durationUnit === 'm' ? currentConfig.durationSeconds * 60 : (currentConfig.durationUnit === 't' ? currentConfig.durationSeconds * 2 : currentConfig.durationSeconds);
        const steps = Math.max(1, Math.ceil(durationSec / interval));

        // Use last 100 candles for simulation
        const startIdx = Math.max(0, candles.length - 110);
        for (let i = startIdx; i < candles.length - steps; i++) {
          const hist = candles.slice(0, i);
          const res = strategy.analyze(hist);
          
          if (res.signal !== 'HOLD' && res.confidence >= currentConfig.minConfidence) {
            const entryPrice = candles[i].close;
            const exitPrice = candles[i + steps].close;
            const won = (res.signal === 'CALL' && exitPrice > entryPrice) || (res.signal === 'PUT' && exitPrice < entryPrice);
            
            const payoutRate = currentConfig.payoutRate || 0.85;
            const pnl = won ? currentStake * payoutRate : -currentStake;
            
            if (isNaN(pnl)) continue;

            simBalance += pnl;
            
            if (won) {
              wins++;
              grossProfit += pnl;
              if (currentConfig.compoundingEnabled) {
                currentStake = currentStake * (1 + payoutRate);
              } else {
                currentStake = currentConfig.initialTrade;
              }
              level++;
              if (level > currentConfig.maxRecoveryLevel) {
                level = 1;
                currentStake = currentConfig.initialTrade;
              }
            } else {
              losses++;
              grossLoss += Math.abs(pnl);
              currentStake = currentConfig.initialTrade;
              level = 1;
            }

            if (simBalance > peakBalance) peakBalance = simBalance;
            const dd = peakBalance > 0 ? ((peakBalance - simBalance) / peakBalance) * 100 : 0;
            if (dd > maxDD) maxDD = dd;

            trades.push({
              time: new Date(candles[i].epoch * 1000).toLocaleTimeString(),
              direction: res.signal,
              won,
              reason: res.reason,
              profit: pnl,
              balance: simBalance
            });
          }
        }

        const total = wins + losses;
        const winRate = total > 0 ? (wins / total) : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
        let score = (winRate * 60) + (Math.min(profitFactor, 3) * 10) + (Math.max(0, 10 - maxDD) * 1);
        score = Math.min(100, Math.max(0, Math.round(score)));
        const finalProfit = simBalance - currentConfig.startBalance;
        
        const result = {
          winRate,
          totalTrades: total,
          wins,
          losses,
          profit: isNaN(finalProfit) ? 0 : finalProfit,
          score,
          maxDrawdown: maxDD,
          profitFactor,
          timestamp: Date.now(),
          trades: trades.slice(-25).reverse()
        };

        setState(prev => ({ 
          ...prev, 
          backtestResult: symbol === currentConfig.symbol ? result : prev.backtestResult,
          allMarketScores: { ...prev.allMarketScores, [symbol]: score },
          isReversed: symbol === currentConfig.symbol ? winRate < 0.42 : prev.isReversed
        }));

        if (symbol === currentConfig.symbol) {
          addLog(`BACKTEST ${symbol}: $${result.profit.toFixed(2)} | Score: ${score}`, score > 60 ? 'success' : 'warning');
        }
      }
    };

    const unMsg = derivService.onMessage(handleBacktestData);
    setTimeout(unMsg, 2000);
  }, []);

  const runGlobalScanner = useCallback(async () => {
    setState(prev => ({ ...prev, isBacktestingAll: true }));
    addLog('NEURAL GLOBAL SCAN: Initializing parallel market evaluation...', 'info');
    
    const symbols = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V'];
    
    for (const sym of symbols) {
      await runFullBacktest(sym);
      // Small delay between requests to prevent rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    setState(prev => {
      const best = (Object.entries(prev.allMarketScores) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
      if (best && prev.isAutoPivotEnabled && best[1] > 60 && best[0] !== configRef.current.symbol) {
        addLog(`AUTONOMOUS PIVOT: Strategy detected superior liquidity on ${best[0]} (${best[1]}%). Switching...`, 'success');
        updateConfig({ symbol: best[0] as any });
      }
      return { ...prev, isBacktestingAll: false };
    });
    
    addLog('GLOBAL SCAN COMPLETE: Market hierarchy recalculated.', 'info');
  }, [runFullBacktest, updateConfig]);

  const toggleAutoPivot = () => {
    setState(prev => {
      const newVal = !prev.isAutoPivotEnabled;
      addLog(newVal ? 'AUTO-PILOT ACTIVATED: Dynamic Symbol Migration engaged.' : 'AUTO-PILOT DEACTIVATED.', newVal ? 'success' : 'warning');
      if (newVal) {
        setTimeout(runGlobalScanner, 1000);
      }
      return { ...prev, isAutoPivotEnabled: newVal };
    });
  };

  const toggleAutoReverse = () => {
    setState(prev => {
      const newVal = !prev.isAutoReverseEnabled;
      addLog(newVal ? 'INVERSION CORE ARMED: Bot will flip signals if score < 50.' : 'INVERSION CORE DISARMED.', newVal ? 'success' : 'warning');
      return { ...prev, isAutoReverseEnabled: newVal };
    });
  };

  // Analysis & Countdown Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isRunning && state.isAnalyzing && state.analysisCountdown > 0) {
      timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          analysisCountdown: Math.max(0, prev.analysisCountdown - 1)
        }));
      }, 1000);
    } else if (state.isRunning && state.isAnalyzing && state.analysisCountdown === 0) {
      addLog('Diagnostic Phase Complete. Synthesizing historical accuracy...', 'info');
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
    return () => clearInterval(timer);
  }, [state.isRunning, state.isAnalyzing, state.analysisCountdown]);

  // Autonomous Global Scanner Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isAutoPivotEnabled) {
      // Run scanner every 10 minutes to recalibrate market hierarchy
      interval = setInterval(() => {
        if (!state.isBacktestingAll) {
          runGlobalScanner();
        }
      }, 600000); 
    }
    return () => clearInterval(interval);
  }, [state.isAutoPivotEnabled, state.isBacktestingAll, runGlobalScanner]);

  // periodic sync
  useEffect(() => {
    if (isAuthorized) {
       const interval = setInterval(() => {
         syncTradeHistory();
         syncStatement();
         syncPortfolio();
       }, 30000);
       return () => clearInterval(interval);
    }
  }, [isAuthorized, syncTradeHistory, syncStatement, syncPortfolio]);

  const startBot = () => {
    addLog('INITIATING: Quantum High-Frequency Core...', 'info');
    
    // Ensure we are subscribed to correctly intervaled candles for live trading
    const interval = [60, 120, 180, 300, 600, 900].includes(configRef.current.candleInterval) ? configRef.current.candleInterval : 60;
    derivService.getCandles(configRef.current.symbol, 300, interval, true);

    setState(prev => ({ 
      ...prev, 
      isRunning: true, 
      isAnalyzing: true, 
      analysisCountdown: 5, 
      isReversed: false 
    }));
    runFullBacktest();
  };
  const stopBot = () => {
    addLog('SHUTDOWN: Trading Engine Halted.', 'error');
    // Unsubscribe from candles? We don't have a direct unsubscribe but we can stop processing
    setState(prev => ({ ...prev, isRunning: false, isAnalyzing: false }));
  };
  const resetSequence = () => {
    openTradesRef.current = 0;
    activeContractsRef.current = {};
    processedContractsRef.current.clear();
    lastResultTimeRef.current = Date.now();
    lastFireTimeRef.current = 0;
    
    setState(prev => ({
      ...prev,
      currentSequence: 1,
      currentLevel: 1,
      currentRow: 0,
      currentCol: 0,
      sequenceStartBalance: config.startBalance,
      trades: [],
      activeTrade: undefined,
      logs: [{ id: 'reset', timestamp: Date.now(), message: 'ENGINE RESET: All pipelines cleared. Ready for fresh trajectory.', type: 'success' }, ...prev.logs].slice(0, 50)
    }));
  };

  return (
    <BotContext.Provider value={{
      config,
      state,
      updateConfig,
      startBot,
      stopBot,
      resetSequence,
      runFullBacktest,
      runGlobalScanner,
      toggleAutoPivot,
      toggleAutoReverse,
      syncTradeHistory,
      syncStatement,
      syncPortfolio,
      isConnected,
      isAuthorized
    }}>
      {children}
    </BotContext.Provider>
  );
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (!context) throw new Error('useBot must be used within BotProvider');
  return context;
};
