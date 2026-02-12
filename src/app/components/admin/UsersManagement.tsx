import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shield, UserCheck, MoreVertical, ChevronDown, X, Loader2 } from 'lucide-react';
import { collection, doc, onSnapshot, query, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  department?: string;
  level?: string;
  role?: 'student' | 'contributor' | 'admin';
  createdAt?: any;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'contributor'>('all');

  // Contributor Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [contributorForm, setContributorForm] = useState({
    badge: 'Rising Star',
    contributionCount: 0
  });
  const [isPromoting, setIsPromoting] = useState(false);

  // Fetch Users
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      const sorted = fetched.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
        return timeB - timeA;
      });

      setUsers(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePromoteToContributor = async () => {
    if (!selectedUser) return;
    setIsPromoting(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        role: 'contributor'
      });

      const contributorRef = doc(db, 'contributors', selectedUser.id);
      await setDoc(contributorRef, {
        name: selectedUser.name,
        department: selectedUser.department || selectedUser.departmentId || 'Unassigned',
        levelOrYear: selectedUser.level || 'Unknown',
        contributionCount: contributorForm.contributionCount,
        badge: contributorForm.badge
      }, { merge: true });

      setShowContributorModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Failed to promote user. Check console.");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.departmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || (user.role || 'student') === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Users Management</h1>
        <p className="text-sm text-[#AAA]">{users.length} total users</p>
      </div>

      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full h-11 pl-10 pr-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="relative group">
              <button className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2">
                <span>Role: {roleFilter === 'all' ? 'All' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span>
                <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1F] border border-[#333] rounded-lg shadow-xl hidden group-hover:block z-20">
                {['all', 'student', 'contributor', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r as any)}
                    className="w-full text-left px-4 py-2 text-[#AAA] hover:bg-[#333] hover:text-white first:rounded-t-lg last:rounded-b-lg"
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Role</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Joined</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#666]">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#666]">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#222227] transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-[#E5E5E5]">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-[#AAA]">{user.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                          ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                          : user.role === 'contributor'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'bg-[#666]/10 text-[#AAA]'
                          }`}
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3" strokeWidth={2} />}
                        {user.role === 'contributor' && <UserCheck className="w-3 h-3" strokeWidth={2} />}
                        {(user.role || 'Student').charAt(0).toUpperCase() + (user.role || 'student').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#AAA]">{user.department || user.departmentId || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-[#AAA]">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {(!user.role || user.role === 'student') && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowContributorModal(true);
                            }}
                            className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1.5 rounded-lg hover:bg-[#F59E0B]/20 transition-colors"
                          >
                            Promote
                          </button>
                        )}
                        <button
                          onClick={() => handleViewUser(user)}
                          className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center text-[#666]">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-[#666]">No users found.</div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-4 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#E5E5E5] mb-0.5">{user.name}</h3>
                  <p className="text-xs text-[#AAA] mb-2">{user.email}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                      ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                      : user.role === 'contributor'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : 'bg-[#666]/10 text-[#AAA]'
                      }`}
                  >
                    {user.role === 'admin' && <Shield className="w-2.5 h-2.5" strokeWidth={2.5} />}
                    {user.role === 'contributor' && <UserCheck className="w-2.5 h-2.5" strokeWidth={2.5} />}
                    {user.role || 'student'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-[10px] text-[#555] font-medium uppercase tracking-tighter">Joined {formatDate(user.createdAt)}</div>
                  <div className="text-[10px] text-[#888] font-bold">{user.department || user.departmentId || 'GENERAL'}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A2F] flex items-center justify-between">
                <div className="flex gap-2">
                  {(!user.role || user.role === 'student') && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowContributorModal(true);
                      }}
                      className="px-4 py-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                    >
                      Promote
                    </button>
                  )}
                  <button
                    onClick={() => handleViewUser(user)}
                    className="px-4 py-2 bg-[#333] text-[#AAA] rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                  >
                    View
                  </button>
                </div>
                <button
                  onClick={() => handleViewUser(user)}
                  className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:bg-[#333] rounded-xl active:scale-95 transition-transform"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[#2A2A2F] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#E5E5E5]">User Profile</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-[#AAA] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center p-4 bg-[#0F1115] rounded-2xl mb-2">
                  <div className="w-16 h-16 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-3 text-2xl font-bold">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-lg font-bold text-[#E5E5E5]">{selectedUser.name || 'Unknown User'}</div>
                  <div className="text-sm text-[#AAA]">{selectedUser.email}</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Role</span>
                    <span className="text-[#E5E5E5] capitalize">{selectedUser.role || 'student'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Department</span>
                    <span className="text-[#E5E5E5]">{selectedUser.department || selectedUser.departmentId || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Level</span>
                    <span className="text-[#E5E5E5]">{selectedUser.level || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Member Since</span>
                    <span className="text-[#E5E5E5]">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#2A2A2F] flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full bg-[#333] text-[#E5E5E5] py-2 rounded-xl text-sm font-medium hover:bg-[#444] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Contributor Modal */}
        {showContributorModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[#2A2A2F] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#E5E5E5]">Make Contributor</h3>
                <button onClick={() => setShowContributorModal(false)} className="text-[#AAA] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#AAA]">
                  Promoting <strong>{selectedUser.name}</strong> to Contributor will allow them to be recognized in the app.
                </p>
                <div>
                  <label className="block text-sm font-medium text-[#AAA] mb-1">Badge Title</label>
                  <select
                    value={contributorForm.badge}
                    onChange={(e) => setContributorForm({ ...contributorForm, badge: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-3 py-2 text-[#E5E5E5] outline-none focus:border-[#F59E0B]"
                  >
                    <option value="Rising Star">Rising Star</option>
                    <option value="Top Contributor">Top Contributor</option>
                    <option value="Verified Tutor">Verified Tutor</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#2A2A2F] flex justify-end gap-3">
                <button onClick={() => setShowContributorModal(false)} className="text-[#AAA] text-sm hover:text-white">Cancel</button>
                <button
                  onClick={handlePromoteToContributor}
                  disabled={isPromoting}
                  className="bg-[#F59E0B] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#D97706] disabled:opacity-50 flex items-center gap-2"
                >
                  {isPromoting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
