import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/api';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'update'
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  
  // Status Popup State
  const [statusPopup, setStatusPopup] = useState({ show: false, type: 'success', message: '' });
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: 10,
    expiryDate: '2026-04-30',
    minOrderAmount: 5000,
    isActive: true
  });

  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const data = await fetchCoupons();
    setCoupons(data);
    setLoading(false);
    
    // Staggered entrance animation
    setTimeout(() => {
      gsap.fromTo('.coupon-card', 
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 1, ease: 'expo.out' }
      );
    }, 100);
  };

  const handleToggleModal = (type = 'create', coupon = null) => {
    if (!showModal) {
      setModalType(type);
      if (type === 'update' && coupon) {
        setSelectedCoupon(coupon);
        setFormData({
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          expiryDate: coupon.expiryDate?.split('T')[0] || '',
          minOrderAmount: coupon.minOrderAmount,
          isActive: coupon.isActive
        });
      } else {
        setFormData({
          code: '',
          discountType: 'percentage',
          value: 10,
          expiryDate: '2026-04-30',
          minOrderAmount: 5000,
          isActive: true
        });
      }
      setShowModal(true);
    } else {
      // Animate out
      gsap.to(modalContentRef.current, { scale: 0.8, opacity: 0, y: 50, duration: 0.4, ease: 'power2.in' });
      gsap.to(modalRef.current, { opacity: 0, duration: 0.5, onComplete: () => setShowModal(false) });
    }
  };

  const showStatus = (type, message) => {
    setStatusPopup({ show: true, type, message });
    // Auto hide after 3 seconds
    setTimeout(() => {
        if(popupRef.current) {
            gsap.to(popupRef.current, { opacity: 0, scale: 0.8, duration: 0.5, onComplete: () => setStatusPopup({ show: false, type: 'success', message: '' }) });
        }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (modalType === 'create') {
      res = await createCoupon(formData);
    } else {
      res = await updateCoupon(selectedCoupon._id, formData);
    }

    if (res.message === "Coupon created" || res.message === "Coupon updated" || res.success) {
      showStatus('success', `Coupon ${modalType === 'create' ? 'Created' : 'Updated'} Successfully`);
      handleToggleModal();
      loadCoupons();
    } else {
      showStatus('error', res.message || "Operation Failed");
    }
  };

  const handleDeleteClick = (id) => {
    setStatusPopup({ 
        show: true, 
        type: 'confirm', 
        message: "Are you sure you want to purge this elite coupon?",
        targetId: id
    });
  };

  const performDelete = async () => {
    const id = statusPopup.targetId;
    setStatusPopup({ show: false, type: 'success', message: '' }); // Hide confirm
    
    const res = await deleteCoupon(id);
    if (res.success || res.message?.includes("deleted")) {
      showStatus('success', "Coupon Purged Successfully");
      loadCoupons();
    } else {
      showStatus('permission', "Restricted Action: Permission Denied");
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      gsap.fromTo(modalContentRef.current, 
        { scale: 0.7, opacity: 0, y: 100, rotateX: 20 },
        { scale: 1, opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: 'expo.out' }
      );
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showModal]);

  return (
    <div ref={containerRef} className="pb-32 pt-2 space-y-12 max-w-[1600px] mx-auto px-0">
      {/* Header Section */}
      <div className="relative py-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-pink/30 to-transparent"></div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse"></div>
             <span className="text-[10px] font-black text-accent-pink uppercase tracking-[0.5em]">Promotional Engine v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Elite <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Coupons</span></h1>
          <p className="text-text-muted text-sm font-medium max-w-xl opacity-70 italic">Manage high-end promotional vouchers and exclusive discount access keys.</p>
        </div>
        <button 
          onClick={() => handleToggleModal('create')}
          className="group relative w-full md:w-auto px-8 md:px-10 py-4 rounded-2xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all duration-500 shadow-[0_20px_40px_rgba(192,38,211,0.2)] active:scale-95 flex items-center justify-center"
        >
          <span className="relative z-10 flex items-center gap-3">
             <i className="ri-add-circle-line text-lg"></i>
             Forge New Coupon
          </span>
        </button>
      </div>

      {/* Coupon Grid */}
      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
           <div className="w-20 h-20 border-t-2 border-accent-pink rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="coupon-card group relative opacity-0">
               <div className="relative p-6 md:p-8 rounded-[2rem] md:rounded-[40px] bg-[#0a0a0a] border border-white/5 hover:border-accent-pink/40 transition-all duration-700 overflow-hidden shadow-2xl">
                  {/* Decorative Ticket Cutout */}
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#050505] border-r border-white/5"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#050505] border-l border-white/5"></div>
                  
                  {/* Content */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center">
                        <i className="ri-coupon-3-fill text-2xl text-accent-pink"></i>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleToggleModal('update', coupon)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-accent-purple/20 transition-all group/icon">
                            <i className="ri-edit-2-line group-hover/icon:scale-110 transition-transform"></i>
                        </button>
                        <button onClick={() => handleDeleteClick(coupon._id)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-rose-500/20 transition-all group/icon">
                            <i className="ri-delete-bin-7-line group-hover/icon:scale-110 transition-transform"></i>
                        </button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-accent-pink transition-colors">{coupon.code}</h3>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Code Key Identifier</p>
                  </div>

                  <div className="flex items-center justify-between py-6 border-y border-dashed border-white/10">
                    <div>
                        <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Benefit</p>
                        <p className="text-xl font-black text-emerald-400 italic">{coupon.value}{coupon.discountType === 'percentage' ? '%' : ' PKR'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Status</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${coupon.isActive ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {coupon.isActive ? 'Active' : 'Halted'}
                        </span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-center">
                    <div>
                        <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Expiry</p>
                        <p className="text-[10px] font-black text-white italic">{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse"></div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Modal (Focus Mode) */}
      {showModal && createPortal(
        <div ref={modalRef} className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#050505] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-pink/5 blur-[120px] rounded-full animate-pulse"></div>
          
          <div 
            ref={modalContentRef}
            className="relative w-[95%] sm:w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar h-auto bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] md:rounded-[45px] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-ping"></div>
                    <span className="text-[8px] font-black text-accent-pink uppercase tracking-[0.4em]">Forge Prototype</span>
                  </div>
                  <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">
                    {modalType === 'create' ? 'Create Elite Voucher' : 'Update Voucher Link'}
                  </h2>
               </div>
               <button onClick={() => handleToggleModal()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-all group">
                 <i className="ri-close-line text-xl text-white group-hover:rotate-90 transition-transform"></i>
               </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-accent-pink transition-all font-black tracking-widest" 
                    placeholder="e.g. EID2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-accent-pink transition-all font-black tracking-widest appearance-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Value</label>
                  <input 
                    type="number" 
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-accent-pink transition-all font-black" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Min Order Amount</label>
                  <input 
                    type="number" 
                    required
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-accent-pink transition-all font-black" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-accent-pink transition-all font-black [color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-white uppercase tracking-widest mb-0.5 italic">Activation Status</p>
                   <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Toggle live visibility</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-12 h-6 rounded-full p-0.5 transition-all duration-500 ${formData.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all duration-500 transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0 shadow-lg'}`}></div>
                </button>
              </div>

              <div className="pt-4 flex gap-4">
                 <button 
                   type="button" 
                   onClick={() => handleToggleModal()}
                   className="flex-1 py-3 rounded-xl border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-all"
                 >
                   Cancel Forge
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(192,38,211,0.3)] hover:opacity-90 transition-all active:scale-95"
                 >
                   {modalType === 'create' ? 'Synchronize Coupon' : 'Apply Modifications'}
                 </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Status Popup (3D Style Focus Mode) */}
      {statusPopup.show && createPortal(
        <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl">
           <div 
             ref={popupRef}
             className="relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[50px] bg-[#0a0a0a] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] text-center space-y-6 md:space-y-8 max-w-md w-full mx-4"
           >
              <div className="flex justify-center">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center relative ${
                    statusPopup.type === 'success' ? 'bg-emerald-400/10' : statusPopup.type === 'permission' ? 'bg-amber-400/10' : 'bg-rose-500/10'
                 }`}>
                    <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
                       statusPopup.type === 'success' ? 'bg-emerald-400/20' : statusPopup.type === 'permission' ? 'bg-amber-400/20' : 'bg-rose-500/20'
                    }`}></div>
                    <i className={`text-5xl relative z-10 ${
                       statusPopup.type === 'success' ? 'ri-checkbox-circle-fill text-emerald-400' : 
                       statusPopup.type === 'permission' ? 'ri-shield-flash-fill text-amber-400' : 
                       'ri-error-warning-fill text-rose-500'
                    } transition-transform animate-bounce`}></i>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.6em]">System Notification</h3>
                 <p className="text-xl font-black text-white italic tracking-tighter">{statusPopup.message}</p>
              </div>

              <div className="h-[1px] w-20 bg-white/10 mx-auto"></div>
              
              {statusPopup.type === 'confirm' ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => setStatusPopup({ show: false, type: 'success', message: '' })}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={performDelete}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(192,38,211,0.3)] hover:opacity-90 transition-all"
                  >
                    Confirm Purge
                  </button>
                </div>
              ) : (
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Process Synchronized with Core</p>
              )}
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Coupons;
