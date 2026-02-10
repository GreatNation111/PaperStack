import { SeedAdminData } from './SeedAdminData';
import { motion } from 'motion/react';
import { Clock, CheckCircle, FileText, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const stats = [
    { label: 'Pending', value: '47', icon: Clock, color: '#F59E0B', change: '+12 today' },
    { label: 'Approved Today', value: '12', icon: CheckCircle, color: '#10B981', change: '' },
    { label: 'Total Papers', value: '1.2k', icon: FileText, color: '#4F46E5', change: '+89 this week' },
    { label: 'Active Contributors', value: '89', icon: Users, color: '#0D9488', change: '+5 this month' },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Approved',
      item: 'PHY 301 - 2023/2024 Final Exam',
      user: 'Admin: Chidi Okafor',
      time: '2 min ago',
      type: 'approved' as const,
    },
    {
      id: '2',
      action: 'Rejected',
      item: 'MTH 201 - 2022/2023 Test (Poor quality)',
      user: 'Admin: Amina Bello',
      time: '15 min ago',
      type: 'rejected' as const,
    },
    {
      id: '3',
      action: 'Uploaded',
      item: 'CSC 401 - 2023/2024 Second Semester',
      user: 'Admin: Emeka Nwosu',
      time: '1 hour ago',
      type: 'uploaded' as const,
    },
    {
      id: '4',
      action: 'Approved',
      item: 'CHM 101 - 2024/2025 First Semester',
      user: 'Admin: Fatima Ibrahim',
      time: '2 hours ago',
      type: 'approved' as const,
    },
    {
      id: '5',
      action: 'Flag Resolved',
      item: 'BIO 201 - Duplicate content removed',
      user: 'Admin: Chidi Okafor',
      time: '3 hours ago',
      type: 'flagged' as const,
    },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Dashboard</h1>
          <p className="text-sm text-[#AAA]">Overview of content moderation activity</p>
        </div>
        <SeedAdminData />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-6 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={1.5} />
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs text-[#10B981]">
                    <TrendingUp className="w-3 h-3" strokeWidth={2} />
                  </div>
                )}
              </div>
              <div className="text-3xl font-semibold text-[#E5E5E5] mb-1">{stat.value}</div>
              <div className="text-sm text-[#AAA] mb-1">{stat.label}</div>
              {stat.change && <div className="text-xs text-[#666]">{stat.change}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('pending')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#4F46E5] hover:bg-[#4F46E5]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Review Pending</div>
            <div className="text-xs text-[#AAA]">47 submissions waiting</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Send Notification</div>
            <div className="text-xs text-[#AAA]">Announce to students</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#EF4444] hover:bg-[#EF4444]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Check Flags</div>
            <div className="text-xs text-[#AAA]">8 reports to review</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#2A2A2F] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#E5E5E5]">Recent Activity</h2>
          <button className="text-sm text-[#4F46E5] hover:underline">View All</button>
        </div>

        <div className="divide-y divide-[#2A2A2F]">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-4 hover:bg-[#222227] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'approved'
                    ? 'bg-[#10B981]'
                    : activity.type === 'rejected'
                      ? 'bg-[#EF4444]'
                      : activity.type === 'flagged'
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#4F46E5]'
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <span
                      className={`text-sm font-medium ${activity.type === 'approved'
                        ? 'text-[#10B981]'
                        : activity.type === 'rejected'
                          ? 'text-[#EF4444]'
                          : 'text-[#E5E5E5]'
                        }`}
                    >
                      {activity.action}
                    </span>
                    <span className="text-xs text-[#666] flex-shrink-0">{activity.time}</span>
                  </div>
                  <div className="text-sm text-[#DDD] mb-1">{activity.item}</div>
                  <div className="text-xs text-[#AAA]">{activity.user}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint - Desktop only */}
      <div className="hidden lg:block mt-6">
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-4 py-3">
          <div className="flex items-center gap-6 text-xs text-[#666]">
            <span>Keyboard shortcuts:</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">P</kbd> Pending</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">N</kbd> Notifications</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">C</kbd> Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
