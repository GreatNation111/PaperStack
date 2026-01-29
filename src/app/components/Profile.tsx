import { useState } from 'react';
import { BookOpen, GraduationCap, Calculator, Scale, TestTube, ChevronRight, Edit, Moon, Sun, Crown, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  userName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
}

export function Profile({ userName, isDarkMode, onToggleDarkMode, onSignOut }: ProfileProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<'book' | 'cap' | 'calculator' | 'scale' | 'testtube'>('book');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const avatarIcons = {
    book: BookOpen,
    cap: GraduationCap,
    calculator: Calculator,
    scale: Scale,
    testtube: TestTube,
  };

  const AvatarIcon = avatarIcons[selectedAvatar];

  const premiumFeatures = [
    'Lecturer Repeat Insights',
    'Most Likely Questions Packs',
    'Detailed Solutions',
    'Unlimited Bookmarks & Downloads',
    'Ad-Free Experience',
  ];

  const contributors = [
    { course: 'PHY 101', count: 3, date: 'Dec 2024' },
    { course: 'MTH 101', count: 2, date: 'Nov 2024' },
  ];

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-6 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                <AvatarIcon className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-card border-2 border-background rounded-full flex items-center justify-center shadow-lg"
              >
                <Edit className="w-4 h-4 text-foreground" strokeWidth={2} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{userName}</h2>
            <p className="text-base text-secondary">Physics • 200 Level</p>
          </div>

          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">Choose Avatar</h3>
              <div className="flex gap-3 justify-center">
                {(Object.keys(avatarIcons) as Array<keyof typeof avatarIcons>).map((key) => {
                  const Icon = avatarIcons[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedAvatar(key)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${selectedAvatar === key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-secondary hover:bg-muted/80'
                        }`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings List */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all">
            <span className="font-medium text-foreground">Department & Level</span>
            <ChevronRight className="w-5 h-5 text-secondary" strokeWidth={2} />
          </button>

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
        </div>

        {/* Premium Card */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 mb-8 text-primary-foreground">
          <div className="flex items-start gap-3 mb-4">
            <Crown className="w-7 h-7 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-bold mb-1">Unlock Premium</h3>
              <p className="text-sm text-primary-foreground/90">
                Get access to exclusive features
              </p>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="text-sm text-primary-foreground/90 flex items-start gap-2">
                <span className="text-primary-foreground mt-0.5">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button className="w-full h-12 bg-card text-primary rounded-xl font-semibold hover:opacity-90 transition-all">
            See Plans
          </button>
        </div>

        {/* Contributions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Contributions</h2>
          {contributors.length > 0 ? (
            <div className="space-y-3 mb-4">
              {contributors.map((contrib, index) => (
                <motion.div
                  key={contrib.course}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-foreground mb-1">{contrib.course}</div>
                    <div className="text-sm text-secondary">
                      {contrib.count} papers • {contrib.date}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-lg">
                    {contrib.count}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
          <button className="w-full h-12 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all">
            Become a Contributor
          </button>
        </div>

        {/* Footer Links */}
        <div className="space-y-3">
          <button className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all">
            <span className="font-medium text-foreground">Help & Support</span>
            <ChevronRight className="w-5 h-5 text-secondary" strokeWidth={2} />
          </button>

          <button className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition-all">
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