import React, { createContext, useContext, useEffect, useState } from "react";
import { notificationService, Notification, NotificationPreference } from "@/lib/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference | null;
  notify: (
    type: "signal" | "alert" | "trade" | "news" | "system",
    title: string,
    message: string,
    options?: any
  ) => Promise<Notification>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setPreferences: (preferences: Partial<NotificationPreference>) => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferencesState] = useState<NotificationPreference | null>(null);

  // 初始化
  useEffect(() => {
    // 从localStorage加载偏好
    const savedPrefs = localStorage.getItem("notificationPreferences");
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      notificationService.setPreferences("current-user", prefs);
      setPreferencesState(prefs);
    } else {
      const defaultPrefs = notificationService.getPreferences("current-user");
      setPreferencesState(defaultPrefs);
    }

    // 请求通知权限
    notificationService.requestNotificationPermission();

    // 初始化通知列表
    updateNotifications();
  }, []);

  // 定期更新通知列表
  useEffect(() => {
    const interval = setInterval(updateNotifications, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateNotifications = () => {
    const notifs = notificationService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleNotify = async (
    type: "signal" | "alert" | "trade" | "news" | "system",
    title: string,
    message: string,
    options?: any
  ): Promise<Notification> => {
    const notification = await notificationService.notify(type, title, message, {
      ...options,
      userId: "current-user"
    });
    updateNotifications();
    return notification;
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    updateNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    updateNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    updateNotifications();
  };

  const handleClearAllNotifications = () => {
    notificationService.clearAllNotifications();
    updateNotifications();
  };

  const handleSetPreferences = (newPrefs: Partial<NotificationPreference>) => {
    notificationService.setPreferences("current-user", newPrefs);
    const updated = notificationService.getPreferences("current-user");
    setPreferencesState(updated);
    localStorage.setItem("notificationPreferences", JSON.stringify(updated));
  };

  const handleRequestPermission = async (): Promise<boolean> => {
    return notificationService.requestNotificationPermission();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    notify: handleNotify,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    clearAllNotifications: handleClearAllNotifications,
    setPreferences: handleSetPreferences,
    requestPermission: handleRequestPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
