import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Send, Edit3, Trash2, Eye, Calendar, Users, Bell, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  target: 'global' | 'department' | 'course';
  targetName?: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  sentDate?: string;
  views?: number;
}

export function NotificationsManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'global' | 'department' | 'course'>('global');
  const [targetName, setTargetName] = useState('');

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Past Questions Available - Physics Department',
      body: 'PHY 301, PHY 401, and PHY 501 past questions for 2023/2024 session are now live.',
      target: 'department',
      targetName: 'Physics',
      status: 'sent',
      sentDate: 'Jan 15, 2025',
      views: 234,
    },
    {
      id: '2',
      title: 'Platform Maintenance Scheduled',
      body: 'PaperStack will undergo scheduled maintenance on January 20th from 2:00 AM to 4:00 AM.',
      target: 'global',
      status: 'scheduled',
      scheduledDate: 'Jan 18, 2025',
    },
    {
      id: '3',
      title: 'Exam Preparation Tips',
      body: 'New study guides and exam strategies now available in the Library section.',
      target: 'global',
      status: 'draft',
    },
  ];

  const handleCreate = () => {
    console.log('Creating notification:', { title, body, target, targetName });
    setShowCreateForm(false);
    setTitle('');
    setBody('');
    setTarget('global');
    setTargetName('');
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Notifications Manager</h1>
          <p className="text-sm text-[#AAA]">Create and manage announcements for students</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="h-11 px-4 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">New Notification</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[#E5E5E5] mb-6">Create Notification</h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#DDD] mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New Past Questions Available"
                className="w-full h-12 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-[#DDD] mb-2">Message Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement message here..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors resize-none"
              />
              <p className="text-xs text-[#666] mt-2">{body.length} / 500 characters</p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-[#DDD] mb-3">Target Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setTarget('global')}
                  className={`h-20 rounded-xl border-2 transition-all ${
                    target === 'global'
                      ? 'border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]'
                      : 'border-[#333] text-[#AAA] hover:border-[#444]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">All Students</span>
                  </div>
                </button>

                <button
                  onClick={() => setTarget('department')}
                  className={`h-20 rounded-xl border-2 transition-all ${
                    target === 'department'
                      ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                      : 'border-[#333] text-[#AAA] hover:border-[#444]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Bell className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Department</span>
                  </div>
                </button>

                <button
                  onClick={() => setTarget('course')}
                  className={`h-20 rounded-xl border-2 transition-all ${
                    target === 'course'
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                      : 'border-[#333] text-[#AAA] hover:border-[#444]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Specific Course</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Specific Target Name */}
            {target !== 'global' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-medium text-[#DDD] mb-2">
                  {target === 'department' ? 'Select Department' : 'Select Course'}
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder={target === 'department' ? 'e.g., Physics' : 'e.g., PHY 301'}
                  className="w-full h-12 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleCreate}
                className="flex-1 h-12 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" strokeWidth={2} />
                Send Now
              </button>
              <button className="flex-1 h-12 border border-[#333] text-[#AAA] rounded-xl font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" strokeWidth={1.5} />
                Schedule
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setTitle('');
                  setBody('');
                }}
                className="sm:w-auto h-12 px-4 border border-[#333] text-[#AAA] rounded-xl font-medium hover:border-[#E5E5E5] hover:text-[#E5E5E5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-5 hover:border-[#333] transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      notification.status === 'sent'
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : notification.status === 'scheduled'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : 'bg-[#666]/10 text-[#AAA]'
                    }`}
                  >
                    {notification.status === 'sent' && <CheckCircle className="w-3 h-3 inline mr-1" strokeWidth={2} />}
                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      notification.target === 'global'
                        ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                        : notification.target === 'department'
                        ? 'bg-[#0D9488]/10 text-[#0D9488]'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}
                  >
                    {notification.target === 'global'
                      ? 'All Students'
                      : `${notification.target === 'department' ? 'Dept' : 'Course'}: ${notification.targetName}`}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#E5E5E5] mb-2">{notification.title}</h3>
                <p className="text-sm text-[#AAA] mb-3 leading-relaxed">{notification.body}</p>

                <div className="flex flex-wrap gap-4 text-xs text-[#666]">
                  {notification.sentDate && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" strokeWidth={2} />
                      Sent: {notification.sentDate}
                    </span>
                  )}
                  {notification.scheduledDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={2} />
                      Scheduled: {notification.scheduledDate}
                    </span>
                  )}
                  {notification.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" strokeWidth={2} />
                      {notification.views} views
                    </span>
                  )}
                </div>
              </div>

              <div className="flex lg:flex-col gap-2 lg:items-end">
                <button className="h-9 px-3 border border-[#333] text-[#AAA] rounded-lg hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                {notification.status === 'draft' && (
                  <button className="h-9 px-3 border border-[#333] text-[#AAA] rounded-lg hover:border-[#0D9488] hover:text-[#0D9488] transition-colors flex items-center gap-2 text-sm">
                    <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
                <button className="h-9 px-3 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
