import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Loader2, Save, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { DEFAULT_PRICING_CONFIG, GlobalConfig, PricingConfig, useGlobalConfig, usePricingConfig } from '@/hooks/useData';

export function AdminSettings() {
  const { config, loading } = useGlobalConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { pricingConfig, loading: pricingLoading } = usePricingConfig();
  const [pricingStats, setPricingStats] = useState<Record<string, number>>({ total: 0 });
  const [pricingVoters, setPricingVoters] = useState<Record<string, any[]>>({});
  const [localPricingConfig, setLocalPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

  // Local state for immediate UI feedback before blur/save
  const [localConfig, setLocalConfig] = useState<GlobalConfig | null>(null);

  // Sync local state when config loads
  useEffect(() => {
    if (config && !loading) {
      setLocalConfig(config);
    }
  }, [config, loading]);

  useEffect(() => {
    if (!pricingLoading) {
      setLocalPricingConfig(pricingConfig);
    }
  }, [pricingConfig, pricingLoading]);

  // Fetch pricing feedback stats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pricingFeedback'), (snap) => {
      const stats: Record<string, number> = { total: snap.size };
      const voters: Record<string, any[]> = {};
      
      snap.docs.forEach(doc => {
        const data = doc.data();
        const choice = data.suggestedPrice?.toString();
        if (choice) {
          stats[choice] = (stats[choice] || 0) + 1;
          if (!voters[choice]) voters[choice] = [];
          if (data.userName) voters[choice].push(data); // only push if denormalized data exists
        }
      });
      setPricingStats(stats);
      setPricingVoters(voters);
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

  const handleUpdatePricingConfig = async (updates?: Partial<PricingConfig>) => {
    const nextConfig = {
      ...localPricingConfig,
      ...updates,
      options: (updates?.options || localPricingConfig.options)
        .map(option => ({
          amount: Number(option.amount) || 0,
          label: option.label?.trim() || `\u20A6${Number(option.amount || 0).toLocaleString()} / Semester`,
        }))
        .filter(option => option.amount > 0),
    };

    if (!nextConfig.options.length) {
      alert('Add at least one valid price option.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'config', 'pricing'), nextConfig, { merge: true });
      setLocalPricingConfig(nextConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating pricing config:', error);
      alert('Failed to save pricing settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || pricingLoading || !localConfig) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Find the most popular price
  const prices = localPricingConfig.options.map(option => option.amount.toString());
  const marketLeader = prices.reduce((a, b) =>
    (pricingStats[a as keyof typeof pricingStats] as number) >= (pricingStats[b as keyof typeof pricingStats] as number) ? a : b
  , prices[0] || '0');

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

          <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Student Pricing Title</label>
                <input
                  value={localPricingConfig.title}
                  onChange={(e) => setLocalPricingConfig({ ...localPricingConfig, title: e.target.value })}
                  onBlur={() => handleUpdatePricingConfig({ title: localPricingConfig.title })}
                  className="w-full bg-muted/40 border border-border rounded-xl h-11 px-4 font-bold text-foreground focus:border-primary/40 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Pricing Choices</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextOptions = [...localPricingConfig.options, { amount: 0, label: '' }];
                    setLocalPricingConfig({ ...localPricingConfig, options: nextOptions });
                  }}
                  className="w-full h-11 rounded-xl border border-border bg-muted/40 text-secondary hover:text-foreground text-xs font-bold uppercase tracking-widest"
                >
                  Add Price Option
                </button>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Student Pricing Description</label>
                <textarea
                  value={localPricingConfig.description}
                  onChange={(e) => setLocalPricingConfig({ ...localPricingConfig, description: e.target.value })}
                  onBlur={() => handleUpdatePricingConfig({ description: localPricingConfig.description })}
                  className="w-full bg-muted/40 border border-border rounded-xl min-h-20 px-4 py-3 font-medium text-foreground focus:border-primary/40 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {localPricingConfig.options.map((option, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 items-center bg-muted/20 border border-border rounded-2xl p-3">
                  <input
                    type="number"
                    min="1"
                    value={option.amount || ''}
                    onChange={(e) => {
                      const amount = Number(e.target.value) || 0;
                      const nextOptions = localPricingConfig.options.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, amount } : item
                      );
                      setLocalPricingConfig({ ...localPricingConfig, options: nextOptions });
                    }}
                    className="w-full bg-card border border-border rounded-xl h-11 px-4 font-black text-foreground focus:border-primary/40 outline-none text-sm"
                    placeholder="1000"
                  />
                  <input
                    value={option.label}
                    onChange={(e) => {
                      const nextOptions = localPricingConfig.options.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: e.target.value } : item
                      );
                      setLocalPricingConfig({ ...localPricingConfig, options: nextOptions });
                    }}
                    className="w-full bg-card border border-border rounded-xl h-11 px-4 font-bold text-foreground focus:border-primary/40 outline-none text-sm"
                    placeholder={`\u20A6${Number(option.amount || 0).toLocaleString()} / Semester`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePricingConfig()}
                      disabled={isSaving}
                      className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextOptions = localPricingConfig.options.filter((_, itemIndex) => itemIndex !== index);
                        setLocalPricingConfig({ ...localPricingConfig, options: nextOptions });
                        void handleUpdatePricingConfig({ options: nextOptions });
                      }}
                      disabled={localPricingConfig.options.length <= 1 || isSaving}
                      className="h-11 px-4 rounded-xl border border-border text-red-500 text-xs font-bold disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prices.map((price, _idx) => {
                const count = pricingStats[price] || 0;
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
                      <div className="text-4xl font-black text-foreground tracking-tight mb-1">{`\u20A6${parseInt(price).toLocaleString()}`}</div>
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
                      
                      {/* Avatar Stack */}
                      {(pricingVoters[price] && pricingVoters[price].length > 0) && (
                        <div className="flex justify-center pt-2">
                          <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                            {pricingVoters[price].slice(0, 5).map((voter, i) => (
                              <div
                                key={voter.userId + i}
                                className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black uppercase shadow-sm relative group cursor-help z-10 hover:z-20 hover:scale-110 transition-transform overflow-hidden"
                              >
                                {voter.userAvatar ? (
                                  <img src={voter.userAvatar} alt={voter.userName} className="w-full h-full object-cover" />
                                ) : (
                                  voter.userName?.charAt(0) || 'U'
                                )}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {voter.userName}
                                </div>
                              </div>
                            ))}
                            {pricingVoters[price].length > 5 && (
                              <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-secondary text-[10px] font-black shadow-sm z-0">
                                +{pricingVoters[price].length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
