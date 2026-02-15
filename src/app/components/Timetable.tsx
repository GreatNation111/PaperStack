import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import { useUserProfile, useTimetable, useGlobalConfig } from '@/hooks/useData';
import { PremiumLock } from './PremiumLock';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface TimetableProps {
    onBack: () => void;
}

export function Timetable({ onBack }: TimetableProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile } = useUserProfile(user?.uid);
    const { config } = useGlobalConfig();
    const { timetable, loading } = useTimetable(profile?.departmentId);

    return (
        <div className="pb-24 min-h-screen">
            <div className="px-6 py-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={2.5} />
                    </button>
                    <h1 className="text-xl font-black text-foreground uppercase tracking-widest">Exam Timetable</h1>
                </div>
            </div>

            <div className="px-6 py-8">
                {/* Semester Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 mb-12"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground">{config.currentSemester} Semester</h3>
                            <p className="text-secondary text-xs font-bold uppercase tracking-widest">{config.currentSession} Session</p>
                        </div>
                    </div>
                    <p className="text-secondary text-xs font-medium leading-relaxed italic">
                        All exam schedules are finalized by the academic board. Check regularly for venue updates.
                    </p>
                </motion.div>

                {/* Schedule Content */}
                <PremiumLock
                    isPremium={!!profile?.isPremium}
                    featureName="Department Timetable"
                    onAction={() => navigate('/premium')}
                >
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : !timetable || timetable.exams.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                            <Calendar className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">No Schedule Found</h4>
                            <p className="text-secondary text-xs font-medium px-12 mt-2">
                                Your department hasn't published the timetable for this semester yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timetable.exams.map((exam, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors mb-1">
                                                {exam.courseCode}
                                            </h4>
                                            <p className="text-sm font-medium text-secondary line-clamp-1">{exam.title}</p>
                                        </div>
                                        <div className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Core_Exam</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 text-secondary">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-tight">
                                                {format(parseISO(exam.date), 'EEE, MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-secondary">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-tight">{exam.time}</span>
                                        </div>
                                        {/* Venue if added later */}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </PremiumLock>
            </div>
        </div>
    );
}
