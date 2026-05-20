import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser } from '../../services/api';

const AdminSignupModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'admin' // Force to admin as requested
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    try {
      const res = await registerUser(formData);
      const isSuccess = res.token || (res.data && res.data.token) || (res.message && res.message.toLowerCase().includes('success'));

      if (isSuccess) {
        onSuccess(formData.fullName);
        setFormData({
          fullName: '', email: '', password: '', phone: '', address: '', role: 'admin'
        });
        setStep(1);
        onClose();
      } else {
        setError(res.message || 'Failed to create admin profile');
      }
    } catch (err) {
      setError('A connection error occurred.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#07060a] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] sticky top-0 z-20">
              <div>
                <h2 className="text-xl md:text-2xl font-luxury italic text-white tracking-tight flex items-center gap-3">
                  <i className="ri-shield-user-line text-accentGold"></i>
                  New Admin
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">Create Admin Privilege Account</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 flex items-center justify-center transition-colors border border-transparent hover:border-rose-500/30"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
              {/* Decorative glows */}
              <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[80px] rounded-full pointer-events-none"></div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-5 relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`signup-step-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Stepper Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-[#c026d3]' : 'w-4 bg-white/10'}`}></div>
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-[#c026d3]' : 'w-4 bg-white/10'}`}></div>
                    </div>

                    {step === 1 ? (
                      <>
                        <div className="relative group">
                          <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#c026d3] transition-colors"></i>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#c026d3]/50 transition-all placeholder:text-white/20"
                          />
                        </div>
                        <div className="relative group">
                          <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#c026d3] transition-colors"></i>
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#c026d3]/50 transition-all placeholder:text-white/20"
                          />
                        </div>
                        <div className="relative group">
                          <i className="ri-lock-2-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#c026d3] transition-colors"></i>
                          <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#c026d3]/50 transition-all placeholder:text-white/20"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative group">
                          <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#c026d3] transition-colors"></i>
                          <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#c026d3]/50 transition-all placeholder:text-white/20"
                          />
                        </div>
                        <div className="relative group">
                          <i className="ri-map-pin-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#c026d3] transition-colors"></i>
                          <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#c026d3]/50 transition-all placeholder:text-white/20"
                          />
                        </div>
                        {/* Hidden role input, defaulting to admin */}
                        <input type="hidden" name="role" value="admin" />
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                          <i className="ri-information-fill text-emerald-400 mt-0.5"></i>
                          <p className="text-xs text-emerald-400/80 font-medium leading-relaxed">
                            This account will be created with full <span className="font-bold text-emerald-400">ADMIN</span> privileges. They will have access to the entire dashboard.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 pt-4">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors flex-shrink-0"
                    >
                      <i className="ri-arrow-left-line"></i>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-2xl shadow-[0_15px_30px_rgba(192,38,211,0.2)] hover:shadow-[0_15px_30px_rgba(192,38,211,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin text-lg"></i>
                        <span>Processing</span>
                      </div>
                    ) : (
                      <span>{step === 1 ? 'Next Step' : 'Create Admin'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AdminSignupModal;
