import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface TimetableProps {
    onBack: () => void;
}

export function Timetable({ onBack }: TimetableProps) {
    const examSchedule = [
        { date: 'Mon, Feb 10', time: '9:00 AM', code: 'PHY 101', title: 'General Physics I', venue: 'Hall A' },
        { date: 'Wed, Feb 12', time: '2:00 PM', code: 'MTH 101', title: 'Elementary Mathematics', venue: 'Hall B' },
        { date: 'Fri, Feb 14', time: '9:00 AM', code: 'CSC 201', title: 'Computer Programming I', venue: 'Hall C' },
        { date: 'Mon, Feb 17', time: '2:00 PM', code: 'PHY 102', title: 'General Physics II', venue: 'Hall A' },
        { date: 'Wed, Feb 19', time: '9:00 AM', code: 'CHM 101', title: 'General Chemistry I', venue: 'Hall D' },
    ];

    return (
        <div className="pb-24 min-h-screen">
            <div className="px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">Exam Timetable</h1>
                </div>

                {/* Semester Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-primary-foreground flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <div>
                            <h3 className="text-xl font-bold text-primary-foreground mb-1">First Semester 2024/2025</h3>
                            <p className="text-primary-foreground/80 text-sm">Examinations begin in 14 days</p>
                        </div>
                    </div>
                </motion.div>

                {/* Schedule List */}
                <div className="space-y-3">
                    {examSchedule.map((exam, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="font-bold text-foreground mb-1">{exam.code}</div>
                                    <div className="text-sm text-secondary">{exam.title}</div>
                                </div>
                                <div className="text-xs text-secondary text-right">
                                    <div className="font-semibold text-foreground mb-1">{exam.date}</div>
                                    <div>{exam.time}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                <span className="text-xs text-secondary">Venue: {exam.venue}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
