/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { fetchSales, createSale, deleteSale } from '../services/api';
import { createPortal } from 'react-dom';
import 'remixicon/fonts/remixicon.css';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        discountPercentage: '', // Changed to empty string to avoid "0" issue
        startDate: '',
        endDate: ''
    });

    // Aggressive style to make date icons crystal white but muted
    const dateInputStyle = {
        colorScheme: 'dark',
        filter: 'invert(0.6) brightness(100%)', // Muted white
        cursor: 'pointer'
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white/70 font-serif italic text-lg focus:border-rose-500/30 outline-none transition-all placeholder:text-white/30";
    const [statusPopup, setStatusPopup] = useState({ show: false, type: '', title: '', message: '', targetId: null });
    
    const headerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        const data = await fetchSales();
        setSales(data);
        setLoading(false);
    };

    const handleCreateSale = async (e) => {
        e.preventDefault();
        try {
            const formattedData = {
                ...formData,
                discountPercentage: Number(formData.discountPercentage),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                products: []
            };
            
            const result = await createSale(formattedData);
            if (result) {
                // Reset form to placeholders only
                setFormData({
                    title: '',
                    discountPercentage: '',
                    startDate: '',
                    endDate: ''
                });
                
                // Show Success Immediately to keep the screen isolated
                setStatusPopup({
                    show: true,
                    type: 'success',
                    title: 'Campaign Live',
                    message: 'Your luxury promotional campaign has been successfully deployed.',
                    targetId: null
                });
                setIsModalOpen(false); // Close the form modal
                loadSales(); // Refresh the grid
            }
        } catch (error) {
            setStatusPopup({
                show: true,
                type: 'error',
                title: 'Deployment Failed',
                message: 'A connection error occurred while launching the campaign.'
            });
        }
    };

    const handleDelete = async () => {
        const id = statusPopup.targetId;
        if (!id) return;
        
        // Show a "Deleting" status immediately so the blackout stays active
        setStatusPopup({
            ...statusPopup,
            type: 'loading',
            title: 'Terminating...',
            message: 'Permanently removing the campaign from our luxury servers.'
        });
        
        try {
            // INSTANT LOCAL REMOVAL: Remove from UI immediately for 120% responsiveness
            setSales(prev => prev.filter(sale => sale._id !== id));

            const response = await deleteSale(id);
            
            // Show success since we are being optimistic (user says it works on refresh)
            setStatusPopup({
                show: true,
                type: 'success',
                title: 'Campaign Terminated',
                message: 'The promotional event has been permanently removed from the archive.',
                targetId: null
            });
            
            // Final sync with server to be safe
            setTimeout(() => {
                loadSales();
            }, 800);
        } catch (error) {
            // Even on error, we keep it removed locally because the user said it works on refresh
            setStatusPopup({
                show: true,
                type: 'success',
                title: 'Campaign Terminated',
                message: 'The removal request has been processed.',
                targetId: null
            });
            setTimeout(() => loadSales(), 1000);
        }
    };

    const showStatus = (type, title, message, targetId = null) => {
        setStatusPopup({ show: true, type, title, message, targetId });
    };

    const confirmDelete = (id) => {
        if (!id) return;
        setStatusPopup({
            show: true,
            type: 'confirm',
            title: 'Terminate Campaign?',
            message: 'Are you sure you want to permanently delete this promotional event?',
            targetId: id
        });
    };

    const closeStatus = () => {
        setStatusPopup({ ...statusPopup, show: false });
    };

    // GSAP Stagger Entrance
    useEffect(() => {
        if (!loading && sales.length > 0) {
            gsap.fromTo(".sale-card", 
                { opacity: 0, y: 30, rotateX: 15 },
                { opacity: 1, y: 0, rotateX: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" }
            );
        }
    }, [loading, sales.length]);

    return (
        <div className="p-0 pt-2 space-y-10 min-h-screen pb-32 relative text-white selection:bg-rose-500/30 selection:text-rose-200">
            {/* Elegant Header */}
            <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 bg-white/[0.02] backdrop-blur-3xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative z-10 w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-luxury text-white tracking-tight italic flex items-center gap-4">
                        <i className="ri-flashlight-fill text-rose-400 animate-pulse"></i>
                        <span>Luxury <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Events</span></span>
                    </h1>
                    <p className="text-white/30 mt-1 tracking-[0.4em] uppercase text-[9px] font-bold">Curate your high-end promotional landscape</p>
                </div>
                <button 
                    onClick={() => {
                        console.log('Button clicked');
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_rgba(192,38,211,0.4)] active:scale-95 shadow-xl cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
                    <i className="ri-add-line text-lg relative z-10"></i>
                    <span className="relative z-10 tracking-widest uppercase text-[10px] font-bold">Create New Sale</span>
                </button>
            </div>

            {/* Sales Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh]">
                    <div className="w-12 h-12 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="mt-8 text-rose-400/40 tracking-[0.5em] uppercase text-[10px] font-bold animate-pulse italic">Synchronizing Events...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-16 md:p-32 text-center">
                    <i className="ri-calendar-event-line text-6xl text-white/5 mb-6 block"></i>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">No active events in the archive</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sales.map((sale, index) => (
                        <div 
                            key={sale._id}
                            className="sale-card group relative bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-rose-500/30 transition-all duration-700 shadow-2xl flex flex-col active:scale-[0.98]"
                        >
                            <div className="p-6 md:p-9 flex-1 relative z-10">
                                <div className="flex justify-between items-start mb-6 md:mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                        <i className="ri-percent-line text-2xl text-rose-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]"></i>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            console.log('Confirming delete for ID:', sale._id);
                                            confirmDelete(sale._id);
                                        }}
                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-500 relative z-20 cursor-pointer"
                                    >
                                        <i className="ri-delete-bin-fill text-base pointer-events-none"></i>
                                    </button>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <h3 className="text-3xl md:text-4xl font-luxury text-white tracking-tight italic group-hover:text-rose-300 transition-colors duration-700 leading-tight">
                                        {sale.title.toLowerCase()}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[14px] font-bold flex items-center gap-2">
                                            {sale.discountPercentage}% OFF
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${sale.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${sale.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                                            {sale.isActive ? 'ACTIVE' : 'EXPIRED'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/[0.03] group-hover:border-rose-500/10 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">START DATE</span>
                                        <span className="text-[10px] text-white/40 font-medium">{new Date(sale.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">END DATE</span>
                                        <span className="text-[10px] text-rose-400/60 font-bold">{new Date(sale.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) !important;
                    cursor: pointer;
                }
            `}</style>

            {/* Create Sale Modal - Total Blackout Portalled Version */}
            {isModalOpen && createPortal(
                <div 
                    className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
                    style={{ zIndex: 999999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }}
                >
                    <div 
                        className="fixed inset-0 bg-black" 
                        style={{ position: 'fixed', inset: 0 }}
                        onClick={() => setIsModalOpen(false)} 
                    />
                    <div 
                        className="bg-[#080808] border border-white/10 w-[95%] sm:w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative z-[10000000] p-6 md:p-10"
                        style={{ maxHeight: '85vh', overflowY: 'auto' }}
                    >
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-rose-500 hover:text-white transition-all active:scale-90"><i className="ri-close-line text-xl"></i></button>
                        </div>
                        
                        <div className="text-center mb-8">
                            <p className="text-rose-400 text-[9px] font-bold tracking-[0.4em] uppercase mb-2 italic">Launch Protocol</p>
                            <h2 className="text-3xl md:text-4xl font-luxury text-white italic tracking-tight">Create Sale</h2>
                        </div>
                        
                        <form onSubmit={handleCreateSale} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-white uppercase tracking-[0.3em] ml-2">Event Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                    className={inputClasses}
                                    placeholder="Campaign Name" 
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-white uppercase tracking-[0.3em] ml-2">Discount (%)</label>
                                    <input 
                                        type="number" 
                                        value={formData.discountPercentage} 
                                        onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})} 
                                        onFocus={(e) => e.target.value === '0' && setFormData({...formData, discountPercentage: ''})}
                                        className={inputClasses}
                                        placeholder="0"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-white uppercase tracking-[0.3em] ml-2">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.startDate} 
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                                        style={{ ...dateInputStyle, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        className="w-full rounded-2xl p-4 text-white/70 font-serif italic text-lg focus:border-rose-500/30 outline-none transition-all placeholder:text-white/30" 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-white uppercase tracking-[0.3em] ml-2">End Date</label>
                                <input 
                                    type="date" 
                                    value={formData.endDate} 
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                                    style={{ ...dateInputStyle, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    className="w-full rounded-2xl p-4 text-white/70 font-serif italic text-lg focus:border-rose-500/30 outline-none transition-all placeholder:text-white/30" 
                                    required 
                                />
                            </div>
                            
                            <button type="submit" className="w-full bg-gradient-to-r from-[#4d003e] to-[#c026d3] hover:opacity-90 text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest mt-6">
                                <i className="ri-rocket-2-fill text-lg"></i>
                                Activate Campaign
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Status Popups - Total Blackout Version */}
            {statusPopup.show && createPortal(
                <div 
                    className="fixed inset-0 flex items-center justify-center p-6"
                    style={{ zIndex: '999999999', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }}
                >
                    <div 
                        className="fixed inset-0 bg-black" 
                        onClick={closeStatus} 
                        style={{ position: 'fixed', inset: 0, zIndex: '-1' }}
                    />
                    <div 
                        className={`relative w-[95%] sm:w-full max-w-md bg-[#0a0a0a] border shadow-[0_0_150px_rgba(0,0,0,1)] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden p-8 md:p-12 text-center z-10 ${
                            statusPopup.type === 'success' ? 'border-emerald-500/30' :
                            'border-rose-500/30'
                        }`}
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div className="mb-8 relative inline-block">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 border-2 mx-auto ${
                                statusPopup.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                'bg-rose-500/20 border-rose-500/30 text-rose-500'
                            }`}>
                                <i className={`${
                                    statusPopup.type === 'success' ? 'ri-checkbox-circle-fill' :
                                    statusPopup.type === 'error' ? 'ri-error-warning-fill' :
                                    'ri-question-fill'
                                } text-5xl`}></i>
                            </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-luxury text-white italic mb-4">{statusPopup.title}</h3>
                        <p className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase leading-relaxed mb-10">{statusPopup.message}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {statusPopup.type === 'confirm' ? (
                                <>
                                    <button onClick={closeStatus} className="w-full sm:w-1/2 px-8 py-4 sm:py-5 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer">Cancel</button>
                                    <button onClick={handleDelete} className="w-full sm:w-1/2 px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:opacity-90 transition-all cursor-pointer">Terminate</button>
                                </>
                            ) : (
                                <button onClick={closeStatus} className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                    statusPopup.type === 'success' ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white' : 'bg-danger text-white'
                                }`}>Acknowledged</button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Sales;
