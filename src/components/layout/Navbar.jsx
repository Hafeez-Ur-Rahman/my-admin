/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Navbar = ({ isCollapsed, setIsCollapsed }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState({ fullName: 'Admin User', role: 'Super Admin' });
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user info", e);
      }
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/auth');
  };

  const handleSearchFocus = (focused) => {
    setIsSearchFocused(focused);
    if (window.innerWidth >= 1024) {
      gsap.to(searchContainerRef.current, {
        width: focused ? 450 : 320,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-white/5 py-3">
      <div className="px-[14px] lg:px-8 flex flex-col lg:flex-row justify-between gap-3 lg:gap-0">
        
        {/* Top Row for Mobile / Left Section for Desktop */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          {/* Left: Title & Toggle */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl lg:rounded-2xl bg-white/[0.03] border border-white/5 text-white hover:bg-accentGold/10 hover:border-accentGold/30 transition-all group active:scale-95 shadow-lg"
            >
              <i className={`ri-menu-2-line text-lg lg:text-xl transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}></i>
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight font-display">Dashboard</h1>
              <span className="text-[9px] lg:text-[10px] text-rose-300/50 font-bold tracking-[0.2em] uppercase">Overview</span>
            </div>
          </div>

          {/* Mobile Right Actions (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-text-muted">
              <i className="ri-notification-3-line text-lg"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border border-background shadow-[0_0_10px_#f43f5e]"></span>
            </button>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 relative bg-sidebar">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}&backgroundColor=1a1625&scale=110&neck=variant01`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Center/Right: Advanced Search and Actions */}
        <div className="flex items-center gap-4 lg:gap-8 w-full lg:w-auto">
          {/* Modern Search Bar - Full width on mobile */}
          <div
            ref={searchContainerRef}
            className="relative group w-full lg:w-[320px]"
          >
            <div className={`absolute inset-0 bg-accentGold/5 rounded-xl lg:rounded-2xl blur-xl transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`relative flex items-center bg-white/[0.03] border rounded-xl lg:rounded-2xl transition-all duration-300 ${isSearchFocused ? 'border-accentGold/40 bg-white/[0.05] shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-white/5'}`}>
              <i className={`ri-search-2-line ml-3 lg:ml-4 text-base lg:text-lg transition-colors duration-300 ${isSearchFocused ? 'text-accentGold' : 'text-text-muted'}`}></i>
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => handleSearchFocus(true)}
                onBlur={() => handleSearchFocus(false)}
                placeholder="Search analytics, products..."
                className="bg-transparent border-none w-full pl-2 lg:pl-3 pr-3 lg:pr-4 py-2 lg:py-2.5 text-xs lg:text-sm text-white placeholder:text-text-muted/50 focus:outline-none"
              />
              <div className="hidden lg:flex mr-3 items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-[10px] font-bold text-text-muted">⌘</span>
                <span className="text-[10px] font-bold text-text-muted">K</span>
              </div>
            </div>
          </div>

          {/* Desktop Actions Section (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-3">
              <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-text-muted hover:text-white hover:bg-white/[0.06] transition-all group shadow-sm">
                <i className="ri-notification-3-line text-xl transition-transform group-hover:rotate-12"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border border-background shadow-[0_0_10px_#f43f5e]"></span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/5"></div>

            {/* Admin Profile - Top Rated Luxury Design */}
            <div className="flex items-center gap-4 pl-4 pr-2 py-2 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-accentGold/40 transition-all duration-500 cursor-pointer group shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
              {/* Subtle Gold Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accentGold/5 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="text-right hidden xl:block relative z-10">
                <p className="text-sm font-black text-white tracking-tight leading-none mb-2 group-hover:text-accentGold transition-colors duration-300">
                  {user.fullName}
                </p>
                <div className="flex items-center justify-end">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-accentGold/30 text-[8px] font-black text-accentGold uppercase tracking-[0.2em] leading-none shadow-inner">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="relative group/avatar z-10">
                <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/10 group-hover/avatar:border-accentGold/60 transition-all duration-500 shadow-2xl relative bg-sidebar">
                  {/* Rim Light Effect */}
                  <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(212,175,55,0.2)] group-hover/avatar:shadow-[inset_0_0_20px_rgba(212,175,55,0.4)] transition-all"></div>
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}&backgroundColor=1a1625&scale=110&neck=variant01`}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                  />
                </div>
                {/* Luxury Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0F172A] rounded-full border border-white/10 flex items-center justify-center z-20 shadow-lg">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Cinematic Logout Button */}
            <button
              onClick={handleLogout}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-500 shadow-xl group active:scale-90"
              title="Logout"
            >
              <i className="ri-shut-down-line text-xl transition-transform group-hover:rotate-180 group-hover:scale-110"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
