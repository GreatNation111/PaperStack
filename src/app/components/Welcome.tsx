import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Search, Bookmark, TrendingUp, FileText, Download, CheckSquare } from 'lucide-react';

interface WelcomeProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function Welcome({ onSignIn, onSignUp }: WelcomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const slides = [
    {
      icon: FileText,
      title: 'Equal Access to Past Questions',
      description: 'No more begging seniors or incomplete sets. Verified questions organized by department and year.',
      visual: 'text',
    },
    {
      icon: Search,
      title: 'Search & Find Instantly',
      description: 'Filter by course code, year, exam type – discover repeated questions.',
      visual: 'search',
    },
    {
      icon: Bookmark,
      title: 'Save & Access Quickly',
      description: 'Bookmark favorites, download PDFs for offline use.',
      visual: 'bookmark',
      badge: 'Coming Soon',
    },
    {
      icon: TrendingUp,
      title: 'Lecturer Repeat Insights',
      description: 'See which lecturers recycle questions year after year.',
      visual: 'graph',
      badge: 'Coming Soon',
    },
    {
      icon: FileText,
      title: 'Detailed Solutions & Predictions',
      description: 'Get high-yield question packs and step-by-step explanations.',
      visual: 'checklist',
      badge: 'Coming Soon',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const renderVisual = (visual: string) => {
    switch (visual) {
      case 'text':
        return (
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-white/70 flex-shrink-0" strokeWidth={1.5} />
              <div className="h-3 flex-1 bg-white/15 rounded" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-white/70 flex-shrink-0" strokeWidth={1.5} />
              <div className="h-3 flex-1 bg-white/15 rounded" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-white/70 flex-shrink-0" strokeWidth={1.5} />
              <div className="h-3 flex-1 bg-white/15 rounded" />
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 gap-3">
            <Search className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            <div className="h-3 w-32 bg-white/10 rounded" />
          </div>
        );
      case 'bookmark':
        return (
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Bookmark className="w-7 h-7 text-white/40" strokeWidth={1.5} />
            </div>
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Download className="w-7 h-7 text-white/40" strokeWidth={1.5} />
            </div>
          </div>
        );
      case 'graph':
        return (
          <div className="w-full h-20 flex items-end gap-2">
            {[40, 70, 45, 85, 60].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-white/10 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        );
      case 'checklist':
        return (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                <div className="h-2 flex-1 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Top Section - Logo and Tagline - Centered in the top space */}
      <motion.div
        className="absolute top-0 left-0 right-0 bottom-[55vh] flex flex-col items-center justify-center px-8 z-0 bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-[rgba(255,255,255,0.70)] before:backdrop-blur-[2px] before:brightness-105 before:-z-10"
        style={{ backgroundImage: 'url(/background-image.jpeg)' }}
        animate={{
          opacity: isPanelExpanded ? 0 : 1,
          pointerEvents: isPanelExpanded ? 'none' : 'auto'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Layers className="w-10 h-10 text-[#0A2540] mb-3" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-[#0A2540] tracking-tight mb-2">PaperStack</h1>
          <p className="text-sm text-[#0A2540]/60 text-center max-w-xs leading-relaxed">
            Curated Past Examination Questions for Nigerian Universities
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom Panel - Absolute Positioning for Full Height Control */}
      <motion.div
        className="bg-[#0A2540]/[0.97] rounded-t-[32px] shadow-2xl absolute left-0 right-0 bottom-0 z-10 flex flex-col"
        initial={false}
        animate={{
          height: isPanelExpanded ? '90%' : '55vh',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {/* Drag Handle - SMOOTH REAL-TIME DRAG */}
        <motion.div
          className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing z-20"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          onDrag={(_, info) => {
            // Drag UP is negative, we want to expand
            if (info.offset.y < -50 && !isPanelExpanded) {
              setIsPanelExpanded(true);
            }
            // Drag DOWN is positive, we want to collapse
            if (info.offset.y > 50 && isPanelExpanded) {
              setIsPanelExpanded(false);
            }
          }}
          onDragEnd={(_, info) => {
            // Velocity check
            if (info.velocity.y < -400) setIsPanelExpanded(true);
            if (info.velocity.y > 400) setIsPanelExpanded(false);
          }}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </motion.div>

        {/* Content Container - Grows with panel */}
        <div className="flex-1 flex flex-col px-4 pt-2 pb-4 overflow-y-auto w-full">
          {/* Welcome Headline */}
          <h2 className="text-2xl font-bold text-white mb-6 pl-4">Welcome</h2>

          {/* Carousel - Centers when expanded */}
          <div className="flex-1 relative mb-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                {isPanelExpanded ? (
                  // Expanded state - Centered with visuals
                  <div className="flex flex-col items-center justify-center gap-8 text-center px-4">
                    <div className="flex flex-col items-center gap-4">
                      {React.createElement(slides[currentSlide].icon, {
                        className: 'w-16 h-16 text-white/90',
                        strokeWidth: 1.5,
                      })}
                      <div className="flex flex-col items-center gap-2">
                        <h3 className="text-2xl font-semibold text-white">
                          {slides[currentSlide].title}
                        </h3>
                        {slides[currentSlide].badge && (
                          <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                            {slides[currentSlide].badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full max-w-sm">
                      {renderVisual(slides[currentSlide].visual || '')}
                    </div>
                    <p className="text-base text-white/80 leading-relaxed max-w-md">
                      {slides[currentSlide].description}
                    </p>
                  </div>
                ) : (
                  // Collapsed state - Side by side
                  <div className="flex items-start gap-4 px-4">
                    {React.createElement(slides[currentSlide].icon, {
                      className: 'w-9 h-9 text-white/90 flex-shrink-0',
                      strokeWidth: 1.5,
                    })}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {slides[currentSlide].title}
                        </h3>
                        {slides[currentSlide].badge && (
                          <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                            {slides[currentSlide].badge}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-white/70 leading-relaxed">
                        {slides[currentSlide].description}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 px-4 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-4 mb-3">
            <button
              onClick={onSignIn}
              className="flex-1 h-14 bg-white text-[#0A2540] rounded-xl font-semibold hover:opacity-90 transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="flex-1 h-14 border-2 border-white bg-transparent text-white rounded-xl font-semibold hover:bg-white/5 transition-all duration-300"
            >
              Sign Up
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-white/70">
            <a className="hover:underline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <span>•</span>
            <a className="hover:underline" href="/tos" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}