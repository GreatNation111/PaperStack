import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, MessageCircleQuestion, Save, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments, RepeatedQuestionsData, RepeatedQuestion } from '@/hooks/useData';

export function RepeatedQuestionsManagement() {
    const { departments, loading: loadingDepts } = useDepartments();
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [data, setData] = useState<RepeatedQuestionsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form for adding new curated items
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
            const updatedItems = [...data.items, { ...newItem, updatedAt: new Date() }];
            setData({ ...data, items: updatedItems });
            setNewItem({ courseCode: '', questions: '', updatedAt: null });
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
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Question Curator</h1>
                    <p className="text-secondary text-sm font-medium">Curate high-yield repeated questions for each department.</p>
                </div>
                {data && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 bg-accent text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Insights
                    </button>
                )}
            </div>

            {/* Department Selection */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 mb-8">
                <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-4 block">Select Department</label>
                <div className="flex gap-4">
                    <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="flex-1 h-14 px-6 bg-muted/20 border border-border rounded-2xl text-foreground font-bold focus:border-accent outline-none transition-all appearance-none"
                    >
                        <option value="">-- Choose a Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedDeptId ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center bg-muted/10 rounded-[2.5rem] border border-dashed border-border"
                    >
                        <MessageCircleQuestion className="w-12 h-12 text-secondary/20 mx-auto mb-4" />
                        <p className="text-secondary text-sm font-medium italic">Select a department to view curated questions.</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-xs ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                                    }`}
                            >
                                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </motion.div>
                        )}

                        {/* Add New Insight Box */}
                        <div className="bg-card border border-border rounded-[2.5rem] p-8">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-accent" />
                                Add Curated Insight
                            </h3>
                            <div className="space-y-4">
                                <input
                                    placeholder="Course Code (e.g. BUS 201)"
                                    value={newItem.courseCode}
                                    onChange={(e) => setNewItem({ ...newItem, courseCode: e.target.value.toUpperCase() })}
                                    className="w-full h-12 px-5 bg-muted/20 border border-border rounded-xl text-sm font-bold placeholder:text-secondary focus:border-accent outline-none transition-all"
                                />
                                <textarea
                                    placeholder="Enter the repeated questions or patterns. One per line is best..."
                                    rows={4}
                                    value={newItem.questions}
                                    onChange={(e) => setNewItem({ ...newItem, questions: e.target.value })}
                                    className="w-full p-5 bg-muted/20 border border-border rounded-xl text-sm font-medium placeholder:text-secondary focus:border-accent outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItem.courseCode || !newItem.questions}
                                className="mt-6 w-full h-12 bg-muted text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add to Insight List
                            </button>
                        </div>

                        {/* Published List */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] px-4">Live Insights</h3>
                            {data?.items.length === 0 ? (
                                <div className="text-center py-10 text-secondary/40 font-bold italic text-sm">No curated questions for this department yet.</div>
                            ) : (
                                data?.items.map((item, idx) => (
                                    <div key={idx} className="bg-card border border-border rounded-[2.5rem] p-8 group hover:border-accent/30 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="font-black text-foreground text-lg">{item.courseCode}</div>
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="bg-muted/30 p-6 rounded-2xl">
                                            <p className="text-sm font-medium text-secondary whitespace-pre-wrap leading-relaxed">{item.questions}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
