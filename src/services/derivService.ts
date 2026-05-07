
import { MarketSymbol } from '../types/trading';

export class DerivService {
  private socket: WebSocket | null = null;
  private messageListeners: ((data: any) => void)[] = [];
  private onConnectListeners: (() => void)[] = [];
  private onDisconnectListeners: (() => void)[] = [];
  private activeSubscriptions: Set<string> = new Set();

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
    
    try {
      this.socket = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
      
      this.socket.onopen = () => {
        console.log('Deriv WS Connected');
        this.activeSubscriptions.clear(); // Clear local state on fresh connection
        this.onConnectListeners.forEach(l => l());
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Debugging already subscribed issues
          if (data.error && data.error.code === 'AlreadySubscribed') {
             // Silently handle or log
             return;
          }

          this.messageListeners.forEach(l => l(data));
        } catch (e) {
          console.error('WS Message Parse Error:', e);
        }
      };
      
      this.socket.onclose = (e) => {
        console.log('Deriv WS Closed', e.code, e.reason);
        this.socket = null;
        this.activeSubscriptions.clear();
        this.onDisconnectListeners.forEach(l => l());
        // Auto reconnect after 3s
        setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = (err) => {
        console.error('Deriv WS Error:', err);
      };
    } catch (err) {
      console.error('Deriv Connection Attempt Failed:', err);
    }
  }

  send(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('Attempted to send message while WS was not open. Reconnecting...');
      this.connect();
    }
  }

  authorize(token: string) {
    this.send({ authorize: token });
  }

  subscribeBalance() {
    this.send({ balance: 1, subscribe: 1 });
  }

  getCandles(symbol: MarketSymbol, count: number = 300, granularity: number = 60, subscribe: boolean = false) {
    if (subscribe) {
      const subKey = `candles_${symbol}_${granularity}`;
      if (this.activeSubscriptions.has(subKey)) {
        // Request history without subscribing if already subscribed
        this.send({
          ticks_history: symbol,
          adjust_start_time: 1,
          count,
          end: 'latest',
          granularity,
          style: 'candles'
        });
        return;
      }
      this.activeSubscriptions.add(subKey);
    }

    this.send({
      ticks_history: symbol,
      adjust_start_time: 1,
      count,
      end: 'latest',
      granularity,
      style: 'candles',
      subscribe: subscribe ? 1 : undefined
    });
  }

  forgetAll() {
    this.send({ forget_all: 'ticks' });
    this.send({ forget_all: 'candles' });
    this.activeSubscriptions.clear();
  }

  buyContract(proposalId: string, price: number) {
    this.send({ buy: proposalId, price });
  }

  subscribeContract(contractId: number) {
    this.send({ proposal_open_contract: 1, contract_id: contractId, subscribe: 1 });
  }

  sellContract(contractId: number, price: number = 0) {
    this.send({ sell: contractId, price });
  }

  getProfitTable(limit: number = 50, offset: number = 0) {
    this.send({ profit_table: 1, limit, offset, sort: 'DESC' });
  }

  getStatement(limit: number = 50, offset: number = 0) {
    this.send({ statement: 1, limit, offset });
  }

  getPortfolio() {
    this.send({ portfolio: 1 });
  }

  onMessage(callback: (data: any) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== callback);
    };
  }

  onConnect(callback: () => void) {
    this.onConnectListeners.push(callback);
    return () => {
      this.onConnectListeners = this.onConnectListeners.filter(l => l !== callback);
    };
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectListeners.push(callback);
    return () => {
      this.onDisconnectListeners = this.onDisconnectListeners.filter(l => l !== callback);
    };
  }
}

export const derivService = new DerivService();
