import { ArrowLeft, Crown, MessageCircleQuestion, Sparkles, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useUserProfile, useRepeatedQuestions, useGlobalConfig } from '@/hooks/useData';
import { PremiumLock } from './PremiumLock';
import { format } from 'date-fns';

export function RepeatedQuestions() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useUserProfile(user?.uid);
    const { config } = useGlobalConfig();
    const { data, loading } = useRepeatedQuestions(profile?.departmentId);

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={2.5} />
                    </button>
                    <h1 className="text-xl font-black text-foreground uppercase tracking-widest">Repeated Questions</h1>
                </div>
            </div>

            <div className="px-6 py-8">
                {/* Intro Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/5 border border-accent/20 rounded-[2.5rem] p-8 mb-12 flex gap-6 items-start"
                >
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex-shrink-0 flex items-center justify-center text-accent">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground mb-1">Pattern Recognition</h3>
                        <p className="text-secondary text-xs font-medium leading-relaxed">
                            Our admins manually curate common questions from previous exam cycles to help you focus on high-yield topics.
                        </p>
                    </div>
                </motion.div>

                {/* Content */}
                <PremiumLock
                    isPremium={!!profile?.isPremium}
                    featureName="Curated Pattern Insights"
                    onAction={() => navigate('/premium')}
                >
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-48 bg-muted/50 animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : !data || data.items.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                            <MessageCircleQuestion className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Insight Queue Empty</h4>
                            <p className="text-secondary text-xs font-medium px-12 mt-2">
                                Curated insights for your department are currently being reviewed by admins.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {data.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-base font-black text-foreground mb-1">{item.courseCode}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                Updated {item.updatedAt?.toDate ? format(item.updatedAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                                            <Crown className="w-5 h-5 text-primary opacity-50" />
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                                        <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                                            {item.questions}
                                        </p>
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
