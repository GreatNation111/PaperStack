import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Trash2, X, CheckCircle, Loader2, Link as LinkIcon, File as FileIcon, Edit3, Eye } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generatePdfThumbnail, validatePdfFile, MAX_PDF_SIZE_LABEL } from '@/utils/pdfThumbnail';

interface Paper {
  id: string;
  title: string;
  code: string;
  year: string;
  semester: string;
  type: string;
  pdfUrl?: string;
  richTextContent?: string;
  thumbnailUrl?: string;
  downloads: number;
  courseId?: string;
  departmentId?: string;
}

interface CoursePapersManagerProps {
  courseId: string;
  courseCode: string;
  departmentId: string;
  onClose: () => void;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote'],
    [{ align: [] }],
    ['clean'],
  ],
};

export function CoursePapersManager({ courseId, courseCode, departmentId, onClose }: CoursePapersManagerProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [uploadMode, setUploadMode] = useState<'pdf' | 'richtext'>('pdf');
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    semester: 'First',
    type: 'Exam',
    title: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [richText, setRichText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'papers'), where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Paper));
      setPapers(docs);
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [courseId]);

  const resetForm = () => {
    setEditingPaper(null);
    setFormData({ year: new Date().getFullYear().toString(), semester: 'First', type: 'Exam', title: '' });
    setSelectedFile(null);
    setRichText('');
    setUploadProgress(0);
    setFormError('');
    setStatusMsg('');
    setUploadMode('pdf');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      year: paper.year || '',
      semester: paper.semester || 'First',
      type: paper.type || 'Exam',
      title: paper.title || ''
    });
    setUploadMode(paper.richTextContent ? 'richtext' : 'pdf');
    setRichText(paper.richTextContent || '');
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError('');
    setStatusMsg('');
    setShowForm(true);
  };

  /**
   * Uploads a file to Firebase Storage with progress tracking.
   * Returns the download URL.
   */
  const uploadFileToStorage = async (file: File, storagePath: string): Promise<string> => {
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSave = async () => {
    setFormError('');
    setStatusMsg('');

    if (!formData.year || !formData.type) {
      setFormError('Please fill in required fields (Year, Type).');
      return;
    }

    // For NEW papers, content is required
    if (!editingPaper) {
      if (uploadMode === 'pdf' && !selectedFile) {
        setFormError('Please select a PDF file.');
        return;
      }
      if (uploadMode === 'richtext' && (!richText || richText === '<p><br></p>')) {
        setFormError('Please enter the paper content.');
        return;
      }
    }

    // Validate PDF if selected
    if (selectedFile) {
      const validationError = validatePdfFile(selectedFile);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    setIsSaving(true);
    try {
      let pdfUrl = editingPaper?.pdfUrl || '';
      let thumbnailUrl = editingPaper?.thumbnailUrl || '';

      // Handle PDF upload (new or replacement)
      if (uploadMode === 'pdf' && selectedFile) {
        setStatusMsg('Uploading PDF...');

        // Delete old PDF from storage if replacing
        if (editingPaper?.pdfUrl && editingPaper.pdfUrl.includes('firebasestorage')) {
          try {
            await deleteObject(ref(storage, editingPaper.pdfUrl));
          } catch (e) {
            console.warn('Could not delete old PDF:', e);
          }
        }
        // Delete old thumbnail if replacing
        if (editingPaper?.thumbnailUrl && editingPaper.thumbnailUrl.includes('firebasestorage')) {
          try {
            await deleteObject(ref(storage, editingPaper.thumbnailUrl));
          } catch (e) {
            console.warn('Could not delete old thumbnail:', e);
          }
        }

        pdfUrl = await uploadFileToStorage(
          selectedFile,
          `papers/${courseId}/${Date.now()}_${selectedFile.name}`
        );

        // Generate and upload thumbnail
        setStatusMsg('Generating thumbnail...');
        try {
          const thumbBlob = await generatePdfThumbnail(selectedFile);
          const thumbFile = new File([thumbBlob], `thumb_${Date.now()}.png`, { type: 'image/png' });
          thumbnailUrl = await uploadFileToStorage(
            thumbFile,
            `papers/${courseId}/thumbnails/${Date.now()}_thumb.png`
          );
        } catch (thumbErr) {
          console.warn('Thumbnail generation failed (non-critical):', thumbErr);
          // Continue without thumbnail — not a blocking error
        }
      }

      const paperTitle = formData.title || `${courseCode} ${formData.type} ${formData.year}`;

      const payload: Record<string, any> = {
        title: paperTitle,
        code: courseCode,
        courseId,
        departmentId,
        year: formData.year,
        semester: formData.semester,
        type: formData.type,
        lastUpdated: serverTimestamp(),
      };

      if (uploadMode === 'pdf') {
        if (pdfUrl) payload.pdfUrl = pdfUrl;
        if (thumbnailUrl) payload.thumbnailUrl = thumbnailUrl;
        // Clear rich text if switching to PDF
        payload.richTextContent = '';
      } else {
        payload.richTextContent = richText;
        // Clear PDF fields if switching to rich text
        payload.pdfUrl = '';
        payload.thumbnailUrl = '';
      }

      setStatusMsg('Saving to database...');

      if (editingPaper) {
        await updateDoc(doc(db, 'papers', editingPaper.id), payload);
      } else {
        payload.downloads = 0;
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'papers'), payload);
      }

      setShowForm(false);
      resetForm();
      fetchPapers();
    } catch (err) {
      console.error('Error saving paper:', err);
      setFormError('Failed to save paper. Please try again.');
    } finally {
      setIsSaving(false);
      setStatusMsg('');
    }
  };

  const handleDelete = async (paper: Paper) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    try {
      // Delete PDF from storage
      if (paper.pdfUrl && paper.pdfUrl.includes('firebasestorage')) {
        try {
          await deleteObject(ref(storage, paper.pdfUrl));
        } catch (e) {
          console.warn('Could not delete PDF from storage:', e);
        }
      }
      // Delete thumbnail from storage
      if (paper.thumbnailUrl && paper.thumbnailUrl.includes('firebasestorage')) {
        try {
          await deleteObject(ref(storage, paper.thumbnailUrl));
        } catch (e) {
          console.warn('Could not delete thumbnail from storage:', e);
        }
      }
      await deleteDoc(doc(db, 'papers', paper.id));
      setPapers(prev => prev.filter(p => p.id !== paper.id));
    } catch (err) {
      console.error('Error deleting paper:', err);
      alert('Failed to delete paper.');
    }
  };

  const isEditing = !!editingPaper;

  return (
    <div className="flex flex-col h-full bg-[#1A1A1F] text-[#E5E5E5]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2F]">
        <div>
          <h2 className="text-xl font-semibold">Manage Papers</h2>
          <p className="text-sm text-[#AAA]">{courseCode} — {papers.length} paper{papers.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Existing Papers</h3>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Add Paper
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-[#AAA]"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading papers...</div>
              ) : papers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#2A2A2F] rounded-xl text-[#AAA]">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No papers found for this course.</p>
                  <p className="text-xs mt-1 text-[#666]">Click "Add Paper" to upload a PDF or create a native document.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {papers.map(paper => (
                    <div key={paper.id} className="flex items-center justify-between p-4 border border-[#2A2A2F] rounded-xl bg-[#222227]/50 hover:bg-[#222227] transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail or icon */}
                        <div className="w-12 h-14 rounded-lg bg-[#1A1A1F] border border-[#333] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {paper.thumbnailUrl ? (
                            <img src={paper.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : paper.richTextContent ? (
                            <FileText className="w-5 h-5 text-blue-400" />
                          ) : paper.pdfUrl ? (
                            <FileIcon className="w-5 h-5 text-red-400" />
                          ) : (
                            <LinkIcon className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#E5E5E5]">{paper.title}</h4>
                          <p className="text-xs text-[#AAA] mt-0.5">
                            {paper.year} • {paper.semester} • {paper.type}
                            {paper.richTextContent ? ' • Native Doc' : paper.pdfUrl ? ' • PDF' : ' • Legacy Link'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Preview */}
                        {paper.pdfUrl && (
                          <button
                            onClick={() => window.open(paper.pdfUrl, '_blank')}
                            className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#333]/50 rounded-lg transition-colors"
                            title="Preview PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(paper)}
                          className="w-8 h-8 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                          title="Edit Paper"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(paper)}
                          className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{isEditing ? 'Edit Paper' : 'Add New Paper'}</h3>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2 border border-[#333] text-[#AAA] rounded-lg text-sm font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                {/* Mode Selector */}
                <div className="flex p-1 bg-[#0F1115] border border-[#2A2A2F] rounded-xl">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'pdf' ? 'bg-[#2A2A2F] text-white' : 'text-[#888] hover:text-[#DDD]'}`}
                    onClick={() => setUploadMode('pdf')}
                  >
                    Upload PDF
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'richtext' ? 'bg-[#2A2A2F] text-white' : 'text-[#888] hover:text-[#DDD]'}`}
                    onClick={() => setUploadMode('richtext')}
                  >
                    Native Document
                  </button>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Year *</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                    >
                      <option value="Exam">Exam</option>
                      <option value="Test">Test</option>
                      <option value="Assignment">Assignment</option>
                    </select>
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
                    <label className="block text-sm font-medium text-[#DDD] mb-2">Custom Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Auto-generated if blank"
                      className="w-full h-11 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="pt-2 border-t border-[#2A2A2F]">
                  {uploadMode === 'pdf' ? (
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">
                        PDF File {!isEditing && '*'}{' '}
                        <span className="text-xs text-[#888] font-normal">Max {MAX_PDF_SIZE_LABEL}</span>
                      </label>
                      {isEditing && editingPaper?.pdfUrl && !selectedFile && (
                        <div className="mb-3 p-3 bg-[#0F1115] border border-[#333] rounded-xl flex items-center gap-3">
                          {editingPaper.thumbnailUrl ? (
                            <img src={editingPaper.thumbnailUrl} alt="" className="w-10 h-12 object-cover rounded border border-[#333]" />
                          ) : (
                            <FileIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#DDD] truncate">Current PDF uploaded</p>
                            <p className="text-xs text-[#888]">Select a new file below to replace it</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-[#AAA] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4F46E5]/10 file:text-[#4F46E5] hover:file:bg-[#4F46E5]/20 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-[#DDD] mb-2">Document Content {!isEditing && '*'}</label>
                      <div className="bg-white rounded-xl overflow-hidden text-black pb-10" style={{ minHeight: '300px' }}>
                        <ReactQuill
                          theme="snow"
                          value={richText}
                          onChange={setRichText}
                          modules={quillModules}
                          style={{ height: '250px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-11 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {statusMsg || (uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)` : 'Saving...')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" strokeWidth={2} />
                        {isEditing ? 'Save Changes' : 'Add Paper'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
