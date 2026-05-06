import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'remixicon/fonts/remixicon.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [generalSettings, setGeneralSettings] = useState({
    shopName: 'LUXORA Perfumes',
    contactEmail: 'admin@luxora.com',
    phoneNumber: '+1 (555) 000-1234',
    address: '123 Luxury Ave, Beverly Hills, CA',
    currency: 'USD',
    language: 'English'
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newCustomers: true,
    stockAlerts: false,
    marketingEmails: true,
    securityAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'Dark',
    accentColor: '#d4af37',
    compactMode: false,
    animations: true
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: 'ri-settings-line' },
    { id: 'account', name: 'Account', icon: 'ri-user-settings-line' },
    { id: 'notifications', name: 'Notifications', icon: 'ri-notification-3-line' },
    { id: 'appearance', name: 'Appearance', icon: 'ri-palette-line' },
    { id: 'security', name: 'Security', icon: 'ri-shield-keyhole-line' },
    { id: 'payment', name: 'Payments', icon: 'ri-bank-card-line' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Shop Name</label>
                <input
                  type="text"
                  value={generalSettings.shopName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, shopName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Contact Email</label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Phone Number</label>
                <input
                  type="text"
                  value={generalSettings.phoneNumber}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, phoneNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Store Currency</label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300 appearance-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Business Address</label>
              <textarea
                value={generalSettings.address}
                onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300 h-24 resize-none"
              ></textarea>
            </div>
          </motion.div>
        );

      case 'account':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 p-6 bg-white/5 border border-white/10 rounded-[24px]">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-[#c026d3]/20 flex items-center justify-center border-2 border-[#c026d3]/50 overflow-hidden">
                  <i className="ri-user-line text-4xl text-[#c026d3]"></i>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#c026d3] text-black rounded-full flex items-center justify-center border-4 border-[#0a0a0a] hover:scale-110 transition-transform">
                  <i className="ri-camera-line text-xs font-bold"></i>
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold">Administrator</h3>
                <p className="text-sm text-text-muted">Super Admin • Joined March 2024</p>
                <div className="flex justify-center sm:justify-start gap-2 mt-3">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 uppercase tracking-widest">Active</span>
                  <span className="px-3 py-1 bg-[#c026d3]/10 text-[#c026d3] text-[10px] font-bold rounded-full border border-[#c026d3]/20 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Full Name</label>
                <input
                  type="text"
                  defaultValue="Admin Luxora"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Username</label>
                <input
                  type="text"
                  defaultValue="admin_luxora"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#c026d3] font-bold">Change Password</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accentGold/50 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-[#c026d3]/30 transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${value ? 'bg-[#c026d3]/10 text-[#c026d3]' : 'bg-white/5 text-text-muted'}`}>
                    <i className={key === 'orderUpdates' ? 'ri-shopping-bag-line' : key === 'newCustomers' ? 'ri-user-add-line' : key === 'stockAlerts' ? 'ri-error-warning-line' : key === 'marketingEmails' ? 'ri-mail-line' : 'ri-shield-check-line'}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Receive notifications for this event</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`w-12 h-6 rounded-full transition-all duration-500 relative ${value ? 'bg-[#c026d3]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-500 ${value ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <i className="ri-shield-flash-line text-2xl text-green-500"></i>
                  </div>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Two-Factor Auth</h3>
                </div>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">Add an extra layer of security to your account by requiring more than just a password to log in.</p>
                <button className="w-full py-3 bg-green-500/10 text-green-500 font-bold rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-white transition-all duration-300 uppercase tracking-widest text-[10px]">Enable 2FA</button>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accentGold/5 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#c026d3]/10 flex items-center justify-center border border-[#c026d3]/20">
                    <i className="ri-device-line text-2xl text-[#c026d3]"></i>
                  </div>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Active Sessions</h3>
                </div>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">You are currently logged in on 3 devices. Revoke any sessions you don't recognize.</p>
                <button className="w-full py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:border-[#c026d3]/50 transition-all duration-300 uppercase tracking-widest text-[10px]">Manage Sessions</button>
              </div>
            </div>

            <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-[24px]">
              <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2">Danger Zone</h3>
              <p className="text-xs text-text-muted mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-300 uppercase tracking-widest text-[10px]">Delete Account</button>
            </div>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Theme Mode</label>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4">
                  {['Light', 'Dark', 'System'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setAppearance({ ...appearance, theme: mode })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${appearance.theme === mode ? 'bg-[#c026d3]/20 border-[#c026d3] text-[#c026d3]' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Accent Color</label>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4">
                  {['#d4af37', '#f472b6', '#8b5cf6', '#3b82f6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAppearance({ ...appearance, accentColor: color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${appearance.accentColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold">Compact Mode</h4>
                <p className="text-[11px] text-text-muted">Reduce whitespace for higher density</p>
              </div>
              <button
                onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                className={`w-12 h-6 rounded-full transition-all duration-500 relative ${appearance.compactMode ? 'bg-[#c026d3]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${appearance.compactMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <i className="ri-tools-line text-3xl text-text-muted"></i>
            </div>
            <h3 className="text-lg font-bold">Coming Soon</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">This setting section is currently under development to ensure the highest quality experience.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="text-4xl font-serif tracking-tight text-white mb-2">System <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Settings</span></h1>
          <p className="text-text-muted text-sm tracking-[0.1em] uppercase">Configure your luxury management system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group relative w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_4px_25px_rgba(192,38,211,0.4)] flex justify-center items-center"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isSaving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
        {/* Sidebar Tabs */}
        <div className="flex flex-row lg:flex-col overflow-x-auto custom-scrollbar pb-2 lg:pb-0 space-x-2 lg:space-x-0 lg:space-y-2 snap-x">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none lg:w-full flex items-center justify-center lg:justify-start gap-3 lg:gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden snap-center ${activeTab === tab.id ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-[0_4px_20px_rgba(192,38,211,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5 bg-white/5 lg:bg-transparent'}`}
            >
              <i className={`${tab.icon} text-xl transition-transform duration-500 group-hover:scale-110`}></i>
              <span className="text-[13px] font-bold uppercase tracking-widest">{tab.name}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#4d003e] to-[#c026d3] -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-sidebar/50 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[32px] p-6 md:p-8 min-h-[500px] shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c026d3]/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purpleGlow/5 blur-[100px] rounded-full pointer-events-none"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#c026d3]/10 flex items-center justify-center border border-[#c026d3]/20 mx-auto sm:mx-0">
                  <i className={`${tabs.find(t => t.id === activeTab)?.icon} text-2xl text-[#c026d3]`}></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest">{tabs.find(t => t.id === activeTab)?.name} Settings</h2>
                  <p className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">Manage your {activeTab} preferences and configurations</p>
                </div>
              </div>

              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
