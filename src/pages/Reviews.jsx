import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllReviews, deleteReview } from '../services/api';
import 'remixicon/fonts/remixicon.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setIsLoading(true);
        const data = await fetchAllReviews();
        setReviews(data);
        setIsLoading(false);
    };

    const handleDelete = async (review) => {
        const id = review._id || review.id;
        const ownerId = review.user?._id || review.user?.id || review.userId || review.user;

        showStatus('confirm', 'Delete Review?', 'Are you sure you want to delete this review? This action cannot be undone.', async () => {
            closeStatus();
            setIsLoading(true);
            const res = await deleteReview(id, ownerId);
            if (res.success) {
                showStatus('success', 'Deleted!', 'Review has been removed successfully.');
                loadReviews();
            } else {
                showStatus('error', 'Error', res.message || 'Failed to delete review');
                setIsLoading(false);
            }
        });
    };

    const showStatus = (type, title, message, onConfirm = null) => {
        setStatusModal({ isOpen: true, type, title, message, onConfirm });
    };

    const closeStatus = () => {
        setStatusModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
    };

    const filteredReviews = reviews.filter(review => {
        const searchLower = searchTerm.toLowerCase();
        const userName = (review.user?.name || review.userName || 'Anonymous').toLowerCase();
        const comment = (review.comment || review.review || '').toLowerCase();
        const productName = (review.product?.name || review.product?.title || '').toLowerCase();
        return userName.includes(searchLower) || comment.includes(searchLower) || productName.includes(searchLower);
    });

    const renderStars = (rating) => {
        const stars = [];
        const numRating = Number(rating) || 5;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={`${i <= numRating ? 'ri-star-fill text-accentGold' : 'ri-star-line text-white/20'} text-lg drop-shadow-md`}></i>
            );
        }
        return stars;
    };

    const StatusModal = () => {
        if (!statusModal.isOpen) return null;
        
        return createPortal(
            <AnimatePresence>
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                            statusModal.type === 'success' ? 'bg-green-500' :
                            statusModal.type === 'error' ? 'bg-danger' : 'bg-accentGold'
                        }`}></div>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                statusModal.type === 'success' ? 'bg-green-500/20 text-green-500' :
                                statusModal.type === 'error' ? 'bg-danger/20 text-danger' : 'bg-accentGold/20 text-accentGold'
                            }`}>
                                <i className={`text-3xl ${
                                    statusModal.type === 'success' ? 'ri-check-line' :
                                    statusModal.type === 'error' ? 'ri-close-line' : 'ri-question-line'
                                }`}></i>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{statusModal.title}</h3>
                            <p className="text-white/70 mb-6 text-sm leading-relaxed">{statusModal.message}</p>
                            
                            <div className="flex gap-3 w-full">
                                {statusModal.type === 'confirm' ? (
                                    <>
                                        <button
                                            onClick={closeStatus}
                                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all text-sm font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={statusModal.onConfirm}
                                            className="flex-1 py-3 px-4 rounded-xl bg-danger/20 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={closeStatus}
                                        className={`flex-1 py-3 px-4 rounded-xl text-white transition-all text-sm font-semibold ${
                                            statusModal.type === 'success' ? 'bg-green-500/20 hover:bg-green-500/40 border border-green-500/30' :
                                            'bg-danger/20 hover:bg-danger/40 border border-danger/30'
                                        }`}
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>,
            document.body
        );
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accentGold/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purpleGlow/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 md:mb-8 relative z-10">
                <div className="flex-1 mt-2 sm:mt-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-1 sm:mb-2 font-serif tracking-wide">
                        Customer Reviews
                    </h1>
                    <p className="text-white/60 text-xs sm:text-sm md:text-base leading-relaxed">
                        Manage and monitor customer feedback across all products.
                    </p>
                </div>

                <div className="relative group w-full sm:w-auto flex items-center">
                    <i className="ri-search-2-line absolute left-4 text-lg text-white/60 group-focus-within:text-accentGold transition-colors z-10 pointer-events-none"></i>
                    <input
                        type="text"
                        placeholder="Search by customer, product, or text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-72 md:w-96 bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-accentGold/50 focus:bg-white/10 transition-all backdrop-blur-md shadow-lg relative z-0"
                    />
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="flex-1 relative z-10">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-accentGold/30 border-t-accentGold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <i className="ri-chat-3-line text-4xl text-white/20"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Reviews Found</h3>
                        <p className="text-white/50">There are no reviews matching your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                        <AnimatePresence>
                            {filteredReviews.map((review, index) => (
                                <motion.div
                                    key={review._id || review.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col group hover:bg-card/60 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-accentGold/30 relative overflow-hidden"
                                >
                                    {/* Glassmorphism shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accentGold/40 to-purpleGlow/40 flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0">
                                                <span className="font-bold text-white text-lg">
                                                    {(review.user?.name || review.userName || 'A').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">
                                                    {review.user?.name || review.userName || 'Anonymous'}
                                                </h4>
                                                <p className="text-[11px] sm:text-xs text-white/50 truncate">
                                                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review)}
                                            className="w-8 h-8 rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white flex items-center justify-center transition-all opacity-100 translate-x-0 md:opacity-0 md:group-hover:opacity-100 md:transform md:translate-x-2 md:group-hover:translate-x-0 flex-shrink-0"
                                            title="Delete Review"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>

                                    <div className="flex gap-1 mb-4 relative z-10">
                                        {renderStars(review.rating)}
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <p className="text-white/80 text-sm leading-relaxed italic line-clamp-4">
                                            "{review.comment || review.review || 'No comment provided.'}"
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <i className="ri-shopping-bag-3-line text-accentGold/70"></i>
                                            <span className="text-xs text-white/60 font-medium truncate">
                                                {review.product?.name || review.product?.title || 'Unknown Product'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <StatusModal />
        </div>
    );
};

export default Reviews;
