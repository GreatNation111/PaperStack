import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  LayoutDashboard,
  Bell,
  BookOpen,
  Building2,
  Users,
  Flag,
  Settings,
  Layers,
  LogOut,
  Calendar,
  MessageCircleQuestion,
  Sun,
  Moon,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AdminLayout({ children, currentPage, onNavigate, onLogout, isDarkMode, onToggleDarkMode }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [featureRequestCount, setFeatureRequestCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feature_interest'), (snap) => {
      const uniqueRequests = new Set(snap.docs.map(requestDoc => {
        const data = requestDoc.data();
        return `${data.feature || 'unknown'}:${data.userId || data.userEmail || requestDoc.id}`;
      }));
      setFeatureRequestCount(uniqueRequests.size);
    });
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'repeated-questions', label: 'Question Curator', icon: MessageCircleQuestion },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Feature Requests', icon: Flag, badge: featureRequestCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`admin-shell min-h-screen transition-colors duration-500 flex flex-col lg:flex-row bg-background text-foreground`}>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-40 transition-colors bg-card border-border`}>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" strokeWidth={2.5} />
          <span className={`font-black uppercase tracking-tighter text-sm text-foreground`}>PaperStack Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${!isDarkMode ? 'bg-indigo-50 text-indigo-600' : 'bg-white/5 text-amber-400'}`}
          >
            {!isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`w-10 h-10 flex items-center justify-center transition-colors text-secondary`}
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex lg:flex-col w-72 border-r fixed left-0 top-0 bottom-0 z-50 transition-colors bg-card border-border`}>
        {/* Logo */}
        <div className={`h-24 px-8 flex items-center gap-3 border-b transition-colors border-border`}>
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className={`font-black text-lg uppercase tracking-tighter text-foreground`}>PaperStack</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all relative group ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                  : 'text-secondary hover:text-foreground hover:bg-muted'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-full"
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-xs font-black uppercase tracking-[0.1em] flex-1 text-left ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{item.label}</span>
                {item.id === 'reports' && featureRequestCount > 0 && (
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
                    {featureRequestCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Section */}
        <div className={`p-4 space-y-4 border-t transition-colors border-border`}>
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all bg-muted text-secondary hover:text-foreground hover:bg-muted/80`}
          >
            {!isDarkMode ? <Moon className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> : <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.5} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{!isDarkMode ? 'Deep Focus Mode' : 'Bright Mode'}</span>
          </button>

          <button
            onClick={onLogout}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50 flex flex-col transition-colors bg-card border-r border-border`}
            >
              {/* Header */}
              <div className={`h-16 px-6 flex items-center justify-between border-b transition-colors border-border`}>
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
                  <span className={`font-black uppercase tracking-tighter text-foreground`}>PaperStack</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors text-secondary hover:text-foreground`}
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full h-14 px-4 rounded-xl flex items-center gap-4 transition-colors ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                        : 'text-secondary hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-xs font-black uppercase tracking-[0.1em] flex-1 text-left">{item.label}</span>
                      {item.id === 'reports' && featureRequestCount > 0 && (
                        <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
                          {featureRequestCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className={`p-4 border-t transition-colors border-border`}>
                <button
                  onClick={() => {
                    onLogout();
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full h-14 px-4 rounded-xl flex items-center gap-4 transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-xs font-black uppercase tracking-[0.1em]">Logout Session</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
