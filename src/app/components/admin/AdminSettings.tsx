import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Database, Crown, Loader2, Save, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useGlobalConfig, GlobalConfig, useUserCount } from '@/hooks/useData';

export function AdminSettings() {
  const { config, loading } = useGlobalConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { count: userCount } = useUserCount();

  // Local state for immediate UI feedback before blur/save
  const [localConfig, setLocalConfig] = useState<GlobalConfig | null>(null);

  // Sync local state when config loads
  useEffect(() => {
    if (config && !loading) {
      setLocalConfig(config);
    }
  }, [config, loading]);

  const handleUpdateConfig = async (updates: Partial<GlobalConfig>) => {
    if (!localConfig) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const configRef = doc(db, 'config', 'global');
      const newConfig = { ...localConfig, ...updates };
      await setDoc(configRef, newConfig, { merge: true });
      setLocalConfig(newConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating config:", error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !localConfig) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" strokeWidth={2.5} />
            System Control
          </h1>
          <p className="text-[#555] font-medium text-sm mt-1 uppercase tracking-widest">Global Platform Configuration</p>
        </div>
        <div className="flex items-center gap-4">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-500 text-xs font-bold"
            >
              <Save className="w-3 h-3" />
              AUTO-SAVED
            </motion.div>
          )}
          <div className="px-4 py-2 bg-[#111] border border-[#222] rounded-xl text-[10px] font-black text-[#444] tracking-widest uppercase">
            ROOT_ACCESS_LEVEL_01
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Settings */}
        <div className="lg:col-span-12 space-y-8">

          {/* Platform Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#080808] border border-[#151515] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors group-hover:bg-primary/10"></div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${localConfig.maintenanceMode ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`}></div>
                <h2 className="text-sm font-black text-[#444] uppercase tracking-[0.2em]">Maintenance Mode</h2>
              </div>
              <p className="text-[#888] text-sm font-medium leading-relaxed max-w-md">
                Maintenance mode blocks public access while allowing administrative functions. Default whitelists apply for root users.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <button
                  onClick={() => handleUpdateConfig({ maintenanceMode: !localConfig.maintenanceMode })}
                  disabled={isSaving}
                  className={`h-12 px-8 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${localConfig.maintenanceMode
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-[#151515] text-[#555] border border-[#252525] hover:border-amber-500/50 hover:text-amber-500'
                    } disabled:opacity-50`}
                >
                  {localConfig.maintenanceMode ? 'Engaged' : 'Disengage'}
                </button>
                {localConfig.maintenanceMode && (
                  <span className="text-[10px] font-black text-amber-500/50 tracking-widest uppercase flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> System Block Active
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#111] border border-[#1a1a1a] rounded-[2rem] p-8 flex flex-col justify-between relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#444] uppercase tracking-widest block mb-3">Platform Identity</label>
                  <input
                    type="text"
                    value={localConfig.platformName}
                    onChange={(e) => setLocalConfig({ ...localConfig, platformName: e.target.value })}
                    onBlur={() => handleUpdateConfig({ platformName: localConfig.platformName })}
                    disabled={isSaving}
                    className="w-full bg-transparent text-2xl font-black text-white outline-none placeholder:text-[#222]"
                    placeholder="Enter system name..."
                  />
                </div>
                <div className="h-px bg-[#222]"></div>
                <div className="flex items-center gap-8">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-[#444] uppercase tracking-widest block mb-2">Sync Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="text-[11px] font-black text-[#666] uppercase tracking-tighter italic">Live_Sync_Document_02</span>
                    </div>
                  </div>
                  {isSaving && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Config & Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Academic Session */}
            <div className="bg-[#080808] border border-[#151515] rounded-[2.5rem] p-8 flex flex-col justify-between space-y-8">
              <div>
                <Calendar className="w-6 h-6 text-primary mb-6" />
                <h3 className="text-sm font-black text-[#444] uppercase tracking-widest mb-2">Academic Session</h3>
                <p className="text-xs text-[#666] font-medium leading-relaxed">System-wide session variable for question sorting.</p>
              </div>
              <input
                type="text"
                value={localConfig.currentSession}
                onChange={(e) => setLocalConfig({ ...localConfig, currentSession: e.target.value })}
                onBlur={() => handleUpdateConfig({ currentSession: localConfig.currentSession })}
                disabled={isSaving}
                className="w-full bg-[#111] border border-[#1a111a] rounded-2xl h-14 px-6 font-black text-white text-sm outline-none focus:border-primary/50 transition-colors"
                placeholder="2023/2024"
              />
            </div>

            {/* Current Semester */}
            <div className="bg-[#080808] border border-[#151515] rounded-[2.5rem] p-8 flex flex-col justify-between space-y-8">
              <div>
                <RefreshCw className={`w-6 h-6 text-indigo-500 mb-6 ${isSaving ? 'animate-spin' : ''}`} />
                <h3 className="text-sm font-black text-[#444] uppercase tracking-widest mb-2">Current Semester</h3>
                <p className="text-xs text-[#666] font-medium leading-relaxed">Toggles current visual focus on all user explore feeds.</p>
              </div>
              <div className="flex bg-[#111] border border-[#1a1a1a] p-1.5 rounded-2xl">
                {['1st', '2nd'].map((sem) => (
                  <button
                    key={sem}
                    disabled={isSaving}
                    onClick={() => handleUpdateConfig({ currentSemester: sem })}
                    className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localConfig.currentSemester === sem
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-[#444] hover:text-[#777]'
                      }`}
                  >
                    {sem} Semester
                  </button>
                ))}
              </div>
            </div>

            {/* System Integrity */}
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Crown className="w-6 h-6 text-primary opacity-20" />
              </div>
              <div className="h-full flex flex-col justify-between relative z-10">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-8">System Integrity</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Active Users</p>
                    <p className="text-2xl font-black text-white">{userCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Database Read</p>
                    <p className="text-2xl font-black text-white">0.2ms</p>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="w-full bg-primary/10 h-1 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '94%' }}
                      className="bg-primary h-full"
                    ></motion.div>
                  </div>
                  <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-3">Platform_Stability_Optimal</p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap items-center gap-4 bg-[#111] border border-[#1a1a1a] rounded-3xl p-6">
            <div className="flex items-center gap-3 px-4 border-r border-[#222]">
              <Database className="w-4 h-4 text-[#444]" />
              <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Database Backup</span>
            </div>
            <button className="text-[10px] font-black text-[#666] hover:text-white uppercase tracking-widest px-4 transition-colors">Export Logs</button>
            <button className="text-[10px] font-black text-[#666] hover:text-white uppercase tracking-widest px-4 transition-colors">Clear Cache</button>
            <button className="text-[10px] font-black text-[#EF4444] hover:text-red-400 uppercase tracking-widest px-4 transition-colors ml-auto">Hard Reset System</button>
          </div>

        </div>
      </div>
    </div>
  );
}
