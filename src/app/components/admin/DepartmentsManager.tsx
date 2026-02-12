import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    X,
    Building2,
    BookOpen,
    Cpu,
    Beaker,
    Calculator,
    Globe,
    Activity,
    Briefcase,
    Music,
    Palette
} from 'lucide-react';
import {
    collection,
    onSnapshot,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Department {
    id: string;
    name: string;
    code: string;
    icon: string;
}

const ICON_PRESETS = [
    { name: 'Building2', icon: Building2 },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Cpu', icon: Cpu },
    { name: 'Beaker', icon: Beaker },
    { name: 'Calculator', icon: Calculator },
    { name: 'Globe', icon: Globe },
    { name: 'Activity', icon: Activity },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Music', icon: Music },
    { name: 'Palette', icon: Palette },
];

export function DepartmentsManager() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        icon: 'Building2'
    });
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Departments Real-time
    useEffect(() => {
        const q = query(collection(db, 'departments'), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Department));
            setDepartments(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching departments:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
            code: '',
            icon: 'Building2'
        });
        setFormError('');
        setShowModal(true);
    };

    const handleOpenEdit = (dept: Department) => {
        setIsEditing(true);
        setEditingId(dept.id);
        setFormData({
            name: dept.name,
            code: dept.code || '',
            icon: dept.icon || 'Building2'
        });
        setFormError('');
        setShowModal(true);
    };

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '_')
            .replace(/^-+|-+$/g, '');
    };

    const handleSave = async () => {
        setFormError('');
        if (!formData.name.trim()) return setFormError('Department name is required');
        if (!formData.code.trim()) return setFormError('Department code is required');

        setIsSaving(true);
        try {
            if (isEditing && editingId) {
                await updateDoc(doc(db, 'departments', editingId), {
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    icon: formData.icon,
                    updatedAt: serverTimestamp()
                });
            } else {
                const slug = slugify(formData.name);
                // Check if already exists to avoid overwriting
                const deptRef = doc(db, 'departments', slug);
                await setDoc(deptRef, {
                    id: slug,
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    icon: formData.icon,
                    createdAt: serverTimestamp()
                });
            }
            setShowModal(false);
        } catch (e: any) {
            console.error('Error saving department:', e);
            setFormError(e.message || 'Failed to save department');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            await deleteDoc(doc(db, 'departments', id));
        } catch (e) {
            console.error('Error deleting department:', e);
            alert('Failed to delete department');
        }
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Departments</h1>
                    <p className="text-sm text-[#AAA]">{departments.length} departments available</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="h-11 px-6 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" strokeWidth={2} />
                    <span>Add Department</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full h-11 pl-10 pr-4 bg-[#1A1A1F] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredDepartments.map((dept, index) => {
                        // Dynamic Icon Render
                        const IconComponent = ICON_PRESETS.find(p => p.name === dept.icon)?.icon || Building2;

                        return (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-5 hover:border-[#333] transition-colors group relative"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                                        <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEdit(dept)}
                                            className="p-2 text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#333] rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id, dept.name)}
                                            className="p-2 text-[#AAA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-[#E5E5E5] mb-1">{dept.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-[#333] rounded text-xs text-[#AAA] font-medium">{dept.code}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {!loading && filteredDepartments.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-[#666]">No departments found matching your search.</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-12 text-[#666]">
                    Loading departments...
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="px-6 py-4 border-b border-[#2A2A2F] flex items-center justify-between bg-[#15151A]">
                                <h2 className="text-lg font-semibold text-[#E5E5E5]">
                                    {isEditing ? 'Edit Department' : 'New Department'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-[#AAA] hover:text-[#E5E5E5] hover:bg-[#333] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {formError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                                        {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-[#AAA] mb-2">Department Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Computer Science"
                                        className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#AAA] mb-2">Code</label>
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. CSC"
                                        className="w-full bg-[#0F1115] border border-[#333] rounded-xl px-4 py-3 text-[#E5E5E5] focus:border-[#4F46E5] outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#AAA] mb-2">Icon</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {ICON_PRESETS.map(preset => {
                                            const Icon = preset.icon;
                                            const isSelected = formData.icon === preset.name;
                                            return (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => setFormData({ ...formData, icon: preset.name })}
                                                    type="button"
                                                    className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${isSelected
                                                        ? 'bg-[#4F46E5]/20 border-[#4F46E5] text-[#4F46E5]'
                                                        : 'bg-[#0F1115] border-[#333] text-[#666] hover:border-[#666] hover:text-[#AAA]'
                                                        }`}
                                                    title={preset.name}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-[#15151A] border-t border-[#2A2A2F] flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-[#AAA] hover:text-[#E5E5E5] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {isEditing ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
