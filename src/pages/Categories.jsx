/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import 'remixicon/fonts/remixicon.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', parentCategory: '', isActive: true });
    
    const [statusPopup, setStatusPopup] = useState({ 
        show: false, 
        type: 'confirm', 
        title: '', 
        message: '', 
        targetId: null 
    });

    const cardsRef = useRef([]);
    const statsRef = useRef([]);
    const headerRef = useRef(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!loading && categories.length > 0) {
            // Stats 3D entrance & Number Counter
            statsRef.current.forEach((el, index) => {
                gsap.fromTo(el,
                    { opacity: 0, rotationX: -45, y: 50, scale: 0.9 },
                    { 
                        opacity: 1, 
                        rotationX: 0, 
                        y: 0, 
                        scale: 1, 
                        duration: 1.2, 
                        delay: index * 0.2,
                        ease: 'expo.out',
                        onComplete: () => {
                            // Floating loop
                            gsap.to(el, {
                                y: -8,
                                duration: 2 + index * 0.4,
                                repeat: -1,
                                yoyo: true,
                                ease: "sine.inOut"
                            });
                        }
                    }
                );

                // Animated Number Counter
                const valueObj = { val: 0 };
                const targetValue = stats[index].value;
                const valueElement = el.querySelector('.stat-value');
                
                if (valueElement) {
                    gsap.to(valueObj, {
                        val: targetValue,
                        duration: 2,
                        delay: 0.5 + index * 0.2,
                        ease: 'power4.out',
                        onUpdate: () => {
                            valueElement.innerText = Math.round(valueObj.val);
                        }
                    });
                }
            });

            // Cards entrance
            gsap.fromTo(cardsRef.current, 
                { opacity: 0, y: 30, scale: 0.95 },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    duration: 0.8, 
                    stagger: 0.05, 
                    ease: 'expo.out' 
                }
            );

            gsap.fromTo(headerRef.current,
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 1, ease: 'power4.out' }
            );
        }
    }, [loading, categories]);

    const stats = [
        { 
            label: 'Total Categories', 
            value: categories.length, 
            icon: 'ri-stack-line', 
            color: 'text-[#fbbf24]', 
            badge: '100%'
        },
        { 
            label: 'Parent Essences', 
            value: categories.filter(c => !c.parentCategory).length, 
            icon: 'ri-medal-2-line', 
            color: 'text-[#2dd4bf]', 
            badge: `${Math.round((categories.filter(c => !c.parentCategory).length / (categories.length || 1)) * 100)}%`
        },
        { 
            label: 'Child Variations', 
            value: categories.filter(c => c.parentCategory).length, 
            icon: 'ri-node-tree', 
            color: 'text-[#f472b6]', 
            badge: `${Math.round((categories.filter(c => c.parentCategory).length / (categories.length || 1)) * 100)}%`
        }
    ];

    const handleOpenModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({ 
                name: category.name || '', 
                parentCategory: category.parentCategory?._id || '', 
                isActive: category.isActive !== undefined ? category.isActive : true 
            });
        } else {
            setCurrentCategory(null);
            setFormData({ name: '', parentCategory: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = currentCategory?._id || currentCategory?.id;
        
        try {
            const payload = {
                ...formData,
                _id: id,
                id: id,
                parentCategory: formData.parentCategory === '' ? null : formData.parentCategory
            };

            let response;
            if (currentCategory && id) {
                response = await updateCategory(id, payload);
            } else {
                response = await createCategory(payload);
            }

            const isSuccess = response && (
                response.success === true ||
                (response.message && (
                    response.message.toLowerCase().includes('successfully') || 
                    response.message.toLowerCase().includes('permanently') ||
                    response.message.toLowerCase().includes('created') ||
                    response.message.toLowerCase().includes('updated')
                )) || 
                response.status === 'success'
            );

            if (isSuccess) {
                showStatus('success', 'Success!', `Category ${currentCategory ? 'updated' : 'created'} successfully.`);
                handleCloseModal();
                if (currentCategory && id) {
                    setCategories(prev => prev.map(c => 
                        (c._id === id || c.id === id) ? { ...c, ...payload } : c
                    ));
                }
                loadCategories();
            } else {
                showStatus('error', 'Failed!', response?.message || 'The server returned an error.');
            }
        } catch (error) {
            showStatus('error', 'Error!', 'A connection error occurred.');
        }
    };

    const showStatus = (type, title, message, targetId = null) => {
        setStatusPopup({ show: true, type, title, message, targetId });
    };

    const closeStatus = () => {
        setStatusPopup(prev => ({ ...prev, show: false }));
    };

    const confirmDelete = async () => {
        const id = statusPopup.targetId;
        if (!id) return;
        closeStatus();
        try {
            const response = await deleteCategory(id);
            const isSuccess = response && (
                response.success === true ||
                (response.message && (
                    response.message.toLowerCase().includes('successfully') || 
                    response.message.toLowerCase().includes('permanently') ||
                    response.message.toLowerCase().includes('removed')
                )) || 
                response.status === 'success'
            );

            if (isSuccess) {
                showStatus('success', 'Deleted!', 'Category has been removed from the database.');
                setCategories(prev => prev.filter(c => c._id !== id && c.id !== id));
                loadCategories();
            } else {
                showStatus('error', 'Failed!', response?.message || 'Could not delete category.');
            }
        } catch (error) {
            showStatus('error', 'Error!', 'A connection error occurred.');
        }
    };

    return (
        <div className="p-0 pt-2 space-y-8 min-h-screen pb-24 relative text-white selection:bg-rose-500/30 selection:text-rose-200">
            {/* Elegant Header */}
            <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 bg-white/[0.02] backdrop-blur-3xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative z-10 w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-luxury text-white tracking-tight italic flex items-center gap-4">
                        <i className="ri-grid-fill text-rose-400"></i>
                        <span>Luxury <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Collections</span></span>
                    </h1>
                    <p className="text-text-muted mt-1 tracking-[0.4em] uppercase text-[9px] font-bold opacity-50">Architect your premium scent hierarchy</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_rgba(192,38,211,0.4)] active:scale-95 shadow-xl"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
                    <i className="ri-add-line text-lg relative z-10"></i>
                    <span className="relative z-10 tracking-widest uppercase text-[10px] font-bold">New Category</span>
                </button>
            </div>

            {/* Dynamic Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div 
                        key={i}
                        ref={el => statsRef.current[i] = el}
                        className="relative bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group/stat"
                    >
                        <div className="absolute inset-0 bg-rose-500/[0.02] group-hover/stat:bg-rose-500/[0.05] transition-colors duration-700"></div>
                        
                        {/* Trend Badge */}
                        <div className="absolute top-2.5 right-6 px-2.5 py-0.5 rounded-full text-[8px] font-bold bg-rose-400/10 border border-rose-400/20 text-rose-400 z-20">
                            {stat.badge}
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.15)] group-hover/stat:scale-110 transition-transform duration-700 group-hover/stat:rotate-[10deg] relative">
                                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-20"></div>
                                <i className={`${stat.icon} text-xl ${stat.color} drop-shadow-[0_0_10px_currentColor] relative z-10`}></i>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">{stat.label}</p>
                                    <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse"></span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-2xl md:text-3xl font-luxury text-white italic tracking-tighter stat-value">{stat.value}</h3>
                                    <span className="text-[8px] text-white/10 font-bold uppercase tracking-[0.1em] italic whitespace-nowrap">Total Essences</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent w-full -translate-x-full group-hover/stat:translate-x-full transition-transform duration-[1.5s] ease-in-out"></div>
                    </div>
                ))}
            </div>

            {/* Category Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh]">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-rose-400 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-8 text-rose-400 tracking-[0.5em] uppercase text-[10px] font-bold animate-pulse italic">Retrieving Essences...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                    {categories.map((category, index) => (
                        <div 
                            key={category._id || category.id || index}
                            ref={el => cardsRef.current[index] = el}
                            className="group relative bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-rose-500/30 transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col h-full active:scale-[0.98] stagger-card"
                        >
                            {/* Subtle Ambient Light */}
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-rose-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            
                            <div className="p-6 md:p-9 flex-1 relative z-10">
                                {/* Header: Icon & Actions */}
                                <div className="flex justify-between items-center mb-8 md:mb-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                            <i className="ri-ink-bottle-line text-2xl text-rose-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]"></i>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(category)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-white/10 hover:text-rose-400 transition-all duration-500">
                                            <i className="ri-pencil-fill text-base"></i>
                                        </button>
                                        <button onClick={() => showStatus('confirm', 'Archive Collection?', 'This will permanently remove this essence category.', category._id || category.id)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-500">
                                            <i className="ri-delete-bin-fill text-base"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Identity Section */}
                                <div className="space-y-4 mb-10">
                                    <h3 className="text-3xl md:text-4xl font-luxury text-white tracking-tight italic group-hover:text-rose-300 transition-colors duration-700 leading-tight truncate">
                                        {category.name.toLowerCase()}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.parentCategory ? (
                                            <span className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[8px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                <i className="ri-node-tree text-[10px]"></i>
                                                {category.parentCategory.name}
                                            </span>
                                        ) : (
                                            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/30 text-[8px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 group-hover:border-rose-500/30 group-hover:text-rose-300 transition-all">
                                                <i className="ri-shining-line text-[10px]"></i>
                                                MASTER TIER
                                            </div>
                                        )}
                                        <div className={`px-3 py-1 rounded-lg border text-[8px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 ${category.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                            <div className={`w-1 h-1 rounded-full ${category.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                                            {category.isActive ? 'ACTIVE' : 'HIDDEN'}
                                        </div>
                                    </div>
                                </div>

                                {/* Information Asset */}
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/[0.03] group-hover:border-rose-500/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">SCENT SLUG</span>
                                        <span className="text-[10px] text-rose-400/40 italic font-medium truncate ml-4">/{category.slug || 'no-slug'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Authenticity Footer */}
                            <div className="px-6 md:px-9 py-5 md:py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between group-hover:bg-rose-500/[0.03] transition-colors">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-bold text-rose-400/30 uppercase tracking-[0.3em]">Authenticity Code</p>
                                    <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase truncate w-32">
                                        {(category._id || category.id || 'AUTH-000').substring(0, 12)}
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                    <i className="ri-qr-code-line text-white/10 group-hover:text-rose-400/30 transition-colors"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/90 backdrop-blur-[30px]" onClick={handleCloseModal} />
                    <motion.div initial={{ scale: 0.9, y: 50, opacity: 0, rotateX: 20 }} animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }} exit={{ scale: 0.9, y: 50, opacity: 0, rotateX: -20 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(244,114,182,0.15)] relative z-10" >
                        <div className="absolute top-0 right-0 p-6 md:p-10">
                            <button onClick={handleCloseModal} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white/5 text-white/40 hover:bg-rose-500 hover:text-white transition-all active:scale-90"><i className="ri-close-line text-xl md:text-2xl"></i></button>
                        </div>
                        <div className="p-8 md:p-16">
                            <div className="mb-8 md:mb-12">
                                <h2 className="text-3xl md:text-4xl font-serif text-white italic tracking-tight">{currentCategory ? 'Refine' : 'Orchestrate'} <span className="text-rose-400">Category</span></h2>
                                <p className="text-text-muted text-[10px] tracking-[0.3em] uppercase font-bold mt-3 opacity-50">Define the core identity of your collection</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold tracking-widest text-rose-400 uppercase ml-2 flex items-center gap-2"><i className="ri-edit-2-line"></i> Category Essence Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 text-white focus:outline-none focus:border-rose-500 focus:bg-white/[0.05] transition-all duration-500 shadow-inner" placeholder="e.g. Imperial Oud" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold tracking-widest text-rose-400 uppercase ml-2 flex items-center gap-2"><i className="ri-node-tree"></i> Parent Scent Tier</label>
                                    <select value={formData.parentCategory} onChange={(e) => setFormData({...formData, parentCategory: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 text-white focus:outline-none focus:border-rose-500 focus:bg-white/[0.05] transition-all duration-500 appearance-none cursor-pointer">
                                        <option value="" className="bg-[#111]">Master Category (No Parent)</option>
                                        {categories.filter(c => (c._id || c.id) !== (currentCategory?._id || currentCategory?.id)).map(c => (<option key={c._id || c.id} value={c._id || c.id} className="bg-[#111]">{c.name}</option>))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-3xl border border-white/5">
                                    <div className="flex-1"><p className="text-white text-xs font-bold uppercase tracking-widest">Active Status</p><p className="text-text-muted text-[10px] mt-1 italic">Determine if this collection is visible</p></div>
                                    <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`w-16 h-8 rounded-full relative transition-all duration-500 ${formData.isActive ? 'bg-rose-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500 ${formData.isActive ? 'left-9' : 'left-1'}`}></div></button>
                                </div>
                                <button type="submit" className="w-full py-6 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-3xl uppercase tracking-[0.3em] text-xs hover:shadow-[0_20px_60px_rgba(192,38,211,0.4)] transition-all duration-700 active:scale-95 mt-4">{currentCategory ? 'Commit Refinements' : 'Initialize Collection'}</button>
                            </form>
                        </div>
                    </motion.div>
                </div>, document.body
            )}

            {/* Status Popups */}
            {statusPopup.show && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/95 backdrop-blur-[40px]" />
                    <motion.div initial={{ scale: 0.5, y: 100, opacity: 0, rotateX: 45 }} animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }} exit={{ scale: 0.5, y: -100, opacity: 0, rotateX: -45 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }} className="bg-[#0d0d0d] border border-white/10 w-full max-w-md rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_200px_rgba(0,0,0,0.8)] relative z-10 text-center p-8 md:p-16" >
                        <div className={`absolute inset-0 opacity-10 animate-pulse ${statusPopup.type === 'confirm' ? 'bg-rose-500' : statusPopup.type === 'success' ? 'bg-rose-500' : 'bg-danger'}`}></div>
                        <div className="relative z-10">
                            <motion.div animate={{ y: [0, -10, 0], rotateZ: statusPopup.type === 'error' ? [-5, 5, -5] : [0, 0, 0] }} transition={{ repeat: Infinity, duration: 3 }} className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center mb-6 md:mb-8 border-2 ${statusPopup.type === 'confirm' ? 'border-rose-500/30 bg-rose-500/10' : statusPopup.type === 'success' ? 'border-rose-500/30 bg-rose-500/10' : 'border-danger/30 bg-danger/10'}`}><i className={`text-3xl md:text-4xl ${statusPopup.type === 'confirm' ? 'ri-question-mark text-rose-400' : statusPopup.type === 'success' ? 'ri-check-line text-rose-400' : 'ri-error-warning-line text-danger'}`}></i></motion.div>
                            <h3 className="text-2xl md:text-3xl font-serif text-white italic mb-4">{statusPopup.title}</h3>
                            <p className="text-text-muted text-sm leading-relaxed mb-8 md:mb-10 opacity-70 px-2 md:px-4">{statusPopup.message}</p>
                            <div className="flex flex-col gap-3">
                                {statusPopup.type === 'confirm' ? (<><button onClick={confirmDelete} className="w-full py-5 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-2xl uppercase tracking-widest text-[10px] hover:shadow-[0_15px_40px_rgba(192,38,211,0.3)] transition-all active:scale-95">Confirm Deletion</button><button onClick={closeStatus} className="w-full py-5 bg-white/5 text-white/60 font-bold rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95">Cancel</button></>) : (<button onClick={closeStatus} className={`w-full py-5 font-bold rounded-2xl uppercase tracking-widest text-[10px] transition-all active:scale-95 ${statusPopup.type === 'success' ? 'bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white shadow-[0_15px_40px_rgba(192,38,211,0.3)]' : 'bg-danger text-white'}`}>Dismiss</button>)}
                            </div>
                        </div>
                    </motion.div>
                </div>, document.body
            )}
        </div>
    );
};

export default Categories;
