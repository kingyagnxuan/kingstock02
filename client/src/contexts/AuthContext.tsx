import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, AuthState, LoginCredentials, RegisterCredentials } from "@/lib/authTypes";
import { mockCurrentUser, mockUsers } from "@/lib/mockAuthData";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined
  });

  // 初始化认证状态 - 从localStorage恢复
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedAuth = localStorage.getItem("auth_state");
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          setAuthState({
            user: parsedAuth.user,
            isAuthenticated: parsedAuth.isAuthenticated,
            isLoading: false,
            error: undefined
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟登录验证
    if (credentials.email === "demo@example.com" && credentials.password === "password") {
      const newAuthState = {
        user: mockCurrentUser,
        isAuthenticated: true,
        isLoading: false
      };
      setAuthState(newAuthState);
      // 保存到localStorage
      localStorage.setItem("auth_state", JSON.stringify(newAuthState));
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "邮箱或密码错误"
      }));
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟注册验证
    if (credentials.password !== credentials.confirmPassword) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "两次输入的密码不一致"
      }));
      return;
    }

    // 模拟用户创建
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: credentials.username,
      email: credentials.email,
      avatar: "👤",
      reputation: 0,
      joinedAt: new Date(),
      isVerified: false
    };

    const newAuthState = {
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    };
    setAuthState(newAuthState);
    // 保存到localStorage
    localStorage.setItem("auth_state", JSON.stringify(newAuthState));
  };

  const logout = () => {
    const newAuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
    setAuthState(newAuthState);
    // 清除localStorage
    localStorage.removeItem("auth_state");
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) return;

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedAuthState = {
      ...authState,
      user: authState.user ? { ...authState.user, ...updates } : null,
      isLoading: false
    };
    setAuthState(updatedAuthState);
    // 保存到localStorage
    localStorage.setItem("auth_state", JSON.stringify(updatedAuthState));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
