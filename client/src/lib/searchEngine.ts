import { DiscussionThread } from "./communityTypes";

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "thread" | "stock" | "news";
  relevance: number;
  metadata?: Record<string, any>;
}

export interface RecommendationItem {
  id: string;
  title: string;
  reason: string;
  score: number;
  type: "thread" | "stock" | "user";
}

// 全文搜索引擎
export class SearchEngine {
  private threads: DiscussionThread[];

  constructor(threads: DiscussionThread[]) {
    this.threads = threads;
  }

  // 基础搜索
  search(query: string, filters?: { category?: string; stockCode?: string }): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    this.threads.forEach(thread => {
      // 应用过滤器
      if (filters?.category && thread.category !== filters.category) return;
      if (filters?.stockCode && thread.stockCode !== filters.stockCode) return;

      // 计算相关性分数
      let relevance = 0;
      const titleMatch = thread.title.toLowerCase().includes(queryLower);
      const contentMatch = thread.content.toLowerCase().includes(queryLower);
      const tagMatch = thread.tags.some(tag => tag.toLowerCase().includes(queryLower));

      if (titleMatch) relevance += 100;
      if (contentMatch) relevance += 50;
      if (tagMatch) relevance += 75;

      if (relevance > 0) {
        results.push({
          id: thread.id,
          title: thread.title,
          content: thread.content.substring(0, 100) + "...",
          type: "thread",
          relevance,
          metadata: {
            stockCode: thread.stockCode,
            stockName: thread.stockName,
            category: thread.category,
            views: thread.views,
            replies: thread.replies
          }
        });
      }
    });

    // 按相关性排序
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // 高级搜索 - 支持多条件组合
  advancedSearch(
    query: string,
    filters: {
      category?: string;
      stockCode?: string;
      minViews?: number;
      minReplies?: number;
      dateRange?: { start: Date; end: Date };
      sortBy?: "relevance" | "views" | "replies" | "recent";
    }
  ): SearchResult[] {
    let results = this.search(query, { category: filters.category, stockCode: filters.stockCode });

    // 应用数值过滤
    if (filters.minViews) {
      results = results.filter(r => (r.metadata?.views || 0) >= filters.minViews!);
    }
    if (filters.minReplies) {
      results = results.filter(r => (r.metadata?.replies || 0) >= filters.minReplies!);
    }

    // 应用日期过滤
    if (filters.dateRange) {
      results = results.filter(r => {
        const thread = this.threads.find(t => t.id === r.id);
        if (!thread) return false;
        return thread.createdAt >= filters.dateRange!.start && thread.createdAt <= filters.dateRange!.end;
      });
    }

    // 应用排序
    if (filters.sortBy === "views") {
      results.sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0));
    } else if (filters.sortBy === "replies") {
      results.sort((a, b) => (b.metadata?.replies || 0) - (a.metadata?.replies || 0));
    } else if (filters.sortBy === "recent") {
      results.sort((a, b) => {
        const threadA = this.threads.find(t => t.id === a.id)?.createdAt || new Date(0);
        const threadB = this.threads.find(t => t.id === b.id)?.createdAt || new Date(0);
        return threadB.getTime() - threadA.getTime();
      });
    }

    return results;
  }
}

// 推荐引擎
export class RecommendationEngine {
  private threads: DiscussionThread[];
  private userInterests: Set<string>;

  constructor(threads: DiscussionThread[], userInterests: string[] = []) {
    this.threads = threads;
    this.userInterests = new Set(userInterests);
  }

  // 基于用户兴趣的推荐
  recommendByInterests(): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];

    this.threads.forEach(thread => {
      let score = 0;
      let reasons: string[] = [];

      // 检查标签匹配
      thread.tags.forEach(tag => {
        if (this.userInterests.has(tag)) {
          score += 30;
          reasons.push(`包含您感兴趣的话题: ${tag}`);
        }
      });

      // 检查板块匹配
      if (this.userInterests.has(thread.stockName)) {
        score += 40;
        reasons.push(`关于您关注的股票: ${thread.stockName}`);
      }

      // 热度加分
      if (thread.views > 1000) {
        score += 20;
        reasons.push("热门讨论");
      }

      if (thread.replies > 30) {
        score += 15;
        reasons.push("活跃讨论");
      }

      if (score > 0) {
        recommendations.push({
          id: thread.id,
          title: thread.title,
          reason: reasons.join(" · "),
          score,
          type: "thread"
        });
      }
    });

    // 按分数排序
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // 热门讨论推荐
  recommendHotTopics(): RecommendationItem[] {
    return this.threads
      .map(thread => ({
        id: thread.id,
        title: thread.title,
        reason: `${thread.views} 浏览 · ${thread.replies} 回复`,
        score: thread.views + thread.replies * 2,
        type: "thread" as const
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // 最新讨论推荐
  recommendLatest(): RecommendationItem[] {
    return this.threads
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(thread => ({
        id: thread.id,
        title: thread.title,
        reason: `发布于 ${thread.createdAt.toLocaleString()}`,
        score: 100,
        type: "thread" as const
      }));
  }

  // 相似讨论推荐
  recommendSimilar(threadId: string): RecommendationItem[] {
    const sourceThread = this.threads.find(t => t.id === threadId);
    if (!sourceThread) return [];

    const recommendations: RecommendationItem[] = [];

    this.threads.forEach(thread => {
      if (thread.id === threadId) return;

      let score = 0;

      // 相同板块
      if (thread.stockCode === sourceThread.stockCode) {
        score += 50;
      }

      // 相同分类
      if (thread.category === sourceThread.category) {
        score += 30;
      }

      // 共同标签
      const commonTags = thread.tags.filter(tag => sourceThread.tags.includes(tag));
      score += commonTags.length * 20;

      if (score > 0) {
        recommendations.push({
          id: thread.id,
          title: thread.title,
          reason: `相关讨论 (${sourceThread.stockName})`,
          score,
          type: "thread"
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
  }
}
