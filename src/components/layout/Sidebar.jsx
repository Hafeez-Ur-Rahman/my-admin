/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import 'remixicon/fonts/remixicon.css';

const menuItems = [
  { name: 'Dashboard', icon: 'ri-home-4-line', path: '/' },
  { name: 'Analytics', icon: 'ri-bubble-chart-fill', path: '/analytics' },
  { name: 'Categories', icon: 'ri-grid-line', path: '/categories' },
  { name: 'Products', icon: 'ri-ink-bottle-line', path: '/products' },
  { name: 'Orders', icon: 'ri-shopping-cart-2-line', path: '/orders' },
  { name: 'Sales', icon: 'ri-percent-line', path: '/sales' },
  { name: 'Customers', icon: 'ri-group-line', path: '/customers' },
  { name: 'Inventory', icon: 'ri-archive-line', path: '/inventory' },
  { name: 'Coupons', icon: 'ri-coupon-line', path: '/coupons' },
  { name: 'Reports', icon: 'ri-bar-chart-box-line', path: '/reports' },
  { name: 'Settings', icon: 'ri-settings-4-line', path: '/settings' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const sidebarRef = useRef(null);
  const menuItemsRef = useRef([]);
  const logoutRef = useRef(null);
  const highlightRef = useRef(null);
  const brandTextRef = useRef(null);
  const perfumesTextRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      menuItemsRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const handleLogoHover = (isEnter) => {
    if (isEnter) {
      gsap.to(brandTextRef.current, {
        scale: 1.1,
        letterSpacing: '0.15em',
        color: '#fff',
        textShadow: '0 0 15px rgba(225, 152, 152, 0.5)',
        duration: 0.6,
        ease: 'expo.out'
      });
      gsap.to(perfumesTextRef.current, {
        opacity: 1,
        letterSpacing: '0.8em',
        y: 2,
        duration: 0.8,
        ease: 'expo.out'
      });
    } else {
      gsap.to(brandTextRef.current, {
        scale: 1,
        letterSpacing: '0.1em',
        color: '#f9a8d4', // rose-300
        textShadow: '0 0 0px rgba(225, 152, 152, 0)',
        duration: 0.6,
        ease: 'expo.out'
      });
      gsap.to(perfumesTextRef.current, {
        opacity: 0.6,
        letterSpacing: '0.6em',
        y: 0,
        duration: 0.6,
        ease: 'expo.out'
      });
    }
  };

  const handleItemHover = (e, isEnter) => {
    const target = e.currentTarget;
    if (isEnter) {
      const { offsetTop, offsetHeight } = target;
      gsap.to(highlightRef.current, {
        opacity: 1,
        y: offsetTop,
        height: offsetHeight,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(target.querySelector('i'), {
        scale: 1.2,
        color: '#d4af37',
        duration: 0.3
      });
    } else {
      gsap.to(target.querySelector('i'), {
        scale: 1,
        color: 'inherit',
        duration: 0.3
      });
    }
  };

  const handleMouseLeaveSidebar = () => {
    gsap.to(highlightRef.current, {
      opacity: 0,
      duration: 0.3
    });
  };

  const handleLogoutHover = (isEnter) => {
    gsap.to(logoutRef.current, {
      scale: isEnter ? 1.05 : 1,
      backgroundColor: isEnter ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? (isMobile ? 0 : 80) : (isMobile ? '65vw' : 260),
        duration: 0.5,
        ease: 'expo.inOut'
      });
    };
    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  return (
    <>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[40] lg:hidden top-[125px]"
          />
        )}
      </AnimatePresence>

      <div
        ref={sidebarRef}
        onMouseLeave={handleMouseLeaveSidebar}
        className="fixed left-0 bg-sidebar border-r border-white/5 flex flex-col overflow-hidden shadow-[10px_0_40px_rgba(0,0,0,0.8)] z-[45] top-[125px] bottom-0 lg:inset-y-0 lg:z-[50]"
        style={{ width: window.innerWidth < 1024 ? (isCollapsed ? 0 : '65vw') : (isCollapsed ? 80 : 260) }}
      >
        {/* Logo Section - Aligned with Navbar Top */}
        <div
          onMouseEnter={() => handleLogoHover(true)}
          onMouseLeave={() => handleLogoHover(false)}
          className="flex h-[80px] pt-3 items-center overflow-hidden flex-shrink-0 border-b border-white/5 bg-gradient-to-b from-purpleGlow/5 to-transparent relative cursor-pointer group/logo"
        >
          <div className="w-[70px] flex items-center justify-center flex-shrink-0 relative z-10">
            <div className="relative group/logo">
              {/* Flower Emblem with Piëch Animation */}
              <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-700 group-hover/logo:rotate-[360deg]">
                <div className="absolute inset-0 bg-accentGold/0 rounded-full group-hover/logo:bg-accentGold/10 blur-xl transition-all duration-700"></div>
                <i className="ri-vip-crown-line text-accentGold text-3xl relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-700 group-hover/logo:scale-110"></i>

                {/* Decorative orbital ring */}
                <div className="absolute inset-0 border border-accentGold/10 rounded-full scale-125 group-hover/logo:border-accentGold/40 group-hover/logo:scale-100 transition-all duration-1000"></div>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col ml-0 relative z-10"
              >
                <span
                  ref={brandTextRef}
                  className="text-[22px] font-serif tracking-[0.1em] bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent whitespace-nowrap leading-none italic"
                >
                  LUXORA
                </span>
                <span
                  ref={perfumesTextRef}
                  className="text-[9px] text-white/80 font-medium tracking-[0.2em] uppercase mt-1 ml-0.5"
                >
                  PERFUME STORE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Items Container */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar overflow-x-hidden relative pt-8 pb-24">
          {/* Floating Highlight Bar - GSAP Animated */}
          <div
            ref={highlightRef}
            className="absolute left-0 w-[2px] bg-purpleGlow opacity-0 pointer-events-none rounded-r-full shadow-[0_0_15px_#7C3AED] z-20"
            style={{ transition: 'none' }}
          ></div>

          {menuItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              ref={(el) => (menuItemsRef.current[index] = el)}
              onMouseEnter={(e) => handleItemHover(e, true)}
              onMouseLeave={(e) => handleItemHover(e, false)}
              onClick={() => {
                if (window.innerWidth < 1024) setIsCollapsed(true);
              }}
              className={({ isActive }) =>
                `flex items-center h-12 rounded-xl transition-all duration-500 group relative overflow-hidden mx-3 ${isActive
                  ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-[0_4px_20px_rgba(192,38,211,0.3)]'
                  : 'text-white/70 hover:text-white'
                }`
              }
            >
              <div className="w-[60px] flex items-center justify-center flex-shrink-0 relative z-30">
                <i className={`${item.icon} text-[20px] transition-all duration-500 ${item.name === 'Dashboard' ? 'text-white' : 'text-[#f472b6]'} group-hover:text-[#ff71ce] group-hover:drop-shadow-[0_0_10px_#ff71ce]`}></i>
              </div>

              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-semibold whitespace-nowrap text-[13px] tracking-[0.08em] ml-1 relative z-30 uppercase"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-sidebar border border-accentGold/20 rounded-xl text-[10px] font-bold text-accentGold opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 z-50 whitespace-nowrap shadow-[20px_0_60px_rgba(0,0,0,0.6)] transform translate-x-4 group-hover:translate-x-0 tracking-[0.3em] uppercase backdrop-blur-xl">
                  {item.name}
                </div>
              )}

              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-accentGold/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </NavLink>
          ))}

          {/* Logout Section inside Nav */}
          <div className="pt-4 mt-4 border-t border-white/5 relative mx-2">
            <button
              ref={logoutRef}
              onMouseEnter={() => handleLogoutHover(true)}
              onMouseLeave={() => handleLogoutHover(false)}
              className="w-full flex items-center h-12 rounded-2xl text-danger/70 hover:text-danger transition-all duration-300 group overflow-hidden relative active:scale-95"
            >
              <div className="w-[70px] flex items-center justify-center flex-shrink-0 relative z-30">
                <i className="ri-logout-box-r-line text-[20px] transition-transform duration-500 group-hover:-translate-x-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]"></i>
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-bold text-[13px] tracking-[0.08em] ml-1 relative z-30 uppercase"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-sidebar border border-danger/20 rounded-xl text-[10px] font-bold text-danger opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 z-50 whitespace-nowrap shadow-2xl tracking-[0.3em] uppercase backdrop-blur-xl">
                  Logout
                </div>
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

