import { motion } from 'motion/react';
import { Settings, Shield, Bell, Palette, Database, Crown, ChevronRight } from 'lucide-react';

export function AdminSettings() {
  const settingsSections = [
    {
      title: 'Moderation Rules',
      description: 'Configure content approval policies and quality standards',
      icon: Shield,
      color: '#4F46E5',
      items: [
        'Auto-approve from verified contributors',
        'Require manual review for new uploaders',
        'Minimum image quality threshold',
        'Duplicate detection sensitivity',
      ],
    },
    {
      title: 'Notification Preferences',
      description: 'Manage admin alerts and email notifications',
      icon: Bell,
      color: '#0D9488',
      items: [
        'New submission alerts',
        'Report flagged content',
        'Daily digest emails',
        'User registration notifications',
      ],
    },
    {
      title: 'Site Configuration',
      description: 'General platform settings and branding',
      icon: Database,
      color: '#F59E0B',
      items: [
        'Platform name and logo',
        'Supported universities',
        'Academic year settings',
        'Maintenance mode toggle',
      ],
    },
    {
      title: 'Theme & Appearance',
      description: 'Customize admin dashboard look and feel',
      icon: Palette,
      color: '#8B5CF6',
      items: [
        'Dark mode (default)',
        'Accent color',
        'Sidebar layout',
        'Data visualization style',
      ],
    },
    {
      title: 'Premium Features',
      description: 'Enable or configure premium functionality',
      icon: Crown,
      color: '#F59E0B',
      items: [
        'Contributor submissions (Coming Soon)',
        'AI-powered predictions (Coming Soon)',
        'Detailed solutions (Coming Soon)',
        'Study planner (Coming Soon)',
      ],
    },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Admin Settings</h1>
        <p className="text-sm text-[#AAA]">Configure platform behavior and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden hover:border-[#333] transition-colors"
            >
              <button className="w-full px-6 py-5 flex items-center gap-4 hover:bg-[#222227] transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: section.color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base font-semibold text-[#E5E5E5] mb-1">{section.title}</h3>
                  <p className="text-sm text-[#AAA]">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#666] flex-shrink-0" strokeWidth={1.5} />
              </button>

              {/* Expandable Content - Hidden by default, shown on click */}
              <div className="px-6 pb-5 pt-2 border-t border-[#2A2A2F] hidden">
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center justify-between">
                      <span className="text-sm text-[#DDD]">{item}</span>
                      <button className="text-sm text-[#4F46E5] hover:underline">Configure</button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="mt-8 bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#E5E5E5] mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
          System Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[#AAA] mb-1">Platform Version</div>
            <div className="text-sm font-medium text-[#E5E5E5]">v1.2.4</div>
          </div>
          <div>
            <div className="text-xs text-[#AAA] mb-1">Database Size</div>
            <div className="text-sm font-medium text-[#E5E5E5]">2.4 GB</div>
          </div>
          <div>
            <div className="text-xs text-[#AAA] mb-1">Last Backup</div>
            <div className="text-sm font-medium text-[#E5E5E5]">Jan 15, 2025 03:00 AM</div>
          </div>
          <div>
            <div className="text-xs text-[#AAA] mb-1">Active Sessions</div>
            <div className="text-sm font-medium text-[#E5E5E5]">247</div>
          </div>
          <div>
            <div className="text-xs text-[#AAA] mb-1">Server Status</div>
            <div className="text-sm font-medium text-[#10B981]">Healthy</div>
          </div>
          <div>
            <div className="text-xs text-[#AAA] mb-1">Uptime</div>
            <div className="text-sm font-medium text-[#E5E5E5]">99.8%</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#E5E5E5] mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#EF4444]" strokeWidth={1.5} />
          Danger Zone
        </h2>
        <p className="text-sm text-[#AAA] mb-4">
          Irreversible actions that require administrator authorization
        </p>
        <div className="space-y-3">
          <button className="w-full h-11 border-2 border-[#EF4444]/50 text-[#EF4444] rounded-xl font-medium hover:bg-[#EF4444]/10 transition-colors text-sm">
            Clear All Cached Data
          </button>
          <button className="w-full h-11 border-2 border-[#EF4444]/50 text-[#EF4444] rounded-xl font-medium hover:bg-[#EF4444]/10 transition-colors text-sm">
            Reset All User Passwords
          </button>
          <button className="w-full h-11 bg-[#EF4444] text-white rounded-xl font-medium hover:bg-[#DC2626] transition-colors text-sm">
            Enable Maintenance Mode
          </button>
        </div>
      </div>
    </div>
  );
}
