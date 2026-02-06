import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Shield, UserCheck, UserX, MoreVertical, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'verified';
  department: string;
  joinDate: string;
  status: 'active' | 'suspended';
}

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'verified'>('all');

  const users: User[] = [
    {
      id: '1',
      name: 'Chidi Okafor',
      email: 'chidi.okafor@unilag.edu.ng',
      role: 'admin',
      department: 'Physics',
      joinDate: 'Jan 2024',
      status: 'active',
    },
    {
      id: '2',
      name: 'Amina Bello',
      email: 'amina.bello@unilag.edu.ng',
      role: 'admin',
      department: 'Mathematics',
      joinDate: 'Feb 2024',
      status: 'active',
    },
    {
      id: '3',
      name: 'Emeka Nwosu',
      email: 'emeka.nwosu@student.unilag.edu.ng',
      role: 'verified',
      department: 'Computer Science',
      joinDate: 'Mar 2024',
      status: 'active',
    },
    {
      id: '4',
      name: 'Fatima Ibrahim',
      email: 'fatima.ibrahim@student.unilag.edu.ng',
      role: 'student',
      department: 'Chemistry',
      joinDate: 'Jan 2025',
      status: 'active',
    },
    {
      id: '5',
      name: 'Tunde Adeyemi',
      email: 'tunde.adeyemi@student.unilag.edu.ng',
      role: 'student',
      department: 'Biology',
      joinDate: 'Dec 2024',
      status: 'suspended',
    },
  ];

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
            <button className="h-11 px-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#AAA] hover:text-[#E5E5E5] hover:border-[#4F46E5] transition-colors flex items-center gap-2">
              <span>Role: {roleFilter === 'all' ? 'All' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span>
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
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
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Role</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Join Date</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[#AAA] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F]">
              {users.map((user, index) => (
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
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                          : user.role === 'verified'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#666]/10 text-[#AAA]'
                      }`}
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3" strokeWidth={2} />}
                      {user.role === 'verified' && <UserCheck className="w-3 h-3" strokeWidth={2} />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{user.department}</td>
                  <td className="px-4 py-4 text-sm text-[#AAA]">{user.joinDate}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#EF4444]/10 text-[#EF4444]'
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
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
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-[#E5E5E5] mb-1">{user.name}</div>
                <div className="text-sm text-[#AAA] mb-2">{user.email}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                        : user.role === 'verified'
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : 'bg-[#666]/10 text-[#AAA]'
                    }`}
                  >
                    {user.role === 'admin' && <Shield className="w-3 h-3" strokeWidth={2} />}
                    {user.role === 'verified' && <UserCheck className="w-3 h-3" strokeWidth={2} />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : 'bg-[#EF4444]/10 text-[#EF4444]'
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-[#666]">
                  {user.department} • Joined {user.joinDate}
                </div>
              </div>
              <button className="w-10 h-10 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#222227] rounded-lg transition-colors flex-shrink-0">
                <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2A2F]">
              <button className="flex-1 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#10B981] hover:text-[#10B981] transition-colors text-sm font-medium">
                Promote to Verified
              </button>
              <button className="flex-1 h-10 border border-[#333] text-[#AAA] rounded-lg hover:border-[#EF4444] hover:text-[#EF4444] transition-colors text-sm font-medium">
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contributor Note */}
      <div className="mt-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#F59E0B]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#E5E5E5] mb-1">Contributor Submissions Coming Soon</h3>
            <p className="text-sm text-[#AAA] leading-relaxed">
              The contributor upload feature is launching soon. For now, only admins can upload content directly. "Verified" badge indicates trusted community members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
