import { useState } from 'react';
import { Database, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { seedDatabase } from '@/utils/seed';
import { useNavigate } from 'react-router-dom';

export function SeedData() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const navigate = useNavigate();

    const handleSeed = async () => {
        if (!confirm("Are you sure? This will rewrite database content.")) return;

        setLoading(true);
        setStatus('idle');

        try {
            const result = await seedDatabase();
            if (result) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">Database Seeding</h1>
                <p className="text-secondary text-sm mb-8">
                    Populate Firestore with default departments, courses, and sample past questions.
                    Use this for development only.
                </p>

                {status === 'success' && (
                    <div className="bg-green-500/10 text-green-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-left">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold">Success!</p>
                            <p>Database populated successfully.</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-left">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold">Error</p>
                            <p>Failed to seed database. Check console.</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Seeding...' : 'Run Seed Script'}
                </button>

                <button
                    onClick={() => navigate('/home')}
                    className="text-sm text-secondary hover:text-foreground transition-colors flex items-center justify-center gap-2 w-full py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}
