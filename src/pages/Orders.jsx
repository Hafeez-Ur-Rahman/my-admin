/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { fetchDashboardData, updateOrderStatus } from '../services/api';
import 'remixicon/fonts/remixicon.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusPopup, setStatusPopup] = useState({ show: false, type: '', message: '' });
    
    const containerRef = useRef(null);
    const rowsRef = useRef([]);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, activeFilter, searchTerm]);

    const loadOrders = async () => {
        setLoading(true);
        const data = await fetchDashboardData();
        if (data && data.allOrders) {
            setOrders(data.allOrders);
        }
        setLoading(false);
    };

    const filterOrders = () => {
        let filtered = [...orders];
        
        if (activeFilter !== 'all') {
            filtered = filtered.filter(order => order.status?.toLowerCase() === activeFilter.toLowerCase());
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order => {
                const customerName = order.userId?.fullName?.toLowerCase() || '';
                const orderNum = order.orderNumber?.toLowerCase() || '';
                const orderId = order._id?.toLowerCase() || '';
                const payment = order.paymentMethod?.toLowerCase() || '';
                const subtotal = String(order.subtotal || '');
                const itemsMatch = order.items?.some(item => 
                    item.titleSnapshot?.toLowerCase().includes(term)
                );

                return orderNum.includes(term) || 
                       customerName.includes(term) || 
                       orderId.includes(term) || 
                       payment.includes(term) ||
                       subtotal.includes(term) ||
                       itemsMatch;
            });
        }
        
        setFilteredOrders(filtered);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const response = await updateOrderStatus(id, newStatus);
            if (response.message.toLowerCase().includes('updated')) {
                setOrders(prev => prev.map(order => 
                    order._id === id ? { ...order, status: newStatus } : order
                ));
                showPopup('success', `Order marked as ${newStatus}`);
            } else {
                showPopup('error', 'Failed to update status');
            }
        } catch (error) {
            showPopup('error', 'Connection error');
        } finally {
            setUpdatingId(null);
        }
    };

    const showPopup = (type, message) => {
        setStatusPopup({ show: true, type, message });
        setTimeout(() => setStatusPopup({ show: false, type: '', message: '' }), 3000);
    };

    // GSAP Entrance Animation
    useEffect(() => {
        if (!loading && filteredOrders.length > 0) {
            gsap.fromTo(rowsRef.current, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [loading, filteredOrders.length]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'pending': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            case 'shipped': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'cancelled': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
            default: return 'bg-white/5 border-white/10 text-white/40';
        }
    };

    return (
        <div className="p-0 pt-2 space-y-10 min-h-screen pb-32 text-white selection:bg-rose-500/30 selection:text-rose-200">
            {/* Elegant Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 bg-white/[0.02] backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 w-full sm:w-auto">
                    <h1 className="text-3xl md:text-4xl font-luxury text-white tracking-tight italic flex items-center gap-4">
                        <i className="ri-shopping-bag-3-fill text-rose-400"></i>
                        <span>Order <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Managements</span></span>
                    </h1>
                    <p className="text-white/30 mt-2 tracking-[0.4em] uppercase text-[9px] font-bold">Overseeing the flow of global luxury essence</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="relative group/search">
                        <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover/search:text-rose-400 transition-colors"></i>
                        <input 
                            type="text" 
                            placeholder="SEARCH COLLECTIONS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 w-full sm:w-72 text-[10px] font-bold tracking-[0.2em] outline-none focus:border-rose-500/30 focus:bg-white/[0.08] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Glass Filter Tabs */}
            <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-3xl w-full sm:w-fit overflow-x-auto no-scrollbar backdrop-blur-xl flex-nowrap">
                {['all', 'pending', 'delivered', 'cancelled'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-8 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                            activeFilter === filter 
                            ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-[0_10px_30px_rgba(192,38,211,0.3)]' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Orders List Container */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[40vh]">
                        <div className="w-12 h-12 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                        <p className="mt-6 text-rose-400/40 text-[10px] font-bold uppercase tracking-[0.5em] italic animate-pulse">Syncing Inventory...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-16 md:p-32 text-center">
                        <i className="ri-inbox-archive-line text-6xl text-white/5 mb-6 block"></i>
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">No requests found in this tier</p>
                    </div>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div 
                            key={order._id}
                            ref={el => rowsRef.current[index] = el}
                            className="group relative bg-gradient-to-r from-white/[0.03] to-transparent backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-6 md:gap-10 hover:border-rose-500/30 hover:bg-white/[0.05] transition-all duration-700 shadow-2xl overflow-hidden"
                        >
                            {/* Animated Background Pulse */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mr-20 -mt-20"></div>

                            {/* Identity Section */}
                            <div className="flex items-center gap-6 lg:w-1/4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                    <i className="ri-user-heart-fill text-2xl text-rose-300"></i>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-bold text-rose-400/40 uppercase tracking-[0.3em] mb-1">CONSIGNEE</p>
                                    <h4 className="text-xl font-luxury text-white truncate italic">{order.userId?.fullName || 'Anonymous Collector'}</h4>
                                    <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase mt-1">ID: {(order._id).substring(18).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                                <div>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">REFERENCE</p>
                                    <p className="text-xs font-bold text-rose-300 tracking-wider truncate">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">VALUATION</p>
                                    <p className="text-lg font-luxury text-white italic">Rs {order.subtotal?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">TIMESTAMP</p>
                                    <p className="text-[10px] font-bold text-white/40 tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">STATUS</p>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></div>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Full Status Control */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 mt-4 lg:mt-0">
                                <div className="relative group/status w-full sm:w-auto">
                                    <select 
                                        value={order.status}
                                        disabled={updatingId === order._id}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className={`w-full sm:w-auto appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-10 text-[9px] font-bold uppercase tracking-[0.2em] outline-none hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 ${getStatusColor(order.status)}`}
                                    >
                                        <option value="pending" className="bg-[#0a0a0a]">Pending</option>
                                        <option value="delivered" className="bg-[#0a0a0a]">Delivered</option>
                                        <option value="cancelled" className="bg-[#0a0a0a]">Cancelled</option>
                                    </select>
                                    <i className={`ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover/status:translate-y-[-40%] ${updatingId === order._id ? 'animate-spin ri-loader-4-line' : 'ri-arrow-down-s-line'}`}></i>
                                </div>

                                <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full sm:w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-white/10 transition-all duration-500"
                                    title="View Detailed Manifesto"
                                >
                                    <i className="ri-eye-line text-lg"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Success/Error Popup */}
            <AnimatePresence>
                {statusPopup.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-4 sm:bottom-10 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[100] px-6 sm:px-10 py-5 rounded-[2rem] border backdrop-blur-3xl shadow-2xl flex items-center gap-4 ${
                            statusPopup.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                    >
                        <i className={statusPopup.type === 'success' ? 'ri-checkbox-circle-fill text-2xl' : 'ri-error-warning-fill text-2xl'}></i>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5">{statusPopup.type.toUpperCase()}</p>
                            <p className="text-sm font-medium italic">{statusPopup.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-background/90 backdrop-blur-[40px]"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 w-[95%] sm:w-full max-w-2xl rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="absolute top-0 right-0 p-6 md:p-8 z-20">
                                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-rose-500 hover:text-white transition-all"><i className="ri-close-line text-xl"></i></button>
                            </div>

                            <div className="p-6 md:p-12 overflow-y-auto custom-scrollbar">
                                <div className="mb-8 md:mb-10">
                                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-[0.4em] mb-2">Detailed Manifesto</p>
                                    <h2 className="text-3xl md:text-4xl font-luxury text-white italic">Order {selectedOrder.orderNumber}</h2>
                                    <div className="flex items-center gap-4 mt-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border flex items-center gap-2 ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 md:space-y-8 pr-2 no-scrollbar">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 md:p-5 bg-white/[0.02] rounded-3xl border border-white/5">
                                            <img src={`https://perfume-project-production-b650.up.railway.app${item.imageSnapshot}`} alt={item.titleSnapshot} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/10" />
                                            <div className="flex-1">
                                                <h5 className="text-lg font-luxury text-white italic">{item.titleSnapshot}</h5>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">QTY: {item.qty} × Rs {item.priceSnapshot?.toLocaleString()}</p>
                                            </div>
                                            <p className="text-xl font-luxury text-rose-300 italic text-left sm:text-right">Rs {(item.qty * item.priceSnapshot)?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-6 md:gap-10">
                                    <div>
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2">SHIPPING ARCHIVE</p>
                                        <p className="text-xs text-white/60 leading-relaxed font-medium">{selectedOrder.shippingAddress || 'N/A'}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[8px] font-bold text-rose-400/40 uppercase tracking-[0.3em] mb-2">FINAL VALUATION</p>
                                        <p className="text-2xl md:text-3xl font-luxury text-white italic">Rs {selectedOrder.subtotal?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
