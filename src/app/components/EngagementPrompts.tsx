import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, MessageSquareText, Smartphone, Star, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { submitStudentFeedback, useDepartments, useUserProfile } from '@/hooks/useData';

type PromptId = 'feedback' | 'install';
type ActivePrompt = PromptId | null;
type InstallStep = 'intro' | 'ios' | 'android';

type PromptState = {
  completed?: boolean;
  submitted?: boolean;
  dismissedUntil?: any;
  lastShownAt?: any;
  updatedAt?: any;
  weekKey?: string;
  weeklyCount?: number;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PROMPT_DELAY_MS = 9000;
const FEEDBACK_SNOOZE_DAYS = 7;
const INSTALL_SNOOZE_DAYS = 14;

function toDate(value: any) {
  if (!value) return null;
  if (value.toDate) return value.toDate() as Date;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function getWeekKey(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return `${copy.getFullYear()}-${copy.getMonth() + 1}-${copy.getDate()}`;
}

function isStandaloneApp() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

function getDeviceStep(): InstallStep {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ? 'ios' : 'android';
}

function getPromptStatePath(userId: string, promptId: PromptId) {
  return doc(db, 'users', userId, 'prompt_state', promptId);
}

export function EngagementPrompts({ enabled }: { enabled: boolean }) {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { departments } = useDepartments();

  const [feedbackPromptState, setFeedbackPromptState] = useState<PromptState | null | undefined>(undefined);
  const [installPromptState, setInstallPromptState] = useState<PromptState | null | undefined>(undefined);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [hasStudied, setHasStudied] = useState(false);
  const [nativeInstallPrompt, setNativeInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [rating, setRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [installStep, setInstallStep] = useState<InstallStep>('intro');

  const departmentName = useMemo(() => {
    return departments.find(department => department.id === profile?.departmentId)?.name || '';
  }, [departments, profile?.departmentId]);

  const hasAcademicProfile = Boolean(profile?.departmentId && profile.departmentId !== 'General' && profile?.level);
  const isQuietStudentRoute = ['/home', '/explore', '/library', '/past-questions'].includes(location.pathname);
  const promptSessionKey = user?.uid ? `paperstack_prompt_shown_${user.uid}` : '';
  const currentWeekKey = getWeekKey();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setNativeInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const sessionKey = `paperstack_session_registered_${user.uid}`;
    const countKey = `paperstack_session_count_${user.uid}`;
    let nextCount = Number(localStorage.getItem(countKey) || 0);

    if (!sessionStorage.getItem(sessionKey)) {
      nextCount += 1;
      localStorage.setItem(countKey, String(nextCount));
      sessionStorage.setItem(sessionKey, 'true');
    }

    setSessionCount(nextCount);
    setHasStudied(localStorage.getItem(`paperstack_has_studied_${user.uid}`) === 'true');
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const routeSuggestsStudy = location.pathname.startsWith('/view-paper')
      || location.pathname.startsWith('/course/')
      || location.pathname === '/library';

    if (routeSuggestsStudy) {
      localStorage.setItem(`paperstack_has_studied_${user.uid}`, 'true');
      setHasStudied(true);
    }
  }, [location.pathname, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setFeedbackPromptState(undefined);
      setInstallPromptState(undefined);
      return;
    }

    let isMounted = true;

    const loadPromptState = async () => {
      const [feedbackStateSnap, installStateSnap, feedbackSnap] = await Promise.all([
        getDoc(getPromptStatePath(user.uid, 'feedback')),
        getDoc(getPromptStatePath(user.uid, 'install')),
        getDoc(doc(db, 'student_feedback', user.uid))
      ]);

      if (!isMounted) return;

      const feedbackState = feedbackStateSnap.exists() ? feedbackStateSnap.data() as PromptState : {};
      setFeedbackPromptState({
        ...feedbackState,
        submitted: feedbackState.submitted || feedbackSnap.exists()
      });
      setInstallPromptState(installStateSnap.exists() ? installStateSnap.data() as PromptState : {});
    };

    loadPromptState().catch(error => {
      console.error('Error loading engagement prompt state:', error);
      if (isMounted) {
        setFeedbackPromptState({});
        setInstallPromptState({});
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !installPromptState || !isStandaloneApp() || installPromptState.completed) return;

    void updatePromptState('install', { completed: true, completedAt: new Date() });
  }, [installPromptState?.completed, user?.uid]);

  const updatePromptState = async (promptId: PromptId, updates: PromptState) => {
    if (!user?.uid) return;

    const nextUpdates = {
      ...updates,
      updatedAt: new Date()
    };

    await setDoc(getPromptStatePath(user.uid, promptId), nextUpdates, { merge: true });

    if (promptId === 'feedback') {
      setFeedbackPromptState(prev => ({ ...(prev || {}), ...nextUpdates }));
    } else {
      setInstallPromptState(prev => ({ ...(prev || {}), ...nextUpdates }));
    }
  };

  const recordPromptImpression = async (promptId: PromptId) => {
    const state = promptId === 'feedback' ? feedbackPromptState : installPromptState;
    const weeklyCount = state?.weekKey === currentWeekKey ? state?.weeklyCount || 0 : 0;

    await updatePromptState(promptId, {
      weekKey: currentWeekKey,
      weeklyCount: weeklyCount + 1,
      lastShownAt: new Date()
    });
  };

  const isSnoozed = (state?: PromptState | null) => {
    const dismissedUntil = toDate(state?.dismissedUntil);
    return Boolean(dismissedUntil && dismissedUntil > new Date());
  };

  const weeklyCount = (state?: PromptState | null) => {
    return state?.weekKey === currentWeekKey ? state?.weeklyCount || 0 : 0;
  };

  useEffect(() => {
    if (!enabled || !user?.uid || activePrompt || !hasAcademicProfile || !isQuietStudentRoute) return;
    if (feedbackPromptState === undefined || installPromptState === undefined) return;
    if (sessionStorage.getItem(promptSessionKey)) return;

    const hasEnoughUsage = hasStudied || sessionCount >= 2;
    if (!hasEnoughUsage) return;

    const timer = window.setTimeout(() => {
      if (sessionStorage.getItem(promptSessionKey)) return;

      const canAskFeedback = !feedbackPromptState?.submitted
        && !isSnoozed(feedbackPromptState)
        && weeklyCount(feedbackPromptState) < 2;
      const canAskInstall = !isStandaloneApp()
        && !installPromptState?.completed
        && !isSnoozed(installPromptState);

      let nextPrompt: ActivePrompt = null;
      if (canAskFeedback && Math.random() < (hasStudied ? 0.55 : 0.35)) {
        nextPrompt = 'feedback';
      } else if (canAskInstall && Math.random() < 0.45) {
        nextPrompt = 'install';
      }

      if (!nextPrompt) return;

      sessionStorage.setItem(promptSessionKey, nextPrompt);
      setActivePrompt(nextPrompt);
      setInstallStep('intro');
      void recordPromptImpression(nextPrompt);
    }, PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    activePrompt,
    enabled,
    feedbackPromptState,
    hasAcademicProfile,
    hasStudied,
    installPromptState,
    isQuietStudentRoute,
    promptSessionKey,
    sessionCount,
    user?.uid
  ]);

  const closePrompt = () => {
    setActivePrompt(null);
    setFeedbackSubmitted(false);
    setSubmittingFeedback(false);
  };

  const snoozeFeedback = async () => {
    await updatePromptState('feedback', { dismissedUntil: addDays(FEEDBACK_SNOOZE_DAYS) });
    closePrompt();
  };

  const snoozeInstall = async () => {
    await updatePromptState('install', { dismissedUntil: addDays(INSTALL_SNOOZE_DAYS) });
    closePrompt();
  };

  const markInstallComplete = async () => {
    await updatePromptState('install', { completed: true, completedAt: new Date() });
    closePrompt();
  };

  const handleSubmitFeedback = async () => {
    if (!user || rating === 0 || submittingFeedback) return;

    setSubmittingFeedback(true);
    try {
      await submitStudentFeedback({
        user,
        profile,
        departmentName,
        rating,
        message: feedbackMessage,
        contextPath: location.pathname
      });
      await updatePromptState('feedback', { submitted: true, completedAt: new Date() });
      setFeedbackSubmitted(true);
      window.setTimeout(closePrompt, 1400);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmittingFeedback(false);
    }
  };

  const handleNativeInstall = async () => {
    if (!nativeInstallPrompt) return;

    await nativeInstallPrompt.prompt();
    const choice = await nativeInstallPrompt.userChoice;
    setNativeInstallPrompt(null);

    if (choice.outcome === 'accepted') {
      await markInstallComplete();
    }
  };

  return (
    <AnimatePresence>
      {activePrompt && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card text-foreground shadow-2xl sm:rounded-3xl"
          >
            {activePrompt === 'feedback' ? (
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {feedbackSubmitted ? <CheckCircle className="h-5 w-5" /> : <MessageSquareText className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-foreground">How is PaperStack working for you?</h2>
                      <p className="mt-1 text-sm leading-6 text-secondary">
                        Your feedback helps us improve the courses, past questions, and study experience for students.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={snoozeFeedback}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close feedback prompt"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {feedbackSubmitted ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-primary">
                    Thanks. Your feedback has been received.
                  </div>
                ) : (
                  <>
                    <div className="mb-5 flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                            value <= rating
                              ? 'border-amber-400 bg-amber-400/10 text-amber-500'
                              : 'border-border bg-muted/30 text-secondary hover:border-amber-300 hover:text-amber-500'
                          }`}
                          aria-label={`Rate PaperStack ${value} out of 5`}
                        >
                          <Star className="h-6 w-6" fill={value <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-secondary">
                      Feedback message
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(event) => setFeedbackMessage(event.target.value)}
                      rows={4}
                      maxLength={600}
                      placeholder="Tell us what would make PaperStack more useful for you."
                      className="mb-5 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-secondary/60 focus:border-primary"
                    />

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={snoozeFeedback}
                        className="h-11 flex-1 rounded-xl border border-border px-4 text-sm font-bold text-secondary transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Not now
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitFeedback}
                        disabled={rating === 0 || submittingFeedback}
                        className="h-11 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submittingFeedback ? 'Sending...' : 'Submit feedback'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-foreground">Add PaperStack to your home screen</h2>
                      <p className="mt-1 text-sm leading-6 text-secondary">
                        Open PaperStack faster whenever you need past questions, saved papers, or course materials.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={snoozeInstall}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close install prompt"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {installStep === 'intro' ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setInstallStep(getDeviceStep())}
                      className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Show me how
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={snoozeInstall}
                        className="h-11 rounded-xl border border-border px-4 text-sm font-bold text-secondary transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Maybe later
                      </button>
                      <button
                        type="button"
                        onClick={markInstallComplete}
                        className="h-11 rounded-xl border border-border px-4 text-sm font-bold text-secondary transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Already added
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1">
                      <button
                        type="button"
                        onClick={() => setInstallStep('ios')}
                        className={`h-10 rounded-xl text-sm font-bold transition-colors ${
                          installStep === 'ios' ? 'bg-card text-foreground shadow-sm' : 'text-secondary'
                        }`}
                      >
                        iPhone or iPad
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallStep('android')}
                        className={`h-10 rounded-xl text-sm font-bold transition-colors ${
                          installStep === 'android' ? 'bg-card text-foreground shadow-sm' : 'text-secondary'
                        }`}
                      >
                        Android
                      </button>
                    </div>

                    <div className="mb-5 space-y-3 text-sm leading-6 text-secondary">
                      {installStep === 'ios' ? (
                        <>
                          <p><span className="font-bold text-foreground">1.</span> Open PaperStack in Safari.</p>
                          <p><span className="font-bold text-foreground">2.</span> Tap the Share button.</p>
                          <p><span className="font-bold text-foreground">3.</span> Choose Add to Home Screen.</p>
                          <p><span className="font-bold text-foreground">4.</span> Tap Add.</p>
                        </>
                      ) : (
                        <>
                          <p><span className="font-bold text-foreground">1.</span> Open PaperStack in Chrome.</p>
                          <p><span className="font-bold text-foreground">2.</span> Tap the menu button.</p>
                          <p><span className="font-bold text-foreground">3.</span> Choose Install app or Add to Home screen.</p>
                          <p><span className="font-bold text-foreground">4.</span> Confirm by tapping Install or Add.</p>
                        </>
                      )}
                    </div>

                    {installStep === 'android' && nativeInstallPrompt && (
                      <button
                        type="button"
                        onClick={handleNativeInstall}
                        className="mb-2 h-11 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Install from browser
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={snoozeInstall}
                        className="h-11 rounded-xl border border-border px-4 text-sm font-bold text-secondary transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Later
                      </button>
                      <button
                        type="button"
                        onClick={markInstallComplete}
                        className="h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
