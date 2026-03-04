import { useState, useEffect } from 'react';
import { Bell, Search, AlignLeft, Calendar, ChevronRight, Atom, Cpu, Wrench, Briefcase, FlaskConical, Database, UserCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useDepartments, useRecentCourses, useNotifications, useUserProfile, useTimetable } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';
import { PremiumLock } from './PremiumLock';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO, isAfter } from 'date-fns';
import { requestNotificationPermissionAndSaveToken } from '@/services/messaging';

interface HomeProps {
  userName: string;
  onNotifications: () => void;
  onExplore: (department?: string) => void;
}

export function Home({ userName, onNotifications, onExplore }: HomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useUserProfile(user?.uid);
  const { departments, loading: loadingDepts } = useDepartments();
  const { courses: recentCourses, loading: loadingCourses } = useRecentCourses(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const { timetable, loading: loadingTimetable } = useTimetable(profile?.departmentId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Check notification permission status on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setShowNotificationBanner(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!user) return;
    const success = await requestNotificationPermissionAndSaveToken(user.uid);
    if (success) {
      setShowNotificationBanner(false);
    }
  };

  const handleDismissBanner = () => {
    setShowNotificationBanner(false);
    // Optionally save to local storage not to ask again
    localStorage.setItem('hideNotificationBanner', 'true');
  };

  useEffect(() => {
    if (localStorage.getItem('hideNotificationBanner')) {
      setShowNotificationBanner(false);
    }
  }, []);

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
    (course.code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Logic to find the next imminent exam
  const nextExam = timetable?.exams
    ?.filter(exam => isAfter(parseISO(exam.date), new Date()))
    ?.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];

  const daysTilExam = nextExam ? differenceInDays(parseISO(nextExam.date), new Date()) : null;

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
              className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all relative"
            >
              <Bell className="w-5 h-5 text-foreground" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-muted" />
              )}
            </button>
            {/* Avatar: Show user's avatar from settings if available, else show first letter initial */}
            <div
              onDoubleClick={() => navigate('/admin')}
              className="cursor-default"
              title="Profile"
            >
              {profile?.avatar ? (
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center">
                  <img
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.avatar}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt="User avatar"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold uppercase select-none">
                  {userName ? userName[0] : 'S'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Push Notification Banner */}
        {showNotificationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="flex gap-3 items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Enable Push Notifications</h3>
                <p className="text-secondary text-sm">Get real-time alerts for new past questions and department updates.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto relative z-10">
              <button
                onClick={handleDismissBanner}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleEnableNotifications}
                className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Enable
              </button>
            </div>
          </motion.div>
        )}

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

        {/* Upcoming Exams Highlight - Department Scoped & Premium Gated */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <PremiumLock
              isPremium={!!profile?.isPremium}
              featureName="Exam Countdown"
              onAction={() => navigate('/premium')}
              compact={true}
            >
              <div className="bg-primary rounded-2xl p-8 min-h-[240px] flex flex-col justify-between relative overflow-hidden">
                {/* Visual Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />

                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground mb-1">Upcoming Exams</h3>
                    <p className="text-primary-foreground/70 text-sm font-medium">
                      {nextExam ? `${nextExam.courseCode}: ${nextExam.title}` : 'No upcoming exams'}
                    </p>
                  </div>
                  <Calendar className="w-6 h-6 text-primary-foreground opacity-80" strokeWidth={1.5} />
                </div>

                <div className="flex items-baseline gap-2 mb-4 relative z-10">
                  <span className="text-primary-foreground text-4xl font-black">
                    {daysTilExam !== null ? daysTilExam : '--'}
                  </span>
                  <span className="text-primary-foreground/80 text-sm font-bold uppercase tracking-widest">Days Left</span>
                </div>

                <button
                  onClick={() => navigate('/timetable')}
                  className="w-full h-12 bg-primary-foreground text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all relative z-10 shadow-lg"
                >
                  View Full Timetable
                </button>
              </div>
            </PremiumLock>
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
              <p className="text-secondary text-sm font-medium mb-4">You haven't viewed any courses yet.</p>
              <p className="text-xs text-secondary/60">Start exploring to build your history.</p>
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
                    onClick={() => course.driveFolderUrl && window.open(course.driveFolderUrl, '_blank')}
                    className="flex-shrink-0 snap-center bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all w-72 text-left"
                  >
                    {/* Skeleton Paper Thumbnail */}
                    <div className="w-full h-36 bg-muted rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                      {/* Paper Skeleton */}
                      <div className="w-20 h-28 bg-white rounded-md shadow-sm border border-border/50 p-3 space-y-2 relative transform group-hover:scale-105 transition-transform">
                        <div className="w-3/4 h-2 bg-muted rounded-full animate-pulse" />
                        <div className="w-full h-1 bg-muted/60 rounded-full" />
                        <div className="space-y-1 pt-2">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-1 bg-muted/30 rounded-full" />
                          ))}
                        </div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-primary/10" />
                      </div>

                      <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur rounded text-[10px] font-bold text-foreground">
                        {course.semester === 'First' ? '1st' : '2nd'} Sem
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-foreground mb-1">{course.code}</div>
                      <div className="text-sm text-foreground mb-2 line-clamp-1">{course.title}</div>

                      <div className="flex flex-col gap-1.5 mb-3">
                        <div className="text-xs text-secondary flex items-center gap-1.5">
                          <UserCircle className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="truncate">{course.lecturer || 'Undesignated'}</span>
                        </div>
                        <div className="text-xs text-secondary flex items-center gap-2">
                          <span>{course.level}</span>
                          <span className="w-1 h-1 bg-secondary/30 rounded-full" />
                          <span>{course.papers || 0} papers</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-primary font-semibold">View Papers</span>
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