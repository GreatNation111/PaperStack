import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Send, Edit3, Trash2, Eye, Calendar, Users, Bell, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments } from '@/hooks/useData';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  target: 'global' | 'department' | 'course';
  targetId?: string; // departmentId or courseCode/Id
  targetName?: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: any; // Timestamp
  createdAt?: any;
  views?: number; // derived from receipts, but for now just placeholder or we calculate it
}

export function NotificationsManager() {
  const [activeTab, setActiveTab] = useState<'live' | 'queue'>('live');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Data State
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([]);
  const [queueNotifications, setQueueNotifications] = useState<Notification[]>([]);


  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'alert',
    target: 'global' as 'global' | 'department' | 'course',
    targetId: '',
    targetName: '',
    scheduledDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options Data
  const { departments } = useDepartments();
  const [courses, setCourses] = useState<{ id: string, code: string }[]>([]);

  // Fetch Live Notifications
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setLiveNotifications(snap.docs.map(d => ({ id: d.id, ...d.data(), status: 'sent' } as Notification)));

    });
    return () => unsub();
  }, []);

  // Fetch Queue (Drafts/Scheduled)
  useEffect(() => {
    const q = query(collection(db, 'admin_notifications_queue'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setQueueNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return () => unsub();
  }, []);

  // Fetch Courses for Dropdown (Simplified list)
  useEffect(() => {
    if (formData.target === 'course') {
      const q = query(collection(db, 'courses'), orderBy('code', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
        setCourses(snap.docs.map(d => ({ id: d.id, code: d.data().code })));
      });
      return () => unsub();
    }
  }, [formData.target]);

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'info',
      target: 'global',
      targetId: '',
      targetName: '',
      scheduledDate: ''
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleEdit = (n: Notification) => {
    setEditingId(n.id);
    setActiveTab('queue'); // Can only edit queue items usually, or we assume logic
    setFormData({
      title: n.title,
      body: n.body,
      type: n.type,
      target: n.target,
      targetId: n.targetId || '',
      targetName: n.targetName || '',
      scheduledDate: n.scheduledDate ? new Date(n.scheduledDate.seconds * 1000).toISOString().slice(0, 16) : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string, collectionName: 'notifications' | 'admin_notifications_queue') => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  const handleSubmit = async (action: 'send' | 'draft' | 'schedule') => {
    if (!formData.title || !formData.body) return alert('Title and Body required');
    if (formData.target !== 'global' && !formData.targetId) return alert('Please select a target');

    setIsSubmitting(true);

    // Resolve Target Name if ID selected
    let targetName = formData.targetName;
    if (formData.target === 'department') {
      targetName = departments.find(d => d.id === formData.targetId)?.name || '';
    } else if (formData.target === 'course') {
      targetName = courses.find(c => c.id === formData.targetId)?.code || '';
    }

    const payload = {
      title: formData.title,
      body: formData.body,
      type: formData.type,
      target: formData.target,
      targetId: formData.targetId,
      targetName,
      createdAt: serverTimestamp(),
      status: action === 'send' ? 'sent' : (action === 'schedule' ? 'scheduled' : 'draft'),
      scheduledDate: action === 'schedule' && formData.scheduledDate ? new Date(formData.scheduledDate) : null
    };

    try {
      if (action === 'send') {
        // Atomic write to live notifications
        await addDoc(collection(db, 'notifications'), payload);
        // If editing a draft, delete the draft
        if (editingId) {
          await deleteDoc(doc(db, 'admin_notifications_queue', editingId));
        }

        // --- PUSH NOTIFICATION DISPATCH ---
        try {
          let usersQuery: any = collection(db, 'users');
          if (formData.target === 'department' && formData.targetId) {
            usersQuery = query(collection(db, 'users'), where('departmentId', '==', formData.targetId));
          }

          const snap = await getDocs(usersQuery);
          const tokens: string[] = [];

          snap.forEach(docSnap => {
            const data = docSnap.data() as { fcmTokens?: string[]; notificationSettings?: { pushEnabled?: boolean } };
            if (data.notificationSettings?.pushEnabled === false) return;

            const userTokens = data.fcmTokens;
            if (Array.isArray(userTokens)) {
              tokens.push(...userTokens);
            }
          });

          if (tokens.length > 0) {
            const uniqueTokens = [...new Set(tokens)];

            // Trigger Vercel Serverless Push Dispatcher
            fetch('/api/send-push', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.title,
                body: formData.body,
                tokens: uniqueTokens,
                data: { target: formData.target, targetId: formData.targetId }
              })
            }).catch(err => console.error('Failed to trigger push API endpoint:', err));
          }
        } catch (pushErr) {
          console.error('Error orchestrating push notification batch:', pushErr);
        }
        // --- END PUSH NOTIFICATION DISPATCH ---

      } else {
        // Write to queue
        if (editingId) {
          await updateDoc(doc(db, 'admin_notifications_queue', editingId), payload);
        } else {
          await addDoc(collection(db, 'admin_notifications_queue'), payload);
        }
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Failed to save notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Notifications Manager</h1>
          <p className="text-sm text-[#AAA]">Broadcast updates to your students</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          className="h-11 px-6 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span>New Notification</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1F] p-1 rounded-xl w-fit mb-6 border border-[#2A2A2F]">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'live'
            ? 'bg-[#2A2A2F] text-white shadow-sm'
            : 'text-[#AAA] hover:text-[#E5E5E5]'
            }`}
        >
          Active ({liveNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'queue'
            ? 'bg-[#2A2A2F] text-white shadow-sm'
            : 'text-[#AAA] hover:text-[#E5E5E5]'
            }`}
        >
          Queue ({queueNotifications.length})
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {(activeTab === 'live' ? liveNotifications : queueNotifications).map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] p-5 rounded-xl hover:border-[#3A3A3F] transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wide
                    ${n.type === 'alert' ? 'bg-red-500/10 text-red-500' :
                      n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                        n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {n.type}
                  </span>
                  <span className="text-[#666] text-xs px-2 border-l border-[#333]">
                    {n.target === 'global' ? 'All Students' : `${n.targetName}`}
                  </span>
                  {n.status === 'scheduled' && (
                    <span className="text-amber-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {n.scheduledDate?.toDate().toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-[#E5E5E5] mb-1">{n.title}</h3>
                <p className="text-[#AAA] text-sm leading-relaxed">{n.body}</p>
              </div>

              <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                {activeTab === 'queue' && (
                  <button
                    onClick={() => handleEdit(n)}
                    className="p-2 text-[#AAA] hover:text-white hover:bg-[#333] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id, activeTab === 'live' ? 'notifications' : 'admin_notifications_queue')}
                  className="p-2 text-[#AAA] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {(activeTab === 'live' ? liveNotifications : queueNotifications).length === 0 && (
          <div className="text-center py-12 text-[#666]">
            No {activeTab} notifications found.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-[#2A2A2F] flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-semibold text-[#E5E5E5]">{editingId ? 'Edit Notification' : 'New Notification'}</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-[#666] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-[#AAA] mb-2">Title</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief headline..."
                    className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#AAA] mb-2">Message</label>
                  <textarea
                    value={formData.body}
                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Detailed update..."
                    rows={4}
                    className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#AAA] mb-2">Type</label>
                    <div className="flex gap-2">
                      {['info', 'warning', 'alert'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData({ ...formData, type: t as any })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase border ${formData.type === t
                            ? 'border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]'
                            : 'border-[#333] text-[#666] hover:border-[#666]'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#AAA] mb-2">Target</label>
                    <select
                      value={formData.target}
                      onChange={e => setFormData({ ...formData, target: e.target.value as any, targetId: '' })}
                      className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-2.5 text-[#E5E5E5] focus:border-[#4F46E5] outline-none"
                    >
                      <option value="global">All Students</option>
                      <option value="department">Specific Department</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Target ID Selection */}
                {formData.target === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-[#AAA] mb-2">Select Department</label>
                    <select
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none"
                    >
                      <option value="">Choose...</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}


                {/* Schedule Integration */}
                <div>
                  <label className="block text-sm font-medium text-[#AAA] mb-2">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none [color-scheme:dark]"
                  />
                  <p className="text-xs text-[#666] mt-2">Leave blank to send immediately or save as draft.</p>
                </div>
              </div>

              <div className="bg-[#15151A] px-6 py-4 flex gap-3 justify-end border-t border-[#2A2A2F] flex-shrink-0">
                {/* Logic: 
                    If scheduledDate set -> "Schedule"
                    Else -> "Send Now" or "Save Draft"
                */}
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl border border-[#333] text-[#AAA] font-medium hover:text-white hover:border-[#666] transition-colors"
                >
                  Save Draft
                </button>

                {formData.scheduledDate ? (
                  <button
                    onClick={() => handleSubmit('schedule')}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#F59E0B] text-black font-semibold hover:bg-[#D97706] transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    Schedule
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit('send')}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
