import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Loader2, Save, AlertTriangle, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { useGlobalConfig, GlobalConfig, useUserCount } from '@/hooks/useData';

export function AdminSettings() {
  const { config, loading } = useGlobalConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { count: userCount } = useUserCount();
  const [pricingStats, setPricingStats] = useState({ '1000': 0, '2000': 0, '3000': 0, total: 0 });

  // Local state for immediate UI feedback before blur/save
  const [localConfig, setLocalConfig] = useState<GlobalConfig | null>(null);

  // Sync local state when config loads
  useEffect(() => {
    if (config && !loading) {
      setLocalConfig(config);
    }
  }, [config, loading]);

  // Fetch pricing feedback stats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pricingFeedback'), (snap) => {
      const stats = { '1000': 0, '2000': 0, '3000': 0, total: snap.size };
      snap.docs.forEach(doc => {
        const choice = doc.data().suggestedPrice?.toString();
        if (choice && choice in stats) {
          stats[choice as keyof typeof stats]++;
        }
      });
      setPricingStats(stats);
    });
    return () => unsub();
  }, []);

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

  // Find the most popular price
  const prices = ['1000', '2000', '3000'];
  const marketLeader = prices.reduce((a, b) =>
    (pricingStats[a as keyof typeof pricingStats] as number) >= (pricingStats[b as keyof typeof pricingStats] as number) ? a : b
  );

  return (
    <div className="p-4 lg:p-12 space-y-12 w-full max-w-7xl mx-auto">
      {/* Header - Simplified & Professional */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Settings className="w-8 h-8 text-primary" strokeWidth={2} />
            <h1 className="text-3xl font-black text-foreground tracking-tight">System Settings</h1>
          </div>
          <p className="text-secondary text-[11px] font-bold uppercase tracking-widest opacity-60">Global Application Configuration</p>
        </div>

        <div className="flex items-center gap-4">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-xs font-bold"
            >
              <Save className="w-3.5 h-3.5" />
              Settings Saved
            </motion.div>
          )}
          <div className="px-4 py-2 bg-muted/30 border border-border rounded-xl text-[11px] font-bold text-secondary uppercase tracking-widest">
            Admin Access Verified
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: General Settings */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-2 text-secondary opacity-60">
            <h2 className="text-[11px] font-black uppercase tracking-widest">Platform Controls</h2>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-8 space-y-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Maintenance Mode</h3>
                <div className={`w-2.5 h-2.5 rounded-full ${localConfig.maintenanceMode ? 'bg-amber-500' : 'bg-green-500'}`} />
              </div>
              <p className="text-xs text-secondary font-medium leading-relaxed opacity-80">
                Turn on to block public access while performing updates.
              </p>
              <button
                onClick={() => handleUpdateConfig({ maintenanceMode: !localConfig.maintenanceMode })}
                disabled={isSaving}
                className={`w-full h-12 rounded-xl font-bold text-xs transition-all ${localConfig.maintenanceMode
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-muted text-secondary hover:bg-border'
                  } disabled:opacity-50`}
              >
                {localConfig.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <label className="text-[11px] font-bold text-secondary uppercase tracking-widest block">App Name</label>
              <input
                type="text"
                value={localConfig.platformName}
                onChange={(e) => setLocalConfig({ ...localConfig, platformName: e.target.value })}
                onBlur={() => handleUpdateConfig({ platformName: localConfig.platformName })}
                className="w-full bg-muted/40 border border-border rounded-xl h-12 px-5 font-bold text-foreground outline-none focus:border-primary/40 transition-all text-sm"
                placeholder="PaperStack"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Academic Logic</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Current Session</label>
                <input
                  type="text"
                  value={localConfig.currentSession}
                  onChange={(e) => setLocalConfig({ ...localConfig, currentSession: e.target.value })}
                  onBlur={() => handleUpdateConfig({ currentSession: localConfig.currentSession })}
                  className="w-full bg-muted/40 border border-border rounded-xl h-11 px-4 font-bold text-foreground focus:border-indigo-500/40 outline-none text-sm"
                  placeholder="2023/2024"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Current Semester</label>
                <div className="flex bg-muted/40 border border-border p-1 rounded-xl">
                  {['1st', '2nd'].map(sem => (
                    <button
                      key={sem}
                      onClick={() => handleUpdateConfig({ currentSemester: sem })}
                      className={`flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${localConfig.currentSemester === sem ? 'bg-indigo-500 text-white shadow-sm' : 'text-secondary hover:text-foreground'}`}
                    >
                      {sem} Sem
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pricing Stats (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-secondary opacity-60">
              <TrendingUp className="w-4 h-4" />
              <h2 className="text-[11px] font-black uppercase tracking-widest">Pricing Feedback Stats</h2>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-1.5 rounded-full border border-border text-xs font-bold text-secondary">
              {pricingStats.total} User Votes
            </div>
          </div>

          <div className="bg-card border border-border rounded-[3rem] p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prices.map((price, _idx) => {
                const count = pricingStats[price as keyof typeof pricingStats] as number;
                const percentage = pricingStats.total > 0 ? (count / pricingStats.total) * 100 : 0;
                const isLeader = price === marketLeader;

                return (
                  <div
                    key={price}
                    className={`relative bg-muted/10 border rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] transition-all ${isLeader ? 'border-primary/30 ring-1 ring-primary/10 bg-primary/5' : 'border-border'
                      }`}
                  >
                    {isLeader && (
                      <div className="absolute top-6 left-8 flex items-center gap-2 shadow-sm">
                        <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center pt-8">
                      <div className="text-4xl font-black text-foreground tracking-tight mb-1">₦{parseInt(price).toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Suggested Price</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Popularity</span>
                        <span className={`text-sm font-black ${isLeader ? 'text-primary' : 'text-foreground opacity-60'}`}>{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted/60 rounded-full overflow-hidden border border-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full rounded-full ${isLeader ? 'bg-primary' : 'bg-secondary/40'}`}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-secondary opacity-60 uppercase">{count} Total Votes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
