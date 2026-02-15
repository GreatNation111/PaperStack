import { motion } from 'motion/react';
import { Lock, Crown, BellRing, ChevronRight, Sparkles } from 'lucide-react';

interface PremiumLockProps {
    children: React.ReactNode;
    isPremium: boolean;
    type?: 'premium' | 'coming_soon';
    featureName: string;
    onAction?: () => void;
}

export function PremiumLock({ children, isPremium, type = 'premium', featureName, onAction }: PremiumLockProps) {
    if (isPremium && type === 'premium') {
        return <>{children}</>;
    }

    const isComingSoon = type === 'coming_soon';

    return (
        <div className="relative overflow-hidden rounded-[2rem] group border border-border/50 shadow-sm">
            {/* Content Layer (Blurred) */}
            <div className="blur-xl select-none pointer-events-none transition-all duration-700 group-hover:blur-2xl opacity-20 scale-105">
                {children}
            </div>

            {/* Frosted Glass Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-background/30 backdrop-blur-[6px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[60px] rounded-full animate-pulse [animation-delay:2s]" />
                </div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="relative z-20 flex flex-col items-center text-center max-w-[280px]"
                >
                    {/* Icon Shield Container */}
                    <div className="relative mb-6">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl ${isComingSoon
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                            {isComingSoon ? (
                                <BellRing className="w-10 h-10" strokeWidth={1.5} />
                            ) : (
                                <Lock className="w-10 h-10" strokeWidth={1.5} />
                            )}
                        </div>
                        {/* Floating sparkle */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-2 -right-2 text-primary"
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                            {isComingSoon ? 'Roadmap' : 'Locked'}
                        </h3>
                        <p className="text-secondary text-xs font-bold leading-relaxed uppercase tracking-widest opacity-80">
                            {isComingSoon
                                ? `${featureName} is currently in final development.`
                                : `Unlock ${featureName} with Pro Access.`}
                        </p>
                    </div>

                    <button
                        onClick={onAction}
                        className={`group/btn w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden active:scale-95 ${isComingSoon
                            ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                            : 'bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                            }`}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                        {isComingSoon ? (
                            <>
                                <BellRing className="w-4 h-4" strokeWidth={2.5} />
                                <span>Notify Me</span>
                            </>
                        ) : (
                            <>
                                <Crown className="w-4 h-4" strokeWidth={2.5} />
                                <span>Upgrade Now</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {!isComingSoon && (
                        <p className="mt-6 text-[10px] font-black text-secondary uppercase tracking-widest opacity-40">
                            PaperStack Premium Access
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
