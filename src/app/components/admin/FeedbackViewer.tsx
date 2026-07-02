import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Mail, MessageSquareText, Search, Star, UserRound } from 'lucide-react';
import { StudentFeedback, useStudentFeedbackResponses } from '@/hooks/useData';

function formatDate(timestamp: any) {
  if (!timestamp) return 'No date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getAvatarSrc(avatar?: string) {
  if (!avatar) return '';
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(avatar)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || 'S';
}

function matchesSearch(item: StudentFeedback, query: string) {
  const text = [
    item.userName,
    item.userEmail,
    item.departmentName,
    item.level,
    item.message,
    item.contextPath
  ].join(' ').toLowerCase();

  return text.includes(query.toLowerCase());
}

export function FeedbackViewer() {
  const { feedback, loading } = useStudentFeedbackResponses();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedback = useMemo(() => {
    return feedback.filter(item => matchesSearch(item, searchQuery));
  }, [feedback, searchQuery]);

  const averageRating = feedback.length
    ? feedback.reduce((total, item) => total + Number(item.rating || 0), 0) / feedback.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedback.filter(item => Number(item.rating) === rating).length
  }));

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold text-[#E5E5E5]">Student Feedback</h1>
        <p className="text-sm text-[#AAA]">Ratings and messages students send from the in-app feedback prompt.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#2A2A2F] bg-[#1A1A1F] p-5">
          <div className="mb-1 text-sm text-[#AAA]">Responses</div>
          <div className="text-2xl font-semibold text-[#E5E5E5]">{feedback.length}</div>
        </div>
        <div className="rounded-xl border border-[#2A2A2F] bg-[#1A1A1F] p-5">
          <div className="mb-1 text-sm text-[#AAA]">Average Rating</div>
          <div className="flex items-center gap-2 text-2xl font-semibold text-[#E5E5E5]">
            {averageRating ? averageRating.toFixed(1) : '0.0'}
            <Star className="h-5 w-5 text-amber-400" fill="currentColor" />
          </div>
        </div>
        <div className="rounded-xl border border-[#2A2A2F] bg-[#1A1A1F] p-5">
          <div className="mb-3 text-sm text-[#AAA]">Rating Breakdown</div>
          <div className="space-y-2">
            {distribution.map(item => {
              const width = feedback.length ? Math.round((item.count / feedback.length) * 100) : 0;
              return (
                <div key={item.rating} className="flex items-center gap-2 text-xs text-[#AAA]">
                  <span className="w-5 font-semibold text-[#E5E5E5]">{item.rating}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#333]">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
                  </div>
                  <span className="w-6 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#2A2A2F] bg-[#1A1A1F] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#666]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by student, email, department, or message..."
            className="h-11 w-full rounded-lg border border-[#333] bg-[#0F1115] pl-10 pr-4 text-[#E5E5E5] placeholder:text-[#666] transition-colors focus:border-[#4F46E5] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#2A2A2F] bg-[#1A1A1F]">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-[#666]">Loading feedback...</div>
        ) : filteredFeedback.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#666]">No feedback found.</div>
        ) : (
          <div className="divide-y divide-[#2A2A2F]">
            {filteredFeedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 transition-colors hover:bg-[#202026]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4F46E5]/15 text-sm font-black uppercase text-[#A5B4FC]">
                      {getAvatarSrc(item.userAvatar) ? (
                        <img src={getAvatarSrc(item.userAvatar)} alt={item.userName} className="h-full w-full object-cover" />
                      ) : (
                        getInitial(item.userName)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-[#E5E5E5]">{item.userName || 'Student'}</h2>
                        <div className="flex items-center gap-0.5 rounded-full bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className="h-3.5 w-3.5"
                              fill={starIndex < Number(item.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#AAA]">
                        {item.userEmail && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {item.userEmail}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          {[item.departmentName || item.departmentId || 'No department', item.level || 'No level'].join(' - ')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#2A2A2F] bg-[#111116] p-4 text-sm leading-6 text-[#D4D4D8]">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777]">
                          <MessageSquareText className="h-4 w-4" />
                          Message
                        </div>
                        {item.message || 'No message added.'}
                      </div>
                    </div>
                  </div>
                  {item.contextPath && (
                    <div className="shrink-0 rounded-full border border-[#333] px-3 py-1 text-xs font-semibold text-[#AAA]">
                      {item.contextPath}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
