import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, UserCheck, MoreVertical, ChevronDown, X, Loader2, RefreshCw } from 'lucide-react';
import { collection, doc, query, updateDoc, setDoc, getDocs, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
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
  avatar?: string;
}

const PAGE_SIZE = 50;

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'contributor'>('all');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [openUserMenuId, setOpenUserMenuId] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Contributor Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [contributorForm, setContributorForm] = useState({
    badge: 'Rising Star',
    contributionCount: 0
  });
  const [isPromoting, setIsPromoting] = useState(false);

  // Fetch Users with pagination
  const fetchUsers = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true); else setLoading(true);
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (isLoadMore && lastDoc) {
        q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      }
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      if (!isLoadMore) {
        // Also get total count (1 read)
        const countSnap = await getCountFromServer(collection(db, 'users'));
        setTotalUsers(countSnap.data().count);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

      if (isLoadMore) {
        setUsers(prev => [...prev, ...fetched]);
      } else {
        setUsers(fetched);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        badge: contributorForm.badge,
        avatar: selectedUser.avatar || null
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

  // Actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDemoteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to demote ${user.name || 'this user'} back to Student?`)) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: 'student' });

      // Also delete from contributors collection if they exist there
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'contributors', user.id));

      alert(user.name + " demoted to student.");
    } catch (error) {
      console.error("Error demoting user:", error);
      alert("Demotion failed.");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to DELETE ${user.name || 'this user'}? This will remove their entire account. This cannot be undone.`)) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.id));
      await deleteDoc(doc(db, 'contributors', user.id));
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Deletion failed.");
    }
  };

  const filteredUsers = users.filter(user => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = !s ||
      user.name?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s) ||
      user.departmentId?.toLowerCase().includes(s) ||
      user.department?.toLowerCase().includes(s);

    const matchesRole = roleFilter === 'all' || (user.role || 'student') === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    // 14 days chart data
    const chartData = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return { date: d.toDateString(), count: 0, label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) };
    });

    let newToday = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let contributorsCount = 0;
    const deptCounts: Record<string, number> = {};
    const levelCounts: Record<string, number> = {};

    users.forEach(u => {
      // Role
      if (u.role === 'contributor') contributorsCount++;

      // Department
      const dept = u.department || u.departmentId || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;

      // Level
      const level = u.level || 'Unknown';
      levelCounts[level] = (levelCounts[level] || 0) + 1;

      // Dates
      if (!u.createdAt) return;
      const createdAt = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (createdAt.toDateString() === todayStr) newToday++;
      if (diffDays < 7) thisWeek++;
      if (diffDays < 30) thisMonth++;

      // Chart
      const chartEntry = chartData.find(d => d.date === createdAt.toDateString());
      if (chartEntry) {
        chartEntry.count++;
      }
    });

    const maxChartCount = Math.max(...chartData.map(d => d.count), 1);

    return {
      newToday,
      thisWeek,
      thisMonth,
      contributorsCount,
      departments: Object.entries(deptCounts).sort((a, b) => b[1] - a[1]),
      levels: Object.entries(levelCounts).sort((a, b) => b[1] - a[1]),
      chartData,
      maxChartCount
    };
  }, [users]);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Users Management</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#AAA]">{totalUsers} total users (showing {users.length})</span>
          {roleFilter !== 'all' && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full capitalize">{roleFilter}s only</span>}
          <button onClick={() => { setLastDoc(null); fetchUsers(); }} className="text-xs text-primary hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
          <div className="text-[#AAA] text-xs font-bold uppercase tracking-widest mb-1">New Today</div>
          <div className="text-3xl font-black text-[#E5E5E5]">{analytics.newToday}</div>
        </div>
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
          <div className="text-[#AAA] text-xs font-bold uppercase tracking-widest mb-1">New This Week</div>
          <div className="text-3xl font-black text-[#10B981]">{analytics.thisWeek}</div>
        </div>
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
          <div className="text-[#AAA] text-xs font-bold uppercase tracking-widest mb-1">New This Month</div>
          <div className="text-3xl font-black text-[#4F46E5]">{analytics.thisMonth}</div>
        </div>
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
          <div className="text-[#AAA] text-xs font-bold uppercase tracking-widest mb-1">Contributors</div>
          <div className="text-3xl font-black text-[#F59E0B]">{analytics.contributorsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Signups Chart */}
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-black text-[#E5E5E5] uppercase tracking-widest mb-6">Signups (Last 14 Days)</h3>
          <div className="flex items-end gap-2 h-32 w-full">
            {analytics.chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div 
                  className="w-full bg-[#4F46E5]/20 hover:bg-[#4F46E5] rounded-t-sm transition-all duration-300 relative"
                  style={{ height: `${Math.max((d.count / analytics.maxChartCount) * 100, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {d.count} signups
                  </div>
                </div>
                <div className="text-[9px] text-[#666] font-bold rotate-[-45deg] origin-top-left translate-y-2 translate-x-1 whitespace-nowrap">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="h-6"></div>
        </div>

        {/* Breakdowns */}
        <div className="space-y-4">
          <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
            <h3 className="text-xs font-black text-[#E5E5E5] uppercase tracking-widest mb-4">Top Departments</h3>
            <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#333]">
              {analytics.departments.slice(0, 5).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm text-[#AAA] truncate max-w-[150px]">{dept}</span>
                  <span className="text-sm font-bold text-[#E5E5E5]">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5">
            <h3 className="text-xs font-black text-[#E5E5E5] uppercase tracking-widest mb-4">Level Distribution</h3>
            <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#333]">
              {analytics.levels.map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm text-[#AAA]">{level}</span>
                  <span className="text-sm font-bold text-[#E5E5E5]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleMenuOpen(open => !open)}
                onBlur={() => window.setTimeout(() => setIsRoleMenuOpen(false), 120)}
                aria-expanded={isRoleMenuOpen}
                className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2"
              >
                <span>Role: {roleFilter === 'all' ? 'All' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span>
                <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {isRoleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1F] border border-[#333] rounded-lg shadow-xl z-20 overflow-hidden">
                {['all', 'student', 'contributor', 'admin'].map(r => (
                  <button
                    key={r}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setRoleFilter(r as any);
                      setIsRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[#AAA] hover:bg-[#333] hover:text-white first:rounded-t-lg last:rounded-b-lg"
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              )}
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
                  <td colSpan={6} className="px-4 py-8 text-center text-[#666]">No users found for this filter.</td>
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
                    <td className="px-4 py-4 text-sm font-medium text-[#E5E5E5]">{user.name || 'Unknown'}</td>
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
                    <td className="px-4 py-4 text-sm text-[#AAA]">{user.department || user.departmentId || 'GENERAL'}</td>
                    <td className="px-4 py-4 text-sm text-[#AAA]">
                      <div className="flex flex-col">
                        <span>{formatDate(user.createdAt)}</span>
                        <span className="text-[10px] text-[#666] uppercase tracking-wider">{formatRelativeTime(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {(!user.role || user.role === 'student') ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowContributorModal(true);
                            }}
                            className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1.5 rounded-lg hover:bg-[#F59E0B]/20 transition-colors"
                          >
                            Promote
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteUser(user)}
                            className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            Demote
                          </button>
                        )}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenUserMenuId(openUserMenuId === user.id ? null : user.id)}
                            onBlur={() => window.setTimeout(() => setOpenUserMenuId(null), 120)}
                            aria-expanded={openUserMenuId === user.id}
                            className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#333] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          {openUserMenuId === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl shadow-2xl z-[60] overflow-hidden">
                              <button onMouseDown={(event) => event.preventDefault()} onClick={() => { handleViewUser(user); setOpenUserMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-[#AAA] hover:bg-[#333] hover:text-white">View Details</button>
                              <button onMouseDown={(event) => event.preventDefault()} onClick={() => { void handleDeleteUser(user); setOpenUserMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-[#2A2A2F]">Delete Account</button>
                            </div>
                          )}
                        </div>
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
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-base font-semibold text-[#E5E5E5] truncate mb-0.5">{user.name || 'Unknown'}</h3>
                  <p className="text-xs text-[#AAA] truncate mb-2">{user.email}</p>
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
                <div className="flex flex-col items-end gap-1.5 text-right shrink-0">
                  <div className="text-[9px] text-[#555] font-bold uppercase tracking-widest">{formatRelativeTime(user.createdAt)}</div>
                  <div className="text-[10px] text-primary/80 font-bold max-w-[100px] truncate">{(user.department || user.departmentId || 'GENERAL').toUpperCase()}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A2F] flex items-center justify-between">
                <div className="flex gap-2">
                  {(!user.role || user.role === 'student') ? (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowContributorModal(true);
                      }}
                      className="px-4 py-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl text-xs font-bold active:scale-95 transition-transform"
                    >
                      Promote
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDemoteUser(user)}
                      className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                    >
                      Demote
                    </button>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenUserMenuId(openUserMenuId === user.id ? null : user.id)}
                    onBlur={() => window.setTimeout(() => setOpenUserMenuId(null), 120)}
                    aria-expanded={openUserMenuId === user.id}
                    className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:bg-[#333] rounded-xl active:scale-95 transition-transform outline-none focus:text-white"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openUserMenuId === user.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-36 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl shadow-2xl z-[60] overflow-hidden">
                      <button onMouseDown={(event) => event.preventDefault()} onClick={() => { handleViewUser(user); setOpenUserMenuId(null); }} className="w-full text-left px-4 py-3 text-xs text-[#AAA] active:bg-[#333]">View Details</button>
                      <button onMouseDown={(event) => event.preventDefault()} onClick={() => { void handleDeleteUser(user); setOpenUserMenuId(null); }} className="w-full text-left px-4 py-3 text-xs text-red-500 active:bg-red-500/10 border-t border-[#2A2A2F]">Delete User</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center py-6">
          <button
            onClick={() => fetchUsers(true)}
            disabled={loadingMore}
            className="px-6 py-3 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl text-sm font-medium text-[#AAA] hover:text-[#E5E5E5] hover:border-primary transition-all flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loadingMore ? 'Loading...' : `Load More Users (${users.length} of ${totalUsers})`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-[#2A2A2F] flex items-center justify-between bg-[#15151A]">
                <h3 className="text-lg font-bold text-[#E5E5E5]">User Profile</h3>
                <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#333] transition-colors">
                  <X className="w-5 h-5 text-[#AAA]" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-4 text-3xl font-black shadow-inner">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-xl font-black text-[#E5E5E5] leading-tight mb-1">{selectedUser.name || 'Unknown User'}</div>
                  <div className="text-sm text-[#888] font-medium mb-2">{selectedUser.email}</div>
                  <div className="text-xs text-[#666] bg-[#222] px-3 py-1 rounded-full border border-[#333]">Joined {formatRelativeTime(selectedUser.createdAt)}</div>
                </div>

                <div className="bg-[#0F1115] rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-[#666] font-semibold uppercase tracking-tighter">Current Role</span>
                    <span className="text-primary font-bold capitalize">{selectedUser.role || 'student'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-[#666] font-semibold uppercase tracking-tighter">Department</span>
                    <span className="text-[#E5E5E5] font-bold">{selectedUser.department || selectedUser.departmentId || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-[#666] font-semibold uppercase tracking-tighter">Level/Year</span>
                    <span className="text-[#E5E5E5] font-bold">{selectedUser.level || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#666] font-semibold uppercase tracking-tighter">Registered On</span>
                    <span className="text-[#AAA] font-bold">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 bg-[#15151A] border-t border-[#2A2A2F]">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full bg-[#333] text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-[#444] active:scale-[0.98] transition-all"
                >
                  Return
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Contributor Modal */}
        {showContributorModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-[#2A2A2F] flex items-center justify-between bg-[#15151A]">
                <h3 className="text-lg font-bold text-[#E5E5E5]">Promote User</h3>
                <button onClick={() => setShowContributorModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#333] transition-colors">
                  <X className="w-5 h-5 text-[#AAA]" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-[#F59E0B]/10 p-4 rounded-2xl border border-[#F59E0B]/20">
                  <p className="text-sm text-[#F59E0B] font-medium leading-relaxed">
                    Promoting <strong>{selectedUser.name}</strong> will grant them contributor status and visibility in public sections.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#666] uppercase tracking-widest mb-2.5 ml-1">Badge Title</label>
                  <select
                    value={contributorForm.badge}
                    onChange={(e) => setContributorForm({ ...contributorForm, badge: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#333] rounded-2xl px-4 py-3.5 text-[#E5E5E5] font-bold outline-none focus:border-[#F59E0B] transition-colors appearance-none"
                  >
                    <option value="Rising Star">Rising Star</option>
                    <option value="Top Contributor">Top Contributor</option>
                    <option value="Verified Tutor">Verified Tutor</option>
                    <option value="Senior Editor">Senior Editor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#666] uppercase tracking-widest mb-2.5 ml-1">Papers Contributed</label>
                  <input
                    type="number"
                    value={contributorForm.contributionCount}
                    onChange={(e) => setContributorForm({ ...contributorForm, contributionCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0F1115] border border-[#333] rounded-2xl px-4 py-3.5 text-[#E5E5E5] font-bold outline-none focus:border-[#F59E0B] transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="px-6 py-5 bg-[#15151A] border-t border-[#2A2A2F] flex gap-3">
                <button
                  onClick={() => setShowContributorModal(false)}
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-[#AAA] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteToContributor}
                  disabled={isPromoting}
                  className="flex-[1.5] bg-[#F59E0B] text-black px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-[#D97706] disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isPromoting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Promotion"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
