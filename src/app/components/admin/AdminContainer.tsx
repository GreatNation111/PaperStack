import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { NotificationsManager } from './NotificationsManager';
import { CoursesManagement } from './CoursesManagement';
import { UsersManagement } from './UsersManagement';
import { AdminSettings } from './AdminSettings';
import { DepartmentsManager } from './DepartmentsManager';
import { FeatureRequestsViewer } from './FeatureRequestsViewer';
import { TimetableManagement } from './TimetableManagement';
import { RepeatedQuestionsManagement } from './RepeatedQuestionsManagement';

interface AdminContainerProps {
  onLogout: () => void;
}

type AdminPage =
  | 'dashboard'
  | 'notifications'
  | 'courses'
  | 'departments' // Renamed from schools
  | 'users'
  | 'reports' // Will be Feature Requests
  | 'settings'
  | 'timetable'
  | 'repeated-questions';

export function AdminContainer({ onLogout }: AdminContainerProps) {
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
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate} onLogout={onLogout}>
      {renderPage()}
    </AdminLayout>
  );
}
