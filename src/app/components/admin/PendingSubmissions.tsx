import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
} from 'lucide-react';

interface Submission {
  id: string;
  courseCode: string;
  courseTitle: string;
  year: string;
  uploadedBy: string;
  date: string;
  type: 'text' | 'image';
  preview: string;
  status: 'pending';
}

interface PendingSubmissionsProps {
  onViewDetail: (id: string) => void;
}

export function PendingSubmissions({ onViewDetail }: PendingSubmissionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'course'>('date');

  const submissions: Submission[] = [
    {
      id: '1',
      courseCode: 'PHY 301',
      courseTitle: 'Quantum Mechanics I',
      year: '2023/2024',
      uploadedBy: 'Admin: Chidi Okafor',
      date: 'Jan 15, 2025',
      type: 'text',
      preview: 'Section A: Answer all questions. 1. Define wave-particle duality...',
      status: 'pending',
    },
    {
      id: '2',
      courseCode: 'MTH 201',
      courseTitle: 'Mathematical Methods',
      year: '2023/2024',
      uploadedBy: 'Admin: Amina Bello',
      date: 'Jan 14, 2025',
      type: 'image',
      preview: 'Scanned exam paper - 4 pages',
      status: 'pending',
    },
    {
      id: '3',
      courseCode: 'CSC 401',
      courseTitle: 'Advanced Algorithms',
      year: '2022/2023',
      uploadedBy: 'Admin: Emeka Nwosu',
      date: 'Jan 14, 2025',
      type: 'text',
      preview: 'Part I: Multiple Choice. 1. What is the time complexity of...',
      status: 'pending',
    },
    {
      id: '4',
      courseCode: 'CHM 101',
      courseTitle: 'General Chemistry',
      year: '2024/2025',
      uploadedBy: 'Admin: Fatima Ibrahim',
      date: 'Jan 13, 2025',
      type: 'image',
      preview: 'Scanned exam paper - 6 pages',
      status: 'pending',
    },
  ];

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems((prev) => (prev.length === submissions.length ? [] : submissions.map((s) => s.id)));
  };

  const handleBulkApprove = () => {
    console.log('Bulk approve:', selectedItems);
    setSelectedItems([]);
  };

  const handleBulkReject = () => {
    console.log('Bulk reject:', selectedItems);
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Pending Reviews</h1>
        <p className="text-sm text-[#AAA]">{submissions.length} submissions awaiting moderation</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code, title, or uploader..."
              className="w-full h-11 pl-10 pr-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-5 h-5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>Sort: {sortBy === 'date' ? 'Date' : 'Course'}</span>
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-xl p-4 mb-4 flex items-center justify-between"
        >
          <span className="text-sm text-[#E5E5E5]">
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="h-10 px-4 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" strokeWidth={2} />
              Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="h-10 px-4 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626] transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" strokeWidth={2} />
              Reject
            </button>
          </div>
        </motion.div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === submissions.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#4F46E5]"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">ID</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Course</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Year</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Uploaded By</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Date</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Preview</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {submissions.map((submission, index) => (
                <motion.tr
                  key={submission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#222227] transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(submission.id)}
                      onChange={() => toggleSelect(submission.id)}
                      className="w-4 h-4 accent-[#4F46E5]"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">#{submission.id}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-[#E5E5E5]">{submission.courseCode}</div>
                    <div className="text-xs text-[#AAA]">{submission.courseTitle}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#DDD]">{submission.year}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{submission.uploadedBy}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{submission.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {submission.type === 'text' ? (
                        <FileText className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.5} />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-[#0D9488]" strokeWidth={1.5} />
                      )}
                      <span className="text-xs text-[#AAA] capitalize">{submission.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#666] max-w-xs truncate">{submission.preview}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewDetail(submission.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                        title="Approve (A)"
                      >
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                        title="Reject (R)"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={2} />
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
        {submissions.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={selectedItems.includes(submission.id)}
                onChange={() => toggleSelect(submission.id)}
                className="w-5 h-5 accent-[#4F46E5] mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-semibold text-[#E5E5E5]">{submission.courseCode}</span>
                  <span className="text-xs text-[#666]">#{submission.id}</span>
                </div>
                <div className="text-sm text-[#AAA] mb-2">{submission.courseTitle}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-[#0F1115] border border-[#333] rounded text-xs text-[#AAA]">
                    {submission.year}
                  </span>
                  <span className="px-2 py-1 bg-[#0F1115] border border-[#333] rounded text-xs text-[#AAA] flex items-center gap-1">
                    {submission.type === 'text' ? (
                      <FileText className="w-3 h-3" strokeWidth={1.5} />
                    ) : (
                      <ImageIcon className="w-3 h-3" strokeWidth={1.5} />
                    )}
                    {submission.type}
                  </span>
                </div>
                <div className="text-xs text-[#666] mb-3 line-clamp-2">{submission.preview}</div>
                <div className="text-xs text-[#666]">
                  {submission.uploadedBy} • {submission.date}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2A2F]">
              <button
                onClick={() => onViewDetail(submission.id)}
                className="flex-1 h-10 border border-[#4F46E5] text-[#4F46E5] rounded-lg font-medium hover:bg-[#4F46E5]/10 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                View
              </button>
              <button className="flex-1 h-10 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" strokeWidth={2} />
                Approve
              </button>
              <button className="w-10 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center justify-center">
                <XCircle className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Keyboard Shortcuts Hint - Desktop */}
      <div className="hidden lg:block mt-6">
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-4 py-3">
          <div className="flex items-center gap-6 text-xs text-[#666]">
            <span>Shortcuts:</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">A</kbd> Approve</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">R</kbd> Reject</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">V</kbd> View Details</span>
            <span><kbd className="px-2 py-1 bg-[#0F1115] rounded text-[#AAA]">⌘+A</kbd> Select All</span>
          </div>
        </div>
      </div>
    </div>
  );
}
