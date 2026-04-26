import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
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
import { BottomNav } from '@/app/components/BottomNav';
import { Forbidden } from '@/app/components/Forbidden';
import { SeedData } from '@/app/components/SeedData';
import { MaintenanceGate } from '@/app/components/MaintenanceGate';

// --- Lazy Loaded Heavyweight/Secondary Routes ---
const AdminLogin = lazy(() => import('@/app/components/admin').then(m => ({ default: m.AdminLogin })));
const AdminContainer = lazy(() => import('@/app/components/admin').then(m => ({ default: m.AdminContainer })));
const PastQuestionsViewer = lazy(() => import('@/app/components/PastQuestionsViewer').then(m => ({ default: m.PastQuestionsViewer })));
const Timetable = lazy(() => import('@/app/components/Timetable').then(m => ({ default: m.Timetable })));
const RepeatedQuestions = lazy(() => import('@/app/components/RepeatedQuestions').then(m => ({ default: m.RepeatedQuestions })));
const HelpSupport = lazy(() => import('@/app/components/HelpSupport').then(m => ({ default: m.HelpSupport })));
const TermsPrivacy = lazy(() => import('@/app/components/TermsPrivacy').then(m => ({ default: m.TermsPrivacy })));
const PrivacyPolicy = lazy(() => import('@/app/components/PrivacyPolicy').then(m => ({ default: m.default })));
const TermsOfService = lazy(() => import('@/app/components/TermsOfService').then(m => ({ default: m.default })));
const PremiumPlans = lazy(() => import('@/app/components/PremiumPlans').then(m => ({ default: m.PremiumPlans })));
const CoursePapers = lazy(() => import('@/app/components/CoursePapers').then(m => ({ default: m.CoursePapers })));

// Global loading fallback for Suspense
const GlobalLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { RequireAuth, PublicOnly, RequireAdmin } from '@/app/cards/RouteGuards';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isAdmin, loading: authLoading, userProfile, logout } = useAuth();

  // Admin auto-redirect: if admin mode was persisted, redirect on boot
  useEffect(() => {
    if (authLoading) return;
    const adminPersisted = localStorage.getItem('paperstack_admin_mode') === 'true';
    if (adminPersisted && user && isAdmin && !location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
    // If persisted but user is not admin (e.g. logged out), clear the flag
    if (adminPersisted && !authLoading && (!user || !isAdmin)) {
      localStorage.removeItem('paperstack_admin_mode');
    }
  }, [authLoading, user, isAdmin, location.pathname, navigate]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Navigation Handlers
  const handleSplashComplete = () => navigate('/welcome');
  const handleSignInStart = () => navigate('/signin');
  const handleSignUpStart = () => navigate('/signup');
  // Auth completion is now handled by redirect in SignUp/SignIn or AuthContext observer
  const handleAuthComplete = () => navigate('/home');

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
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const showBottomNav = ['/home', '/explore', '/library', '/profile'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingRoute = location.pathname === '/';
  const isFullWidthRoute = isAdminRoute || isLandingRoute;

  return (
    <div className="min-h-screen bg-background font-[Inter,system-ui,sans-serif]">
      <div className={`${isFullWidthRoute ? 'w-full' : 'max-w-md mx-auto'} bg-background min-h-screen relative`}>
        <Suspense fallback={<GlobalLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Admin Routes - NOT Gated */}
            <Route path="/admin" element={<AdminLogin onComplete={() => navigate('/admin/dashboard')} />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard/*" element={<AdminContainer onLogout={handleSignOut} />} />
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
              <Route path="/seed" element={<SeedData />} />

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
