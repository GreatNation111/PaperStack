import { useState } from 'react';
import { Bell, Search, AlignLeft, Calendar, ChevronRight, Atom, Cpu, Wrench, Briefcase, FlaskConical, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useDepartments, useRecentCourses, Course } from '@/hooks/useData';
import { seedDatabase } from '@/utils/seed';

interface HomeProps {
  userName: string;
  onNotifications: () => void;
  onExplore: (department?: string) => void;
}

export function Home({ userName, onNotifications, onExplore }: HomeProps) {
  const { departments, loading: loadingDepts } = useDepartments();
  const { courses: recentCourses, loading: loadingCourses } = useRecentCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await seedDatabase();
    setSeeding(false);
    window.location.reload(); // Simple reload to refresh hooks
  };

  // Helper for department styling and icons
  const getDeptConfig = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return { color: 'bg-teal-500/10', iconColor: 'text-teal-600', Icon: Atom };
    if (lower.includes('comp') || lower.includes('csc')) return { color: 'bg-indigo-500/10', iconColor: 'text-indigo-600', Icon: Cpu };
    if (lower.includes('indust') || lower.includes('tech')) return { color: 'bg-amber-500/10', iconColor: 'text-amber-600', Icon: Wrench };
    if (lower.includes('busin')) return { color: 'bg-emerald-500/10', iconColor: 'text-emerald-600', Icon: Briefcase };
    if (lower.includes('chem')) return { color: 'bg-rose-500/10', iconColor: 'text-rose-600', Icon: FlaskConical };
    return { color: 'bg-slate-500/10', iconColor: 'text-slate-600', Icon: AlignLeft };
  };

  const filteredCourses = recentCourses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hello, {userName}!</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNotifications}
              className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
            >
              <Bell className="w-5 h-5 text-foreground" strokeWidth={2} />
            </button>
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold uppercase">
              {userName ? userName[0] : 'S'}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search course code, lecturer, or topic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Department Shortcuts - Horizontal Row */}
        {/* Only show if not searching, or keep showing? Usually hide during search, but user didn't specify. Keeping for now. */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {loadingDepts ? (
            // Skeleton loader for departments
            [1, 2, 3].map((i) => (
              <div key={i} className="flex-1 min-w-[30%] h-28 bg-muted/50 animate-pulse rounded-2xl" />
            ))
          ) : (
            departments.map((dept, index) => {
              const { color, iconColor, Icon } = getDeptConfig(dept.name);
              return (
                <motion.button
                  key={dept.id}
                  onClick={() => onExplore(dept.id)}
                  className={`flex-1 min-w-[30%] h-28 ${color} rounded-2xl p-5 flex flex-col items-start justify-between hover:opacity-80 transition-all`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-8 h-8 ${iconColor} bg-white/50 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
                  </div>
                  <span className={`font-semibold text-xs leading-tight text-left ${iconColor}`}>{dept.name}</span>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Upcoming Exams Highlight - Hide when searching to focus on results */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-primary-foreground mb-1">Upcoming Exams</h3>
                <p className="text-primary-foreground/80 text-sm">First Semester 2024/2025</p>
              </div>
              <Calendar className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div className="text-primary-foreground/90 text-2xl font-bold mb-4">14 Days</div>
            <button className="w-full h-12 bg-primary-foreground text-primary rounded-xl font-semibold hover:opacity-90 transition-all">
              Prepare Now
            </button>
          </motion.div>
        )}

        {/* Recently Viewed - Horizontal Carousel */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">{searchQuery ? 'Search Results' : 'Recently Viewed Courses'}</h2>

          {loadingCourses ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 h-48 bg-muted/50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : recentCourses.length === 0 && !searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center select-none bg-muted/20 rounded-2xl border border-dashed border-border mx-auto max-w-sm">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-secondary text-sm font-medium mb-4">Database is empty.</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Populate Dummy Data'}
              </button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center select-none">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-secondary text-sm font-medium">No courses found.</p>
              <p className="text-secondary/60 text-xs mt-1">Try searching for a code like "PHY 101"</p>
            </div>
          ) : (
            <div className="relative -mx-6 px-6">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
                {filteredCourses.map((course, index) => (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex-shrink-0 snap-center bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all w-64 text-left`}
                  >
                    {/* Mock Question Page Preview */}
                    <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex flex-col p-4 overflow-hidden relative">
                      <div className="absolute top-4 right-4 text-xs text-secondary/40 font-semibold">
                        {course.code}
                      </div>
                      <div className="space-y-2 opacity-30">
                        <div className="h-2 w-3/4 bg-foreground/20 rounded" />
                        <div className="h-2 w-full bg-foreground/20 rounded" />
                        <div className="h-2 w-5/6 bg-foreground/20 rounded" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <AlignLeft className="w-6 h-6 text-secondary/20" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground mb-1">{course.code}</div>
                      <div className="text-sm text-foreground mb-2 line-clamp-1">{course.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary">
                          {course.level}
                        </span>
                        <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}