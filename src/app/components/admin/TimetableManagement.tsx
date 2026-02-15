import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Clock, Save, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
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
            setMessage({ type: 'success', text: 'Timetable updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving timetable:', error);
            setMessage({ type: 'error', text: 'Failed to update timetable.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Timetable Manager</h1>
                    <p className="text-secondary text-sm font-medium">Create and manage department-scoped exam schedules.</p>
                </div>
                {timetable && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Updates
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
                        className="flex-1 h-14 px-6 bg-muted/20 border border-border rounded-2xl text-foreground font-bold focus:border-primary outline-none transition-all appearance-none"
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
                        <Calendar className="w-12 h-12 text-secondary/20 mx-auto mb-4" />
                        <p className="text-secondary text-sm font-medium italic">Select a department above to manage its exams.</p>
                    </motion.div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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

                        {/* Add New Exam Row */}
                        <div className="bg-card border border-border rounded-[2.5rem] p-8">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" />
                                Add Exam Slot
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    placeholder="Course Code (e.g. PHY 101)"
                                    value={newExam.courseCode}
                                    onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value.toUpperCase() })}
                                    className="h-12 px-5 bg-muted/20 border border-border rounded-xl text-sm font-bold placeholder:text-secondary focus:border-primary outline-none transition-all"
                                />
                                <input
                                    placeholder="Title (e.g. Mechanics)"
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                    className="h-12 px-5 bg-muted/20 border border-border rounded-xl text-sm font-bold placeholder:text-secondary focus:border-primary outline-none transition-all"
                                />
                                <input
                                    type="date"
                                    value={newExam.date}
                                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                    className="h-12 px-5 bg-muted/20 border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all"
                                />
                                <input
                                    type="time"
                                    value={newExam.time}
                                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                    className="h-12 px-5 bg-muted/20 border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleAddExam}
                                disabled={!newExam.courseCode || !newExam.date || !newExam.time}
                                className="mt-6 w-full h-12 bg-muted text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add to List
                            </button>
                        </div>

                        {/* Current List */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] px-4">Scheduled Exams</h3>
                            {timetable?.exams.length === 0 ? (
                                <div className="text-center py-10 text-secondary/40 font-bold italic text-sm">No exams scheduled yet.</div>
                            ) : (
                                timetable?.exams.map((exam, idx) => (
                                    <div key={idx} className="bg-card border border-border rounded-[2rem] p-6 flex items-center gap-6 group hover:border-primary/30 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div className="font-black text-foreground">{exam.courseCode}</div>
                                            <div className="text-sm font-bold text-secondary truncate">{exam.title}</div>
                                            <div className="flex items-center gap-2 text-xs font-black text-foreground">
                                                <Clock className="w-3.5 h-3.5 text-primary opacity-50" />
                                                {exam.date} @ {exam.time}
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleRemoveExam(idx)}
                                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
