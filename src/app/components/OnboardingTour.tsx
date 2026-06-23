import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TOUR_STORAGE_KEY = 'paperstack_onboarding_tour_v1';

type TourStep = {
  target: string;
  title: string;
  body: string;
  actionLabel?: string;
  route?: string;
};

const steps: TourStep[] = [
  {
    target: 'profile-tab',
    title: 'Start with Profile',
    body: 'Set your department and level here so PaperStack can show courses, timetables, and repeated questions that actually match you.',
    actionLabel: 'Open Profile',
    route: '/profile',
  },
  {
    target: 'explore-tab',
    title: 'Find Past Questions',
    body: 'Explore is where you search for courses and browse by department. Searches now understand both “ITE 403” and “ite403”.',
    actionLabel: 'Open Explore',
    route: '/explore',
  },
  {
    target: 'explore-search',
    title: 'Search Naturally',
    body: 'Type a course code with or without spaces. The search checks all departments while you type, so the right course is not hidden by your current filter.',
  },
  {
    target: 'library-tab',
    title: 'Keep Papers Offline',
    body: 'Saved papers live in Library, so you can still study when data is slow or unavailable.',
  },
];

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function OnboardingTour({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const step = steps[stepIndex];
  const padding = 10;
  const paddedRect = useMemo(() => {
    if (!targetRect) return null;
    return {
      top: Math.max(12, targetRect.top - padding),
      left: Math.max(12, targetRect.left - padding),
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };
  }, [targetRect]);

  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'done') return;

    const id = window.setTimeout(() => setIsVisible(true), 700);
    return () => window.clearTimeout(id);
  }, [enabled]);

  useEffect(() => {
    if (!isVisible) return;

    const updateRect = () => {
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    const id = window.setTimeout(updateRect, 250);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      window.clearTimeout(id);
    };
  }, [isVisible, step.target, location.pathname]);

  if (!enabled || !isVisible) return null;

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'done');
    setIsVisible(false);
  };

  const goNext = () => {
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
      window.setTimeout(() => setStepIndex(index => Math.min(index + 1, steps.length - 1)), 120);
      return;
    }

    if (stepIndex === steps.length - 1) {
      completeTour();
      return;
    }

    setStepIndex(index => index + 1);
  };

  const goBack = () => {
    setStepIndex(index => Math.max(0, index - 1));
  };

  const panelTop = paddedRect
    ? Math.max(16, Math.min(window.innerHeight - 230, paddedRect.top + paddedRect.height + 22))
    : Math.round(window.innerHeight * 0.28);
  const panelLeft = paddedRect
    ? Math.max(16, Math.min(Math.max(16, window.innerWidth - 344), paddedRect.left + paddedRect.width / 2 - 160))
    : 16;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-auto">
      {paddedRect ? (
        <>
          <div className="absolute left-0 right-0 bg-black/70" style={{ top: 0, height: paddedRect.top }} />
          <div className="absolute left-0 bg-black/70" style={{ top: paddedRect.top, width: paddedRect.left, height: paddedRect.height }} />
          <div className="absolute right-0 bg-black/70" style={{ top: paddedRect.top, left: paddedRect.left + paddedRect.width, height: paddedRect.height }} />
          <div className="absolute left-0 right-0 bottom-0 bg-black/70" style={{ top: paddedRect.top + paddedRect.height }} />
          <div
            className="absolute rounded-2xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.04),0_0_32px_rgba(79,70,229,0.55)]"
            style={paddedRect}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {paddedRect && (
        <svg
          className="absolute text-primary pointer-events-none"
          style={{
            top: paddedRect.top + paddedRect.height + 2,
            left: Math.max(20, paddedRect.left + paddedRect.width / 2 - 28),
          }}
          width="72"
          height="54"
          viewBox="0 0 72 54"
          fill="none"
        >
          <path d="M9 45C20 18 43 44 58 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M47 12L59 7L62 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      <div
        className="absolute w-[calc(100vw-32px)] max-w-xs rounded-2xl border border-border bg-card p-4 shadow-2xl text-foreground"
        style={{ top: panelTop, left: panelLeft }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">
              {stepIndex + 1} of {steps.length}
            </div>
            <h3 className="text-base font-bold">{step.title}</h3>
          </div>
          <button
            onClick={completeTour}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-muted hover:text-foreground"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-secondary leading-relaxed mb-4">{step.body}</p>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="h-10 px-3 rounded-full text-sm font-medium text-secondary hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={goNext}
            className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"
          >
            {stepIndex === steps.length - 1 ? 'Done' : step.actionLabel || 'Next'}
            {stepIndex !== steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
