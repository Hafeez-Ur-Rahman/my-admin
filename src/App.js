import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Coupons from './pages/Coupons';
import Analytics from './pages/Analytics';
import Slider from './pages/Slider';
import Auth from './pages/Auth';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import { Inventory } from './pages/Placeholders';

// Page Transition Component for Luxury Feel
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    {children}
  </motion.div>
);

function AppContent() {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('adminToken'));
    };
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-background text-white selection:bg-accentGold/30 selection:text-accentGold relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purpleGlow/10 blur-[150px] rounded-full z-0 pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accentGold/5 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main 
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[260px]'}`}
      >
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-[14px] lg:px-8 pb-10 pt-4 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
              <Route path="/categories" element={<PageWrapper><Categories /></PageWrapper>} />
              <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
              <Route path="/reports" element={<PageWrapper><Reports /></PageWrapper>} />
              <Route path="/sales" element={<PageWrapper><Sales /></PageWrapper>} />
              <Route path="/customers" element={<PageWrapper><Customers /></PageWrapper>} />
              <Route path="/inventory" element={<PageWrapper><Inventory /></PageWrapper>} />
              <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
              <Route path="/coupons" element={<PageWrapper><Coupons /></PageWrapper>} />
              <Route path="/slider" element={<PageWrapper><Slider /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route path="*" element={<PageWrapper><Dashboard /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
