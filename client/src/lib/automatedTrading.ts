import { InvestmentStrategy, SelectionFactor } from "./strategyTypes";

export interface TradeSignal {
  id: string;
  strategyId: string;
  code: string;
  name: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  reason: string;
  confidence: number; // 0-100
  timestamp: Date;
  status: "pending" | "executed" | "cancelled";
}

export interface TradeOrder {
  id: string;
  strategyId: string;
  code: string;
  name: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  totalAmount: number;
  status: "pending" | "partial" | "filled" | "cancelled";
  executedQuantity: number;
  executedPrice: number;
  commission: number;
  timestamp: Date;
  executedAt?: Date;
}

export interface TradeLog {
  id: string;
  strategyId: string;
  orders: TradeOrder[];
  totalProfit: number;
  totalCommission: number;
  timestamp: Date;
}

export interface RiskAlert {
  id: string;
  strategyId: string;
  type: "drawdown" | "loss" | "volatility" | "concentration";
  level: "warning" | "critical";
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}

export interface PortfolioStatus {
  strategyId: string;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitRate: number;
  maxDrawdown: number;
  currentDrawdown: number;
  positions: PositionInfo[];
  alerts: RiskAlert[];
  lastUpdated: Date;
}

export interface PositionInfo {
  code: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  profit: number;
  profitRate: number;
  percentage: number; // 占总资产比例
}

/**
 * 自动化交易执行引擎
 */
export class AutomatedTradingEngine {
  private signals: TradeSignal[] = [];
  private orders: TradeOrder[] = [];
  private tradeLogs: TradeLog[] = [];
  private alerts: RiskAlert[] = [];
  private portfolios: Map<string, PortfolioStatus> = new Map();

  /**
   * 生成交易信号
   */
  generateSignals(
    strategy: InvestmentStrategy,
    candidates: Array<{ code: string; name: string; price: number }>
  ): TradeSignal[] {
    const signals: TradeSignal[] = [];

    candidates.forEach(candidate => {
      // 根据策略因子评估
      let confidence = 50;
      let reason = "基于策略因子评估";

      strategy.factors.forEach(factor => {
        if (factor.category === "technical" && factor.value) {
          confidence += 10;
        }
        if (factor.category === "fundamental" && factor.value) {
          confidence += 8;
        }
        if (factor.category === "sentiment" && factor.value) {
          confidence += 5;
        }
      });

      // 确保置信度在0-100之间
      confidence = Math.min(confidence, 100);

      if (confidence > 60) { // 置信度>60%才生成买入信号
        signals.push({
          id: `signal-${Date.now()}-${candidate.code}`,
          strategyId: strategy.id,
          code: candidate.code,
          name: candidate.name,
          action: "buy",
          price: candidate.price,
          quantity: Math.floor(10000 / candidate.price), // 假设每次买入10000元
          reason,
          confidence,
          timestamp: new Date(),
          status: "pending"
        });
      }
    });

    this.signals.push(...signals);
    return signals;
  }

  /**
   * 执行交易信号
   */
  executeSignal(signalId: string, executionPrice?: number): TradeOrder | null {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) return null;

    const price = executionPrice || signal.price;
    const commission = (price * signal.quantity) * 0.001; // 0.1%手续费

    const order: TradeOrder = {
      id: `order-${Date.now()}`,
      strategyId: signal.strategyId,
      code: signal.code,
      name: signal.name,
      action: signal.action,
      price,
      quantity: signal.quantity,
      totalAmount: price * signal.quantity + commission,
      status: "filled",
      executedQuantity: signal.quantity,
      executedPrice: price,
      commission,
      timestamp: signal.timestamp,
      executedAt: new Date()
    };

    this.orders.push(order);
    signal.status = "executed";

    // 更新投资组合状态
    this.updatePortfolioStatus(signal.strategyId, order);

    return order;
  }

  /**
   * 批量执行信号
   */
  executeSignals(signalIds: string[]): TradeOrder[] {
    return signalIds
      .map(id => this.executeSignal(id))
      .filter((order): order is TradeOrder => order !== null);
  }

  /**
   * 取消交易信号
   */
  cancelSignal(signalId: string): void {
    const signal = this.signals.find(s => s.id === signalId);
    if (signal) {
      signal.status = "cancelled";
    }
  }

  /**
   * 获取交易日志
   */
  getTradeLog(strategyId: string): TradeLog | undefined {
    return this.tradeLogs.find(log => log.strategyId === strategyId);
  }

  /**
   * 生成交易日志
   */
  generateTradeLog(strategyId: string): TradeLog {
    const strategyOrders = this.orders.filter(o => o.strategyId === strategyId);
    const totalCommission = strategyOrders.reduce((sum, o) => sum + o.commission, 0);

    // 计算总利润（简化版）
    let totalProfit = 0;
    for (let i = 0; i < strategyOrders.length - 1; i += 2) {
      const buyOrder = strategyOrders[i];
      const sellOrder = strategyOrders[i + 1];
      if (buyOrder.action === "buy" && sellOrder?.action === "sell") {
        totalProfit += (sellOrder.executedPrice - buyOrder.executedPrice) * buyOrder.quantity - (buyOrder.commission + (sellOrder?.commission || 0));
      }
    }

    const log: TradeLog = {
      id: `log-${Date.now()}`,
      strategyId,
      orders: strategyOrders,
      totalProfit,
      totalCommission,
      timestamp: new Date()
    };

    this.tradeLogs.push(log);
    return log;
  }

  /**
   * 更新投资组合状态
   */
  private updatePortfolioStatus(strategyId: string, order: TradeOrder): void {
    let portfolio = this.portfolios.get(strategyId);

    if (!portfolio) {
      portfolio = {
        strategyId,
        totalValue: 100000, // 初始资金
        totalCost: 0,
        totalProfit: 0,
        profitRate: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        positions: [],
        alerts: [],
        lastUpdated: new Date()
      };
    }

    // 更新持仓
    if (order.action === "buy") {
      const existingPosition = portfolio.positions.find(p => p.code === order.code);
      if (existingPosition) {
        existingPosition.quantity += order.executedQuantity;
        existingPosition.entryPrice = (existingPosition.entryPrice * (existingPosition.quantity - order.executedQuantity) + order.executedPrice * order.executedQuantity) / existingPosition.quantity;
      } else {
        portfolio.positions.push({
          code: order.code,
          name: order.name,
          quantity: order.executedQuantity,
          entryPrice: order.executedPrice,
          currentPrice: order.executedPrice,
          profit: 0,
          profitRate: 0,
          percentage: 0
        });
      }
      portfolio.totalCost += order.totalAmount;
    } else if (order.action === "sell") {
      const position = portfolio.positions.find(p => p.code === order.code);
      if (position) {
        const profit = (order.executedPrice - position.entryPrice) * order.executedQuantity - order.commission;
        portfolio.totalProfit += profit;
        position.quantity -= order.executedQuantity;
        if (position.quantity === 0) {
          portfolio.positions = portfolio.positions.filter(p => p.code !== order.code);
        }
      }
    }

    // 计算投资组合价值
    portfolio.totalValue = 100000 - portfolio.totalCost + portfolio.totalProfit;
    portfolio.profitRate = (portfolio.totalProfit / 100000) * 100;

    // 检查风险预警
    this.checkRiskAlerts(portfolio);

    portfolio.lastUpdated = new Date();
    this.portfolios.set(strategyId, portfolio);
  }

  /**
   * 检查风险预警
   */
  private checkRiskAlerts(portfolio: PortfolioStatus): void {
    // 清空旧警告
    portfolio.alerts = [];

    // 检查最大回撤
    if (portfolio.currentDrawdown < -10) {
      portfolio.alerts.push({
        id: `alert-${Date.now()}-drawdown`,
        strategyId: portfolio.strategyId,
        type: "drawdown",
        level: portfolio.currentDrawdown < -20 ? "critical" : "warning",
        message: `当前回撤${portfolio.currentDrawdown.toFixed(2)}%，超过预警阈值`,
        currentValue: portfolio.currentDrawdown,
        threshold: -10,
        timestamp: new Date()
      });
    }

    // 检查单日亏损
    if (portfolio.totalProfit < -5000) {
      portfolio.alerts.push({
        id: `alert-${Date.now()}-loss`,
        strategyId: portfolio.strategyId,
        type: "loss",
        level: portfolio.totalProfit < -10000 ? "critical" : "warning",
        message: `累计亏损¥${Math.abs(portfolio.totalProfit).toFixed(0)}，超过预警阈值`,
        currentValue: portfolio.totalProfit,
        threshold: -5000,
        timestamp: new Date()
      });
    }

    // 检查持仓集中度
    const maxPosition = Math.max(...portfolio.positions.map(p => p.percentage));
    if (maxPosition > 30) {
      portfolio.alerts.push({
        id: `alert-${Date.now()}-concentration`,
        strategyId: portfolio.strategyId,
        type: "concentration",
        level: maxPosition > 50 ? "critical" : "warning",
        message: `单只股票占比${maxPosition.toFixed(1)}%，持仓过于集中`,
        currentValue: maxPosition,
        threshold: 30,
        timestamp: new Date()
      });
    }
  }

  /**
   * 获取投资组合状态
   */
  getPortfolioStatus(strategyId: string): PortfolioStatus | undefined {
    return this.portfolios.get(strategyId);
  }

  /**
   * 获取所有风险预警
   */
  getRiskAlerts(strategyId?: string): RiskAlert[] {
    if (strategyId) {
      const portfolio = this.portfolios.get(strategyId);
      return portfolio?.alerts || [];
    }
    return Array.from(this.portfolios.values()).flatMap(p => p.alerts);
  }

  /**
   * 获取交易历史
   */
  getTradeHistory(strategyId: string, limit: number = 50): TradeOrder[] {
    return this.orders
      .filter(o => o.strategyId === strategyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 获取待执行信号
   */
  getPendingSignals(strategyId?: string): TradeSignal[] {
    return this.signals.filter(s => s.status === "pending" && (!strategyId || s.strategyId === strategyId));
  }
}

export const automatedTradingEngine = new AutomatedTradingEngine();
