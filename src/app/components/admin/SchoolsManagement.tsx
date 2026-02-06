import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronDown, Plus, Edit3, Trash2, Building2, FolderOpen } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  courseCount: number;
}

interface Faculty {
  id: string;
  name: string;
  departments: Department[];
  isExpanded: boolean;
}

export function SchoolsManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: '1',
      name: 'Faculty of Science',
      isExpanded: true,
      departments: [
        { id: '1-1', name: 'Physics', courseCount: 42 },
        { id: '1-2', name: 'Chemistry', courseCount: 38 },
        { id: '1-3', name: 'Mathematics', courseCount: 35 },
        { id: '1-4', name: 'Computer Science', courseCount: 47 },
        { id: '1-5', name: 'Biology', courseCount: 31 },
      ],
    },
    {
      id: '2',
      name: 'Faculty of Engineering',
      isExpanded: false,
      departments: [
        { id: '2-1', name: 'Electrical Engineering', courseCount: 29 },
        { id: '2-2', name: 'Mechanical Engineering', courseCount: 33 },
        { id: '2-3', name: 'Civil Engineering', courseCount: 27 },
        { id: '2-4', name: 'Chemical Engineering', courseCount: 24 },
      ],
    },
    {
      id: '3',
      name: 'Faculty of Arts',
      isExpanded: false,
      departments: [
        { id: '3-1', name: 'History', courseCount: 18 },
        { id: '3-2', name: 'English', courseCount: 22 },
        { id: '3-3', name: 'Philosophy', courseCount: 15 },
      ],
    },
    {
      id: '4',
      name: 'Faculty of Social Sciences',
      isExpanded: false,
      departments: [
        { id: '4-1', name: 'Economics', courseCount: 26 },
        { id: '4-2', name: 'Sociology', courseCount: 19 },
        { id: '4-3', name: 'Political Science', courseCount: 21 },
      ],
    },
  ]);

  const toggleFaculty = (id: string) => {
    setFaculties((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isExpanded: !f.isExpanded } : f))
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Schools & Departments</h1>
          <p className="text-sm text-[#AAA]">Manage institutional hierarchy</p>
        </div>
        <button className="h-11 px-4 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span className="hidden sm:inline">Add Faculty</span>
        </button>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-3">
        {faculties.map((faculty, index) => (
          <motion.div
            key={faculty.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden"
          >
            {/* Faculty Header */}
            <button
              onClick={() => toggleFaculty(faculty.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#222227] transition-colors"
            >
              <div className="flex items-center gap-3">
                {faculty.isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#AAA]" strokeWidth={1.5} />
                )}
                <Building2 className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
                <span className="text-base font-semibold text-[#E5E5E5]">{faculty.name}</span>
                <span className="px-2 py-0.5 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium rounded-full">
                  {faculty.departments.length} depts
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </button>

            {/* Departments List */}
            {faculty.isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[#2A2A2F]"
              >
                {faculty.departments.map((dept, deptIndex) => (
                  <div
                    key={dept.id}
                    className={`px-5 py-4 pl-16 flex items-center justify-between hover:bg-[#222227] transition-colors ${
                      deptIndex !== faculty.departments.length - 1 ? 'border-b border-[#2A2A2F]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-[#0D9488]" strokeWidth={1.5} />
                      <span className="text-sm text-[#E5E5E5]">{dept.name}</span>
                      <span className="px-2 py-0.5 bg-[#0F1115] border border-[#333] text-[#AAA] text-xs rounded-full">
                        {dept.courseCount} courses
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Department Button */}
                <button className="w-full px-5 py-3 pl-16 flex items-center gap-2 text-[#4F46E5] hover:bg-[#4F46E5]/5 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add Department to {faculty.name}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mobile Note */}
      <div className="mt-6 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4">
        <p className="text-sm text-[#AAA] leading-relaxed">
          <strong className="text-[#E5E5E5]">Tip:</strong> Click on a faculty to expand and view its departments. Use edit/delete icons to manage entries.
        </p>
      </div>
    </div>
  );
}
