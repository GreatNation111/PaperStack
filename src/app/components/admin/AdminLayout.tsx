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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feature_interest'), (snap) => {
      setFeatureRequestCount(snap.size);
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
    <div className="min-h-screen bg-[#0F1115] lg:flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A1F] border-b border-[#2A2A2F] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
          <span className="font-semibold text-[#E5E5E5]">PaperStack Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] transition-colors"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#1A1A1F] border-r border-[#2A2A2F] fixed left-0 top-0 bottom-0">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-2 border-b border-[#2A2A2F]">
          <Layers className="w-6 h-6 text-[#4F46E5]" strokeWidth={1.5} />
          <span className="font-semibold text-[#E5E5E5]">PaperStack Admin</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full h-11 px-3 rounded-lg flex items-center gap-3 mb-1 transition-colors ${isActive
                  ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                  : 'text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227]'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {item.id === 'reports' && featureRequestCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#EC4899] text-white text-[10px] font-bold rounded-full">
                    {featureRequestCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#2A2A2F]">
          <button
            onClick={onLogout}
            className="w-full h-11 px-3 rounded-lg flex items-center gap-3 text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Logout</span>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#1A1A1F] border-r border-[#2A2A2F] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#2A2A2F]">
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#4F46E5]" strokeWidth={1.5} />
                  <span className="font-semibold text-[#E5E5E5]">PaperStack Admin</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                      className={`w-full h-12 px-3 rounded-lg flex items-center gap-3 mb-1 transition-colors ${isActive
                        ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                        : 'text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227]'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {item.id === 'reports' && featureRequestCount > 0 && (
                        <span className="px-2 py-0.5 bg-[#EC4899] text-white text-[10px] font-bold rounded-full">
                          {featureRequestCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-[#2A2A2F]">
                <button
                  onClick={() => {
                    onLogout();
                    setIsSidebarOpen(false);
                  }}
                  className="w-full h-12 px-3 rounded-lg flex items-center gap-3 text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
