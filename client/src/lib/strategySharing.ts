import { InvestmentStrategy, StrategyPerformance } from "./strategyTypes";

export interface SharedStrategy extends InvestmentStrategy {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  shareDate: Date;
  views: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
  description?: string;
  tags?: string[];
  riskLevel: "low" | "medium" | "high"; // 风险等级
  difficulty: "easy" | "medium" | "hard"; // 难度等级
}

export interface StrategyRanking {
  rank: number;
  strategy: SharedStrategy;
  score: number; // 综合评分
  weeklyReturn?: number;
  monthlyReturn?: number;
  totalReturn?: number;
  followers?: number;
}

export interface StrategyComment {
  id: string;
  strategyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1-5星
  timestamp: Date;
  likes: number;
}

export interface StrategyFollower {
  userId: string;
  userName: string;
  userAvatar?: string;
  followDate: Date;
}

// 模拟的共享策略数据
export const mockSharedStrategies: SharedStrategy[] = [
  {
    id: "shared-strategy-1",
    name: "AI应用龙头追涨",
    description: "追踪AI应用板块的涨停龙头股，结合技术面和情绪面因子",
    factors: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    status: "active",
    tags: ["AI", "龙头", "短线"],
    authorId: "user-1",
    authorName: "股市高手",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    shareDate: new Date("2024-01-15"),
    views: 2850,
    likes: 156,
    comments: 42,
    isLiked: false,
    riskLevel: "high",
    difficulty: "medium",
    performance: {
      totalReturn: 28.5,
      winRate: 68,
      maxDrawdown: -12.3,
      sharpeRatio: 1.85,
      tradesCount: 22,
      winTrades: 15,
      lossTrades: 7,
      avgProfit: 4.2,
      avgLoss: -2.1,
      bestTrade: 18.5,
      worstTrade: -8.3,
      lastUpdated: new Date()
    }
  },
  {
    id: "shared-strategy-2",
    name: "商业航天价值投资",
    description: "基于基本面的商业航天板块投资策略，适合长期持仓",
    factors: [],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-10"),
    status: "active",
    tags: ["商业航天", "价值", "长线"],
    authorId: "user-2",
    authorName: "价值投资者",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    shareDate: new Date("2024-02-01"),
    views: 1920,
    likes: 128,
    comments: 35,
    isLiked: false,
    riskLevel: "medium",
    difficulty: "easy",
    performance: {
      totalReturn: 15.8,
      winRate: 72,
      maxDrawdown: -8.5,
      sharpeRatio: 2.12,
      tradesCount: 18,
      winTrades: 13,
      lossTrades: 5,
      avgProfit: 3.5,
      avgLoss: -1.8,
      bestTrade: 12.3,
      worstTrade: -6.2,
      lastUpdated: new Date()
    }
  },
  {
    id: "shared-strategy-3",
    name: "高成长低估值",
    description: "寻找高增长但低估值的股票，平衡风险和收益",
    factors: [],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-18"),
    status: "active",
    tags: ["价值", "成长", "平衡"],
    authorId: "user-3",
    authorName: "量化分析师",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    shareDate: new Date("2024-02-15"),
    views: 1650,
    likes: 92,
    comments: 28,
    isLiked: false,
    riskLevel: "medium",
    difficulty: "hard",
    performance: {
      totalReturn: 8.2,
      winRate: 58,
      maxDrawdown: -15.2,
      sharpeRatio: 0.95,
      tradesCount: 12,
      winTrades: 7,
      lossTrades: 5,
      avgProfit: 2.8,
      avgLoss: -2.5,
      bestTrade: 9.1,
      worstTrade: -7.8,
      lastUpdated: new Date()
    }
  }
];

/**
 * 策略分享管理类
 */
export class StrategySharingManager {
  private strategies: SharedStrategy[] = [...mockSharedStrategies];
  private rankings: StrategyRanking[] = [];

  /**
   * 分享策略到社区
   */
  shareStrategy(strategy: InvestmentStrategy, authorId: string, authorName: string): SharedStrategy {
    const sharedStrategy: SharedStrategy = {
      ...strategy,
      authorId,
      authorName,
      shareDate: new Date(),
      views: 0,
      likes: 0,
      comments: 0,
      riskLevel: this.assessRiskLevel(strategy),
      difficulty: this.assessDifficulty(strategy)
    };

    this.strategies.push(sharedStrategy);
    return sharedStrategy;
  }

  /**
   * 获取策略排行榜
   */
  getRankings(sortBy: "return" | "winRate" | "views" | "likes" | "score" = "score"): StrategyRanking[] {
    const rankings = this.strategies.map((strategy, index) => {
      const score = this.calculateScore(strategy);
      return {
        rank: index + 1,
        strategy,
        score,
        weeklyReturn: strategy.performance?.totalReturn || 0,
        monthlyReturn: strategy.performance?.totalReturn || 0,
        totalReturn: strategy.performance?.totalReturn || 0,
        followers: Math.floor(Math.random() * 500)
      };
    });

    // 根据排序方式排序
    rankings.sort((a, b) => {
      switch (sortBy) {
        case "return":
          return (b.strategy.performance?.totalReturn || 0) - (a.strategy.performance?.totalReturn || 0);
        case "winRate":
          return (b.strategy.performance?.winRate || 0) - (a.strategy.performance?.winRate || 0);
        case "views":
          return b.strategy.views - a.strategy.views;
        case "likes":
          return b.strategy.likes - a.strategy.likes;
        case "score":
        default:
          return b.score - a.score;
      }
    });

    // 重新排序
    rankings.forEach((r, i) => r.rank = i + 1);
    return rankings;
  }

  /**
   * 获取热门策略
   */
  getHotStrategies(limit: number = 10): SharedStrategy[] {
    return [...this.strategies]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * 获取最新策略
   */
  getLatestStrategies(limit: number = 10): SharedStrategy[] {
    return [...this.strategies]
      .sort((a, b) => b.shareDate.getTime() - a.shareDate.getTime())
      .slice(0, limit);
  }

  /**
   * 搜索策略
   */
  searchStrategies(keyword: string): SharedStrategy[] {
    return this.strategies.filter(s =>
      s.name.includes(keyword) ||
      s.description?.includes(keyword) ||
      s.tags?.some(tag => tag.includes(keyword)) ||
      s.authorName.includes(keyword)
    );
  }

  /**
   * 获取策略详情
   */
  getStrategyDetail(strategyId: string): SharedStrategy | undefined {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (strategy) {
      strategy.views++;
    }
    return strategy;
  }

  /**
   * 点赞策略
   */
  likeStrategy(strategyId: string): void {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (strategy) {
      strategy.likes++;
      strategy.isLiked = true;
    }
  }

  /**
   * 取消点赞
   */
  unlikeStrategy(strategyId: string): void {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (strategy) {
      strategy.likes = Math.max(0, strategy.likes - 1);
      strategy.isLiked = false;
    }
  }

  /**
   * 添加评论
   */
  addComment(strategyId: string, comment: Omit<StrategyComment, "id">): StrategyComment {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (strategy) {
      strategy.comments++;
    }

    return {
      id: `comment-${Date.now()}`,
      ...comment
    };
  }

  /**
   * 计算综合评分
   */
  private calculateScore(strategy: SharedStrategy): number {
    const perf = strategy.performance;
    if (!perf) return 0;

    // 综合评分 = 收益率(40%) + 胜率(30%) + 夏普比率(20%) + 人气(10%)
    const returnScore = Math.min(perf.totalReturn / 50, 1) * 40; // 50%收益为满分
    const winRateScore = (perf.winRate / 100) * 30;
    const sharpeScore = Math.min(perf.sharpeRatio / 2, 1) * 20; // 2.0夏普为满分
    const popularityScore = Math.min(strategy.views / 5000, 1) * 10; // 5000浏览为满分

    return returnScore + winRateScore + sharpeScore + popularityScore;
  }

  /**
   * 评估风险等级
   */
  private assessRiskLevel(strategy: InvestmentStrategy): "low" | "medium" | "high" {
    const perf = strategy.performance;
    if (!perf) return "medium";

    if (perf.maxDrawdown > -20 && perf.sharpeRatio > 1.5) return "low";
    if (perf.maxDrawdown < -30 || perf.sharpeRatio < 0.8) return "high";
    return "medium";
  }

  /**
   * 评估难度等级
   */
  private assessDifficulty(strategy: InvestmentStrategy): "easy" | "medium" | "hard" {
    const factorCount = strategy.factors.length;
    if (factorCount <= 3) return "easy";
    if (factorCount <= 6) return "medium";
    return "hard";
  }
}

export const strategySharingManager = new StrategySharingManager();
