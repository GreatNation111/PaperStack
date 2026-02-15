import { motion } from 'motion/react';
import { Lock, Crown, BellRing, ChevronRight } from 'lucide-react';

interface PremiumLockProps {
    children: React.ReactNode;
    isPremium: boolean;
    type?: 'premium' | 'coming_soon';
    featureName: string;
    onAction?: () => void; // Usually navigation to Pricing/Plans page
}

export function PremiumLock({ children, isPremium, type = 'premium', featureName, onAction }: PremiumLockProps) {
    if (isPremium && type === 'premium') {
        return <>{children}</>;
    }

    const isComingSoon = type === 'coming_soon';

    return (
        <div className="relative overflow-hidden rounded-2xl group">
            {/* Content Layer (Blurred) */}
            <div className="blur-md select-none pointer-events-none transition-all group-hover:blur-lg opacity-40">
                {children}
            </div>

            {/* Overlay Layer */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-background/20 backdrop-blur-[2px]">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center max-w-[240px]"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-lg ${isComingSoon ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary'
                        }`}>
                        {isComingSoon ? (
                            <BellRing className="w-7 h-7" strokeWidth={2.5} />
                        ) : (
                            <Lock className="w-7 h-7" strokeWidth={2.5} />
                        )}
                    </div>

                    <h3 className="text-lg font-black text-foreground mb-1">
                        {isComingSoon ? 'Coming Soon' : 'Premium Feature'}
                    </h3>
                    <p className="text-secondary text-xs font-medium leading-relaxed mb-6">
                        {isComingSoon
                            ? `${featureName} is launching soon. Get notified when it's live!`
                            : `Unlock ${featureName} and more with PaperStack Premium.`}
                    </p>

                    <button
                        onClick={onAction}
                        className={`w-full h-11 rounded-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${isComingSoon
                                ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/20 shadow-lg'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-lg'
                            }`}
                    >
                        {isComingSoon ? (
                            <>
                                <BellRing className="w-3.5 h-3.5" strokeWidth={2.5} />
                                Notify Me
                            </>
                        ) : (
                            <>
                                <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
                                See Plans
                                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Floating Accent Crown for Premium */}
                {!isComingSoon && (
                    <div className="absolute top-4 right-4 animate-bounce text-primary/30">
                        <Crown className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
