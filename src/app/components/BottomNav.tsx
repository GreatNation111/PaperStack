import { Home, Compass, BookMarked, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: 'home' | 'explore' | 'library' | 'profile';
  onTabChange: (tab: 'home' | 'explore' | 'library' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'explore' as const, icon: Compass, label: 'Explore' },
    { id: 'library' as const, icon: BookMarked, label: 'Library' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="w-full max-w-xl mx-auto px-4 py-2 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              layout
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium text-sm"
                >
                  {tab.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
