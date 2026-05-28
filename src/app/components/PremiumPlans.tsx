import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Crown, Check, MessageSquare, Heart, Sparkles, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { submitPricingFeedback, usePricingConfig } from '@/hooks/useData';
import { useNavigate } from 'react-router-dom';

export function PremiumPlans() {
    const { user } = useAuth();
    const { pricingConfig } = usePricingConfig();
    const navigate = useNavigate();
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoadingVote, setIsLoadingVote] = useState(true);

    const benefits = [
        { title: 'Full Department Timetables', description: 'Never miss an exam with synced schedules.', icon: Sparkles },
        { title: 'Curated Repeated Questions', description: 'Questions that appear year after year.', icon: Heart },
        { title: 'Unlimited Bookmarks', description: 'Save as many courses as you need.', icon: Check },
        { title: 'Priority Feature Access', description: 'Get new features before anyone else.', icon: Crown },
    ];

    // Check if user has already voted on mount
    useEffect(() => {
        if (!user) {
            setIsLoadingVote(false);
            return;
        }

        const fetchVote = async () => {
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                const snap = await getDoc(doc(db, 'pricingFeedback', user.uid));
                if (snap.exists()) {
                    setSelectedPrice(snap.data().suggestedPrice);
                    setSubmitted(true);
                }
            } catch (err) {
                console.error('Error fetching vote:', err);
            } finally {
                setIsLoadingVote(false);
            }
        };

        fetchVote();
    }, [user]);

    const handleSubmitFeedback = async () => {
        if (!user || !selectedPrice || submitted) return;
        setIsSubmitting(true);
        try {
            await submitPricingFeedback(user, selectedPrice);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="px-6 py-8 flex items-center gap-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-30">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" strokeWidth={2.5} />
                </button>
                <h1 className="text-xl font-black text-foreground uppercase tracking-widest">Premium</h1>
            </div>

            <div className="px-6 py-8 max-w-lg mx-auto">
                {/* Value Prop */}
                <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Crown className="w-20 h-20 text-primary rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-foreground mb-4">PaperStack <span className="text-primary italic">Pro</span></h2>
                        <p className="text-secondary text-sm font-medium leading-relaxed mb-8">
                            We're building the ultimate academic companion. Help us shape the future by validating our features and pricing.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                                        <benefit.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground mb-0.5">{benefit.title}</h4>
                                        <p className="text-xs text-secondary font-medium">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing Feedback Section */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{pricingConfig.title}</h3>
                    </div>

                    <p className="text-secondary text-xs font-medium leading-relaxed mb-8">
                        {pricingConfig.description}
                    </p>

                    <AnimatePresence mode="wait">
                        {isLoadingVote ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-8 flex justify-center"
                            >
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </motion.div>
                        ) : !submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-3"
                            >
                                {pricingConfig.options.map((opt) => (
                                    <button
                                        key={opt.amount}
                                        onClick={() => setSelectedPrice(opt.amount)}
                                        className={`w-full h-14 rounded-2xl border transition-all flex items-center px-6 gap-4 ${selectedPrice === opt.amount
                                            ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                            : 'border-border bg-muted/20 text-foreground hover:bg-muted/40'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPrice === opt.amount ? 'border-primary' : 'border-border'
                                            }`}>
                                            {selectedPrice === opt.amount && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                        </div>
                                        <span className="font-black text-sm">{opt.label}</span>
                                    </button>
                                ))}

                                <button
                                    disabled={!selectedPrice || isSubmitting || isLoadingVote}
                                    onClick={handleSubmitFeedback}
                                    className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-8 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Record My Vote
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="thanks"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8" strokeWidth={3} />
                                </div>
                                <h4 className="text-xl font-black text-foreground mb-2">Vote Recorded!</h4>
                                <p className="text-secondary text-xs font-medium px-4">
                                    Thank you for helping us stay fair. We'll notify you when early access opens!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Note */}
                <p className="text-[10px] text-secondary/40 font-bold text-center mt-8 uppercase tracking-widest leading-loose px-8">
                    PaperStack is dedicated to academic excellence in Nigerian universities. All feedback remains strictly confidential.
                </p>
            </div>
        </div>
    );
}
