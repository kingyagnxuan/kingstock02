/**
 * 推送通知服务
 * 支持浏览器通知、邮件通知和应用内通知
 */

export type NotificationType = "signal" | "alert" | "trade" | "news" | "system";
export type NotificationLevel = "info" | "warning" | "critical";
export type NotificationChannel = "browser" | "email" | "in-app" | "all";

export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
  channels: NotificationChannel[];
}

export interface NotificationPreference {
  userId: string;
  enableBrowserNotification: boolean;
  enableEmailNotification: boolean;
  enableInAppNotification: boolean;
  signalNotification: boolean;
  alertNotification: boolean;
  tradeNotification: boolean;
  newsNotification: boolean;
  systemNotification: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  emailAddress?: string;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * 推送通知服务类
 */
export class NotificationService {
  private notifications: Notification[] = [];
  private preferences: Map<string, NotificationPreference> = new Map();
  private notificationQueue: Notification[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeServiceWorker();
  }

  /**
   * 初始化Service Worker
   */
  private initializeServiceWorker(): void {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log("Service Worker registered for notifications");
      }).catch(error => {
        console.log("Service Worker registration failed:", error);
      });
    }
  }

  /**
   * 请求浏览器通知权限
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (error) {
        console.error("Failed to request notification permission:", error);
        return false;
      }
    }

    return false;
  }

  /**
   * 发送浏览器通知
   */
  private sendBrowserNotification(notification: Notification): void {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/images/logo.png",
        badge: "/images/logo.png",
        tag: notification.id,
        requireInteraction: notification.level === "critical",
        data: notification.data
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    } catch (error) {
      console.error("Failed to send browser notification:", error);
    }
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(
    notification: Notification,
    emailAddress: string
  ): Promise<void> {
    try {
      const payload: EmailNotificationPayload = {
        to: emailAddress,
        subject: notification.title,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.data?.actionUrl,
        actionText: notification.data?.actionText
      };

      // 模拟邮件发送（实际应该调用后端API）
      console.log("Sending email notification:", payload);

      // 实际实现应该调用后端API
      // await fetch('/api/notifications/email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  /**
   * 创建并发送通知
   */
  async notify(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      level?: NotificationLevel;
      channels?: NotificationChannel[];
      data?: Record<string, any>;
      userId?: string;
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      level: options?.level || "info",
      title,
      message,
      timestamp: new Date(),
      read: false,
      data: options?.data,
      channels: options?.channels || ["in-app"]
    };

    // 添加到通知列表
    this.notifications.push(notification);

    // 检查用户偏好
    const userId = options?.userId;
    if (userId) {
      const prefs = this.preferences.get(userId);
      if (prefs && !this.isInQuietHours(prefs)) {
        await this.sendNotificationByChannels(notification, prefs);
      }
    } else {
      // 如果没有指定用户，发送所有启用的通道
      await this.sendNotificationByChannels(notification);
    }

    return notification;
  }

  /**
   * 根据通道发送通知
   */
  private async sendNotificationByChannels(
    notification: Notification,
    prefs?: NotificationPreference
  ): Promise<void> {
    const channels = notification.channels;

    for (const channel of channels) {
      switch (channel) {
        case "browser":
          if (!prefs || prefs.enableBrowserNotification) {
            this.sendBrowserNotification(notification);
          }
          break;
        case "email":
          if (prefs && prefs.enableEmailNotification && prefs.emailAddress) {
            await this.sendEmailNotification(notification, prefs.emailAddress);
          }
          break;
        case "in-app":
          if (!prefs || prefs.enableInAppNotification) {
            // 应用内通知已经添加到列表中
          }
          break;
        case "all":
          if (!prefs || prefs.enableBrowserNotification) {
            this.sendBrowserNotification(notification);
          }
          if (prefs && prefs.enableEmailNotification && prefs.emailAddress) {
            await this.sendEmailNotification(notification, prefs.emailAddress);
          }
          break;
      }
    }
  }

  /**
   * 检查是否在静音时间内
   */
  private isInQuietHours(prefs: NotificationPreference): boolean {
    if (!prefs.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const startTime = prefs.quietHours.startTime;
    const endTime = prefs.quietHours.endTime;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * 发送交易信号通知
   */
  async notifyTradeSignal(
    code: string,
    name: string,
    action: "buy" | "sell",
    price: number,
    confidence: number,
    userId?: string
  ): Promise<Notification> {
    return this.notify(
      "signal",
      `${action === "buy" ? "买入" : "卖出"}信号: ${name}`,
      `${name}(${code}) 在¥${price.toFixed(2)}处生成${action === "buy" ? "买入" : "卖出"}信号，置信度${confidence}%`,
      {
        level: confidence > 80 ? "critical" : "warning",
        channels: ["browser", "email", "in-app"],
        data: {
          code,
          name,
          action,
          price,
          confidence,
          actionUrl: `/automated-trading`,
          actionText: "查看详情"
        },
        userId
      }
    );
  }

  /**
   * 发送风险预警通知
   */
  async notifyRiskAlert(
    strategyId: string,
    strategyName: string,
    alertType: string,
    message: string,
    currentValue: number,
    threshold: number,
    userId?: string
  ): Promise<Notification> {
    return this.notify(
      "alert",
      `风险预警: ${strategyName}`,
      `${message}。当前值: ${currentValue.toFixed(2)}, 预警阈值: ${threshold.toFixed(2)}`,
      {
        level: "critical",
        channels: ["browser", "email", "in-app"],
        data: {
          strategyId,
          strategyName,
          alertType,
          currentValue,
          threshold,
          actionUrl: `/automated-trading`,
          actionText: "查看投资组合"
        },
        userId
      }
    );
  }

  /**
   * 发送交易执行通知
   */
  async notifyTradeExecution(
    code: string,
    name: string,
    action: "buy" | "sell",
    price: number,
    quantity: number,
    totalAmount: number,
    userId?: string
  ): Promise<Notification> {
    return this.notify(
      "trade",
      `交易已执行: ${name}`,
      `${action === "buy" ? "买入" : "卖出"} ${quantity}股 ${name}(${code})，成交价¥${price.toFixed(2)}，成交额¥${totalAmount.toFixed(0)}`,
      {
        level: "info",
        channels: ["browser", "in-app"],
        data: {
          code,
          name,
          action,
          price,
          quantity,
          totalAmount,
          actionUrl: `/automated-trading`,
          actionText: "查看交易记录"
        },
        userId
      }
    );
  }

  /**
   * 发送市场新闻通知
   */
  async notifyMarketNews(
    title: string,
    content: string,
    importance: "high" | "medium" | "low" = "medium",
    userId?: string
  ): Promise<Notification> {
    return this.notify(
      "news",
      `市场资讯: ${title}`,
      content,
      {
        level: importance === "high" ? "warning" : "info",
        channels: importance === "high" ? ["browser", "in-app"] : ["in-app"],
        data: {
          importance,
          actionUrl: `/community`,
          actionText: "查看讨论"
        },
        userId
      }
    );
  }

  /**
   * 获取通知列表
   */
  getNotifications(userId?: string, unreadOnly: boolean = false): Notification[] {
    let notifs = [...this.notifications];

    if (unreadOnly) {
      notifs = notifs.filter(n => !n.read);
    }

    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 标记通知为已读
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * 标记所有通知为已读
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  /**
   * 删除通知
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  /**
   * 清空所有通知
   */
  clearAllNotifications(): void {
    this.notifications = [];
  }

  /**
   * 获取未读通知数量
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * 设置用户通知偏好
   */
  setPreferences(userId: string, preferences: Partial<NotificationPreference>): void {
    const existing = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    this.preferences.set(userId, { ...existing, ...preferences });
  }

  /**
   * 获取用户通知偏好
   */
  getPreferences(userId: string): NotificationPreference {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * 获取默认通知偏好
   */
  private getDefaultPreferences(userId: string): NotificationPreference {
    return {
      userId,
      enableBrowserNotification: true,
      enableEmailNotification: false,
      enableInAppNotification: true,
      signalNotification: true,
      alertNotification: true,
      tradeNotification: true,
      newsNotification: true,
      systemNotification: true,
      quietHours: {
        enabled: true,
        startTime: "22:00",
        endTime: "08:00"
      }
    };
  }
}

// 创建全局实例
export const notificationService = new NotificationService();
