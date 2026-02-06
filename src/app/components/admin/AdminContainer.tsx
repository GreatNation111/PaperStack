import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { PendingSubmissions } from './PendingSubmissions';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { NotificationsManager } from './NotificationsManager';
import { CoursesManagement } from './CoursesManagement';
import { SchoolsManagement } from './SchoolsManagement';
import { UsersManagement } from './UsersManagement';
import { ReportedContent } from './ReportedContent';
import { AdminSettings } from './AdminSettings';

interface AdminContainerProps {
  onLogout: () => void;
}

type AdminPage =
  | 'dashboard'
  | 'pending'
  | 'notifications'
  | 'courses'
  | 'schools'
  | 'users'
  | 'reports'
  | 'settings';

export function AdminContainer({ onLogout }: AdminContainerProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const handleViewSubmissionDetail = (id: string) => {
    setSelectedSubmissionId(id);
  };

  const handleCloseSubmissionDetail = () => {
    setSelectedSubmissionId(null);
  };

  const handleApproveSubmission = (id: string) => {
    console.log('Approved submission:', id);
    // Show toast notification
  };

  const handleRejectSubmission = (id: string, reason: string) => {
    console.log('Rejected submission:', id, 'Reason:', reason);
    // Show toast notification
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AdminPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'pending':
        return <PendingSubmissions onViewDetail={handleViewSubmissionDetail} />;
      case 'notifications':
        return <NotificationsManager />;
      case 'courses':
        return <CoursesManagement />;
      case 'schools':
        return <SchoolsManagement />;
      case 'users':
        return <UsersManagement />;
      case 'reports':
        return <ReportedContent />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <AdminLayout currentPage={currentPage} onNavigate={handleNavigate} onLogout={onLogout}>
        {renderPage()}
      </AdminLayout>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        submissionId={selectedSubmissionId || ''}
        isOpen={selectedSubmissionId !== null}
        onClose={handleCloseSubmissionDetail}
        onApprove={handleApproveSubmission}
        onReject={handleRejectSubmission}
      />
    </>
  );
}
