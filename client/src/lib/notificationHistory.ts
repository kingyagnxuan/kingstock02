/**
 * 通知历史和统计模块
 */

export interface NotificationRecord {
  id: string;
  type: "signal" | "alert" | "trade" | "news" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionTaken: boolean;
  result?: "success" | "failure" | "pending";
}

export interface NotificationStatistics {
  totalNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  byType: Record<string, number>;
  byDay: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
}

export class NotificationHistoryService {
  private records: NotificationRecord[] = [];
  private maxRecords = 1000;

  /**
   * 添加通知记录
   */
  addRecord(
    type: "signal" | "alert" | "trade" | "news" | "system",
    title: string,
    message: string
  ): NotificationRecord {
    const record: NotificationRecord = {
      id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionTaken: false
    };

    this.records.unshift(record);

    // 保持记录数量在限制内
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }

    // 保存到localStorage
    this.saveToLocalStorage();

    return record;
  }

  /**
   * 标记记录为已读
   */
  markAsRead(recordId: string): void {
    const record = this.records.find(r => r.id === recordId);
    if (record) {
      record.read = true;
      this.saveToLocalStorage();
    }
  }

  /**
   * 标记记录为已操作
   */
  markActionTaken(recordId: string, result: "success" | "failure" | "pending"): void {
    const record = this.records.find(r => r.id === recordId);
    if (record) {
      record.actionTaken = true;
      record.result = result;
      this.saveToLocalStorage();
    }
  }

  /**
   * 获取通知记录
   */
  getRecords(
    type?: "signal" | "alert" | "trade" | "news" | "system",
    days: number = 30,
    limit: number = 100
  ): NotificationRecord[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let filtered = this.records.filter(r => r.timestamp >= cutoffDate);

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }

    return filtered.slice(0, limit);
  }

  /**
   * 获取统计数据
   */
  getStatistics(days: number = 30): NotificationStatistics {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const records = this.records.filter(r => r.timestamp >= cutoffDate);

    const stats: NotificationStatistics = {
      totalNotifications: records.length,
      readNotifications: records.filter(r => r.read).length,
      unreadNotifications: records.filter(r => !r.read).length,
      byType: {},
      byDay: {},
      averageResponseTime: 0,
      successRate: 0
    };

    // 按类型统计
    records.forEach(r => {
      stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
    });

    // 按日期统计
    records.forEach(r => {
      const day = r.timestamp.toISOString().split("T")[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    // 计算成功率
    const actionTakenRecords = records.filter(r => r.actionTaken);
    if (actionTakenRecords.length > 0) {
      const successCount = actionTakenRecords.filter(r => r.result === "success").length;
      stats.successRate = (successCount / actionTakenRecords.length) * 100;
    }

    // 计算平均响应时间（模拟）
    stats.averageResponseTime = Math.floor(Math.random() * 5000) + 1000;

    return stats;
  }

  /**
   * 删除旧记录
   */
  deleteOldRecords(days: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const beforeCount = this.records.length;
    this.records = this.records.filter(r => r.timestamp >= cutoffDate);
    const deletedCount = beforeCount - this.records.length;

    if (deletedCount > 0) {
      this.saveToLocalStorage();
    }

    return deletedCount;
  }

  /**
   * 清空所有记录
   */
  clearAll(): void {
    this.records = [];
    this.saveToLocalStorage();
  }

  /**
   * 保存到localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const serialized = this.records.map(r => ({
        ...r,
        timestamp: r.timestamp.toISOString()
      }));
      localStorage.setItem("notificationHistory", JSON.stringify(serialized));
    } catch (error) {
      console.error("Failed to save notification history:", error);
    }
  }

  /**
   * 从localStorage加载
   */
  loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem("notificationHistory");
      if (data) {
        const parsed = JSON.parse(data);
        this.records = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
      }
    } catch (error) {
      console.error("Failed to load notification history:", error);
    }
  }
}

// 创建全局实例
export const notificationHistoryService = new NotificationHistoryService();
