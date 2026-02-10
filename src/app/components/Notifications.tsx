import { useState } from 'react';
import { ArrowLeft, Bell, TrendingUp, FileText, Zap, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, markNotificationRead, markAllNotificationsAsRead, recordFeatureInterest, useFeatureInterests } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, setReading } = useNotifications(user?.uid);
  const { interests } = useFeatureInterests(user?.uid);

  // Local state for optimistic UI updates
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  const handleNotifyInterest = async (title: string) => {
    if (!user) return;
    await recordFeatureInterest(user.uid, title);
  };


  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead || !user) return;
    // Optimistic update
    setLocalReadIds(prev => new Set(prev).add(id));
    await markNotificationRead(user.uid, id);
    // Trigger hook refresh
    setReading(r => !r);
  };

  const handleMarkAll = async () => {
    if (!user) return;
    // Optimistic update - mark all as read locally
    const allIds = new Set(notifications.map(n => n.id));
    setLocalReadIds(allIds);
    const ids = notifications.map(n => n.id);
    await markAllNotificationsAsRead(user.uid, ids);
    // Trigger hook refresh
    setReading(r => !r);
  };

  // Merge local read state with fetched state for immediate UI feedback
  const isNotificationRead = (notif: typeof notifications[0]) => {
    return notif.isRead || localReadIds.has(notif.id);
  };

  const effectiveUnreadCount = notifications.filter(n => !isNotificationRead(n)).length;

  const formatTime = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const comingSoonFeatures = [
    {
      icon: TrendingUp,
      title: 'Lecturer Repeat Insights',
      description: 'Discover which lecturers recycle questions year after year. See patterns and focus your study.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Zap,
      title: 'Most Likely Questions Packs',
      description: 'AI-powered predictions of the most likely exam questions based on historical patterns.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FileText,
      title: 'Detailed Solutions',
      description: 'Step-by-step explanations for every question. Learn the concepts, not just the answers.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Sparkles,
      title: 'Smart Study Planner',
      description: 'Personalized study schedules based on your courses, exam dates, and learning pace.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-foreground p-1 -ml-1 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>
        {effectiveUnreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-xs font-semibold text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {/* Real Notifications */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center select-none bg-muted/20 rounded-2xl border border-dashed border-border mb-8">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-secondary text-sm font-medium mb-2">No notifications yet</p>
            <p className="text-xs text-secondary/60">Admin will send important updates here</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const isRead = isNotificationRead(notification);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMarkRead(notification.id, isRead)}
                    className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-300 ${isRead ? 'border-border' : 'border-primary/30 bg-primary/5'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isRead ? 'bg-muted' : 'bg-primary/10'
                          }`}
                      >
                        {isRead ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : notification.type === 'alert' || notification.type === 'warning' ? (
                          <AlertCircle className={`w-5 h-5 ${notification.type === 'alert' ? 'text-red-500' : 'text-amber-500'}`} />
                        ) : notification.type === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Bell className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold transition-colors duration-300 ${isRead ? 'text-foreground' : 'text-primary'}`}>{notification.title}</h3>
                          {!isRead && (
                            <motion.div
                              initial={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"
                            />
                          )}
                        </div>
                        <p className="text-sm text-secondary mb-2 leading-relaxed">{notification.body || notification.message}</p>
                        <span className="text-xs text-secondary">{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Coming Soon Features */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Coming Soon</h2>
          <div className="space-y-4">
            {comingSoonFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotifyInterest(feature.title)}
                    disabled={interests.includes(feature.title)}
                    className={`w-full h-11 border-2 rounded-xl font-semibold transition-all ${interests.includes(feature.title)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-primary text-primary hover:bg-primary/5'
                      }`}
                  >
                    {interests.includes(feature.title) ? 'Request Sent!' : 'Notify Me When Ready'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
