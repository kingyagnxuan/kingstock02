import { User, UserProfile } from "./authTypes";

export const mockUsers: Record<string, User> = {
  "user-1": {
    id: "user-1",
    username: "投资者A",
    email: "investor-a@example.com",
    avatar: "👤",
    reputation: 1250,
    joinedAt: new Date("2024-01-15"),
    bio: "专注于A股涨停板块分析，擅长AI和商业航天",
    isVerified: true
  },
  "user-2": {
    id: "user-2",
    username: "投资者B",
    email: "investor-b@example.com",
    avatar: "👤",
    reputation: 890,
    joinedAt: new Date("2024-02-20"),
    bio: "长期价值投资者，关注新兴产业",
    isVerified: true
  },
  "user-3": {
    id: "user-3",
    username: "投资者C",
    email: "investor-c@example.com",
    avatar: "👤",
    reputation: 650,
    joinedAt: new Date("2024-03-10"),
    bio: "短线交易爱好者",
    isVerified: false
  }
};

export const mockCurrentUser: User = {
  id: "current-user",
  username: "我的账户",
  email: "myaccount@example.com",
  avatar: "👤",
  reputation: 450,
  joinedAt: new Date("2024-06-01"),
  bio: "学习投资，分享心得",
  isVerified: false
};

export const mockUserProfile: UserProfile = {
  ...mockCurrentUser,
  postsCount: 12,
  repliesCount: 45,
  likesReceived: 156,
  followersCount: 23,
  followingCount: 18,
  watchlistCount: 8
};

// 模拟用户信誉等级
export const getReputationLevel = (reputation: number): string => {
  if (reputation >= 1000) return "资深投资者";
  if (reputation >= 500) return "活跃投资者";
  if (reputation >= 200) return "认证用户";
  return "新手用户";
};

// 模拟用户信誉颜色
export const getReputationColor = (reputation: number): string => {
  if (reputation >= 1000) return "text-yellow-500";
  if (reputation >= 500) return "text-green-500";
  if (reputation >= 200) return "text-blue-500";
  return "text-gray-500";
};
