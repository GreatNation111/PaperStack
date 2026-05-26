import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Clock, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDepartments, Timetable, Exam } from '@/hooks/useData';

export function TimetableManagement() {
    const { departments } = useDepartments();
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form for adding/editing exams
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
            setMessage({ type: 'success', text: `Exam for ${newExam.courseCode} added to list.` });
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
            setMessage({ type: 'success', text: 'Timetable published successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving timetable:', error);
            setMessage({ type: 'error', text: 'Failed to publish timetable.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-32">
            {/* Header Section - Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Timetable Manager</h1>
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Manage Exam Schedules by Department</p>
                </div>
                {timetable && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Publish Changes
                    </button>
                )}
            </div>

            {/* Department Selection */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-secondary opacity-60" />
                    <label className="text-[11px] font-bold text-secondary uppercase tracking-widest">Select Department</label>
                </div>
                <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-14 px-6 bg-muted/40 border-2 border-transparent focus:border-primary/40 rounded-xl text-foreground font-bold outline-none transition-all appearance-none cursor-pointer text-sm"
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
                        <Calendar className="w-16 h-16 text-secondary/10 mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-secondary/40 uppercase tracking-widest">Waiting for Selection</h2>
                        <p className="text-secondary/30 text-[11px] font-bold uppercase tracking-widest mt-2">Pick a department to manage its exam timetable</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-[11px] font-bold text-secondary uppercase tracking-widest opacity-60">Loading Schedule...</span>
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
                                    <Plus className="w-4 h-4 text-primary" />
                                    Add New Exam
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Course Code</label>
                                        <input
                                            placeholder="PHY 101"
                                            value={newExam.courseCode}
                                            onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value.toUpperCase() })}
                                            className="w-full h-12 px-5 bg-muted/30 border border-border focus:border-primary/40 rounded-xl text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Course Title</label>
                                        <input
                                            placeholder="Introduction to Physics"
                                            value={newExam.title}
                                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                            className="w-full h-12 px-5 bg-muted/30 border border-border focus:border-primary/40 rounded-xl text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Date</label>
                                            <input
                                                type="date"
                                                value={newExam.date}
                                                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                                className="w-full h-12 px-4 bg-muted/30 border border-border focus:border-primary/40 rounded-xl text-sm font-bold outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Time</label>
                                            <input
                                                type="time"
                                                value={newExam.time}
                                                onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                                className="w-full h-12 px-4 bg-muted/30 border border-border focus:border-primary/40 rounded-xl text-sm font-bold outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddExam}
                                        disabled={!newExam.courseCode || !newExam.date || !newExam.time}
                                        className="w-full h-14 bg-muted hover:bg-primary text-secondary hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add to List
                                    </button>
                                </div>
                            </div>

                            {/* Exam List */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest opacity-60">Scheduled Exams</h3>
                                    <div className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 px-4 py-1 rounded-full uppercase tracking-widest">
                                        {timetable?.exams.length || 0} Total
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {timetable?.exams.length === 0 ? (
                                        <div className="py-20 text-center bg-muted/5 rounded-[2.5rem] border border-dashed border-border">
                                            <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">No exams added yet</p>
                                        </div>
                                    ) : (
                                        timetable?.exams.map((exam, idx) => (
                                            <motion.div
                                                layout
                                                key={`${exam.courseCode}-${idx}`}
                                                className="bg-card border border-border hover:border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group transition-all"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                                    <Calendar className="w-7 h-7 text-primary/30 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                    <div>
                                                        <div className="font-black text-foreground text-xl tracking-tight uppercase leading-tight">{exam.courseCode}</div>
                                                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60 truncate">{exam.title}</div>
                                                    </div>
                                                    <div className="flex items-center md:justify-end gap-3">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl border border-transparent group-hover:border-primary/10 transition-all text-xs font-bold text-foreground italic">
                                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                                            {exam.date} • {exam.time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveExam(idx)}
                                                    className="w-10 h-10 flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
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
