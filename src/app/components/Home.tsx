import { Bell, Search, AlignLeft, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  userName: string;
  onNotifications: () => void;
  onExplore: (department?: string) => void;
}

export function Home({ userName, onNotifications, onExplore }: HomeProps) {
  // Mock data restored from previous state to matching failing context
  const departments = [
    { id: 'physics', name: 'Physics', icon: 'testtube', color: 'bg-teal-500/10', iconColor: 'text-teal-600' },
    { id: 'cs', name: 'Computer Science', icon: 'calculator', color: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
    { id: 'industrial', name: 'Industrial Tech', icon: 'bookopen', color: 'bg-amber-500/10', iconColor: 'text-amber-600' },
  ];

  const recentCourses = [
    { code: 'PHY 101', title: 'General Physics I', level: '100L', papers: 12, position: 0 },
    { code: 'MTH 101', title: 'Elementary Mathematics', level: '100L', papers: 15, position: 1 },
    { code: 'CSC 201', title: 'Computer Programming I', level: '200L', papers: 8, position: 2 },
  ];

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
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {userName[0]}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search course code, lecturer, or topic"
            className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Department Shortcuts - Horizontal Row */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {departments.map((dept, index) => {
            // Placeholder icons logic if needed, simplify for now
            return (
              <motion.button
                key={dept.id}
                onClick={() => onExplore(dept.id)}
                className={`flex-1 min-w-[30%] h-28 ${dept.color} rounded-2xl p-5 flex flex-col items-start justify-between hover:opacity-80 transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-7 h-7 ${dept.iconColor} bg-current rounded-full opacity-20`} />
                <span className={`font-semibold text-sm ${dept.iconColor}`}>{dept.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Upcoming Exams Highlight */}
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

        {/* Recently Viewed - Horizontal Carousel */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Recently Viewed Courses</h2>
          <div className="relative -mx-6 px-6">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {recentCourses.map((course, index) => (
                <motion.button
                  key={course.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: index === 1 ? 1.05 : 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`flex-shrink-0 snap-center bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all ${index === 1 ? 'w-72' : 'w-64'
                    }`}
                  style={{
                    opacity: index === 0 || index === 2 ? 0.7 : 1,
                  }}
                >
                  {/* Mock Question Page Preview */}
                  <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex flex-col p-4 overflow-hidden relative">
                    <div className="absolute top-4 right-4 text-xs text-secondary/40 font-semibold">
                      {course.code}
                    </div>
                    <div className="space-y-2 opacity-30">
                      <div className="h-2 w-3/4 bg-foreground/20 rounded" />
                      <div className="h-2 w-full bg-foreground/20 rounded" />
                      <div className="h-2 w-5/6 bg-foreground/20 rounded" />
                      <div className="h-2 w-full bg-foreground/20 rounded" />
                      <div className="h-2 w-2/3 bg-foreground/20 rounded" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <AlignLeft className="w-6 h-6 text-secondary/20" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground mb-1">{course.code}</div>
                    <div className="text-sm text-foreground mb-2 line-clamp-1">{course.title}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary">
                        {course.level} • {course.papers} papers
                      </span>
                      <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}