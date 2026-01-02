import { DiscussionThread, DiscussionReply, Notification, MarketNews } from "./communityTypes";

export const mockDiscussionThreads: DiscussionThread[] = [
  {
    id: "thread-1",
    stockCode: "300058",
    stockName: "蓝色光标",
    title: "AI应用龙头，涨停逻辑分析",
    content: "蓝色光标作为AI营销的龙头企业，今天涨停主要受益于：1.ChatGPT热度持续；2.主力资金连续净流入；3.技术面突破关键阻力位。预计后续还有上升空间。",
    author: "投资者A",
    authorAvatar: "👤",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    views: 1250,
    replies: 28,
    likes: 156,
    tags: ["AI应用", "涨停分析", "龙头股"],
    category: "analysis"
  },
  {
    id: "thread-2",
    stockCode: "600363",
    stockName: "联创光电",
    title: "商业航天+AI医疗双龙头，后续如何操作？",
    content: "联创光电今天涨停，同时具备商业航天和AI医疗两个热点概念。请问各位大神，这只股票后续还有机会吗？是继续持有还是获利了结？",
    author: "投资者B",
    authorAvatar: "👤",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    views: 892,
    replies: 45,
    likes: 203,
    tags: ["商业航天", "AI医疗", "操作建议"],
    category: "question"
  },
  {
    id: "thread-3",
    stockCode: "300516",
    stockName: "久之洋",
    title: "创业板20%涨停罕见，军工+商业航天双重利好",
    content: "久之洋创业板20%涨停实属罕见，这说明主力对这只股票的看好程度。军工和商业航天两个热点的结合，未来发展空间巨大。",
    author: "投资者C",
    authorAvatar: "👤",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    views: 2156,
    replies: 67,
    likes: 412,
    tags: ["军工", "商业航天", "涨停"],
    category: "strategy"
  },
  {
    id: "thread-4",
    stockCode: "002131",
    stockName: "利欧股份",
    title: "新媒体营销龙头，小红书快手商业化加速",
    content: "利欧股份作为新媒体营销龙头，受益于小红书和快手的商业化加速。成交量创新高，资金介入度高，这是一个很好的信号。",
    author: "投资者D",
    authorAvatar: "👤",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    views: 1456,
    replies: 32,
    likes: 289,
    tags: ["新媒体", "商业化", "龙头"],
    category: "news"
  }
];

export const mockDiscussionReplies: Record<string, DiscussionReply[]> = {
  "thread-1": [
    {
      id: "reply-1-1",
      threadId: "thread-1",
      content: "同意！AI应用确实是未来的方向，蓝色光标的涨停是合理的。",
      author: "投资者E",
      authorAvatar: "👤",
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      likes: 45,
      isAuthorReply: false
    },
    {
      id: "reply-1-2",
      threadId: "thread-1",
      content: "但是要注意风险，涨停后可能面临获利回吐。建议在回调时轻仓介入。",
      author: "投资者F",
      authorAvatar: "👤",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 67,
      isAuthorReply: false
    }
  ],
  "thread-2": [
    {
      id: "reply-2-1",
      threadId: "thread-2",
      content: "我的建议是分批获利，先卖出一半锁定收益，剩下的继续持有看后续表现。",
      author: "投资者G",
      authorAvatar: "👤",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 89,
      isAuthorReply: false
    }
  ]
};

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "alert",
    title: "价格预警触发",
    message: "蓝色光标已突破您设置的目标价格 12.00",
    stockCode: "300058",
    stockName: "蓝色光标",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionUrl: "/watchlist"
  },
  {
    id: "notif-2",
    type: "news",
    title: "市场热点更新",
    message: "AI应用板块今日涨幅居前，多只龙头股涨停",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    actionUrl: "/limit-up"
  },
  {
    id: "notif-3",
    type: "discussion",
    title: "新讨论回复",
    message: "您关注的讨论《AI应用龙头分析》有新回复",
    stockCode: "300058",
    stockName: "蓝色光标",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionUrl: "/community"
  },
  {
    id: "notif-4",
    type: "system",
    title: "系统提示",
    message: "您的自选股数据已更新，请查看最新行情",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true
  }
];

export const mockMarketNews: MarketNews[] = [
  {
    id: "news-1",
    title: "ChatGPT热度持续，AI应用板块领涨",
    content: "今日A股市场，AI应用板块表现强势，多只龙头股涨停。专家表示，随着ChatGPT应用的深化，AI相关企业将迎来新的发展机遇。",
    source: "财经新闻",
    relatedStocks: ["300058", "002131"],
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    importance: "high",
    url: "#"
  },
  {
    id: "news-2",
    title: "商业航天政策支持力度加大",
    content: "国家相关部门发布新政策，进一步支持商业航天产业发展。业内人士认为，这将为相关企业带来新的增长动力。",
    source: "政策快讯",
    relatedStocks: ["600363", "300516"],
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    importance: "high",
    url: "#"
  },
  {
    id: "news-3",
    title: "小红书快手商业化加速，新媒体营销迎新机遇",
    content: "随着小红书和快手商业化进程加快，新媒体营销行业迎来新的发展机遇。相关上市公司有望从中受益。",
    source: "行业分析",
    relatedStocks: ["002131"],
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    importance: "medium",
    url: "#"
  }
];
