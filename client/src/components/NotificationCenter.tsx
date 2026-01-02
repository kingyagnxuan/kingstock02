import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/lib/communityTypes";
import { Bell, X, AlertCircle, Newspaper, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClear?: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClear,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "news":
        return <Newspaper className="w-4 h-4 text-blue-500" />;
      case "discussion":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-500/10 border-red-500/20";
      case "news":
        return "bg-blue-500/10 border-blue-500/20";
      case "discussion":
        return "bg-green-500/10 border-green-500/20";
      default:
        return "bg-yellow-500/10 border-yellow-500/20";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-lg hover:bg-muted"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">通知中心</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-8 px-2 text-xs"
              >
                清空
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                    notif.read ? "bg-muted/20 border-border/30" : getNotificationColor(notif.type)
                  )}
                  onClick={() => onMarkAsRead?.(notif.id)}
                >
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.stockCode && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {notif.stockName}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t border-border/50 p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setIsOpen(false);
              // Navigate to notification settings
            }}
          >
            <Settings className="w-3 h-3 mr-1" />
            通知设置
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
