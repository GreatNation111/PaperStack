import { ArrowLeft, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useFeatureInterests, recordFeatureInterest } from '@/hooks/useData';

export function RepeatedQuestions() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { interests } = useFeatureInterests(user?.uid);
    const featureTitle = "Repeated Questions Premium";

    const handleNotify = async () => {
        if (!user) return;
        await recordFeatureInterest(user.uid, featureTitle);
    };

    const isNotified = interests.includes(featureTitle);

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <button
                    onClick={() => navigate('/explore')}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
                </button>
                <h1 className="text-2xl font-bold text-foreground">Repeated Questions</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-3xl border border-primary/20 text-center"
                >
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                        <Crown className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Premium Feature</h2>
                    <p className="text-secondary text-sm leading-relaxed mb-6">
                        Unlock access to high-yield repeated questions. Master the patterns that matter most for your exams.
                    </p>

                    <button
                        onClick={handleNotify}
                        disabled={isNotified}
                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 ${isNotified
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-primary text-primary-foreground hover:opacity-90'
                            }`}
                    >
                        {isNotified ? 'Request Sent!' : 'Notify Me When Ready'}
                    </button>
                    <p className="text-xs text-secondary mt-4">Coming soon to PaperStack</p>
                </motion.div>
            </div>
        </div>
    );
}
