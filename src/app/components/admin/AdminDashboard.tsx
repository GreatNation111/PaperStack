import { useState, useEffect } from 'react';
import { SeedAdminData } from './SeedAdminData';
import { motion } from 'motion/react';
import { Building2, BookOpen, Users, Flag, ArrowUpRight, LayoutDashboard, Bell } from 'lucide-react';
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
    <div className="p-4 lg:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <LayoutDashboard className="w-32 h-32 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-1 italic">Intel View</h1>
          <p className="text-secondary text-xs font-black uppercase tracking-[0.3em] opacity-40">Operational Platform Overview</p>
        </div>
        <div className="relative z-10">
          <SeedAdminData />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/20 transition-all group overflow-hidden relative"
            >
              <div
                className="absolute -top-4 -right-4 w-24 h-24 blur-3xl opacity-10 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-rotate-6"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-foreground tracking-tighter mb-1 italic">{stat.value}</div>
                <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Management Hub */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] px-4 opacity-40">Precision Management</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('notifications')}
            className="group relative h-32 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Bell className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground uppercase tracking-tighter mb-1">Satellite Broadcast</div>
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Global Push Notifications</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-white transition-all shadow-xl shadow-primary/10">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('courses')}
            className="group relative h-32 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-green-500/40 hover:shadow-2xl hover:shadow-green-500/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <BookOpen className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground uppercase tracking-tighter mb-1">Catalog Control</div>
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Course Registry & Data</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/5 flex items-center justify-center group-hover:bg-green-500 text-green-600 group-hover:text-white transition-all shadow-xl shadow-green-500/10">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('timetable')}
            className="group relative h-32 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Building2 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground uppercase tracking-tighter mb-1">Schedule Engine</div>
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Exam Timetable Logistics</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center group-hover:bg-amber-500 text-amber-600 group-hover:text-white transition-all shadow-xl shadow-amber-500/10">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('repeated-questions')}
            className="group relative h-32 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-400/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Users className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground uppercase tracking-tighter mb-1">Intel Curator</div>
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Repeat Pattern Analysis</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center group-hover:bg-indigo-500 text-indigo-600 group-hover:text-white transition-all shadow-xl shadow-indigo-500/10">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="group relative h-32 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Flag className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-xl font-black text-foreground uppercase tracking-tighter mb-1">Feedback Loop</div>
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Community Interest Signals</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/5 flex items-center justify-center group-hover:bg-pink-500 text-pink-600 group-hover:text-white transition-all shadow-xl shadow-pink-500/10">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>

      {/* Logic Console Hint */}
      <div className="flex items-center gap-6 p-8 bg-card/40 border border-border rounded-[2.5rem] backdrop-blur-sm">
        <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-secondary opacity-40" />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Console Shortcuts</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded-lg text-[10px] font-black text-secondary">N</kbd>
            <span className="text-[9px] font-black text-secondary/30 uppercase tracking-widest">Global Comms</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded-lg text-[10px] font-black text-secondary">C</kbd>
            <span className="text-[9px] font-black text-secondary/30 uppercase tracking-widest">Knowledge Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
