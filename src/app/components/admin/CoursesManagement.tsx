import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit3, Trash2, X, CheckCircle, Loader2, BookOpen } from 'lucide-react';
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
  setDoc,
  getDocs,
  where,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { clearCourseDataCaches, useDepartments } from '@/hooks/useData';
import { getPdfPageCount, validatePdfFile } from '@/utils/pdfThumbnail';
import { NativeDocumentEditor } from './NativeDocumentEditor';
import { buildCourseCodeSuggestions, courseIdFromCode, findDuplicatePaper, normalizeCourseCode } from '@/utils/courseAdmin';
import { createPdfFromImageFiles } from '@/utils/imageToPdf';

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

interface CoursePaper {
  id: string;
  year?: string;
  pdfUrl?: string;
  richTextContent?: string;
  pageCount?: number;
  courseId?: string;
}

interface CourseFormData {
  code: string;
  title: string;
  departmentId: string;
  level: string;
  semester: string;
  lecturer: string;
  driveFolderUrl: string;
  papers: number | '';
}

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { departments } = useDepartments();

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [attachedPaperId, setAttachedPaperId] = useState<string | null>(null);
  const [paperYear, setPaperYear] = useState('');
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    title: '',
    departmentId: '',
    level: '',
    semester: 'First',
    lecturer: '',
    driveFolderUrl: '',
    papers: 1
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<'pdf' | 'richtext'>('pdf');
  const [richText, setRichText] = useState('');
  const [isReadingPdfCount, setIsReadingPdfCount] = useState(false);
  const [attachedPdfPageCount, setAttachedPdfPageCount] = useState<number | null>(null);

  // Fetch Courses Real-time
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadCoursesWithCounts = async () => {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course));

        try {
          const papersSnap = await getDocs(collection(db, 'papers'));
          const pageCountsByCourse = papersSnap.docs.reduce<Record<string, number>>((counts, paperDoc) => {
            const data = paperDoc.data() as any;
            const courseId = data.courseId;
            const pageCount = Number(data.pageCount || 0);
            if (courseId && pageCount > 0) counts[courseId] = Math.max(counts[courseId] || 0, pageCount);
            return counts;
          }, {});

          setCourses(fetched.map(course => ({
            ...course,
            papers: pageCountsByCourse[course.id] ?? course.papers ?? 0,
          })));
        } catch (countErr) {
          console.error('Error fetching course paper counts:', countErr);
          setCourses(fetched);
        } finally {
          setLoading(false);
        }
      };

      void loadCoursesWithCounts();
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
      papers: 1
    });
    setPaperFile(null);
    setAttachedPaperId(null);
    setPaperYear('');
    setFormError('');
    setUploadMode('pdf');
    setRichText('');
    setAttachedPdfPageCount(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (course: Course) => {
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
      papers: course.papers || 1
    });
    setPaperFile(null);
    setAttachedPaperId(null);
    setPaperYear('');
    setFormError('');
    setUploadMode('pdf');
    setRichText('');
    setAttachedPdfPageCount(null);
    setShowModal(true);

    try {
      const papersSnap = await getDocs(query(collection(db, 'papers'), where('courseId', '==', course.id)));
      const existingPaper = papersSnap.docs
        .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) } as CoursePaper))
        .find(paper => paper.richTextContent || paper.pdfUrl);

      if (existingPaper) {
        setAttachedPaperId(existingPaper.id);
        setPaperYear(existingPaper.year || '');
        setFormData(prev => ({ ...prev, papers: existingPaper.pageCount || course.papers || 1 }));
        if (existingPaper.richTextContent) {
          setUploadMode('richtext');
          setRichText(existingPaper.richTextContent);
        } else {
          setUploadMode('pdf');
        }
      }
    } catch (err) {
      console.error('Error loading existing course paper:', err);
    }
  };

  const handleSave = async () => {
    setFormError('');

    // Validation
    if (!formData.code || !formData.title || !formData.departmentId || !formData.level) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setIsSaving(true);
    try {
      const normalizedCode = normalizeCourseCode(formData.code);
      const payload = {
        ...formData,
        code: normalizedCode,
        lastUpdated: serverTimestamp()
      };

      let customId = editingId;

      if (isEditing && editingId) {
        // For editing, we keep the existing ID
        await updateDoc(doc(db, 'courses', editingId), {
          ...payload,
          id: editingId,
          papers: Number(formData.papers) || 1
        });
        const papersSnap = await getDocs(query(collection(db, 'papers'), where('courseId', '==', editingId)));
        if (!papersSnap.empty) {
          const batch = writeBatch(db);
          papersSnap.docs.forEach(paperDoc => {
            const data = paperDoc.data() as any;
            const titleWasGenerated = !data.title || data.title === `${data.code || data.courseCode || ''} Past Question`;
            batch.update(paperDoc.ref, {
              code: normalizedCode,
              departmentId: formData.departmentId,
              semester: formData.semester,
              pageCount: Number(formData.papers) || data.pageCount || null,
              ...(titleWasGenerated ? { title: `${normalizedCode} Past Question` } : {}),
              lastUpdated: serverTimestamp()
            });
          });
          await batch.commit();
        }
      } else {
        // Create custom readable ID (e.g. 'BUS 101' -> 'bus101')
        customId = courseIdFromCode(normalizedCode);

        // Save with custom ID and include id field in body
        await setDoc(doc(db, 'courses', customId), {
          ...payload,
          id: customId,
          papers: Number(formData.papers) || 1
        });
      }

      const paperPayload = {
        courseId: customId,
        departmentId: formData.departmentId,
        code: normalizedCode,
        title: `${normalizedCode} Past Question`,
        year: paperYear || new Date().getFullYear().toString(),
        semester: formData.semester,
        type: 'Exam',
        downloads: 0,
      };

      // If a paper was attached (PDF), upload and link it
      if (paperFile && customId) {
        const storageRef = ref(storage, `papers/${customId}/${Date.now()}_${paperFile.name}`);
        const snapshot = await uploadBytes(storageRef, paperFile);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        const nextPaperPayload = {
          ...paperPayload,
          pdfUrl: downloadUrl,
          pageCount: attachedPdfPageCount,
          richTextContent: '',
          createdAt: serverTimestamp()
        };

        const duplicate = await findDuplicatePaper({
          courseId: customId,
          year: nextPaperPayload.year,
          type: nextPaperPayload.type,
          semester: nextPaperPayload.semester,
          excludePaperId: attachedPaperId
        });
        const targetPaperId = attachedPaperId || duplicate?.id || null;
        if (duplicate && !attachedPaperId && !confirm('A paper already exists for this course, year, type, and semester. Overwrite it?')) {
          setIsSaving(false);
          return;
        }

        if (targetPaperId) {
          await updateDoc(doc(db, 'papers', targetPaperId), nextPaperPayload);
        } else {
          await addDoc(collection(db, 'papers'), nextPaperPayload);
        }
      }

      // If native doc was written, save it as a paper
      if (uploadMode === 'richtext' && richText && richText !== '<p><br></p>' && customId) {
        const nextPaperPayload = {
          ...paperPayload,
          richTextContent: richText,
          pdfUrl: '',
          createdAt: serverTimestamp()
        };

        const duplicate = await findDuplicatePaper({
          courseId: customId,
          year: nextPaperPayload.year,
          type: nextPaperPayload.type,
          semester: nextPaperPayload.semester,
          excludePaperId: attachedPaperId
        });
        const targetPaperId = attachedPaperId || duplicate?.id || null;
        if (duplicate && !attachedPaperId && !confirm('A paper already exists for this course, year, type, and semester. Overwrite it?')) {
          setIsSaving(false);
          return;
        }

        if (targetPaperId) {
          await updateDoc(doc(db, 'papers', targetPaperId), nextPaperPayload);
        } else {
          await addDoc(collection(db, 'papers'), nextPaperPayload);
        }
      }

      clearCourseDataCaches();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving course:", err);
      setFormError('Failed to save course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaperFileChange = async (files: FileList | File[] | null) => {
    const selectedFiles = Array.from(files || []);
    const firstFile = selectedFiles[0] || null;
    setPaperFile(null);
    setAttachedPdfPageCount(null);
    if (!firstFile) return;

    let file = firstFile;
    if (selectedFiles.every(selectedFile => selectedFile.type.startsWith('image/'))) {
      setIsReadingPdfCount(true);
      try {
        file = await createPdfFromImageFiles(selectedFiles, `${courseIdFromCode(formData.code || 'scanned-paper')}.pdf`);
        setPaperFile(file);
        setAttachedPdfPageCount(selectedFiles.length);
        setFormData(prev => ({ ...prev, papers: selectedFiles.length }));
        setFormError('');
      } catch (err) {
        console.error('Could not create PDF from scanned images:', err);
        setFormError('Could not convert the scanned images to PDF.');
      } finally {
        setIsReadingPdfCount(false);
      }
      return;
    }

    setPaperFile(file);

    const validationError = validatePdfFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsReadingPdfCount(true);
    try {
      const pageCount = await getPdfPageCount(file);
      setAttachedPdfPageCount(pageCount);
      setFormData(prev => ({ ...prev, papers: pageCount }));
      setFormError('');
    } catch (err) {
      console.error('Could not read PDF page count:', err);
      setAttachedPdfPageCount(null);
      setFormError('PDF selected, but the page count could not be read automatically. You can still edit the paper count manually.');
    } finally {
      setIsReadingPdfCount(false);
    }
  };

  const uploadNativeDocumentImage = async (file: File): Promise<string> => {
    const courseKey = editingId || formData.code.toLowerCase().replace(/[^a-z0-9]/g, '') || 'draft-native-docs';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `papers/${courseKey}/native-images/${Date.now()}_${safeName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
        clearCourseDataCaches();
      } catch (err) {
        console.error("Error deleting course:", err);
        alert("Failed to delete course.");
      }
    }
  };

  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || id;

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDepartmentName(c.departmentId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCodeChange = (value: string) => {
    const suggestions = buildCourseCodeSuggestions(value, departments);
    setFormData(prev => ({
      ...prev,
      code: suggestions.normalizedCode,
      level: suggestions.level || prev.level,
      departmentId: suggestions.departmentId || prev.departmentId,
    }));
  };

  const groupedCourses = departments.map(dept => {
    const deptCourses = filteredCourses.filter(course => course.departmentId === dept.id);
    return {
      department: dept,
      courses: deptCourses,
      paperCount: courses
        .filter(course => course.departmentId === dept.id)
        .reduce((total, course) => total + (course.papers || 0), 0),
    };
  });
  const unknownDepartmentCourses = filteredCourses.filter(course => !departments.some(dept => dept.id === course.departmentId));

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

      {/* Department Groups */}
      <div className="space-y-4">
        {groupedCourses.map(({ department, courses: deptCourses, paperCount }) => (
          <section key={department.id} className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
            <div className="px-4 py-4 border-b border-[#2A2A2F] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-[#E5E5E5]">{department.name}</h2>
                <p className="text-xs text-[#AAA]">{deptCourses.length} course{deptCourses.length === 1 ? '' : 's'} shown - {paperCount} PDF page{paperCount === 1 ? '' : 's'} total</p>
              </div>
              <span className="text-xs px-2 py-1 bg-[#2A2A2F] rounded text-[#AAA] w-fit">{department.code || department.id}</span>
            </div>
            {deptCourses.length === 0 ? (
              <div className="px-4 py-8 text-sm text-[#777] flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                No matching courses in this department.
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2F]">
                {deptCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 hover:bg-[#222227] transition-colors flex flex-col lg:flex-row lg:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-[#4F46E5]">{course.code}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#2A2A2F] rounded text-[#AAA]">{course.level}</span>
                        <span className="text-xs text-[#777]">{course.semester} Semester</span>
                      </div>
                      <p className="text-sm text-[#E5E5E5] truncate">{course.title}</p>
                      <p className="text-xs text-[#AAA] mt-1">{course.papers || 0} PDF page{course.papers === 1 ? '' : 's'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                      <button onClick={() => handleOpenEdit(course)} className="h-9 px-3 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center gap-2 text-sm">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="w-9 h-9 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center justify-center" title="Delete course">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {unknownDepartmentCourses.length > 0 && (
        <section className="mt-4 bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
          <div className="px-4 py-4 border-b border-[#2A2A2F]">
            <h2 className="text-lg font-semibold text-[#E5E5E5]">Other Departments</h2>
            <p className="text-xs text-[#AAA]">Courses with department IDs not found in the departments list.</p>
          </div>
          <div className="divide-y divide-[#2A2A2F]">
            {unknownDepartmentCourses.map(course => (
              <div key={course.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#4F46E5]">{course.code}</p>
                  <p className="text-sm text-[#E5E5E5]">{course.title}</p>
                  <p className="text-xs text-[#AAA] mt-1">{getDepartmentName(course.departmentId)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(course)} className="h-9 px-3 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Card List */}
      <div className="hidden">
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
                className="w-full max-w-lg bg-[#1A1A1F] rounded-2xl border border-[#2A2A2F] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
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

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                        onChange={(e) => handleCodeChange(e.target.value)}
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
                      <label className="block text-sm font-medium text-[#DDD] mb-2">PDF Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.papers}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, papers: value === '' ? '' : Math.max(1, parseInt(value) || 1) });
                        }}
                        onBlur={() => setFormData(prev => ({ ...prev, papers: prev.papers === '' ? 1 : prev.papers }))}
                        className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                      />
                      {isReadingPdfCount && (
                        <p className="mt-1 text-xs text-[#888]">Reading PDF page count...</p>
                      )}
                      {!isReadingPdfCount && attachedPdfPageCount !== null && (
                        <p className="mt-1 text-xs text-[#888]">Selected PDF has {attachedPdfPageCount} page{attachedPdfPageCount === 1 ? '' : 's'}.</p>
                      )}
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
                      Scan or Choose Paper (Optional)
                    </label>
                    {/* Mode Tabs */}
                    <div className="flex p-1 bg-[#0F1115] border border-[#2A2A2F] rounded-xl mb-3">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'pdf' ? 'bg-[#2A2A2F] text-white' : 'text-[#888] hover:text-[#DDD]'}`}
                        onClick={() => setUploadMode('pdf')}
                      >
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'richtext' ? 'bg-[#2A2A2F] text-white' : 'text-[#888] hover:text-[#DDD]'}`}
                        onClick={() => setUploadMode('richtext')}
                      >
                        Native Document
                      </button>
                    </div>

                    {uploadMode === 'pdf' ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          multiple
                          capture="environment"
                          onChange={(e) => void handlePaperFileChange(e.target.files || null)}
                          className="w-full text-sm text-[#AAA] file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4F46E5]/10 file:text-[#4F46E5] hover:file:bg-[#4F46E5]/20 focus:outline-none"
                        />
                        <p className="text-xs text-[#888]">Choose a PDF or scan paper pages with your camera. Image scans are converted into one PDF before upload.</p>
                        <input
                          type="text"
                          placeholder="Year (e.g. 2023)"
                          value={paperYear}
                          onChange={(e) => setPaperYear(e.target.value)}
                          className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <NativeDocumentEditor
                          value={richText}
                          onChange={setRichText}
                          onUploadImage={uploadNativeDocumentImage}
                          onError={setFormError}
                        />
                        <input
                          type="text"
                          placeholder="Year (e.g. 2023)"
                          value={paperYear}
                          onChange={(e) => setPaperYear(e.target.value)}
                          className="w-full h-11 px-4 mt-8 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    )}
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
