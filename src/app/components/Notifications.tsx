import { ArrowLeft, Bell, TrendingUp, FileText, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const notifications = [
    {
      id: '1',
      title: 'New Past Questions Added',
      message: 'PHY 301 - 2023/2024 Second Semester papers are now available',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'Exam Reminder',
      message: 'Your first semester exams start in 14 days. Start preparing now!',
      time: '1 day ago',
      read: false,
    },
    {
      id: '3',
      title: 'New Contributor Joined',
      message: 'Adaeze Nwankwo uploaded 5 new past questions to Physics department',
      time: '2 days ago',
      read: true,
    },
  ];

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
      <div className="px-6 py-8 border-b border-border">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="text-foreground">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent</h2>
        <div className="space-y-3 mb-8">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card border rounded-xl p-4 ${
                notification.read ? 'border-border' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-muted' : 'bg-primary/10'
                  }`}
                >
                  <Bell
                    className={`w-5 h-5 ${notification.read ? 'text-secondary' : 'text-primary'}`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-secondary mb-2 leading-relaxed">{notification.message}</p>
                  <span className="text-xs text-secondary">{notification.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Features */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Coming Soon</h2>
          <p className="text-sm text-secondary mb-6 leading-relaxed">
            Exciting premium features we're building for you. Be the first to know when they launch!
          </p>
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
                  <button className="w-full h-11 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all">
                    Notify Me When Ready
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
