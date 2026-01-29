import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Layers } from 'lucide-react';

export function RequireAuth() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <Layers className="w-10 h-10 text-[#0A2540] animate-pulse" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/welcome" replace />;
}

export function RequireAdmin() {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <Layers className="w-10 h-10 text-[#0A2540] animate-pulse" />
            </div>
        );
    }

    if (!user) return <Navigate to="/welcome" replace />;
    if (!isAdmin) return <Navigate to="/403" replace />;

    return <Outlet />;
}

export function PublicOnly() {
    const { user, loading } = useAuth();

    if (loading) return null; // Or splash

    return user ? <Navigate to="/home" replace /> : <Outlet />;
}
