import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Building2, BookOpen, Users, Flag, ArrowUpRight, Bell, HelpCircle, RefreshCw, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { seedDatabase } from '@/utils/seed';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [counts, setCounts] = useState({
    users: 0,
    departments: 0,
    courses: 0,
    contributors: 0,
    requests: 0,
    notifications: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchCounts = useCallback(async () => {
    setRefreshing(true);
    try {
      const [users, depts, courses, contribs, requests, notifs] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'departments')),
        getCountFromServer(collection(db, 'courses')),
        getCountFromServer(collection(db, 'contributors')),
        getCountFromServer(collection(db, 'feature_interest')),
        getCountFromServer(collection(db, 'notifications')),
      ]);
      setCounts({
        users: users.data().count,
        departments: depts.data().count,
        courses: courses.data().count,
        contributors: contribs.data().count,
        requests: requests.data().count,
        notifications: notifs.data().count,
      });
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const stats = [
    { label: 'Total Users', value: counts.users.toString(), icon: Users, color: '#8B5CF6' },
    { label: 'Total Departments', value: counts.departments.toString(), icon: Building2, color: 'var(--primary)' },
    { label: 'Total Courses', value: counts.courses.toString(), icon: BookOpen, color: '#10B981' },
    { label: 'Active Contributors', value: counts.contributors.toString(), icon: Users, color: '#F59E0B' },
    { label: 'Feature Requests', value: counts.requests.toString(), icon: Flag, color: '#EC4899' },
    { label: 'Total Notifications', value: counts.notifications.toString(), icon: Bell, color: '#F43F5E' },
  ];

  const handleSeedDefaults = async () => {
    if (seeding) return;
    if (!window.confirm('Add missing default departments and sample records? Existing Firestore records will not be changed.')) return;

    setSeeding(true);
    setSeedStatus('idle');

    try {
      const result = await seedDatabase();
      setSeedStatus(result ? 'success' : 'error');
      if (result) {
        await fetchCounts();
        window.setTimeout(() => setSeedStatus('idle'), 2200);
      }
    } catch (error) {
      console.error('Error seeding defaults:', error);
      setSeedStatus('error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-12">
      {/* Header - Premium Look */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Live & Operational
          </p>
        </div>
        <button
          onClick={fetchCounts}
          disabled={refreshing}
          className="relative z-10 w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center hover:bg-primary/10 transition-all"
        >
          <RefreshCw className={`w-5 h-5 text-secondary ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: stat.color.startsWith('var') ? 'var(--primary-foreground)' : `${stat.color}15`, border: `1px solid ${stat.color.startsWith('var') ? 'var(--border)' : `${stat.color}30`}` }}
                >
                  <Icon className="w-7 h-7" style={{ color: stat.color.startsWith('var') ? 'var(--primary)' : stat.color }} strokeWidth={2} />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-foreground tracking-tight mb-1">{stat.value}</div>
                <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Management Hub */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-xs font-black text-secondary uppercase tracking-[0.3em] opacity-40">Command Center</h3>
           <div className="h-px flex-1 bg-border/50 ml-6" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('notifications')}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Push Notifications</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Global Alerts & User Comms</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-white transition-all duration-500 shadow-sm">
              <ArrowUpRight className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('courses')}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-green-500/40 hover:shadow-2xl hover:shadow-green-500/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Course Catalog</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Curriculum & Paper Database</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/5 flex items-center justify-center group-hover:bg-green-500 text-green-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <ArrowUpRight className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('timetable')}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Exam Logistics</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Timetable & Schedule Management</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/5 flex items-center justify-center group-hover:bg-amber-500 text-amber-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <ArrowUpRight className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('repeated-questions')}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Question Bank</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Repeated Questions Analysis</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 flex items-center justify-center group-hover:bg-indigo-500 text-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <ArrowUpRight className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Insight Engine</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">User Feedback & Feature Requests</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-pink-500/5 flex items-center justify-center group-hover:bg-pink-500 text-pink-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <ArrowUpRight className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="group relative h-40 bg-card border border-border rounded-[2.5rem] px-10 flex items-center justify-between text-left hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all overflow-hidden disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-2xl font-black text-foreground tracking-tight mb-2">Seed Defaults</div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">
                {seeding
                  ? 'Adding Missing Records'
                  : seedStatus === 'success'
                    ? 'Seed Complete'
                    : seedStatus === 'error'
                      ? 'Seed Failed'
                      : 'Add Missing Data Only'}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 flex items-center justify-center group-hover:bg-cyan-500 text-cyan-600 group-hover:text-white transition-all duration-500 shadow-sm">
              {seeding ? (
                <Loader2 className="w-7 h-7 animate-spin" strokeWidth={2.5} />
              ) : seedStatus === 'success' ? (
                <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
              ) : seedStatus === 'error' ? (
                <AlertCircle className="w-7 h-7" strokeWidth={2.5} />
              ) : (
                <Database className="w-7 h-7" strokeWidth={2.5} />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Helper Section */}
      <div className="flex items-center gap-8 p-10 bg-card border border-border rounded-[3rem] shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-muted/50 to-transparent" />
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center relative z-10">
          <HelpCircle className="w-6 h-6 text-secondary opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-8 relative z-10">
          <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Quick Commands</span>
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1.5 bg-muted border border-border rounded-xl text-[11px] font-black text-secondary shadow-sm">N</kbd>
            <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">New Alert</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1.5 bg-muted border border-border rounded-xl text-[11px] font-black text-secondary shadow-sm">C</kbd>
            <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Course List</span>
          </div>
        </div>
      </div>
    </div>
  );
}
