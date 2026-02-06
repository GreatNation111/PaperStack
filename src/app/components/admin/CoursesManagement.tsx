import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit3, Trash2, BookOpen, X, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  title: string;
  faculty: string;
  department: string;
  level: string;
  paperCount: number;
  lastUpdated: string;
}

export function CoursesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Form state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');

  const courses: Course[] = [
    {
      id: '1',
      code: 'PHY 301',
      title: 'Quantum Mechanics I',
      faculty: 'Science',
      department: 'Physics',
      level: '300',
      paperCount: 24,
      lastUpdated: 'Jan 15, 2025',
    },
    {
      id: '2',
      code: 'MTH 201',
      title: 'Mathematical Methods',
      faculty: 'Science',
      department: 'Mathematics',
      level: '200',
      paperCount: 31,
      lastUpdated: 'Jan 14, 2025',
    },
    {
      id: '3',
      code: 'CSC 401',
      title: 'Advanced Algorithms',
      faculty: 'Science',
      department: 'Computer Science',
      level: '400',
      paperCount: 18,
      lastUpdated: 'Jan 10, 2025',
    },
    {
      id: '4',
      code: 'CHM 101',
      title: 'General Chemistry',
      faculty: 'Science',
      department: 'Chemistry',
      level: '100',
      paperCount: 42,
      lastUpdated: 'Jan 8, 2025',
    },
  ];

  const handleAdd = () => {
    console.log('Adding course:', { code, title, faculty, department, level });
    setShowAddModal(false);
    // Reset form
    setCode('');
    setTitle('');
    setFaculty('');
    setDepartment('');
    setLevel('');
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Courses Management</h1>
          <p className="text-sm text-[#AAA]">{courses.length} courses in database</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-4 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Add Course</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, title, or department..."
            className="w-full h-12 pl-10 pr-4 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-xl p-4 mb-4 flex items-center justify-between"
        >
          <span className="text-sm text-[#E5E5E5]">
            {selectedItems.length} {selectedItems.length === 1 ? 'course' : 'courses'} selected
          </span>
          <button className="h-10 px-4 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626] transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            Delete
          </button>
        </motion.div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th className="px-4 py-4 text-left">
                  <input type="checkbox" className="w-4 h-4 accent-[#4F46E5]" />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Code</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Title</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Faculty</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Level</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider"># Papers</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {courses.map((course, index) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#222227] transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(course.id)}
                      onChange={() => toggleSelect(course.id)}
                      className="w-4 h-4 accent-[#4F46E5]"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#4F46E5]">{course.code}</td>
                  <td className="px-4 py-4 text-sm text-[#E5E5E5]">{course.title}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{course.faculty}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{course.department}</td>
                  <td className="px-4 py-4 text-sm text-[#DDD]">{course.level}</td>
                  <td className="px-4 py-4 text-sm text-[#DDD]">{course.paperCount}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{course.lastUpdated}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={selectedItems.includes(course.id)}
                onChange={() => toggleSelect(course.id)}
                className="w-5 h-5 accent-[#4F46E5] mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-semibold text-[#4F46E5]">{course.code}</span>
                  <span className="px-2 py-0.5 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium rounded-full">
                    {course.paperCount} papers
                  </span>
                </div>
                <div className="text-sm text-[#E5E5E5] mb-2">{course.title}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs text-[#AAA]">{course.faculty}</span>
                  <span className="text-xs text-[#666]">•</span>
                  <span className="text-xs text-[#AAA]">{course.department}</span>
                  <span className="text-xs text-[#666]">•</span>
                  <span className="text-xs text-[#AAA]">Level {course.level}</span>
                </div>
                <div className="text-xs text-[#666]">Updated: {course.lastUpdated}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-[#2A2A2F]">
              <button className="flex-1 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                Edit
              </button>
              <button className="w-10 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center justify-center">
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-[#1A1A1F] rounded-2xl border border-[#2A2A2F] shadow-2xl"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2F]">
                  <h2 className="text-xl font-semibold text-[#E5E5E5]">Add New Course</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Course Code</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g., PHY 301"
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Level</label>
                      <input
                        type="text"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        placeholder="e.g., 300"
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Course Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Quantum Mechanics I"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Faculty</label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="e.g., Science"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., Physics"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#2A2A2F] flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-11 border border-[#333] text-[#AAA] rounded-xl font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 h-11 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" strokeWidth={2} />
                    Add Course
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
