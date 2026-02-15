import { motion } from 'motion/react';
import { Lock, Crown, BellRing, ChevronRight, Sparkles } from 'lucide-react';

interface PremiumLockProps {
    children: React.ReactNode;
    isPremium: boolean;
    type?: 'premium' | 'coming_soon';
    featureName: string;
    onAction?: () => void;
    compact?: boolean;
}

export function PremiumLock({ children, isPremium, type = 'premium', featureName, onAction, compact = false }: PremiumLockProps) {
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

            {/* Frosted Glass Overlay with adaptive padding */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[6px] ${compact ? 'p-3' : 'p-6 lg:p-10'}`}>
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
                    <div className={`relative ${compact ? 'mb-3' : 'mb-6'}`}>
                        <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14 lg:w-16 lg:h-16'} rounded-2xl lg:rounded-3xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl overflow-visible ${isComingSoon
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                            {isComingSoon ? (
                                <BellRing className={`${compact ? 'w-4 h-4' : 'w-6 h-6 lg:w-8 lg:h-8'}`} strokeWidth={1.5} />
                            ) : (
                                <Lock className={`${compact ? 'w-4 h-4' : 'w-6 h-6 lg:w-8 lg:h-8'}`} strokeWidth={1.5} />
                            )}
                        </div>
                        {/* Floating sparkle */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className={`absolute text-primary ${compact ? '-top-0.5 -right-0.5' : '-top-1 -right-1'}`}
                        >
                            <Sparkles className={`${compact ? 'w-3 h-3' : 'w-4 h-4 lg:w-5 lg:h-5'}`} />
                        </motion.div>
                    </div>

                    <div className={`${compact ? 'space-y-0 mb-3' : 'space-y-1 mb-6'}`}>
                        <h3 className={`${compact ? 'text-sm' : 'text-lg lg:text-xl'} font-black text-foreground tracking-tight uppercase`}>
                            {isComingSoon ? 'Roadmap' : 'Locked'}
                        </h3>
                        <p className="text-secondary text-[10px] lg:text-xs font-bold leading-relaxed uppercase tracking-widest opacity-80">
                            {isComingSoon
                                ? `${featureName} is in dev.`
                                : `Unlock ${featureName} with Pro.`}
                        </p>
                    </div>

                    <button
                        onClick={onAction}
                        className={`group/btn w-full ${compact ? 'h-9' : 'h-14'} rounded-2xl flex items-center justify-center px-8 gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden active:scale-95 ${isComingSoon
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
                        <p className={`mt-6 text-[10px] font-black text-secondary uppercase tracking-widest opacity-40 ${compact ? 'hidden' : 'block'}`}>
                            PaperStack Premium Access
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
