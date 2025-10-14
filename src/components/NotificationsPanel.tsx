import { Bell, X, Video, AlertCircle, CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'content_update' | 'subscription_expiring' | 'payment_reminder' | 'new_video';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_video_id?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onClear: (notificationId: string) => void;
}

export function NotificationsPanel({ notifications, onMarkAsRead, onClear }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'subscription_expiring':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'payment_reminder':
        return <CreditCard className="w-5 h-5 text-red-400" />;
      case 'content_update':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[32rem] overflow-y-auto bg-gray-900 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl transition-colors ${
                        notification.is_read
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-white font-medium text-sm">
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClear(notification.id);
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-white/40" />
                            </button>
                          </div>
                          <p className="text-white/60 text-xs mb-2">
                            {notification.message}
                          </p>
                          <p className="text-white/40 text-xs">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
