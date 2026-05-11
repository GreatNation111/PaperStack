import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Splash } from '@/app/components/Splash';
import { Welcome } from '@/app/components/Welcome';
import { Landing } from '@/app/components/Landing';
import { SignIn } from '@/app/components/SignIn';
import { SignUp } from '@/app/components/SignUp';
import { Home } from '@/app/components/Home';
import { Explore } from '@/app/components/Explore';
import { Library } from '@/app/components/Library';
import { Profile } from '@/app/components/Profile';
import { Notifications } from '@/app/components/Notifications';
import { PastQuestions } from '@/app/components/PastQuestions';
import { Timetable } from '@/app/components/Timetable';
import { RepeatedQuestions } from '@/app/components/RepeatedQuestions';
import { CoursePapers } from '@/app/components/CoursePapers';
import { PremiumPlans } from '@/app/components/PremiumPlans';
import { BottomNav } from '@/app/components/BottomNav';
import { Forbidden } from '@/app/components/Forbidden';
import { SeedData } from '@/app/components/SeedData';
import { MaintenanceGate } from '@/app/components/MaintenanceGate';
import { useAnalytics } from '@/app/hooks/useAnalytics';

// --- Lazy Loaded Heavyweight/Secondary Routes ---
const AdminLogin = lazy(() => import('@/app/components/admin').then(m => ({ default: m.AdminLogin })));
const AdminContainer = lazy(() => import('@/app/components/admin').then(m => ({ default: m.AdminContainer })));
const PastQuestionsViewer = lazy(() => import('@/app/components/PastQuestionsViewer').then(m => ({ default: m.PastQuestionsViewer })));
const HelpSupport = lazy(() => import('@/app/components/HelpSupport').then(m => ({ default: m.HelpSupport })));
const TermsPrivacy = lazy(() => import('@/app/components/TermsPrivacy').then(m => ({ default: m.TermsPrivacy })));
const PrivacyPolicy = lazy(() => import('@/app/components/PrivacyPolicy').then(m => ({ default: m.default })));
const TermsOfService = lazy(() => import('@/app/components/TermsOfService').then(m => ({ default: m.default })));

// Global loading fallback for Suspense
const GlobalLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { RequireAuth, PublicOnly, RequireAdmin } from '@/app/cards/RouteGuards';

/** Swipe-to-dismiss offline/online status banner */
function OfflineBanner({ isOffline, showBackOnline, isAdminRoute }: { isOffline: boolean; showBackOnline: boolean; isAdminRoute: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Reset dismissed state when connectivity status changes
  useEffect(() => { setDismissed(false); }, [isOffline, showBackOnline]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    // Swipe up (dy < -40) or horizontal (|dx| > 80) to dismiss
    if (dy < -40 || Math.abs(dx) > 80) {
      setDismissed(true);
    }
    touchStartRef.current = null;
  }, []);

  if (dismissed || ((!isOffline && !showBackOnline) || isAdminRoute)) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[70] px-4 pointer-events-none">
      <div
        ref={bannerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`max-w-md mx-auto rounded-2xl border px-4 py-3 shadow-lg pointer-events-auto transition-all duration-300 ${
          isOffline
            ? 'bg-card border-border text-foreground'
            : 'bg-green-600 text-white border-green-500'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isOffline ? "You're offline" : 'Back online'}
            </p>
            <p className={`text-xs ${isOffline ? 'text-secondary' : 'text-white/80'}`}>
              {isOffline ? 'Swipe to dismiss · Downloads are available.' : 'Your connection is restored.'}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className={`p-1.5 rounded-full transition-colors ${isOffline ? 'hover:bg-foreground/10 text-secondary' : 'hover:bg-white/20 text-white/70'}`}
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}


function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('paperstack_theme') === 'dark';
  });
  const { user, isAdmin, loading: authLoading, userProfile, logout } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();

  const adminPersisted = localStorage.getItem('paperstack_admin_mode') === 'true';

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!user || adminPersisted) return;
    const prefetch = window.requestIdleCallback || ((callback: IdleRequestCallback) => window.setTimeout(callback, 300));
    const cancelPrefetch = window.cancelIdleCallback || window.clearTimeout;
    const handle = prefetch(() => {
      void import('@/app/components/PastQuestionsViewer');
      void import('@/app/components/HelpSupport');
    });

    return () => cancelPrefetch(handle as any);
  }, [user, adminPersisted]);

  // Offline detection and auto-redirect
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (hasBeenOffline) {
        setShowBackOnline(true);
        window.setTimeout(() => setShowBackOnline(false), 3000);
      }
    };
    const handleOffline = () => {
      setHasBeenOffline(true);
      setShowBackOnline(false);
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline]);

  useEffect(() => {
    if (isOffline && user && !adminPersisted && !authLoading) {
       const allowedOfflineRoutes = ['/library', '/view-paper', '/profile'];
       const isAllowed = allowedOfflineRoutes.some(route => location.pathname.startsWith(route));
       if (!isAllowed) {
          navigate('/library', { replace: true });
       }
    }
  }, [isOffline, user, adminPersisted, authLoading, location.pathname, navigate]);

  // If admin mode is active and we're not on an admin route, immediately redirect
  // This bypasses the student UI entirely on reload
  useEffect(() => {
    // Only redirect if we are logged in as admin or have the persistence flag
    // and we are NOT already on an admin route
    if (adminPersisted && !location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [adminPersisted, location.pathname, navigate]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('paperstack_theme', next ? 'dark' : 'light');
  };

  // Navigation Handlers
  const handleSplashComplete = () => navigate('/welcome');
  const handleSignInStart = () => navigate('/signin');
  const handleSignUpStart = () => navigate('/signup');
  const handleAuthComplete = () => {
    // Check if user is admin, if so, go to admin dashboard
    if (adminPersisted || isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/home');
    }
  };

  const handleBackToWelcome = () => navigate('/welcome');
  const handleNotifications = () => navigate('/notifications');
  const handleBackFromNotifications = () => navigate('/home');

  const handleExplore = (department?: string) => {
    navigate('/explore', { state: { department } });
  };

  const handleViewPastQuestions = (courseCode?: string, selectedLevel?: string | null, departmentId?: string) => {
    navigate('/past-questions', { state: { courseCode, selectedLevel, departmentId } });
  };

  const handleBackFromPastQuestions = () => navigate('/explore');

  const handleTabChange = (tab: string) => {
    if (tab === 'home') navigate('/home');
    else navigate(`/${tab}`);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('paperstack_admin_mode');
    await logout();
    navigate('/welcome');
  };

  // Determine active tab based on path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path.startsWith('/explore')) return 'explore';
    if (path.startsWith('/past-questions')) return 'explore';
    if (path.startsWith('/course/')) return 'explore';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const showBottomNav = ['/home', '/explore', '/library', '/profile', '/past-questions'].includes(location.pathname)
    || location.pathname.startsWith('/course/');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingRoute = location.pathname === '/';
  const isFullWidthRoute = isAdminRoute || isLandingRoute;

  return (
    <div className="min-h-screen bg-background font-[Inter,system-ui,sans-serif]">
      <div className={`${isFullWidthRoute ? 'w-full' : 'max-w-md mx-auto'} bg-background min-h-screen relative`}>
        <Suspense fallback={<GlobalLoader />}>
          <Routes location={location}>
            {/* Admin Routes - NOT Gated */}
            <Route path="/admin" element={<AdminLogin onComplete={() => navigate('/admin/dashboard')} />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard/*" element={<AdminContainer onLogout={handleSignOut} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />} />
            </Route>

            {/* User Routes - Gated by MaintenanceGate */}
            <Route element={<MaintenanceGate><Outlet /></MaintenanceGate>}>
              {/* Public Routes */}
              <Route element={<PublicOnly />}>
                <Route path="/" element={<Landing />} />
                <Route path="/welcome" element={<Welcome onSignIn={handleSignInStart} onSignUp={handleSignUpStart} />} />
                <Route path="/signin" element={<SignIn onBack={handleBackToWelcome} onSignUp={handleSignUpStart} onComplete={handleAuthComplete} />} />
                <Route path="/signup" element={<SignUp onBack={handleBackToWelcome} onSignIn={handleSignInStart} onComplete={handleAuthComplete} />} />
              </Route>

              {/* Shared Legal Pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/tos" element={<TermsOfService />} />
              <Route path="/terms" element={<TermsPrivacy />} />

              {/* Splash/Index */}
              <Route path="/splash" element={<Splash onComplete={handleSplashComplete} />} />

              {/* Protected User Routes */}
              <Route element={<RequireAuth />}>
                <Route path="/home" element={<Home userName={userProfile?.name || user?.displayName || 'Student'} onNotifications={handleNotifications} onExplore={handleExplore} />} />
                <Route path="/explore" element={<Explore selectedDepartment={location.state?.department} onViewPastQuestions={handleViewPastQuestions} />} />
                <Route path="/library" element={<Library />} />
                <Route path="/profile" element={<Profile userName={userProfile?.name || user?.displayName || 'Student'} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onSignOut={handleSignOut} />} />
                <Route path="/notifications" element={<Notifications onBack={handleBackFromNotifications} />} />

                {/* Feature Routes */}
                <Route path="/past-questions" element={<PastQuestions onBack={handleBackFromPastQuestions} courseCode={location.state?.courseCode} selectedLevel={location.state?.selectedLevel} departmentId={location.state?.departmentId} />} />
                <Route path="/course/:courseId/papers" element={<CoursePapers />} />
                <Route path="/view-paper/:paperId" element={<PastQuestionsViewer onBack={() => navigate(-1)} />} />
                <Route path="/timetable" element={<Timetable onBack={() => navigate(-1)} />} />
                <Route path="/premium" element={<PremiumPlans />} />
                <Route path="/repeated-questions" element={<RepeatedQuestions />} />
                <Route path="/help" element={<HelpSupport />} />
              </Route>

              {/* Errors */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="*" element={<Navigate to="/splash" />} />
            </Route>
          </Routes>
        </Suspense>

        {showBottomNav && (
          <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
        )}

        <OfflineBanner isOffline={isOffline} showBackOnline={showBackOnline} isAdminRoute={isAdminRoute} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
