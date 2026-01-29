import { Layers, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-secondary mb-8 max-w-xs mx-auto">
                You do not have permission to access the administrative area.
            </p>

            <button
                onClick={() => navigate('/home')}
                className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all"
            >
                Return Home
            </button>
        </div>
    );
}
