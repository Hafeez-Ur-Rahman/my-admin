import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
  const cardRef = useRef(null);
  const iconBoxRef = useRef(null);

  useEffect(() => {
    // Subtle Icon Glow Breathing
    gsap.to(iconBoxRef.current, {
      boxShadow: '0 0 20px rgba(244,114,182,0.1)',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  const getColorTheme = (colorName) => {
    switch (colorName) {
      case 'gold': return { text: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/5', border: 'border-[#fbbf24]/20', glow: 'bg-[#fbbf24]' };
      case 'cyan': return { text: 'text-[#2dd4bf]', bg: 'bg-[#2dd4bf]/5', border: 'border-[#2dd4bf]/20', glow: 'bg-[#2dd4bf]' };
      case 'pink': return { text: 'text-[#f472b6]', bg: 'bg-[#f472b6]/5', border: 'border-[#f472b6]/20', glow: 'bg-[#f472b6]' };
      case 'purple': return { text: 'text-[#A855F7]', bg: 'bg-[#A855F7]/5', border: 'border-[#A855F7]/20', glow: 'bg-[#A855F7]' };
      case 'magenta': return { text: 'text-[#ec4899]', bg: 'bg-[#ec4899]/5', border: 'border-[#ec4899]/20', glow: 'bg-[#ec4899]' };
      default: return { text: 'text-white', bg: 'bg-white/5', border: 'border-white/20', glow: 'bg-white' };
    }
  };

  const theme = getColorTheme(color);

  return (
    <div
      ref={cardRef}
      className="relative bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group/stat stagger-card"
    >
      <div className="absolute inset-0 bg-rose-500/[0.02] group-hover/stat:bg-rose-500/[0.05] transition-colors duration-700"></div>
      
      {/* Trend Badge */}
      <div className={`absolute top-1.5 right-6 px-2.5 py-0.5 rounded-full text-[8px] font-bold border flex items-center gap-1 z-20 ${
        trend === 'up' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
      }`}>
        <i className={`ri-arrow-${trend === 'up' ? 'up' : 'down'}-line`}></i>
        {trendValue}%
      </div>

      <div className="flex items-center gap-5 relative z-10 w-full">
        {/* Pink Circle Icon Container */}
        <div 
          ref={iconBoxRef}
          className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex-shrink-0 flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.15)] group-hover/stat:scale-105 transition-transform duration-700 relative"
        >
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-20"></div>
          <i className={`${icon} text-xl ${theme.text} drop-shadow-[0_0_10px_currentColor] relative z-10`}></i>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] truncate">{title}</p>
            <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-2xl font-luxury text-white italic tracking-tighter stat-value truncate">{value}</h3>
            <span className="text-[8px] text-white/10 font-bold uppercase tracking-[0.1em] italic whitespace-nowrap">vs last period</span>
          </div>
        </div>
      </div>

      {/* Animated background line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent w-full -translate-x-full group-hover/stat:translate-x-full transition-transform duration-[1.5s] ease-in-out"></div>
    </div>
  );
};

export default StatCard;
