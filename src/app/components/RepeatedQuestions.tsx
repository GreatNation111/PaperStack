import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface RepeatedQuestionsProps {
    onBack: () => void;
}

export function RepeatedQuestions({ onBack }: RepeatedQuestionsProps) {
    const questions = [
        {
            code: 'PHY 101',
            question: 'Derive the equation of motion for a particle under constant acceleration.',
            years: ['2019', '2021', '2023'],
            frequency: 'High',
        },
        {
            code: 'PHY 101',
            question: 'Explain Newton\'s laws of motion and provide practical examples.',
            years: ['2018', '2020', '2022', '2023'],
            frequency: 'Very High',
        },
        {
            code: 'MTH 101',
            question: 'Solve the differential equation dy/dx = x² + 2x.',
            years: ['2020', '2022', '2023'],
            frequency: 'High',
        },
        {
            code: 'CSC 201',
            question: 'Write a program to implement bubble sort algorithm.',
            years: ['2019', '2021', '2023'],
            frequency: 'High',
        },
        {
            code: 'PHY 102',
            question: 'Describe the first and second laws of thermodynamics.',
            years: ['2018', '2020', '2021', '2023'],
            frequency: 'Very High',
        },
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
                    <h1 className="text-3xl font-bold text-foreground">Repeated Questions</h1>
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <TrendingUp className="w-6 h-6 text-primary-foreground flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <div>
                            <h3 className="text-xl font-bold text-primary-foreground mb-1">High-Yield Questions</h3>
                            <p className="text-primary-foreground/80 text-sm">
                                Questions that frequently appear across multiple exam years
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <RefreshCw className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-foreground text-sm">{item.code}</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.frequency === 'Very High'
                                                    ? 'bg-red-500/10 text-red-600'
                                                    : 'bg-amber-500/10 text-amber-600'
                                                }`}
                                        >
                                            {item.frequency}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed mb-3">{item.question}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-secondary">Appeared in:</span>
                                        <div className="flex gap-1.5">
                                            {item.years.map((year, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-muted rounded text-xs text-secondary font-medium"
                                                >
                                                    {year}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
