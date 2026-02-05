import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, RefreshCw, ChevronDown, ChevronRight, Award, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ExploreProps {
  selectedDepartment?: string;
  onViewPastQuestions: (course?: string, level?: string | null, departmentId?: string) => void;
}

import { useDepartments, useCourses, useContributors, Course, useUserProfile } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';

export function Explore({ selectedDepartment, onViewPastQuestions }: ExploreProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);

  // Use profile department as default if available, otherwise fallback
  const [departmentId, setDepartmentId] = useState<string | undefined>(selectedDepartment || profile?.departmentId || 'physics_ed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const { departments, loading: loadingDepts } = useDepartments();
  const { courses, loading: loadingCourses } = useCourses(departmentId);
  const { contributors, loading: loadingContribs } = useContributors();

  // Sync department with profile when it loads
  useEffect(() => {
    if (profile?.departmentId && !selectedDepartment) {
      setDepartmentId(profile.departmentId);
    }
  }, [profile?.departmentId, selectedDepartment]);

  const currentDeptName = departments.find(d => d.id === departmentId)?.name || 'Select Department';

  const userLevel = profile?.level || '100L'; // Default if not set

  const coursesForYou = courses.filter(course => {
    if (searchQuery) {
      return course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Filter by level
    const effectiveLevel = selectedLevel || userLevel;
    // Strict equality might be too strict if formats differ, but they seem consistent '200L'
    return course.level === effectiveLevel;
  });

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Explore</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search course code, lecturer, or topic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-14 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all"
          />
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-transparent p-1 transition-colors ${showFilter ? 'text-primary' : 'text-secondary'}`}
          >
            <Filter className={`${showFilter ? 'fill-current' : ''} w-5 h-5`} strokeWidth={2} />
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${!selectedLevel ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
                >
                  All ({userLevel})
                </button>
                {['100L', '200L', '300L', '400L'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedLevel === lvl ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Department Selector - Pill-shaped */}
        {!profile?.departmentId && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <div className="text-amber-600 text-xs font-medium">
              Please set your Department and Level in Profile to personalize this feed.
            </div>
          </div>
        )}
        <div className="mb-6">
          <div className="text-xs text-secondary mb-2 px-1">Your department</div>
          <div className="relative">
            {/* Simple native select for now on top of the UI for functionality */}
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setIsDropdownOpen(false)}
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="bg-[#0A2540]/5 border border-border rounded-full px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0A2540] rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-foreground">
                  {loadingDepts ? 'Loading...' : currentDeptName}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-secondary" strokeWidth={2} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Gateway Cards - 2-Column Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/timetable')}
            className="relative bg-[#0A2540] rounded-3xl p-6 flex flex-col items-center justify-center overflow-hidden min-h-[180px]"
          >
            {/* Overlapping Illustration */}
            <div className="absolute bottom-0 right-0 opacity-10">
              <Layers className="w-24 h-24" strokeWidth={1} />
            </div>
            <Calendar className="w-10 h-10 text-white/90 mb-3 z-10" strokeWidth={1.5} />
            <div className="text-center z-10">
              <div className="font-semibold text-white mb-1">Timetable</div>
              <div className="text-xs text-white/70">Exam schedule</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/repeated-questions')}
            className="relative bg-teal-600 rounded-3xl p-6 flex flex-col items-center justify-center overflow-hidden min-h-[180px]"
          >
            {/* Overlapping Illustration */}
            <div className="absolute bottom-0 right-0 opacity-10">
              <BookOpen className="w-24 h-24" strokeWidth={1} />
            </div>
            <RefreshCw className="w-10 h-10 text-white/90 mb-3 z-10" strokeWidth={1.5} />
            <div className="text-center z-10">
              <div className="font-semibold text-white mb-1">Repeated</div>
              <div className="text-xs text-white/70">High-yield questions</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewPastQuestions(undefined, selectedLevel)}
            className="relative bg-indigo-600 rounded-3xl p-6 flex flex-col items-center justify-center overflow-hidden min-h-[180px] col-span-2"
          >
            {/* Overlapping Illustration */}
            <div className="absolute bottom-0 right-0 opacity-10">
              <FileText className="w-32 h-32" strokeWidth={1} />
            </div>
            <FileText className="w-10 h-10 text-white/90 mb-3 z-10" strokeWidth={1.5} />
            <div className="text-center z-10">
              <div className="font-semibold text-white mb-1">Past Questions</div>
              <div className="text-xs text-white/70">All available papers 100-400 level</div>
            </div>
          </motion.button>
        </div>

        {/* Courses List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {searchQuery ? 'Search Results' : 'Courses for you'}
            {searchQuery ? 'Search Results' : 'Courses for you'}
            {!searchQuery && <span className="text-primary ml-2 text-sm font-normal">({selectedLevel || userLevel || 'All Levels'})</span>}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {loadingCourses ? (
              // Skeleton loader for courses
              [1, 2].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 h-48 bg-muted/50 animate-pulse rounded-2xl" />
              ))
            ) : coursesForYou.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-8 text-center bg-card/50 rounded-2xl border border-dashed border-border">
                <FileText className="w-8 h-8 text-secondary/30 mb-2" />
                <div className="text-secondary text-sm">No courses found matching criteria.</div>
              </div>
            ) : (
              coursesForYou.map((course, index) => (
                <motion.button
                  key={course.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onViewPastQuestions(course.code, selectedLevel || userLevel)}
                  className="flex-shrink-0 w-72 bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all text-left"
                >
                  <div className="w-full h-32 bg-muted rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <FileText className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur rounded text-[10px] font-bold text-foreground">
                      {course.semester || '1st'} Sem
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground mb-1">{course.code}</div>
                    <div className="text-sm text-foreground mb-2 line-clamp-1">{course.title}</div>
                    <div className="text-xs text-secondary mb-3 flex items-center gap-2">
                      <span>{course.level}</span>
                      <span className="w-1 h-1 bg-secondary rounded-full" />
                      <span>{course.semester || 'First'} Sem</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary font-medium">View Papers</span>
                      <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Contributors Recognition */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Top Contributors</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {loadingContribs ? (
              // Skeleton for contributors
              [1, 2].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 h-32 bg-muted/50 animate-pulse rounded-2xl" />
              ))
            ) : contributors.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-6 text-center">
                <div className="text-secondary text-sm">No contributors yet.</div>
              </div>
            ) : (
              contributors.map((contributor, index) => (
                <motion.div
                  key={contributor.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex-shrink-0 w-64 bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{contributor.name}</div>
                      <div className="text-xs text-secondary">
                        {contributor.department} • {contributor.levelOrYear}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-secondary mb-2">{contributor.contributionCount} past questions</div>
                  {contributor.badge && (
                    <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-xs font-medium">
                      <Award className="w-3.5 h-3.5" strokeWidth={2} />
                      {contributor.badge}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}