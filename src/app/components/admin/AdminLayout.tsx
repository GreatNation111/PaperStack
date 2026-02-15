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
}

export function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [featureRequestCount, setFeatureRequestCount] = useState(0);
  const [isBrightMode, setIsBrightMode] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feature_interest'), (snap) => {
      setFeatureRequestCount(snap.size);
    });
    return () => unsub();
  }, []);

  // Update root class for theme vars
  useEffect(() => {
    if (isBrightMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [isBrightMode]);

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
    <div className={`min-h-screen transition-colors duration-500 flex flex-col lg:flex-row ${isBrightMode ? 'bg-[#FAFAFA] text-[#0A2540]' : 'bg-[#0F1115] text-[#E5E5E5]'}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-40 transition-colors ${isBrightMode ? 'bg-white border-[#EEE]' : 'bg-[#1A1A1F] border-[#2A2A2F]'}`}>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#4F46E5]" strokeWidth={2.5} />
          <span className={`font-black uppercase tracking-tighter text-sm ${isBrightMode ? 'text-[#0A2540]' : 'text-[#E5E5E5]'}`}>PaperStack Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBrightMode(!isBrightMode)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isBrightMode ? 'bg-indigo-50 text-indigo-600' : 'bg-white/5 text-amber-400'}`}
          >
            {isBrightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${isBrightMode ? 'text-[#555]' : 'text-[#AAA]'}`}
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex lg:flex-col w-72 border-r fixed left-0 top-0 bottom-0 z-50 transition-colors ${isBrightMode ? 'bg-white border-[#EEE]' : 'bg-[#1A1A1F] border-[#2A2A2F]'}`}>
        {/* Logo */}
        <div className={`h-24 px-8 flex items-center gap-3 border-b transition-colors ${isBrightMode ? 'border-[#EEE]' : 'border-[#2A2A2F]'}`}>
          <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className={`font-black text-lg uppercase tracking-tighter ${isBrightMode ? 'text-[#0A2540]' : 'text-[#E5E5E5]'}`}>PaperStack</span>
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
                  ? (isBrightMode ? 'bg-indigo-50 text-[#4F46E5]' : 'bg-[#4F46E5]/10 text-[#4F46E5]')
                  : (isBrightMode ? 'text-[#64748B] hover:text-[#0A2540] hover:bg-slate-50' : 'text-[#888] hover:text-[#E5E5E5] hover:bg-[#222227]')
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-[#4F46E5] rounded-full"
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#4F46E5]' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-xs font-black uppercase tracking-[0.1em] flex-1 text-left ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{item.label}</span>
                {item.id === 'reports' && featureRequestCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#EC4899] text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
                    {featureRequestCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Section */}
        <div className={`p-4 space-y-4 border-t transition-colors ${isBrightMode ? 'border-[#EEE]' : 'border-[#2A2A2F]'}`}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsBrightMode(!isBrightMode)}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all ${isBrightMode ? 'bg-slate-50 text-[#0A2540] hover:bg-slate-100' : 'bg-[#222227] text-[#AAA] hover:text-white'}`}
          >
            {isBrightMode ? <Moon className="w-5 h-5 text-indigo-600" strokeWidth={1.5} /> : <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.5} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isBrightMode ? 'Deep Focus Mode' : 'Bright Mode'}</span>
          </button>

          <button
            onClick={onLogout}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all ${isBrightMode ? 'text-[#EF4444] hover:bg-red-50' : 'text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/5'}`}
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
              className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50 flex flex-col transition-colors ${isBrightMode ? 'bg-white border-r border-[#EEE]' : 'bg-[#1A1A1F] border-r border-[#2A2A2F]'}`}
            >
              {/* Header */}
              <div className={`h-16 px-6 flex items-center justify-between border-b transition-colors ${isBrightMode ? 'border-[#EEE]' : 'border-[#2A2A2F]'}`}>
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-[#4F46E5]" strokeWidth={2.5} />
                  <span className={`font-black uppercase tracking-tighter ${isBrightMode ? 'text-[#0A2540]' : 'text-[#E5E5E5]'}`}>PaperStack</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${isBrightMode ? 'text-[#AAA] hover:text-[#555]' : 'text-[#AAA] hover:text-[#E5E5E5]'}`}
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
                        ? (isBrightMode ? 'bg-indigo-50 text-[#4F46E5]' : 'bg-[#4F46E5]/10 text-[#4F46E5]')
                        : (isBrightMode ? 'text-[#64748B] hover:text-[#0A2540]' : 'text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227]')
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-xs font-black uppercase tracking-[0.1em] flex-1 text-left">{item.label}</span>
                      {item.id === 'reports' && featureRequestCount > 0 && (
                        <span className="px-2 py-0.5 bg-[#EC4899] text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
                          {featureRequestCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className={`p-4 border-t transition-colors ${isBrightMode ? 'border-[#EEE]' : 'border-[#2A2A2F]'}`}>
                <button
                  onClick={() => {
                    onLogout();
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full h-14 px-4 rounded-xl flex items-center gap-4 transition-colors ${isBrightMode ? 'text-[#EF4444] hover:bg-red-50' : 'text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/5'}`}
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
