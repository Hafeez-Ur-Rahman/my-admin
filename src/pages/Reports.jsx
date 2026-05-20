/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { fetchMonthlyRevenue, fetchSalesReport, fetchTopProductsReport } from '../services/api';
import StatCard from '../components/dashboard/StatCard';

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [salesStats, setSalesStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('intelligence');
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [rev, sales, top] = await Promise.all([
          fetchMonthlyRevenue(),
          fetchSalesReport(),
          fetchTopProductsReport()
        ]);
        setRevenueData(rev || []);
        setSalesStats(sales);
        setTopProducts(top || []);
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const ctx = gsap.context(() => {
      gsap.from('.stagger-card', {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        delay: 0.2
      });

      gsap.from('.stagger-chart', {
        x: 40,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.5
      });

      gsap.to('.header-accent', {
        width: '100%',
        duration: 2,
        ease: 'power4.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const toggleModal = (type = 'intelligence') => {
    if (!showModal) {
      setModalType(type);
      setShowModal(true);
    } else {
      const ctx = gsap.context(() => {
        gsap.to(modalContentRef.current, {
          scale: 0.8,
          opacity: 0,
          y: 50,
          rotateX: 15,
          duration: 0.5,
          ease: 'power2.in'
        });
        gsap.to(modalRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => setShowModal(false)
        });
      });
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.fromTo(modalRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.inOut' }
        );
        gsap.fromTo(modalContentRef.current,
          { scale: 0.8, opacity: 0, y: 50, rotateX: 15 },
          { scale: 1, opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: 'expo.out', delay: 0.1 }
        );
      });
      return () => {
        document.body.style.overflow = 'unset';
        ctx.revert();
      };
    }
  }, [showModal]);

  const stats = [
    { label: 'Total Revenue', value: salesStats?.totalRevenue ? formatCurrency(salesStats.totalRevenue) : 'Rs 0', trend: 'up', trendValue: '12.5', icon: 'ri-money-dollar-circle-line', color: 'pink' },
    { label: 'Gross Sales', value: salesStats?.totalSales || '0', trend: 'up', trendValue: '8.2', icon: 'ri-shopping-bag-3-line', color: 'purple' },
    { label: 'Avg. Order Value', value: salesStats?.avgOrderValue ? formatCurrency(salesStats.avgOrderValue) : 'Rs 0', trend: 'up', trendValue: '5.4', icon: 'ri-funds-line', color: 'cyan' },
    { label: 'Market Conversion', value: '3.2%', trend: 'up', trendValue: '1.2', icon: 'ri-percent-line', color: 'gold' },
  ];

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-[1px] border-accent-pink/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-2 border-accent-pink rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-[1px] border-accent-purple/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="ri-bar-chart-2-line text-4xl text-white opacity-20"></i>
          </div>
        </div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Analyzing Performance</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-24 pt-2 space-y-16 max-w-[1600px] mx-auto overflow-hidden px-0">
      {/* Header */}
      <div className="relative py-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-pink/50 to-transparent header-accent"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-[9px] font-black text-accent-pink uppercase tracking-widest">v3.0 Analytics</span>
              <div className="h-[1px] w-12 bg-white/10"></div>
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Business Intelligence</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-4 italic">
              Performance <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Intelligence</span>
            </h1>
            <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed">
              Comprehensive analysis of global sales velocity, revenue dynamics, and market positioning. Synthesizing high-frequency data into actionable business intelligence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <button onClick={() => toggleModal('export')} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex justify-center items-center">
              <i className="ri-download-2-line mr-2"></i> Export Data
            </button>
            <button onClick={() => toggleModal('intelligence')} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(192,38,211,0.4)] hover:opacity-90 transition-all flex justify-center items-center">
              <i className="ri-calendar-event-line mr-2"></i> Time Horizon
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="stagger-card group cursor-pointer" onClick={() => toggleModal('intelligence')}>
            <StatCard title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} trend={stat.trend} trendValue={stat.trendValue} />
          </div>
        ))}
      </div>

      {/* Charts & Elite Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-6 md:p-10 rounded-[2rem] md:rounded-[40px] border border-white/5 stagger-chart relative overflow-hidden group shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4 sm:gap-0">
            <div>
              <h3 className="text-2xl font-black text-white italic">Revenue Dynamics</h3>
              <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-[0.4em]">Monthly growth trajectory</p>
            </div>
            <div className="flex gap-2">
              {['Q1', 'Q2', 'Q3', 'Q4'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${t === 'Q2' ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-lg shadow-[#c026d3]/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: '900'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: '900'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '20px' }} itemStyle={{ color: '#f43f5e', fontWeight: '900', fontSize: '10px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={5} fill="url(#revenueGrad)" animationDuration={3000} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0a0a0a' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[40px] border border-white/5 stagger-chart overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
          <h3 className="text-2xl font-black text-white italic mb-10">Elite Assets</h3>
          <div className="space-y-8">
            {topProducts.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center gap-5 group/asset cursor-pointer" onClick={() => toggleModal('intelligence')}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 group-hover/asset:border-accent-pink/40 transition-all duration-500">
                  <img src={product.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&q=80'} alt={product.name} className="w-full h-full object-cover opacity-60 group-hover/asset:opacity-100 transition-all duration-700" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-white group-hover/asset:text-accent-pink transition-colors">{product.name}</h4>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">{product.category || 'Luxury Collection'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white italic">{formatCurrency(product.revenue)}</p>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter mt-1">{product.sales} units</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => toggleModal('intelligence')} className="w-full py-4 mt-12 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 hover:text-white transition-all">View Market Matrix</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[50px] border border-white/5 stagger-card relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white italic mb-10">Sector Performance</h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={revenueData.slice(-6)}>
                       <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: '900'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: '900'}} />
                       <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '15px' }} />
                       <Bar dataKey="sales" radius={[15, 15, 0, 0]} barSize={40}>
                          {revenueData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f43f5e' : '#A855F7'} fillOpacity={0.6} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[50px] border border-white/5 stagger-card flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
           <div className="relative z-10 py-10">
              <div className="w-24 h-24 bg-accent-pink/10 rounded-full flex items-center justify-center text-accent-pink text-5xl mb-8 mx-auto border border-accent-pink/20 shadow-[0_0_50px_rgba(244,63,94,0.2)] group-hover:scale-110 transition-transform">
                 <i className="ri-award-line"></i>
              </div>
              <h3 className="text-4xl font-black text-white italic mb-6 tracking-tighter">Market Mastery</h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto font-medium leading-relaxed opacity-70 mb-10">
                Your enterprise is outperforming the luxury index by <span className="text-emerald-400 font-black">+24.8%</span>. Global brand recognition is reaching critical mass.
              </p>
              <button onClick={() => toggleModal('strategy')} className="px-12 py-5 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:shadow-[0_0_50px_rgba(192,38,211,0.4)] hover:opacity-90 transition-all">Synthesize Growth Strategy</button>
           </div>
        </div>
      </div>

      {/* Intelligence Modal */}
      {showModal && createPortal(
        <div ref={modalRef} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-12 bg-[#050505] overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-pink/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-purple/10 blur-[150px] rounded-full pointer-events-none"></div>

          <div ref={modalContentRef} className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] md:rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-accent-pink/10 via-transparent to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-ping"></div>
                  <span className="text-[10px] font-black text-accent-pink uppercase tracking-[0.4em]">Executive Summary</span>
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">
                  {modalType === 'export' ? 'Deep Extraction' : modalType === 'strategy' ? 'Strategic Synthesis' : 'Market Intelligence'}
                </h2>
              </div>
              <button onClick={() => toggleModal()} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 group">
                <i className="ri-close-line text-2xl text-white group-hover:rotate-90 transition-transform"></i>
              </button>
            </div>

            <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 border-l-2 border-accent-pink pl-4">Core Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Revenue Growth', value: '+14.2%', color: 'text-emerald-400' },
                        { label: 'Customer LTV', value: 'Rs 42K', color: 'text-accent-pink' },
                        { label: 'Market Share', value: '12.5%', color: 'text-accent-purple' },
                        { label: 'Velocity Index', value: 'High', color: 'text-cyan-400' }
                      ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 group/m">
                          <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">{item.label}</span>
                          <span className={`text-xl font-black ${item.color} italic block transition-transform`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 border-l-2 border-accent-purple pl-4">Distribution Analysis</h4>
                    <div className="space-y-3">
                      {['Luxury Perfumes', 'Elite Collections', 'Private Blend'].map((cat, i) => (
                        <div key={i} className="relative h-10 w-full bg-white/5 rounded-xl overflow-hidden border border-white/5">
                          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-pink to-accent-purple opacity-40" style={{ width: `${85 - (i * 15)}%` }}></div>
                          <div className="absolute inset-0 flex items-center justify-between px-5">
                            <span className="text-[9px] font-black text-white uppercase">{cat}</span>
                            <span className="text-xs font-black text-white italic">{85 - (i * 15)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                   <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 border-l-2 border-cyan-400 pl-4">AI Recommendations</h4>
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-accent-pink/[0.08] to-accent-purple/[0.08] border border-white/10 relative overflow-hidden">
                      <p className="text-base text-white font-medium leading-relaxed italic mb-6">
                        "Algorithm suggests a pivot towards <span className="text-accent-pink font-black">Personalized Scents</span> for the Q4 campaign. High engagement in luxury segments indicates a 22% potential lift."
                      </p>
                      <div className="space-y-4">
                        {['Scale digital presence in MENA regions', 'Integrate blockchain for product authenticity', 'Expand "Elite Membership" benefits'].map((text, i) => (
                          <div key={i} className="flex items-center gap-3 text-[9px] font-bold text-white/60 uppercase tracking-wide">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-pink"></div>
                            {text}
                          </div>
                        ))}
                      </div>
                    </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button onClick={() => toggleModal()} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all text-center">Archive Report</button>
              <button onClick={() => toggleModal()} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[9px] font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(192,38,211,0.3)] hover:opacity-90 transition-all text-center">Execute Strategy</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Reports;
