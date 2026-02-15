import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, HelpCircle, Save, Loader2, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments, RepeatedQuestionsData, RepeatedQuestion } from '@/hooks/useData';

export function RepeatedQuestionsManagement() {
    const { departments, loading: loadingDepts } = useDepartments();
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [data, setData] = useState<RepeatedQuestionsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form for adding new items
    const [newItem, setNewItem] = useState<RepeatedQuestion>({
        courseCode: '',
        questions: '',
        updatedAt: null
    });

    useEffect(() => {
        if (!selectedDeptId) {
            setData(null);
            return;
        }

        setLoading(true);
        const unsub = onSnapshot(doc(db, 'repeated_questions', selectedDeptId), (snap) => {
            if (snap.exists()) {
                setData(snap.data() as RepeatedQuestionsData);
            } else {
                setData({ departmentId: selectedDeptId, items: [] });
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching repeated questions:', err);
            setLoading(false);
        });

        return () => unsub();
    }, [selectedDeptId]);

    const handleAddItem = () => {
        if (!newItem.courseCode || !newItem.questions) return;

        if (data) {
            const updatedItems = [{ ...newItem, updatedAt: new Date() }, ...data.items];
            setData({ ...data, items: updatedItems });
            setNewItem({ courseCode: '', questions: '', updatedAt: null });
            setMessage({ type: 'success', text: `Question pattern for ${newItem.courseCode} added.` });
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleRemoveItem = (index: number) => {
        if (data) {
            const updatedItems = data.items.filter((_, i) => i !== index);
            setData({ ...data, items: updatedItems });
        }
    };

    const handleSave = async () => {
        if (!selectedDeptId || !data) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await setDoc(doc(db, 'repeated_questions', selectedDeptId), data);
            setMessage({ type: 'success', text: 'Questions published successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving questions:', error);
            setMessage({ type: 'error', text: 'Failed to publish questions.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-32">
            {/* Header Section - Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Repeated Questions</h1>
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Manage High-Yield Exam Patterns & Questions</p>
                </div>
                {data && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Publish Changes
                    </button>
                )}
            </div>

            {/* Department Selector */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-5 h-5 text-secondary opacity-60" />
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest">Select Department</label>
                </div>
                <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-14 px-6 bg-muted/40 border-2 border-transparent focus:border-indigo-500/40 rounded-xl text-foreground font-bold outline-none transition-all appearance-none cursor-pointer text-sm"
                >
                    <option value="">-- Choose a Department --</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence mode="wait">
                {!selectedDeptId ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/30"
                    >
                        <HelpCircle className="w-16 h-16 text-secondary/10 mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-secondary/40 uppercase tracking-widest">Select Background</h2>
                        <p className="text-secondary/30 text-[11px] font-bold uppercase tracking-widest mt-2">Pick a department to manage its repeated questions</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-[11px] font-bold text-secondary uppercase tracking-widest opacity-60">Loading Patterns...</span>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Status Message */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`p-4 rounded-2xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/5 border-green-500/10 text-green-600' : 'bg-red-500/5 border-red-500/10 text-red-600'}`}
                            >
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="font-bold text-xs uppercase tracking-tight">{message.text}</span>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            {/* Entry Form */}
                            <div className="xl:col-span-4 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                                <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-indigo-500" />
                                    Add Question Pattern
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Course Code</label>
                                        <input
                                            placeholder="GNS 101"
                                            value={newItem.courseCode}
                                            onChange={(e) => setNewItem({ ...newItem, courseCode: e.target.value.toUpperCase() })}
                                            className="w-full h-12 px-5 bg-muted/30 border border-border focus:border-indigo-500/40 rounded-xl text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Key Patterns & Trends</label>
                                        <textarea
                                            placeholder="Focus on the history section, lecturer often repeats..."
                                            rows={5}
                                            value={newItem.questions}
                                            onChange={(e) => setNewItem({ ...newItem, questions: e.target.value })}
                                            className="w-full p-5 bg-muted/30 border border-border focus:border-indigo-500/40 rounded-xl text-sm font-medium outline-none transition-all resize-none shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!newItem.courseCode || !newItem.questions}
                                        className="w-full h-14 bg-muted hover:bg-indigo-600 text-secondary hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Pattern
                                    </button>
                                </div>
                            </div>

                            {/* Pattern Feed */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest opacity-60">Curated Patterns</h3>
                                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-500/5 border border-indigo-500/10 px-4 py-1 rounded-full uppercase tracking-widest">
                                        {data?.items.length || 0} Total
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data?.items.length === 0 ? (
                                        <div className="py-20 text-center bg-muted/5 rounded-[2.5rem] border border-dashed border-border">
                                            <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">No patterns identified yet</p>
                                        </div>
                                    ) : (
                                        data?.items.map((item, idx) => (
                                            <motion.div
                                                layout
                                                key={`${item.courseCode}-${idx}`}
                                                className="bg-card border border-border hover:border-indigo-500/20 rounded-2xl p-6 group transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                                            <HelpCircle className="w-6 h-6 text-indigo-600/30 group-hover:text-indigo-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-foreground text-xl tracking-tight uppercase leading-tight">{item.courseCode}</div>
                                                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest opacity-60">High-Yield Trend</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="w-10 h-10 flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="bg-muted/30 p-5 rounded-xl border border-transparent group-hover:border-indigo-500/10 transition-all">
                                                    <p className="text-sm font-bold text-secondary whitespace-pre-wrap leading-relaxed">{item.questions}</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
