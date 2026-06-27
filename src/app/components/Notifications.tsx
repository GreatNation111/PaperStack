import { useRef, useState, useCallback } from 'react';
import { ArrowLeft, Bell, TrendingUp, FileText, Zap, Sparkles, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useNotifications,
  markNotificationRead,
  markAllNotificationsAsRead,
  deleteNotificationForUser,
  recordFeatureInterest,
  useFeatureInterests,
  useUserProfile,
  type Notification as AppNotification,
  type NotificationSwipeAction,
} from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';
import { useAppleMailSwipe } from '@/hooks/useAppleMailSwipe';

interface NotificationsProps {
  onBack: () => void;
}

// ─── Swipeable Notification Card ──────────────────────────────────────────
// Self-contained card component that uses the Apple Mail swipe hook
// and renders progressive action panels underneath the card surface.

interface SwipeableCardProps {
  notification: AppNotification;
  isRead: boolean;
  index: number;
  swipeRightAction: NotificationSwipeAction;
  swipeLeftAction: NotificationSwipeAction;
  rightActionMeta: ReturnType<typeof getActionMeta>;
  leftActionMeta: ReturnType<typeof getActionMeta>;
  onSwipeAction: (notification: AppNotification, action: NotificationSwipeAction, isRead: boolean) => Promise<void>;
  onMarkRead: (id: string, isRead: boolean) => Promise<void>;
  formatTime: (createdAt: any) => string;
}

function SwipeableNotificationCard({
  notification,
  isRead,
  index,
  swipeRightAction,
  swipeLeftAction,
  rightActionMeta,
  leftActionMeta,
  onSwipeAction,
  onMarkRead,
  formatTime,
}: SwipeableCardProps) {
  const RightActionIcon = rightActionMeta.Icon;
  const LeftActionIcon = leftActionMeta.Icon;

  const {
    state,
    handlers,
    shouldPreventClick,
  } = useAppleMailSwipe({
    enableLeft: swipeLeftAction !== 'none',
    enableRight: swipeRightAction !== 'none',
    onSwipeLeft: () => void onSwipeAction(notification, swipeLeftAction, isRead),
    onSwipeRight: () => void onSwipeAction(notification, swipeRightAction, isRead),
  });

  const handleClick = useCallback(() => {
    if (shouldPreventClick()) return;
    void onMarkRead(notification.id, isRead);
  }, [shouldPreventClick, onMarkRead, notification.id, isRead]);

  // Calculate progressive reveal for action panels
  const absOffset = Math.abs(state.offsetX);
  const isSwipingRight = state.offsetX > 0;
  const isSwipingLeft = state.offsetX < 0;

  // Progressive icon scale: starts at 0.6, reaches 1.0 at reveal threshold, grows to 1.3 at full swipe
  const iconScale = Math.min(0.6 + state.progress * 0.7, 1.3);

  // Action panel width matches how far the card has moved
  const actionPanelWidth = absOffset;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* ─── Left Action Panel (revealed on swipe right) ─── */}
      {isSwipingRight && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center rounded-l-2xl overflow-hidden"
          style={{ width: actionPanelWidth }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-150 ${
              state.didFullSwipe
                ? rightActionMeta.action === 'delete'
                  ? 'bg-red-500'
                  : 'bg-green-500'
                : rightActionMeta.action === 'delete'
                  ? 'bg-red-500/15'
                  : 'bg-green-500/15'
            }`}
          />
          <div
            className="relative flex flex-col items-center gap-1 transition-transform"
            style={{ transform: `scale(${iconScale})` }}
          >
            <RightActionIcon
              className={`w-5 h-5 transition-colors duration-150 ${
                state.didFullSwipe ? 'text-white' : rightActionMeta.textClass
              }`}
            />
            {absOffset > 50 && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                  state.didFullSwipe ? 'text-white' : rightActionMeta.textClass
                }`}
              >
                {rightActionMeta.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── Right Action Panel (revealed on swipe left) ─── */}
      {isSwipingLeft && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-2xl overflow-hidden"
          style={{ width: actionPanelWidth }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-150 ${
              state.didFullSwipe
                ? leftActionMeta.action === 'delete'
                  ? 'bg-red-500'
                  : 'bg-green-500'
                : leftActionMeta.action === 'delete'
                  ? 'bg-red-500/15'
                  : 'bg-green-500/15'
            }`}
          />
          <div
            className="relative flex flex-col items-center gap-1 transition-transform"
            style={{ transform: `scale(${iconScale})` }}
          >
            <LeftActionIcon
              className={`w-5 h-5 transition-colors duration-150 ${
                state.didFullSwipe ? 'text-white' : leftActionMeta.textClass
              }`}
            />
            {absOffset > 50 && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                  state.didFullSwipe ? 'text-white' : leftActionMeta.textClass
                }`}
              >
                {leftActionMeta.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── Card Surface (finger-driven) ─── */}
      <div
        {...handlers}
        onClick={handleClick}
        className={`relative border rounded-2xl bg-card p-4 cursor-pointer select-none touch-pan-y shadow-sm will-change-transform ${
          isRead ? 'border-border' : 'border-primary/30 ring-1 ring-primary/10'
        }`}
        style={{
          transform: `translate3d(${state.offsetX}px, 0, 0)`,
          transition: state.isDragging ? 'none' : undefined,
        }}
      >
        <div
          className={`absolute left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isRead ? 'bg-muted' : 'bg-primary/10'
          }`}
        >
          {isRead ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : notification.type === 'alert' || notification.type === 'warning' || notification.type === 'info' ? (
            <AlertCircle
              className={`w-4 h-4 ${
                notification.type === 'alert'
                  ? 'text-red-500'
                  : notification.type === 'warning'
                    ? 'text-amber-500'
                    : 'text-blue-500'
              }`}
            />
          ) : (
            <Bell className="w-4 h-4 text-primary" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3 pl-11">
            <h3
              className={`font-semibold leading-snug transition-colors duration-300 ${
                isRead ? 'text-foreground' : 'text-primary'
              }`}
            >
              {notification.title}
            </h3>
            {!isRead && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-secondary mb-3 leading-relaxed">
            {notification.body || notification.message}
          </p>
          <span className="text-xs text-secondary">{formatTime(notification.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Action Meta Helper ─────────────────────────────────────────────────────

function getActionMeta(action: NotificationSwipeAction) {
  if (action === 'markRead') {
    return {
      Icon: CheckCircle,
      label: 'Read',
      action: 'markRead' as const,
      backgroundClass: 'bg-green-500/10',
      textClass: 'text-green-600',
    };
  }

  if (action === 'delete') {
    return {
      Icon: Trash2,
      label: 'Delete',
      action: 'delete' as const,
      backgroundClass: 'bg-red-500/10',
      textClass: 'text-red-500',
    };
  }

  return {
    Icon: Bell,
    label: 'None',
    action: 'none' as const,
    backgroundClass: 'bg-muted/60',
    textClass: 'text-secondary',
  };
}

// ─── Main Notifications Component ───────────────────────────────────────────

export function Notifications({ onBack }: NotificationsProps) {
  const { user } = useAuth();
  const { notifications, loading, setReading } = useNotifications(user?.uid);
  const { interests } = useFeatureInterests(user?.uid);
  const { profile } = useUserProfile(user?.uid);

  // Local state for optimistic UI updates
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  const swipeRightAction = profile?.notificationSettings?.swipeRightAction || 'markRead';
  const swipeLeftAction = profile?.notificationSettings?.swipeLeftAction || 'delete';
  const visibleNotifications = notifications.filter(notification => !localDeletedIds.has(notification.id));

  const handleNotifyInterest = async (title: string) => {
    if (!user) return;
    await recordFeatureInterest(user, title);
  };

  const handleMarkRead = useCallback(async (id: string, isRead: boolean) => {
    if (isRead || !user) return;
    setLocalReadIds(prev => new Set(prev).add(id));
    await markNotificationRead(user.uid, id);
    setReading(r => !r);
  }, [user, setReading]);

  const handleMarkAll = async () => {
    if (!user || markingAll) return;
    const allIds = new Set(visibleNotifications.map(n => n.id));
    setLocalReadIds(allIds);
    const ids = visibleNotifications.map(n => n.id);
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead(user.uid, ids);
      setReading(r => !r);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = useCallback(async (id: string) => {
    if (!user) return;
    setLocalDeletedIds(prev => new Set(prev).add(id));
    await deleteNotificationForUser(user.uid, id);
    setReading(r => !r);
  }, [user, setReading]);

  const handleSwipeAction = useCallback(async (notification: AppNotification, action: NotificationSwipeAction, isRead: boolean) => {
    if (action === 'none') return;
    if (action === 'markRead') {
      await handleMarkRead(notification.id, isRead);
      return;
    }
    await handleDeleteNotification(notification.id);
  }, [handleMarkRead, handleDeleteNotification]);

  // Merge local read state with fetched state for immediate UI feedback
  const isNotificationRead = (notif: typeof notifications[0]) => {
    return notif.isRead || localReadIds.has(notif.id);
  };

  const effectiveUnreadCount = visibleNotifications.filter(n => !isNotificationRead(n)).length;

  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'Welcome';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
      title: 'Most Repeated Questions',
      description: 'See the questions that keep coming back every session. Focus on what matters most.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FileText,
      title: 'Detailed Solutions',
      description: 'Step-by-step explanations being added course by course. Learn the concepts, not just the answers.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Sparkles,
      title: 'Exam Countdown & Reminders',
      description: 'Never miss an exam date. Get countdown timers and push reminders based on your timetable.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const rightMeta = getActionMeta(swipeRightAction);
  const leftMeta = getActionMeta(swipeLeftAction);

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
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-60 flex items-center gap-1"
          >
            {markingAll && <Loader2 className="w-3 h-3 animate-spin" />}
            Read all
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
        ) : visibleNotifications.length === 0 ? (
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
              {visibleNotifications.map((notification, index) => {
                const isRead = isNotificationRead(notification);
                return (
                  <SwipeableNotificationCard
                    key={notification.id}
                    notification={notification}
                    isRead={isRead}
                    index={index}
                    swipeRightAction={swipeRightAction}
                    swipeLeftAction={swipeLeftAction}
                    rightActionMeta={rightMeta}
                    leftActionMeta={leftMeta}
                    onSwipeAction={handleSwipeAction}
                    onMarkRead={handleMarkRead}
                    formatTime={formatTime}
                  />
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
