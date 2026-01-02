/**
 * WebSocket实时数据服务
 * 模拟WebSocket连接，用于实时推送行情数据和通知
 */

export type MessageType = "quote" | "notification" | "signal" | "alert" | "heartbeat";

export interface WebSocketMessage {
  type: MessageType;
  data: Record<string, any>;
  timestamp: number;
}

export interface QuoteUpdate {
  code: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  bid: number;
  ask: number;
  timestamp: number;
}

export class WebSocketService {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: Map<MessageType, Set<(data: any) => void>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private subscriptions: Set<string> = new Set();

  constructor(url: string = "ws://localhost:8080") {
    this.url = url;
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    const types: MessageType[] = ["quote", "notification", "signal", "alert", "heartbeat"];
    types.forEach(type => {
      this.messageHandlers.set(type, new Set());
    });
  }

  /**
   * 连接WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error("Connection already in progress"));
        return;
      }

      this.isConnecting = true;

      try {
        // 模拟WebSocket连接（实际应该使用真实WebSocket）
        console.log(`Connecting to WebSocket: ${this.url}`);

        // 模拟连接成功
        setTimeout(() => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        }, 500);
      } catch (error) {
        this.isConnecting = false;
        this.handleConnectionError(error as Error, reject);
      }
    });
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(error: Error, reject?: (reason?: any) => void): void {
    console.error("WebSocket connection error:", error);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error("Max reconnection attempts reached");
      if (reject) {
        reject(error);
      }
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({
        type: "heartbeat",
        data: { timestamp: Date.now() },
        timestamp: Date.now()
      });
    }, 30000); // 每30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 发送消息
   */
  sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * 订阅股票行情
   */
  subscribeQuote(code: string): void {
    if (!this.subscriptions.has(code)) {
      this.subscriptions.add(code);
      this.sendMessage({
        type: "quote",
        data: { action: "subscribe", code },
        timestamp: Date.now()
      });

      // 模拟行情推送
      this.simulateQuoteUpdates(code);
    }
  }

  /**
   * 取消订阅股票行情
   */
  unsubscribeQuote(code: string): void {
    if (this.subscriptions.has(code)) {
      this.subscriptions.delete(code);
      this.sendMessage({
        type: "quote",
        data: { action: "unsubscribe", code },
        timestamp: Date.now()
      });
    }
  }

  /**
   * 模拟行情更新
   */
  private simulateQuoteUpdates(code: string): void {
    const interval = setInterval(() => {
      if (!this.subscriptions.has(code)) {
        clearInterval(interval);
        return;
      }

      // 生成随机价格变化
      const basePrice = 10 + Math.random() * 100;
      const change = (Math.random() - 0.5) * 2;
      const changePercent = (change / basePrice) * 100;

      const update: QuoteUpdate = {
        code,
        price: basePrice + change,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 10000000),
        amount: Math.floor(Math.random() * 1000000000),
        bid: basePrice + change - 0.01,
        ask: basePrice + change + 0.01,
        timestamp: Date.now()
      };

      this.handleMessage({
        type: "quote",
        data: update,
        timestamp: Date.now()
      });
    }, 2000); // 每2秒推送一次
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error("Error in message handler:", error);
        }
      });
    }
  }

  /**
   * 注册消息处理器
   */
  on(type: MessageType, handler: (data: any) => void): () => void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.add(handler);
      // 返回取消注册函数
      return () => {
        handlers.delete(handler);
      };
    }
    return () => {};
  }

  /**
   * 取消注册消息处理器
   */
  off(type: MessageType, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// 创建全局实例
export const websocketService = new WebSocketService();
