import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit3, Trash2, X, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments } from '@/hooks/useData';

interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  level: string; // e.g., '100L'
  semester: string; // 'First' | 'Second'
  lecturer?: string;
  driveFolderUrl: string;
  papers: number;
  lastUpdated?: any;
}

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { departments } = useDepartments();

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    departmentId: '',
    level: '',
    semester: 'First',
    lecturer: '',
    driveFolderUrl: '',
    papers: 0
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Courses Real-time
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      setCourses(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching courses:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      code: '',
      title: '',
      departmentId: '', // Default empty, user must select
      level: '',
      semester: 'First',
      lecturer: '',
      driveFolderUrl: '',
      papers: 0
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setFormData({
      code: course.code,
      title: course.title,
      departmentId: course.departmentId,
      level: course.level,
      semester: course.semester || 'First',
      lecturer: course.lecturer || '',
      driveFolderUrl: course.driveFolderUrl || '',
      papers: course.papers || 0
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError('');

    // Validation
    if (!formData.code || !formData.title || !formData.departmentId || !formData.level) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!formData.driveFolderUrl || !formData.driveFolderUrl.startsWith('http')) {
      setFormError('A valid Drive Folder URL (starting with http) is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        lastUpdated: serverTimestamp()
      };

      if (isEditing && editingId) {
        // For editing, we keep the existing ID
        await updateDoc(doc(db, 'courses', editingId), {
          ...payload,
          id: editingId // Ensure ID field stays in sync
        });
      } else {
        // Create custom readable ID (e.g. 'BUS 101' -> 'bus101')
        const customId = formData.code.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Save with custom ID and include id field in body
        await setDoc(doc(db, 'courses', customId), {
          ...payload,
          id: customId,
          papers: formData.papers || 0
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving course:", err);
      setFormError('Failed to save course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err) {
        console.error("Error deleting course:", err);
        alert("Failed to delete course.");
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || id;

  if (loading) return <div className="p-8 text-[#AAA]">Loading courses...</div>;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Courses Management</h1>
          <p className="text-sm text-[#AAA]">{courses.length} courses in database</p>
        </div>
        <button
          onClick={handleOpenAdd}
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
            placeholder="Search by course code, title..."
            className="w-full h-12 pl-10 pr-4 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Code</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Title</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Level</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Drive Link</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {filteredCourses.map((course, index) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#222227] transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-medium text-[#4F46E5]">{course.code}</td>
                  <td className="px-4 py-4 text-sm text-[#E5E5E5]">{course.title}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{getDepartmentName(course.departmentId)}</td>
                  <td className="px-4 py-4 text-sm text-[#DDD]">{course.level}</td>
                  <td className="px-4 py-4 text-sm text-[#4F46E5]">
                    {course.driveFolderUrl && (
                      <a href={course.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="w-8 h-8 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      >
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
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-base font-semibold text-[#4F46E5] block">{course.code}</span>
                <span className="text-sm text-[#E5E5E5] block">{course.title}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-[#2A2A2F] rounded text-[#AAA]">{course.level}</span>
            </div>
            <div className="text-xs text-[#AAA] mb-3">
              {getDepartmentName(course.departmentId)} • {course.semester} Semester
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2A2F]">
              <button
                onClick={() => handleOpenEdit(course)}
                className="flex-1 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="w-10 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-[#1A1A1F] rounded-2xl border border-[#2A2A2F] shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2F]">
                  <h2 className="text-xl font-semibold text-[#E5E5E5]">
                    {isEditing ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Code *</label>
                      <input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. PHY 101"
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Level *</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="">Select Level</option>
                        <option value="100L">100L</option>
                        <option value="200L">200L</option>
                        <option value="300L">300L</option>
                        <option value="400L">400L</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Title *</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. General Physics I"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Department *</label>
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="">Select Dept</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Paper Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.papers}
                        onChange={(e) => setFormData({ ...formData, papers: parseInt(e.target.value) || 0 })}
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Lecturer</label>
                      <input
                        value={formData.lecturer}
                        onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                        placeholder="Optional"
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">
                      Drive Folder URL * <span className="text-xs text-[#AAA] font-normal">(Required)</span>
                    </label>
                    <input
                      value={formData.driveFolderUrl}
                      onChange={(e) => setFormData({ ...formData, driveFolderUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#2A2A2F] flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isSaving}
                    className="flex-1 h-11 border border-[#333] text-[#AAA] rounded-xl font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 h-11 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" strokeWidth={2} />}
                    {isEditing ? 'Save Changes' : 'Add Course'}
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
