import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Clock, Save, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments, Timetable, Exam } from '@/hooks/useData';

export function TimetableManagement() {
    const { departments, loading: loadingDepts } = useDepartments();
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form for adding/editing exams in the list
    const [newExam, setNewExam] = useState<Exam>({
        courseCode: '',
        title: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        if (!selectedDeptId) {
            setTimetable(null);
            return;
        }

        setLoading(true);
        const unsub = onSnapshot(doc(db, 'timetables', selectedDeptId), (snap) => {
            if (snap.exists()) {
                setTimetable(snap.data() as Timetable);
            } else {
                setTimetable({ departmentId: selectedDeptId, exams: [] });
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching timetable:', err);
            setLoading(false);
        });

        return () => unsub();
    }, [selectedDeptId]);

    const handleAddExam = () => {
        if (!newExam.courseCode || !newExam.date || !newExam.time) return;

        if (timetable) {
            const updatedExams = [...timetable.exams, newExam].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            setTimetable({ ...timetable, exams: updatedExams });
            setNewExam({ courseCode: '', title: '', date: '', time: '' });
            setMessage({ type: 'success', text: `Staged ${newExam.courseCode}. Remember to Publish!` });
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleRemoveExam = (index: number) => {
        if (timetable) {
            const updatedExams = timetable.exams.filter((_, i) => i !== index);
            setTimetable({ ...timetable, exams: updatedExams });
        }
    };

    const handleSave = async () => {
        if (!selectedDeptId || !timetable) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await setDoc(doc(db, 'timetables', selectedDeptId), timetable);
            setMessage({ type: 'success', text: 'Timetable published live!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving timetable:', error);
            setMessage({ type: 'error', text: 'Failed to publish updates.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Calendar className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-1">Registry</h1>
                    <p className="text-secondary text-xs font-black uppercase tracking-[0.3em] opacity-40">Exam Schedule Management</p>
                </div>
                {timetable && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-16 px-10 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-primary/20"
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Deploy Updates
                    </button>
                )}
            </div>

            {/* Selection Engine */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em]">Context Override</label>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="flex-1 h-16 px-8 bg-muted/40 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl text-foreground font-black outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">-- INITIALIZE DEPARTMENT INTERFACE --</option>
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
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="py-40 text-center bg-muted/5 rounded-[4rem] border-2 border-dashed border-border/30"
                    >
                        <Sparkles className="w-20 h-20 text-secondary/10 mx-auto mb-8 animate-pulse" />
                        <h2 className="text-2xl font-black text-secondary/20 uppercase tracking-[0.4em]">Standby</h2>
                        <p className="text-secondary/30 text-[10px] font-black uppercase tracking-widest mt-4">Select a department to activate management protocols</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <div className="absolute inset-4 rounded-full border-4 border-accent/10 border-b-accent animate-spin-slow" />
                        </div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest animate-pulse">Syncing Departmental Data...</span>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Status Feedback */}
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

                        {/* Split Workstation Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            {/* Input Form Column */}
                            <div className="xl:col-span-4 bg-card border border-border rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    Stage Exam Instance
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Course Identifier</label>
                                        <input
                                            placeholder="E.G. PHY 101"
                                            value={newExam.courseCode}
                                            onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value.toUpperCase() })}
                                            className="w-full h-16 px-8 bg-muted/30 border-2 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black placeholder:text-secondary focus:bg-background outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Full Course Title</label>
                                        <input
                                            placeholder="E.G. INTRO TO PHYSICS"
                                            value={newExam.title}
                                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                            className="w-full h-16 px-8 bg-muted/30 border-2 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black placeholder:text-secondary focus:bg-background outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Exam Date</label>
                                            <input
                                                type="date"
                                                value={newExam.date}
                                                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                                className="w-full h-16 px-8 bg-muted/30 border-2 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black focus:bg-background outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={newExam.time}
                                                onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                                className="w-full h-16 px-8 bg-muted/30 border-2 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black focus:bg-background outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddExam}
                                        disabled={!newExam.courseCode || !newExam.date || !newExam.time}
                                        className="w-full h-16 bg-muted/40 hover:bg-primary text-foreground hover:text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 flex items-center justify-center gap-3 group active:scale-95"
                                    >
                                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                        Commit to Registry
                                    </button>
                                </div>
                            </div>

                            {/* Registry List Column */}
                            <div className="xl:col-span-8 space-y-8">
                                <div className="flex items-center justify-between px-8">
                                    <h3 className="text-sm font-black text-secondary uppercase tracking-[0.3em] opacity-40">Live Registry Logs</h3>
                                    <div className="flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">
                                            {timetable?.exams.length || 0} Entries
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-5 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                                    {timetable?.exams.length === 0 ? (
                                        <div className="py-32 text-center bg-card/30 rounded-[3.5rem] border-2 border-dashed border-border/50">
                                            <div className="text-secondary/20 font-black uppercase tracking-[0.2em] text-sm">Registry is Empty</div>
                                            <div className="text-secondary/10 text-[10px] font-bold uppercase tracking-widest mt-2">Stage an exam instance to populate</div>
                                        </div>
                                    ) : (
                                        timetable?.exams.map((exam, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={`${exam.courseCode}-${idx}`}
                                                className="bg-card border-2 border-border/40 hover:border-primary/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 group transition-all hover:shadow-2xl hover:shadow-primary/5"
                                            >
                                                <div className="w-20 h-20 rounded-[2rem] bg-muted/40 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 transition-all group-hover:rotate-3">
                                                    <Calendar className="w-10 h-10 text-primary opacity-20 group-hover:opacity-100 transition-all" strokeWidth={1} />
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                                                    <div className="space-y-1">
                                                        <div className="font-black text-foreground text-2xl tracking-tighter uppercase">{exam.courseCode}</div>
                                                        <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60 truncate">{exam.title}</div>
                                                    </div>
                                                    <div className="flex flex-col lg:items-end justify-center space-y-2">
                                                        <div className="flex items-center gap-3 px-5 py-2.5 bg-muted/30 rounded-2xl border border-transparent group-hover:border-primary/10 transition-all">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                                                {exam.date} <span className="text-secondary mx-2 font-black">•</span> {exam.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => handleRemoveExam(idx)}
                                                        className="w-14 h-14 flex items-center justify-center text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-3xl transition-all active:scale-75 border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
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
