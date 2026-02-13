import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Splash } from '@/app/components/Splash';
import { Welcome } from '@/app/components/Welcome';
import { SignIn } from '@/app/components/SignIn';
import { SignUp } from '@/app/components/SignUp';
import { Home } from '@/app/components/Home';
import { Explore } from '@/app/components/Explore';
import { Library } from '@/app/components/Library';
import { Profile } from '@/app/components/Profile';
import { Notifications } from '@/app/components/Notifications';
import { PastQuestionsViewer } from '@/app/components/PastQuestionsViewer';
import { PastQuestions } from '@/app/components/PastQuestions';
import { Timetable } from '@/app/components/Timetable';
import { RepeatedQuestions } from '@/app/components/RepeatedQuestions';
import { BottomNav } from '@/app/components/BottomNav';
import { Forbidden } from '@/app/components/Forbidden';
import { SeedData } from '@/app/components/SeedData';
import { HelpSupport } from '@/app/components/HelpSupport';
import { TermsPrivacy } from '@/app/components/TermsPrivacy';
import { AdminContainer, AdminLogin } from '@/app/components/admin';
import { MaintenanceGate } from '@/app/components/MaintenanceGate';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { RequireAuth, PublicOnly, RequireAdmin } from '@/app/cards/RouteGuards';
import { Outlet } from 'react-router-dom';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, userProfile, logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-background font-[Inter,system-ui,sans-serif]">
      <div className={`${isAdminRoute ? 'w-full' : 'max-w-md mx-auto'} bg-background min-h-screen relative`}>
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
              <Route path="/welcome" element={<Welcome onSignIn={handleSignInStart} onSignUp={handleSignUpStart} />} />
              <Route path="/signin" element={<SignIn onBack={handleBackToWelcome} onSignUp={handleSignUpStart} onComplete={handleAuthComplete} />} />
              <Route path="/signup" element={<SignUp onBack={handleBackToWelcome} onSignIn={handleSignInStart} onComplete={handleAuthComplete} />} />
            </Route>

            {/* Splash/Index */}
            <Route path="/" element={<Navigate to="/splash" replace />} />
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
              <Route path="/view-paper/:paperId" element={<PastQuestionsViewer onBack={() => navigate(-1)} />} />
              <Route path="/timetable" element={<Timetable onBack={() => navigate(-1)} />} />
              <Route path="/repeated-questions" element={<RepeatedQuestions />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/terms" element={<TermsPrivacy />} />
            </Route>

            {/* Errors */}
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<Navigate to="/splash" />} />
          </Route>
        </Routes>

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
