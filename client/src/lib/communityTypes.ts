export interface Notification {
  id: string;
  type: 'alert' | 'news' | 'discussion' | 'system';
  title: string;
  message: string;
  stockCode?: string;
  stockName?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPreference {
  enableAlerts: boolean;
  enableNews: boolean;
  enableDiscussions: boolean;
  enableEmail: boolean;
  enableBrowserNotification: boolean;
  alertThreshold?: number; // 价格变动百分比
}

export interface DiscussionThread {
  id: string;
  stockCode: string;
  stockName: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  replies: number;
  likes: number;
  tags: string[];
  category: 'strategy' | 'analysis' | 'news' | 'question' | 'other';
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  likes: number;
  isAuthorReply: boolean;
}

export interface RealTimeQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  change: number;
  bid: number;
  ask: number;
  volume: number;
  turnover: number;
  high: number;
  low: number;
  open: number;
  timestamp: Date;
  source: 'simulated' | 'api';
}

export interface MarketNews {
  id: string;
  title: string;
  content: string;
  source: string;
  relatedStocks: string[];
  publishedAt: Date;
  importance: 'low' | 'medium' | 'high';
  url?: string;
}
