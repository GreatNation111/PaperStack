import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shield, UserCheck, MoreVertical, ChevronDown, X, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'admin' | 'contributor';
  department?: string;
  level?: string;
  joinDate?: any; // Timestamp
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
  const [contributorForm, setContributorForm] = useState({
    badge: 'Rising Star',
    contributionCount: 0
  });
  const [isPromoting, setIsPromoting] = useState(false);

  // Fetch Users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(fetched);
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
      // 1. Update User Role
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        role: 'contributor'
      });

      // 2. Create/Update Contributor Doc
      // We use the same ID as the user for easy lookup
      const contributorRef = doc(db, 'contributors', selectedUser.id);
      await setDoc(contributorRef, {
        name: selectedUser.name,
        department: selectedUser.department || 'Unassigned',
        levelOrYear: selectedUser.level || 'Unknown',
        contributionCount: contributorForm.contributionCount,
        badge: contributorForm.badge,
        updatedAt: serverTimestamp()
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

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || (user.role || 'student') === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp or Date object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Users Management</h1>
        <p className="text-sm text-[#AAA]">{users.length} total users</p>
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
              {/* Simple Dropdown for MVP */}
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

      {/* Desktop Table */}
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
                    <td className="px-4 py-4 text-sm text-[#AAA]">{user.department || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-[#AAA]">{formatDate(user.createdAt || user.joinDate)}</td>
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
                        <button className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors">
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

      {/* Contributor Modal */}
      <AnimatePresence>
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
