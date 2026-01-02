import { useNotification } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, TrendingUp, TrendingDown, Zap, Newspaper } from "lucide-react";
import { useState } from "react";

export default function NotificationCenterAdvanced() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "signal":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "trade":
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case "news":
        return <Newspaper className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "signal":
        return "bg-blue-500/10 border-blue-500/20";
      case "alert":
        return "bg-red-500/10 border-red-500/20";
      case "trade":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "news":
        return "bg-green-500/10 border-green-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "signal":
        return "交易信号";
      case "alert":
        return "风险预警";
      case "trade":
        return "交易执行";
      case "news":
        return "市场资讯";
      default:
        return "系统";
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold">通知中心</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    全部已读
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAllNotifications}
                    className="text-xs text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    清空
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>暂无通知</p>
                </div>
              ) : (
                recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title="标记为已读"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-muted rounded transition-colors text-destructive"
                              title="删除"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border text-center">
                <a href="/notifications" className="text-sm text-primary hover:underline">
                  查看全部通知 →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
