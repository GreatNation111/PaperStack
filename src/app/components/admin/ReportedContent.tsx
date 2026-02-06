import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Search, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';

interface Report {
  id: string;
  itemType: 'question' | 'comment';
  itemTitle: string;
  reason: string;
  reporter: string;
  reportDate: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export function ReportedContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

  const reports: Report[] = [
    {
      id: '1',
      itemType: 'question',
      itemTitle: 'PHY 301 - 2022/2023 Final Exam',
      reason: 'Duplicate content - already exists in database',
      reporter: 'Amina Bello',
      reportDate: 'Jan 15, 2025',
      status: 'pending',
    },
    {
      id: '2',
      itemType: 'question',
      itemTitle: 'MTH 201 - 2021/2022 Test',
      reason: 'Poor image quality - text illegible',
      reporter: 'Chidi Okafor',
      reportDate: 'Jan 14, 2025',
      status: 'pending',
    },
    {
      id: '3',
      itemType: 'question',
      itemTitle: 'CSC 401 - 2023/2024 Assignment',
      reason: 'Not an exam paper - assignment submitted by mistake',
      reporter: 'Emeka Nwosu',
      reportDate: 'Jan 13, 2025',
      status: 'resolved',
    },
    {
      id: '4',
      itemType: 'question',
      itemTitle: 'CHM 101 - 2020/2021 Exam',
      reason: 'Incomplete scan - missing last page',
      reporter: 'Fatima Ibrahim',
      reportDate: 'Jan 12, 2025',
      status: 'pending',
    },
  ];

  const filteredReports = reports.filter((report) =>
    statusFilter === 'all' ? true : report.status === statusFilter
  );

  const handleResolve = (id: string) => {
    console.log('Resolving report:', id);
  };

  const handleDismiss = (id: string) => {
    console.log('Dismissing report:', id);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Reported Content & Flags</h1>
        <p className="text-sm text-[#AAA]">
          {filteredReports.filter((r) => r.status === 'pending').length} pending reports
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item title or reason..."
              className="w-full h-11 pl-10 pr-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`h-11 px-4 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-[#F59E0B] text-white'
                  : 'bg-[#0F1115] border border-[#333] text-[#AAA] hover:border-[#F59E0B]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`h-11 px-4 rounded-lg font-medium transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#0F1115] border border-[#333] text-[#AAA] hover:border-[#10B981]'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`h-11 px-4 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-[#0F1115] border border-[#333] text-[#AAA] hover:border-[#4F46E5]'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Flagged Item</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Reason</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Reporter</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Date</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {filteredReports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#222227] transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-medium text-[#E5E5E5]">{report.itemTitle}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium rounded-full capitalize">
                      {report.itemType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#AAA] max-w-xs truncate">{report.reason}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{report.reporter}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{report.reportDate}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        report.status === 'pending'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          : report.status === 'resolved'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#666]/10 text-[#AAA]'
                      }`}
                    >
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolve(report.id)}
                            className="w-8 h-8 flex items-center justify-center text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </>
                      )}
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
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : report.status === 'resolved'
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : 'bg-[#666]/10 text-[#AAA]'
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                  <span className="px-2.5 py-1 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium rounded-full capitalize">
                    {report.itemType}
                  </span>
                </div>
                <div className="text-base font-semibold text-[#E5E5E5] mb-2">{report.itemTitle}</div>
                <div className="text-sm text-[#AAA] mb-3 leading-relaxed">{report.reason}</div>
                <div className="text-xs text-[#666]">
                  Reported by {report.reporter} • {report.reportDate}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2A2F]">
              <button className="flex-1 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                View
              </button>
              {report.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="flex-1 h-10 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    className="w-10 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#10B981]" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-[#E5E5E5] mb-2">All Clear!</h3>
          <p className="text-sm text-[#AAA]">No {statusFilter} reports to display</p>
        </div>
      )}
    </div>
  );
}
