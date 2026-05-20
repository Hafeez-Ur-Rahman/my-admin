import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchInventoryDashboard, 
  fetchLowProducts, 
  fetchLowVariants, 
  fetchOutOfStock, 
  fetchFullInventory,
  fetchProducts 
} from '../services/api';

const Inventory = () => {
  // Tabs: 'all' | 'low-products' | 'low-variants' | 'out-of-stock'
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for API data
  // eslint-disable-next-line no-unused-vars
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    lowProductStock: 0,
    lowVariants: 0,
    outOfStock: 0
  });
  const [allInventory, setAllInventory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [lowProducts, setLowProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [lowVariants, setLowVariants] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [outOfStock, setOutOfStock] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Load all dashboard metrics and tab data
  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [stats, allData, lowProdData, lowVarData, outData, prodsData] = await Promise.all([
        fetchInventoryDashboard(),
        fetchFullInventory(),
        fetchLowProducts(),
        fetchLowVariants(),
        fetchOutOfStock(),
        fetchProducts()
      ]);

      if (stats) setDashboardStats(stats);
      if (Array.isArray(allData)) setAllInventory(allData);
      else if (allData?.data && Array.isArray(allData.data)) setAllInventory(allData.data);

      if (Array.isArray(lowProdData)) setLowProducts(lowProdData);
      else if (lowProdData?.data && Array.isArray(lowProdData.data)) setLowProducts(lowProdData.data);

      if (Array.isArray(lowVarData)) setLowVariants(lowVarData);
      else if (lowVarData?.data && Array.isArray(lowVarData.data)) setLowVariants(lowVarData.data);

      if (Array.isArray(outData)) setOutOfStock(outData);
      else if (outData?.data && Array.isArray(outData.data)) setOutOfStock(outData.data);
      
      if (Array.isArray(prodsData)) setProductsList(prodsData);
      else if (prodsData?.data && Array.isArray(prodsData.data)) setProductsList(prodsData.data);
      
    } catch (error) {
      console.error("Failed to load inventory logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  // Helper: Get Total Stock from all variants
  const getTotalStock = (item) => {
    if (item.stock !== undefined) return Number(item.stock) || 0;
    if (item.qty !== undefined) return Number(item.qty) || 0;
    if (item.variants && item.variants.length > 0) {
      return item.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return 0;
  };

  // Dynamic computed counters for absolute UI sync
  const computedStats = useMemo(() => {
    const totalProducts = allInventory.length;
    const lowProductStock = allInventory.filter(item => {
      const total = getTotalStock(item);
      return total > 0 && total <= 10;
    }).length;
    
    const lowVariants = allInventory.filter(item => {
      if (item.variants && item.variants.length > 0) {
        return item.variants.some(v => Number(v.stock) > 0 && Number(v.stock) <= 10);
      }
      const total = getTotalStock(item);
      return total > 0 && total <= 10;
    }).length;
    
    const outOfStock = allInventory.filter(item => getTotalStock(item) <= 0).length;

    return { totalProducts, lowProductStock, lowVariants, outOfStock };
  }, [allInventory]);

  // Determine current dataset to render based on tab
  const currentDataset = useMemo(() => {
    switch (activeTab) {
      case 'low-products':
        // Filter products where total stock is between 1 and 10
        return allInventory.filter(item => {
          const total = getTotalStock(item);
          return total > 0 && total <= 10;
        });
      case 'low-variants':
        // Filter products that have at least one variant running low (<= 10 units)
        return allInventory.filter(item => {
          if (item.variants && item.variants.length > 0) {
            return item.variants.some(v => Number(v.stock) > 0 && Number(v.stock) <= 10);
          }
          const total = getTotalStock(item);
          return total > 0 && total <= 10;
        });
      case 'out-of-stock':
        // Filter products where total stock is 0
        return allInventory.filter(item => getTotalStock(item) <= 0);
      case 'all':
      default:
        return allInventory;
    }
  }, [activeTab, allInventory]);

  // Apply search keyword filter to current view
  const filteredDataset = useMemo(() => {
    if (!searchTerm.trim()) return currentDataset;
    const term = searchTerm.toLowerCase();
    return currentDataset.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(term) || item.title?.toLowerCase().includes(term);
      const brandMatch = item.brand?.toLowerCase().includes(term);
      const categoryMatch = item.category?.toLowerCase().includes(term) || item.categoryId?.toLowerCase().includes(term);
      return nameMatch || brandMatch || categoryMatch;
    });
  }, [currentDataset, searchTerm]);

  // Helper: Status badge generator
  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-rose-500/30 bg-rose-500/5 text-rose-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
          Exhausted
        </span>
      );
    } else if (stock <= 10) {
      return (
        <span className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-amber-500/30 bg-amber-500/5 text-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
          Low Essence
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-full flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
          Optimal
        </span>
      );
    }
  };

  // Helper: Image extractor (bulletproof across flat/nested schemas and admin-uploaded image formats)
  const getProductImage = (item) => {
    let imgPath = null;
    // 1. Check flat fields on root
    if (item.images && item.images.length > 0) imgPath = item.images[0];
    else if (item.thumbnail) imgPath = item.thumbnail;
    else if (item.image) imgPath = item.image;
    
    // 2. Check nested productId fields if populated from inventory refs
    else if (item.productId) {
      if (item.productId.images && item.productId.images.length > 0) imgPath = item.productId.images[0];
      else if (item.productId.thumbnail) imgPath = item.productId.thumbnail;
      else if (item.productId.image) imgPath = item.productId.image;
    }
    
    // 3. Check inside nested variants if any
    else if (item.variants && item.variants.length > 0) {
      const v = item.variants[0];
      if (v.images && v.images.length > 0) imgPath = v.images[0];
      else if (v.image) imgPath = v.image;
      else if (v.thumbnail) imgPath = v.thumbnail;
    }

    // 4. Check products list mapping
    if (!imgPath) {
      const pId = typeof item.productId === 'object' ? (item.productId?._id || item.productId?.id) : (item.productId || item._id || item.id);
      if (pId) {
        const foundProd = productsList.find(p => p._id === pId || p.id === pId);
        if (foundProd) {
          if (foundProd.images && foundProd.images.length > 0) imgPath = foundProd.images[0];
          else if (foundProd.thumbnail) imgPath = foundProd.thumbnail;
          else if (foundProd.image) imgPath = foundProd.image;
        }
      }
    }

    if (imgPath) {
      let normalizedPath = imgPath.replace(/\\/g, '/');
      if (normalizedPath.startsWith('http') || normalizedPath.startsWith('blob:') || normalizedPath.startsWith('data:')) {
        return normalizedPath;
      }
      const baseUrl = 'https://perfumeapis.brainexworld.com';
      return normalizedPath.startsWith('/') ? `${baseUrl}${normalizedPath}` : `${baseUrl}/${normalizedPath}`;
    }

    return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80'; // fallback luxury perfume
  };

  return (
    <div className="p-0 space-y-8 min-h-screen text-white selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mt-2">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-rose-400">Inventory Management</span>
          <h1 className="text-3xl md:text-4xl font-serif italic text-white tracking-tight mt-1">Scent Vault Inventory</h1>
        </div>
        <button 
          onClick={loadInventoryData}
          disabled={loading}
          className="h-10 md:h-12 px-4 md:px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 text-white/80 hover:text-white font-black rounded-lg uppercase tracking-widest text-[8px] md:text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none w-full md:w-auto"
        >
          <i className={`ri-refresh-line text-xs ${loading ? 'animate-spin' : ''}`}></i>
          Synchronize Vault
        </button>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Metric 1: Total Products */}
        <motion.div 
          onClick={() => setActiveTab('all')}
          whileHover={{ y: -5 }}
          className={`p-5 md:p-6 bg-[#07060a]/90 border rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group ${
            activeTab === 'all' 
              ? 'border-rose-500/30 shadow-[0_0_30px_rgba(244,114,182,0.1)]' 
              : 'border-white/5 shadow-2xl hover:border-white/10'
          }`}
        >
          <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full blur-[70px] pointer-events-none bg-rose-500/5"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Total Masterpieces</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-white font-serif italic">{loading ? '...' : computedStats.totalProducts}</h3>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <i className="ri-database-2-line text-base md:text-lg"></i>
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Low Product Stock */}
        <motion.div 
          onClick={() => setActiveTab('low-products')}
          whileHover={{ y: -5 }}
          className={`p-5 md:p-6 bg-[#07060a]/90 border rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group ${
            activeTab === 'low-products' 
              ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
              : 'border-white/5 shadow-2xl hover:border-white/10'
          }`}
        >
          <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full blur-[70px] pointer-events-none bg-amber-500/5"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Low Scent Levels</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-white font-serif italic">{loading ? '...' : computedStats.lowProductStock}</h3>
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${
              computedStats.lowProductStock > 0 
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse' 
                : 'border-white/10 bg-white/5 text-white/40'
            }`}>
              <i className="ri-alert-line text-base md:text-lg"></i>
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Low Variants */}
        <motion.div 
          onClick={() => setActiveTab('low-variants')}
          whileHover={{ y: -5 }}
          className={`p-5 md:p-6 bg-[#07060a]/90 border rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group ${
            activeTab === 'low-variants' 
              ? 'border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]' 
              : 'border-white/5 shadow-2xl hover:border-white/10'
          }`}
        >
          <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full blur-[70px] pointer-events-none bg-orange-500/5"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Low Variant Sizes</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-white font-serif italic">{loading ? '...' : computedStats.lowVariants}</h3>
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${
              computedStats.lowVariants > 0 
                ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' 
                : 'border-white/10 bg-white/5 text-white/40'
            }`}>
              <i className="ri-flow-chart text-base md:text-lg"></i>
            </div>
          </div>
        </motion.div>

        {/* Metric 4: Out Of Stock */}
        <motion.div 
          onClick={() => setActiveTab('out-of-stock')}
          whileHover={{ y: -5 }}
          className={`p-5 md:p-6 bg-[#07060a]/90 border rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group ${
            activeTab === 'out-of-stock' 
              ? 'border-rose-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' 
              : 'border-white/5 shadow-2xl hover:border-white/10'
          }`}
        >
          <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full blur-[70px] pointer-events-none bg-rose-600/5"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Exhausted Vaults</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-white font-serif italic">{loading ? '...' : computedStats.outOfStock}</h3>
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${
              computedStats.outOfStock > 0 
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 animate-pulse' 
                : 'border-white/10 bg-white/5 text-white/40'
            }`}>
              <i className="ri-shut-down-line text-base md:text-lg"></i>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Main Grid View */}
      <div className="bg-[#07060a]/90 border border-white/5 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-4 md:p-6 lg:p-10 relative">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none bg-rose-500/5"></div>

        {/* Tab Controls & Inline Filter */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 pb-6 md:pb-8 border-b border-white/5 relative z-10">
          
          {/* Custom Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Vault Inventory', icon: 'ri-archive-line' },
              { id: 'low-products', label: 'Low Stocks', icon: 'ri-alert-line' },
              { id: 'low-variants', label: 'Low Sizes', icon: 'ri-flow-chart' },
              { id: 'out-of-stock', label: 'Exhausted', icon: 'ri-shut-down-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 md:h-11 px-4 md:px-5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 md:gap-2 cursor-pointer flex-grow sm:flex-grow-0 justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-[0_10px_25px_rgba(192,38,211,0.25)] border border-white/10'
                    : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full xl:w-96">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scent vault, category, or brand..."
              className="w-full h-10 md:h-12 pl-12 pr-4 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.07] border border-white/10 focus:border-white/20 text-white rounded-lg text-xs placeholder:text-white/30 transition-all outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <i className="ri-close-circle-fill"></i>
              </button>
            )}
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar pt-6 relative z-10">
          {loading ? (
            // Shimmering Skeleton Loader
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="h-16 w-full bg-white/[0.02] border border-white/5 rounded-xl animate-pulse flex items-center justify-between px-6">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded bg-white/5"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-3/4 bg-white/5 rounded"></div>
                      <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-20 bg-white/5 rounded"></div>
                  <div className="h-3 w-24 bg-white/5 rounded"></div>
                  <div className="h-6 w-20 bg-white/5 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : filteredDataset.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-2xl">
                <i className="ri-archive-drawer-line"></i>
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-white">No Inventory Items Found</h3>
                <p className="text-white/40 text-xs mt-1">There are no records matching the filters or active query bounds.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                  <th className="pb-4 pl-2 whitespace-nowrap">Product Info</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Category</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Variant Specifications</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Current Stock</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Vault Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredDataset.map((item, idx) => (
                    <motion.tr 
                      key={item._id || item.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Product Name and Info */}
                      <td className="py-4 pl-2 whitespace-nowrap min-w-[200px]">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-white/10 overflow-hidden relative bg-black/40 flex-shrink-0">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.name || item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80';
                              }}
                            />
                            {/* Little badge count if low stock */}
                            {getTotalStock(item) <= 0 && (
                              <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[1px] flex items-center justify-center text-[18px] text-rose-500">
                                <i className="ri-close-fill"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs md:text-[13px] text-white tracking-wide truncate max-w-[140px] sm:max-w-[180px]">{item.name || item.title}</h4>
                            <p className="text-[9px] md:text-[10px] text-white/40 font-medium uppercase mt-0.5 tracking-wider">{item.brand || 'Luxury Blend'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category Name */}
                      <td className="py-4 px-4 text-xs font-semibold text-white/70 whitespace-nowrap">
                        {item.category || item.categoryId || 'Premium Perfume'}
                      </td>

                      {/* Variant Size Details */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* If single variant object or has variants list */}
                          {item.size || item.variantName ? (
                            <span className="text-[10px] font-bold tracking-widest text-rose-300 uppercase">
                              {item.size || item.variantName}
                            </span>
                          ) : item.variants && item.variants.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 min-w-[120px] max-w-[200px] sm:max-w-[250px] whitespace-normal">
                              {item.variants
                                .filter(v => activeTab !== 'low-variants' || (Number(v.stock) <= 10))
                                .map((v, vIdx) => (
                                  <span 
                                    key={vIdx}
                                    className={`px-2 py-0.5 text-[8px] font-black tracking-widest rounded uppercase ${
                                      v.stock <= 0 
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                        : v.stock <= 10 
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                          : 'bg-white/5 text-white/60 border border-white/10'
                                    }`}
                                  >
                                    {v.size || v.name || 'Scent'} ({v.stock} units)
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/30 italic">Standard Scent</span>
                          )}
                        </div>
                      </td>

                      {/* Total Stocks */}
                      <td className="py-4 px-4 text-xs font-serif italic font-bold whitespace-nowrap">
                        <span className={`text-sm ${
                          getTotalStock(item) <= 0 
                            ? 'text-rose-500' 
                            : getTotalStock(item) <= 10 
                              ? 'text-amber-500 font-bold' 
                              : 'text-white'
                        }`}>
                          {getTotalStock(item)}
                        </span>
                        <span className="text-[9px] text-white/40 ml-1 font-sans uppercase font-bold tracking-wide">Units</span>
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStockBadge(getTotalStock(item))}
                      </td>

                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};

export default Inventory;
