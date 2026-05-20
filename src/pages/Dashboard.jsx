import React, { useEffect, useRef, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import { SalesAreaChart, CategoryPieChart } from '../components/charts/MainCharts';
import gsap from 'gsap';
import { fetchDashboardData, fetchInventoryDashboard } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    loading: true
  });

  const calculateExtendedStats = (orders) => {
    if (!orders || orders.length === 0) return { categoryData: [] };

    const categorySales = {};

    orders.forEach(order => {
      order.items?.forEach(item => {
        const category = item.category || 'Uncategorized';
        const quantity = item.quantity || 1;
        categorySales[category] = (categorySales[category] || 0) + quantity;
      });
    });

    const categoryData = Object.entries(categorySales)
      .map(([name, value]) => ({ name, value }));

    return { categoryData };
  };

  const processChartData = (orders) => {
    if (!orders || orders.length === 0) return [];

    // Group by date
    const dailySales = {};
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      dailySales[day] = (dailySales[day] || 0) + (order.subtotal || 0);
    });

    // Convert to array and sort by date
    return Object.entries(dailySales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, invData] = await Promise.all([
          fetchDashboardData(),
          fetchInventoryDashboard()
        ]);
        if (data) {
          const chartData = processChartData(data.allOrders);
          const { categoryData } = calculateExtendedStats(data.allOrders);
          setStats({
            ...data,
            chartData,
            categoryData,
            inventoryAlerts: invData,
            loading: false
          });
        } else {
          setStats(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();

    const ctx = gsap.context(() => {
      // Diamond Sparkle Animation
      gsap.to('.welcome-diamond', {
        filter: 'brightness(1.5) contrast(1.2)',
        scale: 1.1,
        duration: 0.2,
        repeat: -1,
        repeatDelay: 3,
        yoyo: true,
        ease: 'power2.inOut'
      });
      // Welcome section internal stagger
      gsap.from(['.welcome-text', '.welcome-sub', '.welcome-badge', '.welcome-info'], {
        opacity: 0,
        x: -20,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.3
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Run stagger animation only after data has loaded
  useEffect(() => {
    if (!stats.loading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.stagger-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
        );
      }
    }
  }, [stats.loading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-PK').format(num);
  };

  return (
    <div ref={containerRef} className="space-y-8 pb-10 pt-2 px-0">
      {/* Refined Luxury Welcome Section */}
      <div className="stagger-card relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-0">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 blur-[60px] rounded-full group-hover:bg-rose-500/10 transition-all duration-1000"></div>

        <div className="flex items-center gap-4 sm:gap-8 relative z-10 w-full lg:flex-1">
          {/* Refined Icon Container */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-rose-500/20 blur-[20px] sm:blur-[30px] animate-pulse rounded-full opacity-40"></div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative z-10 shadow-xl backdrop-blur-xl animate-[float_4s_easeInOut_infinite]">
              <i className="ri-vip-diamond-fill text-2xl sm:text-3xl text-rose-400 welcome-diamond"></i>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <h2 className="text-lg sm:text-3xl font-luxury text-white italic tracking-tight welcome-text leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent font-bold not-italic font-sans block sm:inline mt-0.5 sm:mt-0">Admin Excellence</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <p className="text-[7px] sm:text-[9px] text-white/40 tracking-[0.2em] sm:tracking-[0.3em] uppercase font-bold welcome-sub leading-relaxed max-w-[150px] sm:max-w-none">Orchestrating the Luxora Empire</p>
              <div className="inline-flex items-center gap-1.5 bg-rose-500/5 px-2 py-1 sm:px-3 sm:py-1 rounded-full border border-rose-500/10 welcome-badge w-fit mt-1 sm:mt-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                <span className="text-[6px] sm:text-[8px] font-bold text-rose-300 uppercase tracking-widest whitespace-nowrap">Active Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Info Section */}
        <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-8 lg:pl-8 border-t lg:border-t-0 lg:border-l border-white/5 welcome-info w-full lg:w-auto pt-4 lg:pt-0">
          <div className="text-left lg:text-right flex-1 lg:flex-none">
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-0.5">Scent Standard Time</p>
            <p className="text-lg font-luxury text-white/80 italic">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center flex-shrink-0">
            <i className="ri-time-line text-white/20"></i>
          </div>
        </div>
      </div>

      {/* Refined Scent Vault Alerts Banner */}
      {!stats.loading && stats.inventoryAlerts && (stats.inventoryAlerts.lowProductStock > 0 || stats.inventoryAlerts.outOfStock > 0) && (
        <div 
          onClick={() => navigate('/inventory')}
          className="stagger-card relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/15 hover:to-rose-500/15 transition-all duration-300 border border-amber-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-[0_15px_30px_rgba(245,158,11,0.05)] group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <i className="ri-alert-fill text-lg animate-pulse"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide uppercase">Scent Vault Alerts Active</p>
              <p className="text-[10px] text-white/50 mt-1 font-medium">
                {stats.inventoryAlerts.lowProductStock} low-stock scent{stats.inventoryAlerts.lowProductStock > 1 ? 's' : ''} and {stats.inventoryAlerts.outOfStock} out-of-stock item{stats.inventoryAlerts.outOfStock > 1 ? 's' : ''} require restocking.
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-white transition-colors">
            Access Vault <i className="ri-arrow-right-s-line text-xs"></i>
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.loading ? "..." : formatNumber(stats.totalOrders)}
          icon="ri-shopping-bag-3-line"
          trend="up"
          trendValue="12.5"
          color="pink"
        />
        <StatCard
          title="Total Customers"
          value={stats.loading ? "..." : formatNumber(stats.totalCustomers)}
          icon="ri-group-line"
          trend="up"
          trendValue="8.2"
          color="purple"
        />
        <StatCard
          title="Total Products"
          value={stats.loading ? "..." : formatNumber(stats.totalProducts)}
          icon="ri-ink-bottle-line"
          trend="up"
          trendValue="4.1"
          color="gold"
        />
        <StatCard
          title="Total Revenue"
          value={stats.loading ? "..." : formatCurrency(stats.totalRevenue)}
          icon="ri-money-dollar-circle-line"
          trend="up"
          trendValue="15.8"
          color="magenta"
        />
      </div>

      {/* Row 2: Sales Overview and Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Overview */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl stagger-card group/chart">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-10">
            <div>
              <h3 className="text-xl font-luxury text-white italic mb-1">Sales Performance</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Revenue Analytics Overview</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white/60 font-bold focus:outline-none focus:border-rose-500/30 transition-colors uppercase tracking-widest cursor-pointer flex-1 sm:flex-none">
                <option className="bg-[#1a1625]">This Month</option>
                <option className="bg-[#1a1625]">Last Month</option>
              </select>
              <button className="w-10 h-10 flex-shrink-0 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-colors">
                <i className="ri-download-2-line text-rose-400"></i>
              </button>
            </div>
          </div>
          <div className="relative h-[320px]">
            <SalesAreaChart chartData={stats.chartData} />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-2xl p-5 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl stagger-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8 w-full">
            <h3 className="text-xl font-luxury text-white italic">Elite Selection</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-[9px] font-bold text-rose-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 group/view w-full sm:w-auto justify-start sm:justify-end"
            >
              Examine All <i className="ri-arrow-right-line group-hover/view:translate-x-1 transition-transform"></i>
            </button>
          </div>
          
          <div className="space-y-6">
            {(stats.topProducts || [
              { name: 'Rose de Grasse', category: 'Eau de Parfum', sales: 124, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop' },
              { name: 'Oud Wood Elite', category: 'Private Blend', sales: 98, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&h=100&fit=crop' },
              { name: 'Bergamot Bloom', category: 'Colonia', sales: 86, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop' },
              { name: 'Amber Absolute', category: 'Luxury Edition', sales: 72, img: 'https://images.unsplash.com/photo-1616949755610-8c9fad0fd98c?w=100&h=100&fit=crop' },
            ]).map((product, i) => (
              <div key={i} className="flex items-center justify-between group/item p-2 sm:p-3 rounded-2xl hover:bg-white/[0.02] transition-colors gap-2">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-card border border-white/5 overflow-hidden flex-shrink-0 shadow-lg group-hover/item:border-rose-500/30 transition-all">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-sm font-luxury text-white italic group-hover/item:text-rose-400 transition-colors truncate w-full">{product.name}</span>
                    <span className="text-[8px] sm:text-[9px] text-white/30 uppercase font-bold tracking-widest truncate">{product.category}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-base sm:text-lg font-luxury text-white italic block">{product.sales}</span>
                  <span className="text-[7px] sm:text-[8px] text-white/10 font-bold uppercase tracking-[0.2em] whitespace-nowrap">units sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl stagger-card overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-luxury text-white italic">Recent Transactions</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-[9px] font-bold text-rose-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 group/ord"
            >
              Order History <i className="ri-arrow-right-line group-hover/ord:translate-x-1 transition-transform"></i>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/20 text-[9px] font-bold uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-5">Reference</th>
                  <th className="pb-5">Client</th>
                  <th className="pb-5">Status</th>
                  <th className="pb-5 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(stats.recentOrders || [
                  { id: '#ORD-1250', customer: 'John Smith', date: '30 May 2024', amount: 'Rs 25,000', status: 'Completed' },
                  { id: '#ORD-1249', customer: 'Emily Johnson', date: '29 May 2024', amount: 'Rs 18,000', status: 'Processing' },
                  { id: '#ORD-1248', customer: 'Michael Brown', date: '29 May 2024', amount: 'Rs 32,000', status: 'Completed' },
                  { id: '#ORD-1247', customer: 'Sophia Williams', date: '28 May 2024', amount: 'Rs 15,000', status: 'Pending' },
                ]).map((order, i) => {
                  const id = order.orderNumber || order.id;
                  const customer = order.userId?.fullName || order.customer;
                  const amount = order.subtotal ? formatCurrency(order.subtotal) : order.amount;
                  const status = (order.status && typeof order.status === 'string') ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : (order.status || 'Unknown');

                  return (
                    <tr key={i} className="group/row hover:bg-white/[0.01] transition-colors">
                      <td className="py-5 text-[10px] font-bold text-white/40 tracking-wider">{id}</td>
                      <td className="py-5 text-sm font-luxury text-white italic group-hover/row:text-rose-400 transition-colors">{customer}</td>
                      <td className="py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${['completed', 'delivered'].includes(status?.toLowerCase()) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            ['processing', 'pending'].includes(status?.toLowerCase()) ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-5 text-sm font-luxury text-white italic text-right">{amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl stagger-card">
          <h3 className="text-xl font-luxury text-white italic mb-10">Scent Distribution</h3>
          <CategoryPieChart chartData={stats.categoryData} totalValue={stats.totalRevenue} />

          <div className="space-y-5 mt-10">
            {stats.loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (() => {
              const displayData = (stats.categoryData && stats.categoryData.length > 0) ? stats.categoryData : [
                { name: "Men's Perfume", value: 42 },
                { name: "Women's Perfume", value: 35 },
                { name: 'Unisex Perfume', value: 15 },
                { name: 'Gift Sets', value: 8 },
              ];
              const total = displayData.reduce((a, b) => a + b.value, 0) || 1;
              const colors = ['bg-[#D4AF37]', 'bg-[#f9d053]', 'bg-[#dbb758]', 'bg-[#BDBDBD]'];

              return displayData.map((cat, i) => {
                const percentage = Math.round((cat.value / total) * 100);
                return (
                  <div key={i} className="flex items-center justify-between group/cat">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]} shadow-[0_0_10px_currentColor]`}></div>
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest group-hover/cat:text-rose-400 transition-colors">{cat.name}</span>
                    </div>
                    <span className="text-sm font-luxury text-white italic">{percentage}%</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/5 text-center">
        <p className="text-xs text-text-muted"></p>
      </footer>
    </div>
  );
};

export default Dashboard;
