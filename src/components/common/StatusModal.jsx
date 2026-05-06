import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StatusModal = ({ isOpen, type, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  const config = {
    permission: {
      icon: 'ri-question-line',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-400/20',
      btnColor: 'bg-amber-500 hover:bg-amber-600'
    },
    success: {
      icon: 'ri-checkbox-circle-line',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/20',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600'
    },
    error: {
      icon: 'ri-error-warning-line',
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      borderColor: 'border-rose-400/20',
      btnColor: 'bg-rose-500 hover:bg-rose-600'
    }
  };

  const current = config[type] || config.success;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={type === 'permission' ? onCancel : onConfirm}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100, rotateX: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-card border border-white/10 rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden perspective-1000"
        >
          {/* Decorative Gradient */}
          <div className={`absolute top-0 left-0 w-full h-1 ${current.bgColor.replace('/10', '')}`}></div>

          <div className="p-8 flex flex-col items-center text-center">
            {/* Animated Icon Container */}
            <motion.div
              initial={{ rotateY: 180, scale: 0 }}
              animate={{ 
                rotateY: 0, 
                scale: [1, 1.05, 1],
                y: [0, -5, 0]
              }}
              transition={{ 
                rotateY: { duration: 0.5 },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className={`w-20 h-20 rounded-2xl ${current.bgColor} ${current.borderColor} border flex items-center justify-center mb-6 shadow-2xl relative group overflow-hidden`}
            >
              <i className={`${current.icon} text-4xl ${current.color} group-hover:scale-110 transition-transform`}></i>
              
              {/* Shimmer Effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </motion.div>

            <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed px-4">{message}</p>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              {type === 'permission' ? (
                <>
                  <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-3.5 rounded-xl ${current.btnColor} text-white font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
                  >
                    {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={onConfirm}
                  className={`w-full py-3.5 rounded-xl ${current.btnColor} text-white font-bold text-sm transition-all shadow-lg active:scale-95`}
                >
                  Great!
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default StatusModal;
