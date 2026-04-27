import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, BookOpen, Users, Flag, ArrowUpRight, Bell, HelpCircle } from 'lucide-react';
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
    { label: 'Active Contributors', value: counts.contributors.toString(), icon: Users, color: '#F59E0B' },
    { label: 'Feature Requests', value: counts.requests.toString(), icon: Flag, color: '#EC4899' },
    { label: 'Total Notifications', value: counts.notifications.toString(), icon: Bell, color: '#F43F5E' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-10">
      {/* Header - Simplified */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-border p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">General Overview & Management Hub</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-[2rem] p-8 hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={2} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-foreground tracking-tight mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold text-secondary uppercase tracking-widest opacity-60">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Management Hub - Simplified Terminology */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-secondary uppercase tracking-widest px-4 opacity-40">System Management</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('notifications')}
            className="group relative h-32 bg-card border border-border rounded-[2rem] px-10 flex items-center justify-between text-left hover:border-primary/40 hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground tracking-tight mb-1">Send Notifications</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Push Alerts & Announcements</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-white transition-all">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('courses')}
            className="group relative h-32 bg-card border border-border rounded-[2rem] px-10 flex items-center justify-between text-left hover:border-green-500/40 hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground tracking-tight mb-1">Manage Courses</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Course Database & Materials</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/5 flex items-center justify-center group-hover:bg-green-500 text-green-600 group-hover:text-white transition-all">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('timetable')}
            className="group relative h-32 bg-card border border-border rounded-[2rem] px-10 flex items-center justify-between text-left hover:border-amber-500/40 hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground tracking-tight mb-1">Timetable Manager</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Exam Schedules & Logistics</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center group-hover:bg-amber-500 text-amber-600 group-hover:text-white transition-all">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('repeated-questions')}
            className="group relative h-32 bg-card border border-border rounded-[2rem] px-10 flex items-center justify-between text-left hover:border-indigo-400/40 hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground tracking-tight mb-1">Question Curator</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Repeated Questions Analysis</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center group-hover:bg-indigo-500 text-indigo-600 group-hover:text-white transition-all">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="group relative h-32 bg-card border border-border rounded-[2rem] px-10 flex items-center justify-between text-left hover:border-pink-500/40 hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground tracking-tight mb-1">Feature Requests</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">User Feedback & Interests</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/5 flex items-center justify-center group-hover:bg-pink-500 text-pink-600 group-hover:text-white transition-all">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {/* Simplified Helper Section */}
      <div className="flex items-center gap-6 p-8 bg-card border border-border rounded-[2rem] shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-secondary opacity-60" />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-[11px] font-bold text-secondary/60 uppercase tracking-widest">Helpful Shortcuts</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded-lg text-[10px] font-black text-secondary">N</kbd>
            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">New Notification</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded-lg text-[10px] font-black text-secondary">C</kbd>
            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Course Catalog</span>
          </div>
        </div>
      </div>
    </div>
  );
}
