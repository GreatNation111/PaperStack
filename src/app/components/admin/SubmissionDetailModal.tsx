import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, CheckCircle, XCircle, Edit3, Calendar, User, FileText, AlertCircle } from 'lucide-react';

interface SubmissionDetailModalProps {
  submissionId: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function SubmissionDetailModal({
  submissionId,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: SubmissionDetailModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Mock data
  const submission = {
    id: submissionId,
    courseCode: 'PHY 301',
    courseTitle: 'Quantum Mechanics I',
    year: '2023/2024',
    semester: 'Second Semester',
    examType: 'Final Exam',
    uploadedBy: 'Admin: Chidi Okafor',
    uploadDate: 'January 15, 2025 at 2:30 PM',
    type: 'text',
    content: `UNIVERSITY OF LAGOS
FACULTY OF SCIENCE
DEPARTMENT OF PHYSICS

PHY 301: Quantum Mechanics I
Second Semester Examination, 2023/2024
Time Allowed: 3 Hours

INSTRUCTION: Answer THREE questions only. All questions carry equal marks.

SECTION A

1. (a) State and explain the Heisenberg Uncertainty Principle. [5 marks]
   (b) A particle is confined to a one-dimensional box of length L. Derive the expression for the allowed energy levels. [10 marks]
   (c) Calculate the energy difference between the first and second excited states for an electron in a box of length 1 nm. [5 marks]

2. (a) What is wave-particle duality? Discuss its significance in quantum mechanics. [6 marks]
   (b) Derive the de Broglie wavelength for a particle of mass m moving with velocity v. [8 marks]
   (c) An electron is accelerated through a potential difference of 100V. Calculate its de Broglie wavelength. [6 marks]

SECTION B

3. (a) Explain the concept of quantum superposition with suitable examples. [7 marks]
   (b) Write down the time-independent Schrödinger equation and explain each term. [8 marks]
   (c) Solve the Schrödinger equation for a free particle. [5 marks]

4. (a) Discuss the physical significance of the wavefunction ψ(x,t). [6 marks]
   (b) State and prove the normalization condition for wavefunctions. [9 marks]
   (c) Given ψ(x) = A exp(-x²/2a²), find the normalization constant A. [5 marks]`,
  };

  const handleApprove = () => {
    onApprove(submissionId);
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(submissionId, rejectReason);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-0 lg:p-8 lg:items-center overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full lg:max-w-4xl bg-[#1A1A1F] lg:rounded-2xl shadow-2xl border-0 lg:border lg:border-[#2A2A2F] min-h-screen lg:min-h-0 lg:max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2F] flex-shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-[#E5E5E5]">Review Submission</h2>
                  <p className="text-sm text-[#AAA] mt-1">ID: #{submissionId}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#0F1115] border border-[#2A2A2F] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.5} />
                      <span className="text-xs text-[#AAA]">Course</span>
                    </div>
                    <div className="text-sm font-medium text-[#E5E5E5]">{submission.courseCode}</div>
                    <div className="text-xs text-[#AAA]">{submission.courseTitle}</div>
                  </div>

                  <div className="bg-[#0F1115] border border-[#2A2A2F] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#0D9488]" strokeWidth={1.5} />
                      <span className="text-xs text-[#AAA]">Academic Year</span>
                    </div>
                    <div className="text-sm font-medium text-[#E5E5E5]">{submission.year}</div>
                    <div className="text-xs text-[#AAA]">{submission.semester}</div>
                  </div>

                  <div className="bg-[#0F1115] border border-[#2A2A2F] rounded-xl p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />
                      <span className="text-xs text-[#AAA]">Uploaded By</span>
                    </div>
                    <div className="text-sm font-medium text-[#E5E5E5]">{submission.uploadedBy}</div>
                    <div className="text-xs text-[#AAA]">{submission.uploadDate}</div>
                  </div>
                </div>

                {/* Zoom Controls - Desktop only */}
                <div className="hidden lg:flex items-center justify-between bg-[#0F1115] border border-[#2A2A2F] rounded-xl px-4 py-3">
                  <span className="text-sm text-[#AAA]">Content Preview</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span className="text-sm text-[#DDD] w-12 text-center">{zoom}%</span>
                    <button
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Content Display */}
                <div className="bg-[#0F1115] border border-[#2A2A2F] rounded-xl p-6 lg:p-8">
                  <div
                    className="text-[#DDD] font-[Merriweather,Georgia,serif] leading-relaxed whitespace-pre-wrap"
                    style={{ fontSize: `${zoom}%` }}
                  >
                    {submission.content}
                  </div>
                </div>

                {/* Reject Form */}
                {showRejectForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-[#E5E5E5] mb-1">Reject Submission</h3>
                        <p className="text-sm text-[#AAA]">
                          Provide a reason for rejection. This will help maintain quality standards.
                        </p>
                      </div>
                    </div>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g., Poor image quality, incomplete content, duplicate submission..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#EF4444] transition-colors resize-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-[#2A2A2F] flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {!showRejectForm ? (
                    <>
                      <button
                        onClick={handleApprove}
                        className="flex-1 h-12 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" strokeWidth={2} />
                        Approve Submission
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="flex-1 h-12 border-2 border-[#EF4444] text-[#EF4444] rounded-xl font-medium hover:bg-[#EF4444]/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" strokeWidth={2} />
                        Reject
                      </button>
                      <button className="w-full sm:w-12 h-12 border border-[#333] text-[#AAA] rounded-xl hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-2">
                        <Edit3 className="w-5 h-5" strokeWidth={1.5} />
                        <span className="sm:hidden">Edit Metadata</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                        className="flex-1 h-12 border border-[#333] text-[#AAA] rounded-xl font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                        className="flex-1 h-12 bg-[#EF4444] text-white rounded-xl font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" strokeWidth={2} />
                        Confirm Rejection
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
