import { useState } from 'react';
import { Search, Filter, Calendar, FileText, RefreshCw, ChevronDown, ChevronRight, Award, BookOpen, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface ExploreProps {
  selectedDepartment?: string;
  onViewPastQuestions: (course?: string) => void;
  onViewTimetable?: () => void;
  onViewRepeated?: () => void;
}

export function Explore({ selectedDepartment, onViewPastQuestions, onViewTimetable, onViewRepeated }: ExploreProps) {
  const [department, setDepartment] = useState(selectedDepartment || 'physics');

  const departments = [
    { id: 'physics', name: 'Physics' },
    { id: 'cs', name: 'Computer Science' },
    { id: 'industrial', name: 'Industrial Technology' },
  ];

  const courses = [
    {
      code: 'PHY 101',
      title: 'General Physics I',
      level: '100L',
      lecturer: 'Dr. Adeyemi',
      papers: 12,
    },
    {
      code: 'PHY 102',
      title: 'General Physics II',
      level: '100L',
      lecturer: 'Prof. Okafor',
      papers: 10,
    },
    {
      code: 'PHY 201',
      title: 'Elementary Modern Physics',
      level: '200L',
      lecturer: 'Dr. Adeyemi',
      papers: 8,
    },
    {
      code: 'PHY 202',
      title: 'Thermodynamics',
      level: '200L',
      lecturer: 'Dr. Ibrahim',
      papers: 9,
    },
  ];

  const contributors = [
    { name: 'Adaeze Nwankwo', dept: 'Physics', year: '300L', count: 47, badge: 'Top in Physics' },
    { name: 'Chukwuma Obi', dept: 'Computer Science', year: '400L', count: 32, badge: null },
    { name: 'Fatima Bello', dept: 'Physics', year: '200L', count: 28, badge: null },
  ];

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
            className="w-full h-14 pl-12 pr-14 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary">
            <Filter className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Department Selector - Pill-shaped */}
        <div className="mb-6">
          <div className="text-xs text-secondary mb-2 px-1">Your department</div>
          <div className="bg-[#0A2540]/5 border border-border rounded-full px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0A2540] rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-foreground">
                {departments.find((d) => d.id === department)?.name}
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-secondary" strokeWidth={2} />
          </div>
        </div>

        {/* Gateway Cards - 2-Column Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewTimetable}
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
            onClick={onViewRepeated}
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
            onClick={() => onViewPastQuestions()}
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
          <h2 className="text-xl font-bold text-foreground mb-4">Courses in Physics</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {courses.map((course, index) => (
              <motion.button
                key={course.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onViewPastQuestions(course.code)}
                className="flex-shrink-0 w-72 bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all"
              >
                <div className="w-full h-32 bg-muted rounded-xl mb-4 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-secondary" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground mb-1">{course.code}</div>
                  <div className="text-sm text-foreground mb-2">{course.title}</div>
                  <div className="text-xs text-secondary mb-3">
                    {course.level} • {course.lecturer}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary">{course.papers} papers</span>
                    <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contributors Recognition */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Top Contributors</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor.name}
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
                      {contributor.dept} • {contributor.year}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-secondary mb-2">{contributor.count} past questions</div>
                {contributor.badge && (
                  <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-xs font-medium">
                    <Award className="w-3.5 h-3.5" strokeWidth={2} />
                    {contributor.badge}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}