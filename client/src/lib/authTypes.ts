export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  joinedAt: Date;
  bio?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserProfile extends User {
  postsCount: number;
  repliesCount: number;
  likesReceived: number;
  followersCount: number;
  followingCount: number;
  watchlistCount: number;
}
