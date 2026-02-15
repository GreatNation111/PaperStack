import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, MessageCircleQuestion, Save, Loader2, AlertCircle, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
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
            const updatedItems = [{ ...newItem, updatedAt: new Date() }, ...data.items];
            setData({ ...data, items: updatedItems });
            setNewItem({ courseCode: '', questions: '', updatedAt: null });
            setMessage({ type: 'success', text: `Insights for ${newItem.courseCode} staged!` });
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
            setMessage({ type: 'success', text: 'Knowledge insights published live!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving questions:', error);
            setMessage({ type: 'error', text: 'Failed to publish insights.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MessageCircleQuestion className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-1">Intelligence</h1>
                    <p className="text-secondary text-xs font-black uppercase tracking-[0.3em] opacity-40">Repeated Questions Curator</p>
                </div>
                {data && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-16 px-10 bg-accent text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-accent/20"
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Deploy Insights
                    </button>
                )}
            </div>

            {/* Context Selector */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-secondary" />
                    </div>
                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em]">Target Department</label>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="flex-1 h-16 px-8 bg-muted/40 border-2 border-transparent focus:border-accent/50 focus:bg-background rounded-2xl text-foreground font-black outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">-- ACTIVATE DEPARTMENT INTEL --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedDeptId ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-40 text-center bg-muted/5 rounded-[4rem] border-2 border-dashed border-border/30"
                    >
                        <Sparkles className="w-20 h-20 text-secondary/10 mx-auto mb-8 animate-pulse" />
                        <h2 className="text-2xl font-black text-secondary/20 uppercase tracking-[0.4em]">Signal Offline</h2>
                        <p className="text-secondary/30 text-[10px] font-black uppercase tracking-widest mt-4">Connect a department to curate historical patterns</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-accent/10 border-t-accent animate-spin" />
                            <div className="absolute inset-4 rounded-full border-4 border-primary/10 border-b-primary animate-spin-slow" />
                        </div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest animate-pulse">Scanning Historical Data...</span>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* localized Feedback */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 ${message.type === 'success' ? 'bg-green-500/5 border-green-500/10 text-green-600' : 'bg-red-500/5 border-red-500/10 text-red-600'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {message.type === 'success' ? <CheckCircle className="w-6 h-6 shadow-sm" /> : <AlertCircle className="w-6 h-6 shadow-sm" />}
                                </div>
                                <span className="font-black text-xs uppercase tracking-tight">{message.text}</span>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            {/* Curation Column */}
                            <div className="xl:col-span-4 bg-card border border-border rounded-[3.5rem] p-10 shadow-2xl">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                                    Curate Pattern
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Course Identifier</label>
                                        <input
                                            placeholder="E.G. BUS 201"
                                            value={newItem.courseCode}
                                            onChange={(e) => setNewItem({ ...newItem, courseCode: e.target.value.toUpperCase() })}
                                            className="w-full h-16 px-8 bg-muted/30 border-2 border-transparent focus:border-accent/40 rounded-[1.5rem] text-sm font-black placeholder:text-secondary focus:bg-background outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Key Questions & Patterns</label>
                                        <textarea
                                            placeholder="Enter high-yield questions, lecturer patterns, or tips..."
                                            rows={6}
                                            value={newItem.questions}
                                            onChange={(e) => setNewItem({ ...newItem, questions: e.target.value })}
                                            className="w-full p-8 bg-muted/30 border-2 border-transparent focus:border-accent/40 rounded-[2rem] text-sm font-medium placeholder:text-secondary focus:bg-background outline-none transition-all resize-none leading-relaxed shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!newItem.courseCode || !newItem.questions}
                                        className="w-full h-16 bg-muted/40 hover:bg-accent text-foreground hover:text-accent-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 flex items-center justify-center gap-3 group active:scale-95"
                                    >
                                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                        Commit Insight
                                    </button>
                                </div>
                            </div>

                            {/* Intel Feed Column */}
                            <div className="xl:col-span-8 space-y-8">
                                <div className="flex items-center justify-between px-8">
                                    <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] opacity-40">Intelligence Stream</h3>
                                    <div className="flex items-center gap-2 px-6 py-2 bg-accent/5 rounded-full border border-accent/10">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mt-0.5">
                                            {data?.items.length || 0} Patterns Logged
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                                    {data?.items.length === 0 ? (
                                        <div className="py-32 text-center bg-card/30 rounded-[3.5rem] border-2 border-dashed border-border/50">
                                            <div className="text-secondary/20 font-black uppercase tracking-[0.2em] text-sm">Intel Feed Empty</div>
                                            <div className="text-secondary/10 text-[10px] font-bold uppercase tracking-widest mt-2">Commit a pattern to activate stream</div>
                                        </div>
                                    ) : (
                                        data?.items.map((item, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={`${item.courseCode}-${idx}`}
                                                className="bg-card border-2 border-border/40 hover:border-accent/20 rounded-[3rem] p-10 group transition-all hover:shadow-2xl hover:shadow-accent/5"
                                            >
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-all">
                                                            <Sparkles className="w-8 h-8 text-accent" strokeWidth={1.5} />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-foreground text-3xl tracking-tighter uppercase">{item.courseCode}</div>
                                                            <div className="text-[10px] font-black text-accent uppercase tracking-[0.3em] opacity-60">High-Yield Insight</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="w-12 h-12 flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-75"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="bg-muted/30 p-8 rounded-[2rem] border border-transparent group-hover:border-accent/10 transition-all relative">
                                                    <div className="absolute top-4 left-4 opacity-5">
                                                        <MessageCircleQuestion className="w-12 h-12" />
                                                    </div>
                                                    <p className="text-sm font-bold text-secondary whitespace-pre-wrap leading-relaxed relative z-10">{item.questions}</p>
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
