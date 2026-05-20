/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line 
} from 'recharts';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { fetchAnalyticsOverview, fetchAnalyticsDailyOrders, fetchAnalyticsMonthlyOrders } from '../services/api';
import StatCard from '../components/dashboard/StatCard';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('Daily');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('deep-report');
  
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ov, daily, monthly] = await Promise.all([
          fetchAnalyticsOverview(),
          fetchAnalyticsDailyOrders(),
          fetchAnalyticsMonthlyOrders()
        ]);
        setOverview(ov);
        setDailyData(daily || []);
        setMonthlyData(monthly || []);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const ctx = gsap.context(() => {
      gsap.from('.stagger-card', {
        y: 60, opacity: 0, scale: 0.9, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.2
      });
      gsap.from('.stagger-chart', {
        x: 40, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'power4.out', delay: 0.4
      });
      gsap.to('.header-accent', {
        width: '100%', duration: 2, ease: 'power4.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleModal = (type = 'deep-report') => {
    if (!showModal) {
      setModalType(type);
      setShowModal(true);
    } else {
      const ctx = gsap.context(() => {
        gsap.to(modalContentRef.current, {
          scale: 0.9, opacity: 0, y: 30, rotateX: 10, duration: 0.4, ease: 'power2.in'
        });
        gsap.to(modalRef.current, {
          opacity: 0, duration: 0.5, ease: 'power2.inOut', onComplete: () => setShowModal(false)
        });
      });
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(modalContentRef.current, 
          { scale: 0.9, opacity: 0, y: 30, rotateX: 10 },
          { scale: 1, opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: 'expo.out', delay: 0.1 }
        );
      });
      return () => {
        document.body.style.overflow = 'unset';
        ctx.revert();
      };
    }
  }, [showModal]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const monthlyChartData = monthlyData.map(item => ({
    name: new Date(2000, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    orders: item.products.reduce((sum, p) => sum + p.totalOrders, 0)
  }));

  const getChartData = () => {
    if (timeframe === 'Daily') {
      return dailyData.map(item => ({
        name: `${item._id.day}/${item._id.month}`,
        orders: item.products.reduce((sum, p) => sum + p.totalOrders, 0),
        revenue: item.products.reduce((sum, p) => sum + (p.totalOrders * 5000), 0)
      }));
    } else if (timeframe === 'Monthly') {
      return monthlyChartData;
    } else {
        return [
            { name: 'Week 1', orders: 12, revenue: 60000 },
            { name: 'Week 2', orders: 18, revenue: 95000 },
            { name: 'Week 3', orders: 25, revenue: 130000 },
            { name: 'Week 4', orders: 22, revenue: 110000 },
        ];
    }
  };

  const activeChartData = getChartData();

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 border-[1px] border-accent-pink/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-2 border-accent-pink rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="ri-pulse-line text-5xl text-white opacity-20 animate-pulse"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-32 pt-2 space-y-16 max-w-[1700px] mx-auto px-0">
      {/* Header */}
      <div className="relative py-4">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-pink/50 to-transparent header-accent"></div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-[9px] font-black text-accent-pink uppercase tracking-widest italic">Core Analytics v4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">Quantum <span className="text-accent-pink">Dynamics</span></h1>
            <p className="text-text-muted text-sm font-medium max-w-xl opacity-70 italic">Synchronized data ecosystem tracking global revenue velocity and asset performance.</p>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-[24px] w-full lg:w-auto">
             <div className="text-center px-4 border-r border-white/10">
                <p className="text-[8px] font-black text-white/30 uppercase mb-1">Health</p>
                <p className="text-xl font-black text-emerald-400">98%</p>
             </div>
             <div className="text-center px-4">
                <p className="text-[8px] font-black text-white/30 uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-ping"></div>
                    <span className="text-xl font-black text-white italic tracking-tighter leading-none">SYNC</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Users', value: overview?.totalUsers || 0, icon: 'ri-user-6-line', color: 'pink', trend: '+14%' },
          { label: 'Active Assets', value: overview?.totalProducts || 0, icon: 'ri-ink-bottle-line', color: 'purple', trend: 'Stable' },
          { label: 'Global Orders', value: overview?.totalOrders || 0, icon: 'ri-shopping-bag-3-line', color: 'cyan', trend: '+22%' },
          { label: 'Revenue Stream', value: formatCurrency(overview?.totalRevenue || 0), icon: 'ri-coins-line', color: 'gold', trend: '+31%' }
        ].map((stat, i) => (
          <div key={i} className="stagger-card" onClick={() => toggleModal()}>
            <StatCard title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} trend={stat.trend.startsWith('+') ? 'up' : 'down'} trendValue={stat.trend.replace(/[+-]/, '')} />
          </div>
        ))}
      </div>

      {/* Velocity & Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-6 md:p-10 rounded-[35px] md:rounded-[45px] border border-white/5 stagger-chart relative overflow-hidden group shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter">Velocity Dynamics</h3>
              <p className="text-[9px] text-text-muted mt-1 font-bold uppercase tracking-[0.4em]">Real-time transaction tracking</p>
            </div>
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md w-full sm:w-auto overflow-x-auto no-scrollbar">
              {['Daily', 'Weekly', 'Monthly'].map(t => (
                <button 
                    key={t} 
                    onClick={() => setTimeframe(t)}
                    className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-accent-pink text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={activeChartData}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px' }} />
                <Area type="monotone" dataKey="orders" stroke="#f43f5e" strokeWidth={5} fill="url(#velocityGrad)" animationDuration={2500} dot={{ r: 4, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 md:p-10 rounded-[35px] md:rounded-[45px] border border-white/5 stagger-chart flex flex-col shadow-2xl relative overflow-hidden group" onClick={() => toggleModal('strategy')}>
          <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter mb-8 md:mb-10">Growth Projection</h3>
          <div className="flex-1 space-y-10 relative z-10">
            {monthlyChartData.slice(0, 4).map((item, i) => (
              <div key={i} className="group/item">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">{item.name}</span>
                  <span className="text-2xl font-black text-accent-pink italic leading-none">{item.orders}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-accent-pink to-cyan-500 rounded-full" style={{ width: `${(item.orders / Math.max(...monthlyChartData.map(o => o.orders), 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Dominance */}
      <div className="glass p-6 md:p-12 rounded-[35px] md:rounded-[55px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-ping"></div>
              <span className="text-[10px] font-black text-accent-pink uppercase tracking-[0.5em]">Global Asset Sovereignty</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">Market <span className="text-accent-pink">Dominance</span></h3>
          </div>
          <button 
            onClick={() => toggleModal('deep-report')}
            className="px-10 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent-pink hover:text-white transition-all duration-500 shadow-xl w-full sm:w-auto"
          >
            Synthesize Deep Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {overview?.products?.map((product, i) => (
            <div key={i} className="stagger-card group/product cursor-pointer" onClick={() => toggleModal('asset-intelligence')}>
              <div className="relative p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-accent-pink/40 transition-all duration-1000 hover:bg-white/[0.05] overflow-hidden">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-[32px] overflow-hidden mb-6 shadow-2xl border border-white/5 group-hover/product:scale-105 transition-transform">
                    <img 
                      src={product.image?.startsWith('http') ? product.image : `https://perfume-project-production-b650.up.railway.app${product.image}`}
                      className="w-full h-full object-cover"
                      alt={product.title}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80'}
                    />
                  </div>
                  <span className="text-[9px] font-black text-accent-pink uppercase tracking-[0.3em] italic mb-2 block">Rank #{i+1}</span>
                  <h4 className="text-lg font-black text-white group-hover/product:text-accent-pink transition-colors mb-5">{product.title}</h4>
                  <div className="flex justify-between w-full px-2">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Volume</p>
                      <p className="text-lg font-black text-white italic">{product.totalOrders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Status</p>
                      <p className="text-lg font-black text-emerald-400 italic">ELITE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intelligence Modal (Focus Mode) */}
      {showModal && createPortal(
        <div ref={modalRef} className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#050505] overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-pink/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/5 blur-[120px] rounded-full"></div>

          <div 
            ref={modalContentRef}
            className="relative w-[95%] sm:w-[85%] max-w-4xl h-[85vh] md:h-[75vh] bg-[#0a0a0a] border border-white/10 rounded-[30px] md:rounded-[45px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-start sm:items-center bg-gradient-to-r from-accent-pink/[0.05] via-transparent to-transparent gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-ping"></div>
                  <span className="text-[9px] font-black text-accent-pink uppercase tracking-[0.4em]">Intelligence Synthesis</span>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                  {modalType === 'deep-report' ? 'Global Market Deep Dive' : modalType === 'strategy' ? 'Neural Strategy Map' : 'Asset Performance Index'}
                </h2>
              </div>
              <button onClick={() => toggleModal()} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-all group">
                <i className="ri-close-line text-2xl text-white group-hover:rotate-90 transition-transform"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div>
                        <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 border-l-2 border-accent-pink pl-3">Data Density</h4>
                        <div className="grid grid-cols-2 gap-4">
                           {[
                              { label: 'Market Velocity', value: '0.84x', color: 'text-cyan-400' },
                              { label: 'Sentiment Index', value: 'Elite', color: 'text-accent-pink' },
                              { label: 'Churn Potential', value: 'Low', color: 'text-emerald-400' },
                              { label: 'Growth Vector', value: 'Upward', color: 'text-accent-purple' }
                           ].map((stat, i) => (
                              <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                 <p className="text-[8px] font-bold text-white/30 uppercase mb-1">{stat.label}</p>
                                 <p className={`text-lg font-black ${stat.color} italic`}>{stat.value}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 border-l-2 border-accent-purple pl-3">Asset Distribution</h4>
                        <div className="space-y-3">
                           {['Paris', 'Dubai', 'London'].map((city, i) => (
                              <div key={i} className="relative h-10 w-full bg-white/5 rounded-xl overflow-hidden border border-white/5">
                                 <div className="absolute inset-y-0 left-0 bg-accent-pink opacity-20" style={{ width: `${80 - i*20}%` }}></div>
                                 <div className="absolute inset-0 flex items-center justify-between px-4">
                                    <span className="text-[9px] font-black text-white uppercase">{city}</span>
                                    <span className="text-xs font-black text-white italic">{80 - i*20}%</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="p-6 md:p-8 rounded-[25px] md:rounded-[35px] bg-gradient-to-br from-accent-pink/[0.08] to-accent-purple/[0.08] border border-white/10">
                        <p className="text-[9px] font-black text-accent-pink uppercase tracking-[0.4em] mb-4 italic">Neural Synthesis Output</p>
                        <p className="text-base text-white font-medium leading-relaxed italic mb-6">
                           "The ecosystem is displaying a high level of <span className="text-accent-pink font-black">Segment Fluidity</span>. Recommend a 15% increase in inventory velocity for Dubai-based hubs."
                        </p>
                        <div className="space-y-3">
                           {[
                              'Optimize cross-border logistics',
                              'Implement predictive restocking',
                              'Scale influencer-led campaigns'
                           ].map((task, i) => (
                              <div key={i} className="flex items-center gap-3 text-[9px] font-bold text-white/60 uppercase">
                                 <div className="w-1.5 h-1.5 rounded-full bg-accent-pink"></div>
                                 {task}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 md:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
               <button onClick={() => toggleModal()} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all text-center">Download Audit</button>
               <button onClick={() => toggleModal()} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent-pink text-white text-[9px] font-black uppercase tracking-widest shadow-xl text-center">Execute Strategy</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Analytics;
