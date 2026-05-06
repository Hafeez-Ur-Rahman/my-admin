import React from 'react';

const PlaceholderPage = ({ title, icon, color }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
    <div className={`w-24 h-24 rounded-[32px] bg-${color}/10 border border-${color}/20 flex items-center justify-center text-5xl text-${color} animate-float shadow-glow`}>
      <i className={icon}></i>
    </div>
    <div>
      <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-mutedText mt-2 font-medium max-w-md mx-auto">
        This section is currently under development to ensure the highest quality experience. Check back soon for premium {title.toLowerCase()} management features.
      </p>
    </div>
    <button className="px-8 py-3 bg-card border border-white/10 rounded-luxury text-sm font-bold hover:bg-cardHover transition-all text-white">
      Return to Dashboard
    </button>
  </div>
);

export const Categories = () => <PlaceholderPage title="Categories" icon="ri-layout-grid-line" color="accentGold" />;
export const Sales = () => <PlaceholderPage title="Sales Reports" icon="ri-line-chart-line" color="aquaBlue" />;
export const Reports = () => <PlaceholderPage title="System Reports" icon="ri-bar-chart-box-line" color="purpleGlow" />;
export const Inventory = () => <PlaceholderPage title="Inventory Management" icon="ri-archive-drawer-line" color="success" />;
