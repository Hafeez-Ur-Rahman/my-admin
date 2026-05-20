import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSliders, createSlider, updateSlider, deleteSlider } from '../services/api';
import 'remixicon/fonts/remixicon.css';

const Slider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [formValues, setFormValues] = useState({
    title: '',
    subtitle: '',
    buttonOneText: '',
    buttonOneLink: '',
    buttonTwoText: '',
    order: 1,
    isActive: true,
  });

  const [mediaItem, setMediaItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [statusPopup, setStatusPopup] = useState({
    show: false,
    type: 'confirm',
    title: '',
    message: '',
    targetId: null
  });

  const cardsRef = useRef([]);
  const headerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSliders();
      // Ensure we always have an array
      setSliders(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("Error loading sliders:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && sliders.length > 0) {
      // Header entrance
      gsap.fromTo(headerRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power4.out' }
      );

      // Cards/Rows entrance
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out'
        }
      );
    }
  }, [loading, sliders]);

  const getSliderImage = (item) => {
    let imgPath = item.image || item.imageUrl || item.thumbnail;
    if (imgPath) {
      let normalizedPath = imgPath.replace(/\\/g, '/');
      if (normalizedPath.startsWith('http') || normalizedPath.startsWith('blob:') || normalizedPath.startsWith('data:')) {
        return normalizedPath;
      }
      const baseUrl = 'https://perfumeapis.brainexworld.com';
      return normalizedPath.startsWith('/') ? `${baseUrl}${normalizedPath}` : `${baseUrl}/${normalizedPath}`;
    }
    return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80';
  };

  // Modal Handlers
  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormValues({
      title: '',
      subtitle: '',
      buttonOneText: '',
      buttonOneLink: '',
      buttonTwoText: '',
      order: 1,
      isActive: true,
    });
    setMediaItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (mediaItem && mediaItem.preview && mediaItem.preview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaItem.preview);
    }
  };

  // Image Selection Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (mediaItem && mediaItem.preview && mediaItem.preview.startsWith('blob:')) {
        URL.revokeObjectURL(mediaItem.preview);
      }
      setMediaItem({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      });
    }
  };

  const removeFile = () => {
    if (mediaItem && mediaItem.preview && mediaItem.preview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaItem.preview);
    }
    setMediaItem(null);
  };

  const handleEditClick = (slider) => {
    setIsEditMode(true);
    setEditingId(slider._id || slider.id);

    setFormValues({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      buttonOneText: slider.buttonOneText || '',
      buttonOneLink: slider.buttonOneLink || '',
      buttonTwoText: slider.buttonTwoText || '',
      order: slider.order || 1,
      isActive: slider.isActive !== undefined ? slider.isActive : true,
    });

    if (slider.image || slider.imageUrl) {
      setMediaItem({
        file: null,
        preview: getSliderImage(slider),
        isExisting: true
      });
    } else {
      setMediaItem(null);
    }
    setIsModalOpen(true);
  };

  // Action Status Handlers
  const showStatus = (type, title, message, targetId = null) => {
    setStatusPopup({ show: true, type, title, message, targetId });
  };

  const closeStatus = () => {
    setStatusPopup(prev => ({ ...prev, show: false }));
  };

  // API Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mediaItem) {
      showStatus('error', 'Image Required!', 'Please select an image for your luxury slider campaign.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append('title', formValues.title);
      formData.append('subtitle', formValues.subtitle);
      formData.append('buttonOneText', formValues.buttonOneText);
      formData.append('buttonOneLink', formValues.buttonOneLink);
      formData.append('buttonTwoText', formValues.buttonTwoText);
      formData.append('order', formValues.order);
      formData.append('isActive', String(formValues.isActive));

      if (mediaItem && !mediaItem.isExisting) {
        formData.append('image', mediaItem.file);
      }

      let response;
      if (isEditMode) {
        response = await updateSlider(editingId, formData);
      } else {
        response = await createSlider(formData);
      }

      const isSuccess = response && (
        response.success === true ||
        response._id ||
        response.id ||
        (response.message && (
          response.message.toLowerCase().includes('successfully') ||
          response.message.toLowerCase().includes('created') ||
          response.message.toLowerCase().includes('updated')
        )) ||
        response.status === 'success' ||
        response.data
      );

      if (isSuccess) {
        showStatus('success', isEditMode ? 'Updated!' : 'Created!', isEditMode ? 'Slider campaign has been updated successfully.' : 'New slider campaign has been launched successfully.');
        handleCloseModal();
        loadData();
      } else {
        const errorMsg = response?.message || response?.error || 'The server returned an error during submission.';
        showStatus('error', 'Failed!', String(errorMsg));
      }
    } catch (error) {
      console.error("Slider submission failed:", error);
      showStatus('error', 'Error!', 'A connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // API Delete Handler
  const confirmDelete = async () => {
    const id = statusPopup.targetId;
    if (!id) return;
    closeStatus();

    try {
      const response = await deleteSlider(id);
      const isSuccess = response && (
        response.success === true ||
        response.status === 'success' ||
        (response.message && (
          response.message.toLowerCase().includes('successfully') ||
          response.message.toLowerCase().includes('removed') ||
          response.message.toLowerCase().includes('deleted')
        ))
      );

      // even if structure isn't perfect, assume success if no hard error thrown
      if (isSuccess !== false) {
        showStatus('success', 'Deleted!', 'The slider campaign has been permanently removed.');
        setSliders(prev => prev.filter(s => s._id !== id && s.id !== id));
      } else {
        showStatus('error', 'Failed!', response?.message || 'Could not delete the slider.');
      }
    } catch (error) {
      console.error("Slider deletion error:", error);
      showStatus('error', 'Error!', 'A connection error occurred.');
    }
  };

  const filteredSliders = Array.isArray(sliders) ? sliders.filter(s =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.order - b.order) : [];

  return (
    <div className="p-0 pt-2 space-y-8 min-h-screen pb-24 text-white selection:bg-rose-500/30 selection:text-rose-200">

      {/* Premium Header */}
      <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/[0.02] backdrop-blur-3xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative z-10 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-luxury text-white tracking-tight italic flex items-center gap-4">
            <i className="ri-slideshow-3-line text-rose-400"></i>
            <span>Campaign <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Sliders</span></span>
          </h1>
          <p className="text-white/40 mt-1 tracking-[0.4em] uppercase text-[9px] font-bold">Manage storefront showcase banners</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_rgba(192,38,211,0.4)] active:scale-95 shadow-xl"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
          <i className="ri-add-line text-lg relative z-10"></i>
          <span className="relative z-10 tracking-widest uppercase text-[10px] font-bold">New Campaign</span>
        </button>
      </div>

      {/* Main Table Panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-rose-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-8 text-rose-400 tracking-[0.5em] uppercase text-[10px] font-bold animate-pulse italic">Retrieving Campaigns...</p>
        </div>
      ) : (
        <div className="bg-[#07060a]/90 backdrop-blur-3xl rounded-3xl md:rounded-[2rem] border border-white/5 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none bg-rose-500/5"></div>

          {/* Toolbar */}
          <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] relative z-10">
            <div className="relative w-full md:w-96">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full bg-white/5 border border-white/10 hover:bg-white/[0.07] focus:bg-white/[0.07] focus:border-white/20 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:outline-none transition-all text-white placeholder:text-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-auto">Showing {filteredSliders.length} active campaigns</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto relative z-10">
            {filteredSliders.length === 0 ? (
              <div className="p-16 text-center text-white/30 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <i className="ri-slideshow-line text-3xl text-rose-500/50"></i>
                </div>
                <p className="text-sm font-medium font-luxury italic text-white/60">No campaigns match your filters.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">Campaign Preview</th>
                    <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">Primary CTA</th>
                    <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap text-center">Order</th>
                    <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                    <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSliders.map((item, index) => (
                    <tr
                      key={item._id || item.id || index}
                      ref={el => cardsRef.current[index] = el}
                      className="hover:bg-white/[0.02] transition-all group"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-24 md:w-32 h-14 md:h-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-rose-500/30 transition-colors bg-black/40 flex-shrink-0 relative">
                            <img
                              src={getSliderImage(item)}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </div>
                          <div>
                            <span className="text-sm md:text-base font-luxury italic font-bold text-white group-hover:text-rose-400 transition-colors block leading-tight truncate max-w-[150px] md:max-w-[200px]">{item.title || 'Untitled'}</span>
                            <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest block mt-1 truncate max-w-[150px] md:max-w-[200px]">{item.subtitle || 'No Subtitle'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.buttonOneText ? (
                          <div>
                            <span className="text-[11px] font-bold text-white bg-white/5 px-3 py-1 rounded-md border border-white/10 inline-block uppercase tracking-wider">{item.buttonOneText}</span>
                            <span className="block mt-1 text-[9px] text-white/30 truncate max-w-[120px] ml-1">{item.buttonOneLink || '/'}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/20 italic">No CTA</span>
                        )}
                      </td>

                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                        <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 mx-auto">
                          {item.order}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.isActive ? (
                          <span className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-full flex items-center gap-1.5 w-fit">
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-rose-500/20 bg-rose-500/5 text-rose-400 rounded-full flex items-center gap-1.5 w-fit">
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c026d3]/20 border border-white/5 hover:border-[#c026d3]/30 text-white/50 hover:text-[#c026d3] flex items-center justify-center transition-all duration-300"
                            title="Edit Campaign"
                          >
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button
                            onClick={() => showStatus('confirm', 'Remove Campaign?', `Are you sure you want to delete "${item.title}"?`, item._id || item.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-white/50 hover:text-rose-400 flex items-center justify-center transition-all duration-300"
                            title="Delete Campaign"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleCloseModal}
              ></motion.div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#07060a] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full max-w-4xl relative z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] sticky top-0 z-20">
                  <div>
                    <h2 className="text-xl md:text-2xl font-luxury italic text-white tracking-tight flex items-center gap-3">
                      <i className="ri-slideshow-4-line text-rose-400"></i>
                      {isEditMode ? 'Edit Campaign' : 'New Campaign Launch'}
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">Configure slider parameters</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 flex items-center justify-center transition-colors border border-transparent hover:border-rose-500/30"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                  <form id="sliderForm" onSubmit={handleSubmit} className="space-y-8">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Campaign Title</label>
                        <input
                          required
                          type="text"
                          value={formValues.title}
                          onChange={e => setFormValues({ ...formValues, title: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                          placeholder="e.g. Summer Sale"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Subtitle / Highlight</label>
                        <input
                          type="text"
                          value={formValues.subtitle}
                          onChange={e => setFormValues({ ...formValues, subtitle: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                          placeholder="e.g. Up to 50% Off"
                        />
                      </div>
                    </div>

                    {/* Buttons Configuration */}
                    <div className="bg-white/[0.02] border border-white/5 p-5 md:p-6 rounded-2xl space-y-6">
                      <h3 className="text-xs font-bold text-white/70 uppercase tracking-[0.1em] flex items-center gap-2">
                        <i className="ri-cursor-fill text-rose-400"></i> Call to Action
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Primary Button Text</label>
                          <input
                            type="text"
                            value={formValues.buttonOneText}
                            onChange={e => setFormValues({ ...formValues, buttonOneText: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                            placeholder="e.g. Shop Now"
                          />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Primary Link Destination</label>
                          <div className="relative">
                            <i className="ri-link absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
                            <input
                              type="text"
                              value={formValues.buttonOneLink}
                              onChange={e => setFormValues({ ...formValues, buttonOneLink: e.target.value })}
                              className="w-full bg-black/20 border border-white/10 focus:border-rose-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                              placeholder="e.g. /collections/summer"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Secondary Button Text</label>
                          <input
                            type="text"
                            value={formValues.buttonTwoText}
                            onChange={e => setFormValues({ ...formValues, buttonTwoText: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                            placeholder="e.g. View Details (Optional)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Positioning & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Display Order</label>
                        <input
                          type="number"
                          min="1"
                          value={formValues.order}
                          onChange={e => setFormValues({ ...formValues, order: parseInt(e.target.value) || 1 })}
                          className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em] ml-1">Campaign Status</label>
                        <div className="flex items-center gap-4 h-12">
                          <button
                            type="button"
                            onClick={() => setFormValues({ ...formValues, isActive: true })}
                            className={`flex-1 h-full rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${formValues.isActive
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormValues({ ...formValues, isActive: false })}
                            className={`flex-1 h-full rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${!formValues.isActive
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                          >
                            Hidden
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Banner Image Upload */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/70 uppercase tracking-[0.1em] flex items-center gap-2">
                          <i className="ri-image-add-line text-rose-400"></i> Banner Visual
                        </label>
                        <span className="text-[9px] text-white/30 tracking-widest uppercase">Ratio: 16:9 recommended</span>
                      </div>

                      {!mediaItem ? (
                        <div className="relative w-full h-48 md:h-64 rounded-2xl border-2 border-dashed border-white/10 hover:border-rose-500/30 bg-white/[0.01] hover:bg-white/[0.02] flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer overflow-hidden group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:text-rose-400">
                            <i className="ri-upload-cloud-2-line text-2xl"></i>
                          </div>
                          <p className="text-xs text-white/40 font-medium">Click or drag banner image here</p>
                        </div>
                      ) : (
                        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 group bg-black/40">
                          <img
                            src={mediaItem.preview}
                            alt="Banner Preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeFile}
                              className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col-reverse sm:flex-row justify-end gap-4 sticky bottom-0 z-20">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    form="sliderForm"
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(192,38,211,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    {submitting ? (
                      <i className="ri-loader-4-line animate-spin text-lg relative z-10"></i>
                    ) : (
                      <i className="ri-save-3-line text-lg relative z-10"></i>
                    )}
                    <span className="relative z-10">{isEditMode ? 'Save Changes' : 'Launch Campaign'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Confirmation & Status Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {statusPopup.show && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className="bg-[#07060a] border border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center"
              >
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 border-2 ${statusPopup.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                    statusPopup.type === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                      'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  }`}>
                  <i className={`text-4xl ${statusPopup.type === 'success' ? 'ri-check-line' :
                      statusPopup.type === 'error' ? 'ri-error-warning-line' :
                        'ri-question-mark'
                    }`}></i>
                </div>
                <h3 className="text-2xl font-luxury italic text-white mb-2">{statusPopup.title}</h3>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">{statusPopup.message}</p>

                {statusPopup.type === 'confirm' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={closeStatus} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]">Delete</button>
                  </div>
                ) : (
                  <button onClick={closeStatus} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors">Close</button>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Slider;
