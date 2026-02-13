import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Wrench, ShieldAlert, Clock } from 'lucide-react';
import { useGlobalConfig } from '@/hooks/useData';
import { Outlet } from 'react-router-dom';

export function MaintenanceGate({ children }: { children?: React.ReactNode }) {
    const { isAdmin } = useAuth();
    const { config, loading } = useGlobalConfig();

    if (loading) return null;

    // Show maintenance screen if active and user is NOT an admin
    if (config?.maintenanceMode && !isAdmin) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-8"
                >
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Wrench className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 border-4 border-[#0F1115]">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                            System Under <br /><span className="text-primary italic">Maintenance</span>
                        </h1>
                        <p className="text-[#AAA] text-lg font-medium leading-relaxed">
                            We're polishing things up to give you a better experience. We'll be back shortly!
                        </p>
                    </div>

                    <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-6 flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-primary/60" />
                        </div>
                        <div>
                            <p className="text-xs text-[#666] font-bold uppercase tracking-widest mb-1">Estimated Return</p>
                            <p className="text-[#E5E5E5] font-semibold italic">TBD • Expected in 2 hours</p>
                        </div>
                    </div>

                    <div className="pt-8">
                        <p className="text-xs text-[#444] font-medium">© {new Date().getFullYear()} {config.platformName}. Stay tuned.</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
}
