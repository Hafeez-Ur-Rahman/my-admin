import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                {/* Backdrop with heavy isolation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                {/* Profile Card */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-card/60 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                >
                    {/* Top Decorative Header - Reduced Height */}
                    <div className="h-20 bg-gradient-to-br from-accent-pink/20 to-purpleGlow/20 relative">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-all"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* Profile Body - More Compact */}
                    <div className="px-8 pb-8 -mt-10 relative text-center">
                        <div className="w-20 h-20 rounded-3xl bg-card border-4 border-background flex items-center justify-center text-3xl text-accent-pink font-luxury font-bold shadow-2xl mx-auto mb-3">
                            {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        
                        <h2 className="text-xl font-luxury text-white italic">{user.fullName || user.name || "Unknown User"}</h2>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mt-1 ${
                            user.role === 'admin' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20'
                        }`}>
                            {user.role}
                        </span>

                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
                                <div className="w-9 h-9 rounded-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink text-base">
                                    <i className="ri-mail-line"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Email Address</p>
                                    <p className="text-xs text-white/80 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
                                <div className="w-9 h-9 rounded-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink text-base">
                                    <i className="ri-phone-line"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Phone Number</p>
                                    <p className="text-xs text-white/80 font-medium">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
                                <div className="w-9 h-9 rounded-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink text-base">
                                    <i className="ri-map-pin-line"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Address</p>
                                    <p className="text-xs text-white/80 font-medium leading-tight">{user.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
                                <div className="w-9 h-9 rounded-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink text-base">
                                    <i className="ri-calendar-line"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Member Since</p>
                                    <p className="text-xs text-white/80 font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full mt-6 py-3.5 rounded-2xl bg-accent-pink text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent-pink/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Close Profile
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default ProfileModal;
