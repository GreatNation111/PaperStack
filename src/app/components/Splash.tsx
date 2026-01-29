import { motion } from 'motion/react';
import { Layers } from 'lucide-react';
import { useEffect } from 'react';

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center px-8"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <Layers className="w-16 h-16 text-primary mb-6" strokeWidth={1.5} />
        <h1 className="text-4xl font-bold text-foreground tracking-tight">PaperStack</h1>
        <p className="text-lg text-secondary mt-4 text-center max-w-sm leading-relaxed">
          Curated Past Examination Questions for Nigerian Universities
        </p>
      </motion.div>
    </motion.div>
  );
}
