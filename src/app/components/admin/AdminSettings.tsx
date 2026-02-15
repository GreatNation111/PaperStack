import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Database, Crown, Loader2, Save, AlertTriangle, RefreshCw, Calendar, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
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
    <div className="p-4 lg:p-12 space-y-12 w-full max-w-[1800px] mx-auto">
      {/* Header - Expansive Desktop Style */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-[#151515]">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Settings className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control Panel</h1>
          </div>
          <p className="text-[#555] font-black text-[10px] uppercase tracking-[0.4em] ml-16">Global Command & Intelligence Hub</p>
        </div>

        <div className="flex items-center gap-6">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sync Successful
            </motion.div>
          )}
          <div className="px-6 py-3 bg-[#0A0A0A] border border-[#151515] rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em]">Secure Session: ROOT_01</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left: System Operations (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-[11px] font-black text-[#444] uppercase tracking-[0.3em]">Core Operations</h2>
          </div>

          <div className="bg-[#080808] border border-[#151515] rounded-[2.5rem] p-8 space-y-8 group transition-all hover:border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Maintenance</h3>
                <div className={`w-2 h-2 rounded-full ${localConfig.maintenanceMode ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-green-500'}`} />
              </div>
              <p className="text-[11px] text-[#555] font-medium leading-relaxed">
                Platform-wide access restriction. Root admins remain whitelisted during downtime.
              </p>
              <button
                onClick={() => handleUpdateConfig({ maintenanceMode: !localConfig.maintenanceMode })}
                disabled={isSaving}
                className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${localConfig.maintenanceMode
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-[#121212] text-[#666] border border-[#1a1a1a] hover:border-amber-500/50 hover:text-amber-500'
                  } disabled:opacity-50`}
              >
                {localConfig.maintenanceMode ? 'Exit Maintenance' : 'Engage Shield'}
              </button>
            </div>

            <div className="h-px bg-[#151515]" />

            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#444] uppercase tracking-widest block">Platform Identifier</label>
              <input
                type="text"
                value={localConfig.platformName}
                onChange={(e) => setLocalConfig({ ...localConfig, platformName: e.target.value })}
                onBlur={() => handleUpdateConfig({ platformName: localConfig.platformName })}
                disabled={isSaving}
                className="w-full bg-[#0A0A0A] border border-[#151515] rounded-2xl h-14 px-6 font-black text-white outline-none focus:border-primary/40 transition-all text-sm"
                placeholder="Platform Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pb-2">
            <div className="bg-[#080808] border border-[#151515] rounded-[2rem] p-6 space-y-4">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div>
                <label className="text-[9px] font-black text-[#444] uppercase tracking-widest block mb-2">Session</label>
                <input
                  type="text"
                  value={localConfig.currentSession}
                  onChange={(e) => setLocalConfig({ ...localConfig, currentSession: e.target.value })}
                  onBlur={() => handleUpdateConfig({ currentSession: localConfig.currentSession })}
                  className="w-full bg-transparent text-sm font-black text-white outline-none"
                  placeholder="23/24"
                />
              </div>
            </div>
            <div className="bg-[#080808] border border-[#151515] rounded-[2rem] p-6 space-y-4">
              <RefreshCw className={`w-5 h-5 text-primary ${isSaving ? 'animate-spin' : ''}`} />
              <div>
                <label className="text-[9px] font-black text-[#444] uppercase tracking-widest block mb-2">Semester Focus</label>
                <div className="flex gap-2">
                  {['1st', '2nd'].map(sem => (
                    <button
                      key={sem}
                      onClick={() => handleUpdateConfig({ currentSemester: sem })}
                      className={`text-[10px] font-black uppercase tracking-tighter transition-all ${localConfig.currentSemester === sem ? 'text-primary' : 'text-[#333] hover:text-[#555]'}`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pricing Intelligence (8 cols) - Large Desktop Expansive Style */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h2 className="text-[11px] font-black text-[#444] uppercase tracking-[0.3em]">Market Intelligence</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-1.5 rounded-full border border-[#151515]">
                <Users className="w-3 h-3 text-[#555]" />
                <span className="text-[10px] font-black text-white tracking-widest">{pricingStats.total}</span>
                <span className="text-[9px] font-black text-[#444] uppercase tracking-tighter">Samples</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-[#151515] rounded-[3rem] p-2 lg:p-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-20 opacity-[0.01] pointer-events-none">
              <Crown className="w-64 h-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2">
              {prices.map((price, idx) => {
                const count = pricingStats[price as keyof typeof pricingStats] as number;
                const percentage = pricingStats.total > 0 ? (count / pricingStats.total) * 100 : 0;
                const isLeader = price === marketLeader;

                return (
                  <motion.div
                    key={price}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative bg-[#0A0A0A] border rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[400px] transition-all group ${isLeader ? 'border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent' : 'border-[#151515] hover:border-[#222]'
                      }`}
                  >
                    {isLeader && (
                      <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Market Consensus
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center pt-8">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${isLeader ? 'bg-primary shadow-[0_20px_40px_rgba(var(--primary),0.2)]' : 'bg-[#151515]'}`}>
                        <Crown className={`w-8 h-8 ${isLeader ? 'text-black' : 'text-[#333]'}`} strokeWidth={2.5} />
                      </div>
                      <div className="text-5xl font-black text-white tracking-tighter italic mb-1">₦{parseInt(price).toLocaleString()}</div>
                      <div className="text-[9px] font-black text-[#444] uppercase tracking-[0.3em]">Per Semester Subscription</div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Adoption Rate</span>
                          <span className={`text-[11px] font-black ${isLeader ? 'text-primary' : 'text-[#666]'}`}>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-[#151515] p-[2px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={`h-full rounded-full ${isLeader ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-[#222]'}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#121212]">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white italic">{count}</span>
                          <span className="text-[8px] font-black text-[#333] uppercase">Signal Matches</span>
                        </div>
                        <div className="text-[9px] font-black text-[#555] uppercase tracking-widest italic opacity-40 group-hover:opacity-100 transition-opacity">
                          Tier_{idx + 1}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Intelligence Export Box */}
          <div className="bg-[#080808] border border-[#151515] rounded-[2rem] p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center border border-[#151515]">
                <Database className="w-5 h-5 text-[#333]" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Metadata Export</h4>
                <p className="text-[9px] text-[#444] font-black uppercase tracking-tighter">Generate market sentiment CSV for stakeholder review</p>
              </div>
            </div>
            <button className="h-12 px-8 bg-[#121212] border border-[#1a1a1a] rounded-xl text-[10px] font-black text-[#666] uppercase tracking-widest hover:text-white transition-all">
              Export Intel
            </button>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="flex items-center justify-between pt-12 text-[#222] font-black text-[9px] uppercase tracking-[0.5em] border-t border-[#121212]">
        <div className="flex gap-12">
          <span>Core_Latency: 14ms</span>
          <span>Uptime: 99.998%</span>
        </div>
        <div className="text-[#333]">© 2026 PaperStack Advanced_Intelligence_Unit</div>
      </div>
    </div>
  );
}
