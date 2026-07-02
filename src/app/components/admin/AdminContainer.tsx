import { lazy, Suspense, useState } from 'react';
import { AdminLayout } from './AdminLayout';

const AdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotificationsManager = lazy(() => import('./NotificationsManager').then(m => ({ default: m.NotificationsManager })));
const CoursesManagement = lazy(() => import('./CoursesManagement').then(m => ({ default: m.CoursesManagement })));
const UsersManagement = lazy(() => import('./UsersManagement').then(m => ({ default: m.UsersManagement })));
const AdminSettings = lazy(() => import('./AdminSettings').then(m => ({ default: m.AdminSettings })));
const DepartmentsManager = lazy(() => import('./DepartmentsManager').then(m => ({ default: m.DepartmentsManager })));
const FeatureRequestsViewer = lazy(() => import('./FeatureRequestsViewer').then(m => ({ default: m.FeatureRequestsViewer })));
const FeedbackViewer = lazy(() => import('./FeedbackViewer').then(m => ({ default: m.FeedbackViewer })));
const TimetableManagement = lazy(() => import('./TimetableManagement').then(m => ({ default: m.TimetableManagement })));
const RepeatedQuestionsManagement = lazy(() => import('./RepeatedQuestionsManagement').then(m => ({ default: m.RepeatedQuestionsManagement })));

const AdminPageLoader = () => (
  <div className="flex min-h-[320px] items-center justify-center text-[#AAA]">
    Loading...
  </div>
);

interface AdminContainerProps {
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

type AdminPage =
  | 'dashboard'
  | 'notifications'
  | 'courses'
  | 'departments' // Renamed from schools
  | 'users'
  | 'reports' // Will be Feature Requests
  | 'feedback'
  | 'settings'
  | 'timetable'
  | 'repeated-questions';

export function AdminContainer({ onLogout, isDarkMode, onToggleDarkMode }: AdminContainerProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AdminPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsManager />;
      case 'courses':
        return <CoursesManagement />;
      case 'departments':
        return <DepartmentsManager />;
      case 'users':
        return <UsersManagement />;
      case 'reports':
        return <FeatureRequestsViewer />;
      case 'feedback':
        return <FeedbackViewer />;
      case 'settings':
        return <AdminSettings />;
      case 'timetable':
        return <TimetableManagement />;
      case 'repeated-questions':
        return <RepeatedQuestionsManagement />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminLayout 
      currentPage={currentPage} 
      onNavigate={handleNavigate} 
      onLogout={onLogout}
      isDarkMode={isDarkMode}
      onToggleDarkMode={onToggleDarkMode}
    >
      <Suspense fallback={<AdminPageLoader />}>
        {renderPage()}
      </Suspense>
    </AdminLayout>
  );
}
