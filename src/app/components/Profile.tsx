
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Moon, Sun, Crown, LogOut, Loader2, MessageCircle, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useUserProfile, updateUserProfile, useDepartments, useContributors, type NotificationSwipeAction } from '@/hooks/useData';
import { requestNotificationPermissionAndSaveToken } from '@/services/messaging';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProfileProps {
  userName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
}

const notificationActionOptions: { value: NotificationSwipeAction; label: string }[] = [
  { value: 'markRead', label: 'Mark as read' },
  { value: 'delete', label: 'Delete' },
  { value: 'none', label: 'No action' },
];

function GestureControl({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: NotificationSwipeAction;
  disabled: boolean;
  onChange: (action: NotificationSwipeAction) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-secondary mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {notificationActionOptions.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled || value === option.value}
            className={`h-10 rounded-lg border px-2 text-xs font-semibold transition-all ${
              value === option.value
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-muted/30 text-secondary hover:text-foreground hover:border-primary/40'
            } disabled:opacity-100`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Profile({ userName: initialName, isDarkMode, onToggleDarkMode, onSignOut }: ProfileProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { departments } = useDepartments();
  const { contributors } = useContributors();

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingNotificationSettings, setSavingNotificationSettings] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    departmentId: '',
    level: ''
  });

  // Init form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        departmentId: profile.departmentId || '',
        level: profile.level || ''
      });
    }
  }, [profile]);

  // Avatars - Using DiceBear API for Memoji-style avatars
  const avatarSeeds = ['Leo', 'Willow', 'Max', 'Bella', 'Charlie', 'Daisy'];

  // Legacy support: if avatar is one of the old icon names, it will just generate a unique avatar based on that string, 
  // which works fine.
  const selectedAvatar = profile?.avatar || 'Leo';
  const avatarUrl = (seed: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const handleUpdateAvatar = async (key: string) => {
    if (!user) return;
    await updateUserProfile(user.uid, { avatar: key });
    if (userContributor) {
      await updateDoc(doc(db, 'contributors', userContributor.id!), {
        avatar: key
      });
    }
    setIsEditingAvatar(false);
  };

  const handleSaveDetails = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        departmentId: formData.departmentId,
        level: formData.level
      });
      setIsEditingDetails(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const currentDepartmentName = departments.find(d => d.id === profile?.departmentId)?.name || 'Select Department';
  const displayName = profile?.name || user?.displayName || initialName;
  const notificationSettings = {
    pushEnabled: profile?.notificationSettings?.pushEnabled !== false,
    swipeRightAction: profile?.notificationSettings?.swipeRightAction || 'markRead',
    swipeLeftAction: profile?.notificationSettings?.swipeLeftAction || 'delete',
  };

  // Check if user is a contributor (matching by name is risky but fallback for now without ID)
  // Ideally contributors collection should include userId.
  const userContributor = contributors.find(c => c.name === displayName);

  const handleBecomeContributor = () => {
    const msg = `Hello, I'd like to become a contributor on PaperStack.%0A%0AName: ${displayName}%0ADepartment: ${currentDepartmentName}%0ALevel: ${formData.level || 'Not set'}`;
    window.open(`https://wa.me/2349151782993?text=${msg}`, '_blank');
  };

  const saveNotificationSettings = async (nextSettings: typeof notificationSettings) => {
    if (!user) return;
    await updateUserProfile(user.uid, {
      notificationSettings: {
        ...profile?.notificationSettings,
        ...nextSettings,
      },
    });
  };

  const handleTogglePushNotifications = async () => {
    if (!user || savingNotificationSettings) return;

    const nextPushEnabled = !notificationSettings.pushEnabled;
    setSavingNotificationSettings(true);
    setNotificationMessage('');

    try {
      if (nextPushEnabled) {
        if (!('Notification' in window)) {
          setNotificationMessage('Push notifications are not supported on this browser.');
          return;
        }

        const token = await requestNotificationPermissionAndSaveToken(user.uid);
        if (!token && Notification.permission !== 'granted') {
          setNotificationMessage('Notifications are blocked in your browser settings.');
          return;
        }

        localStorage.removeItem('hideNotificationBanner');
      }

      await saveNotificationSettings({
        ...notificationSettings,
        pushEnabled: nextPushEnabled,
      });

      setNotificationMessage(nextPushEnabled ? 'Push notifications are on.' : 'Push notifications are off.');
      window.setTimeout(() => setNotificationMessage(''), 2200);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setNotificationMessage('Could not update notification settings.');
    } finally {
      setSavingNotificationSettings(false);
    }
  };

  const handleUpdateSwipeGesture = async (key: 'swipeRightAction' | 'swipeLeftAction', action: NotificationSwipeAction) => {
    if (!user || savingNotificationSettings) return;

    setSavingNotificationSettings(true);
    setNotificationMessage('');

    try {
      await saveNotificationSettings({
        ...notificationSettings,
        [key]: action,
      });
      setNotificationMessage('Notification gestures updated.');
      window.setTimeout(() => setNotificationMessage(''), 1800);
    } catch (error) {
      console.error('Error updating notification gestures:', error);
      setNotificationMessage('Could not update notification gestures.');
    } finally {
      setSavingNotificationSettings(false);
    }
  };

  const premiumFeatures = [
    'Department Exam Timetables',
    'Curated Repeated Questions',
    'Unlimited Course Bookmarks',
    'Priority Beta Access',
  ];



  return (
    <div className="pb-24 min-h-screen">
      <div className="px-6 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-xl overflow-hidden">
                <img
                  src={avatarUrl(selectedAvatar)}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-card border-2 border-background rounded-full flex items-center justify-center shadow-lg"
              >
                <Edit className="w-4 h-4 text-foreground" strokeWidth={2} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{displayName}</h2>
            <p className="text-base text-secondary">{profile?.departmentId ? currentDepartmentName : 'No Department'} • {profile?.level || 'No Level'}</p>
          </div>

          <AnimatePresence>
            {isEditingAvatar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 bg-card border border-border rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3">Choose Avatar</h3>
                <div className="flex gap-3 justify-center flex-wrap">
                  {avatarSeeds.map((seed) => {
                    return (
                      <button
                        key={seed}
                        onClick={() => handleUpdateAvatar(seed)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all overflow-hidden border-2 ${selectedAvatar === seed
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                          }`}
                      >
                        <img
                          src={avatarUrl(seed)}
                          alt={seed}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Details Logic */}
        <AnimatePresence>
          {isEditingDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-secondary mb-1.5 block">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary mb-1.5 block">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Level</option>
                    {['100L', '200L', '300L', '400L'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsEditingDetails(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
                  <button
                    onClick={handleSaveDetails}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings List */}
        <div className="space-y-3 mb-8">
          {!isEditingDetails && (
            <button
              onClick={() => setIsEditingDetails(true)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all"
            >
              <div className="text-left">
                <span className="font-medium text-foreground block">Department & Level</span>
                <span className="text-xs text-secondary">Update your academic info</span>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary" strokeWidth={2} />
            </button>
          )}

          <div className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-foreground" strokeWidth={2} />
              ) : (
                <Sun className="w-5 h-5 text-foreground" strokeWidth={2} />
              )}
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative w-12 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-border'
                }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-card rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsNotificationSettingsOpen(open => !open)}
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
              aria-expanded={isNotificationSettingsOpen}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {notificationSettings.pushEnabled ? (
                    <Bell className="w-5 h-5 text-primary" strokeWidth={2} />
                  ) : (
                    <BellOff className="w-5 h-5 text-secondary" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-foreground block">Notifications</span>
                  <span className="text-xs text-secondary">
                    {notificationSettings.pushEnabled ? 'Push alerts enabled' : 'Push alerts paused'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-px h-7 bg-border" />
                <ChevronDown
                  className={`w-4 h-4 text-secondary transition-transform ${isNotificationSettingsOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
                <span
                  role="switch"
                  aria-checked={notificationSettings.pushEnabled}
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleTogglePushNotifications();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleTogglePushNotifications();
                    }
                  }}
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                    notificationSettings.pushEnabled ? 'bg-primary' : 'bg-border'
                  } ${savingNotificationSettings ? 'opacity-60' : ''}`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-card rounded-full transition-transform flex items-center justify-center ${
                      notificationSettings.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  >
                    {savingNotificationSettings && <Loader2 className="w-3 h-3 animate-spin text-secondary" />}
                  </span>
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isNotificationSettingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <GestureControl
                        label="Swipe right"
                        value={notificationSettings.swipeRightAction}
                        disabled={savingNotificationSettings}
                        onChange={(action) => handleUpdateSwipeGesture('swipeRightAction', action)}
                      />
                      <GestureControl
                        label="Swipe left"
                        value={notificationSettings.swipeLeftAction}
                        disabled={savingNotificationSettings}
                        onChange={(action) => handleUpdateSwipeGesture('swipeLeftAction', action)}
                      />
                    </div>

                    {notificationMessage && (
                      <p className="text-xs text-secondary">{notificationMessage}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Premium Card */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-[2.5rem] p-8 mb-8 text-primary-foreground relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Crown className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-6">
              <Crown className="w-8 h-8 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <h3 className="text-xl font-black mb-1 uppercase tracking-tight">PaperStack Pro</h3>
                <p className="text-xs text-primary-foreground/80 font-bold uppercase tracking-widest">
                  Unlock Your Potential
                </p>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/premium')}
              className="w-full h-14 bg-card text-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              See Pro Plans
            </button>
          </div>
        </div>

        {/* Contributions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Contributions</h2>

          {/* Explanation Text */}
          {!userContributor && (
            <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
              <p className="text-sm text-secondary leading-relaxed">
                Contributors are students who help upload past questions and solutions.
                Join our team to help others study and earn badges!
              </p>
            </div>
          )}

          {userContributor ? (
            <div className="space-y-3 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-foreground mb-1">Total Uploads</div>
                  <div className="text-sm text-secondary">
                    {userContributor.department}
                  </div>
                </div>
                <div className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-lg">
                  {userContributor.contributionCount || 0}
                </div>
              </motion.div>
            </div>
          ) : (
            <button
              onClick={handleBecomeContributor}
              className="w-full h-12 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Become a Contributor
            </button>
          )}
        </div>

        {/* Footer Links */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/help')}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all"
          >
            <span className="font-medium text-foreground">Help & Support</span>
            <ChevronRight className="w-5 h-5 text-secondary" strokeWidth={2} />
          </button>

          <button
            onClick={() => navigate('/terms')}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all"
          >
            <span className="font-medium text-foreground">Terms & Privacy</span>
            <ChevronRight className="w-5 h-5 text-secondary" strokeWidth={2} />
          </button>

          <button
            onClick={onSignOut}
            className="w-full bg-card border border-destructive/20 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-5 h-5 text-destructive" strokeWidth={2} />
            <span className="font-medium text-destructive">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
