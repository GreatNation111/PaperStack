import { useState, useEffect } from 'react';
import { SeedAdminData } from './SeedAdminData';
import { motion } from 'motion/react';
import { Building2, BookOpen, Users, Flag, ArrowUpRight } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [counts, setCounts] = useState({
    departments: 0,
    courses: 0,
    contributors: 0,
    requests: 0,
    notifications: 0
  });

  useEffect(() => {
    const unsubDepts = onSnapshot(collection(db, 'departments'), snap =>
      setCounts(prev => ({ ...prev, departments: snap.size }))
    );
    const unsubCourses = onSnapshot(collection(db, 'courses'), snap =>
      setCounts(prev => ({ ...prev, courses: snap.size }))
    );
    const unsubContributors = onSnapshot(collection(db, 'contributors'), snap =>
      setCounts(prev => ({ ...prev, contributors: snap.size }))
    );
    const unsubRequests = onSnapshot(collection(db, 'feature_interest'), snap =>
      setCounts(prev => ({ ...prev, requests: snap.size }))
    );
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), snap =>
      setCounts(prev => ({ ...prev, notifications: snap.size }))
    );

    return () => {
      unsubDepts();
      unsubCourses();
      unsubContributors();
      unsubRequests();
      unsubNotifs();
    };
  }, []);

  const stats = [
    { label: 'Total Departments', value: counts.departments.toString(), icon: Building2, color: '#4F46E5' },
    { label: 'Total Courses', value: counts.courses.toString(), icon: BookOpen, color: '#10B981' },
    { label: 'Contributors', value: counts.contributors.toString(), icon: Users, color: '#F59E0B' },
    { label: 'Feature Requests', value: counts.requests.toString(), icon: Flag, color: '#EC4899' },
    { label: 'Total Notifications', value: counts.notifications.toString(), icon: ArrowUpRight, color: '#F43F5E' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Dashboard</h1>
          <p className="text-sm text-[#AAA]">Overview of platform content</p>
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
              </div>
              <div className="text-3xl font-semibold text-[#E5E5E5] mb-1">{stat.value}</div>
              <div className="text-sm text-[#AAA] mb-1">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('notifications')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#4F46E5] hover:bg-[#4F46E5]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Send Notification</div>
            <div className="text-xs text-[#AAA]">Announce to students</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('courses')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#10B981] hover:bg-[#10B981]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Manage Courses</div>
            <div className="text-xs text-[#AAA]">Add or edit courses</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-[#EC4899] hover:bg-[#EC4899]/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">View Requests</div>
            <div className="text-xs text-[#AAA]">See feature requests</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#EC4899] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('timetable')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Timetable Manager</div>
            <div className="text-xs text-[#AAA]">Manage exam schedules</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onNavigate('repeated-questions')}
          className="h-20 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-6 flex items-center justify-between text-left hover:border-indigo-400 hover:bg-indigo-400/5 transition-all group"
        >
          <div>
            <div className="text-base font-medium text-[#E5E5E5] mb-1">Question Curator</div>
            <div className="text-xs text-[#AAA]">Manage repeat patterns</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint - Desktop only */}
      <div className="hidden lg:block mt-6">
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-4 py-3">
          <div className="flex items-center gap-6 text-xs text-[#666]">
            <span>Keyboard shortcuts:</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">N</kbd> Notifications</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">C</kbd> Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
