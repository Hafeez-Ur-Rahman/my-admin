/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../services/api';
import 'remixicon/fonts/remixicon.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form States
  const [formValues, setFormValues] = useState({
    name: '',
    brand: '',
    description: '',
    categoryId: '',
    fragranceFamily: '',
    concentration: 'Eau de Parfum',
    isActive: true,
    topNotes: '',
    middleNotes: '',
    baseNotes: '',
    tags: '',
    // Defaults to prevent schema validation failures on strictly typed backends
    longevity: '10-12 Hours',
    sillage: 'Strong',
    isNewArrival: true,
    boxIncluded: true,
    isTester: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    thumbnail: '',
    video: '',
  });

  const [variants, setVariants] = useState([
    { size: '100ml', price: '', stock: '' }
  ]);

  const [mediaItems, setMediaItems] = useState([]);
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
  const statsRef = useRef([]);
  const headerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (error) {
      console.error("Error loading products/categories:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && products.length > 0) {
      // Header entrance
      gsap.fromTo(headerRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power4.out' }
      );

      // Stats 3D entrance
      statsRef.current.forEach((el, index) => {
        if (!el) return;
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
                y: -6,
                duration: 2 + index * 0.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
              });
            }
          }
        );

        // Animated Number Counters
        const valueObj = { val: 0 };
        let targetValue = 0;
        if (index === 0) targetValue = products.length;
        if (index === 1) targetValue = products.filter(p => getTotalStock(p) <= 10).length;
        if (index === 2) targetValue = products.reduce((sum, p) => sum + getTotalStock(p), 0);

        const valueElement = el.querySelector('.stat-value');
        if (valueElement) {
          gsap.to(valueObj, {
            val: targetValue,
            duration: 1.5,
            delay: 0.4 + index * 0.1,
            ease: 'power3.out',
            onUpdate: () => {
              valueElement.innerText = Math.round(valueObj.val).toLocaleString();
            }
          });
        }
      });

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
  }, [loading, products]);

  // Helpers
  const getTotalStock = (item) => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return 0;
  };

  const getPriceDisplay = (item) => {
    if (item.variants && item.variants.length > 0) {
      const p = item.variants[0].price;
      return typeof p === 'number' ? `PKR ${p.toLocaleString()}` : p;
    }
    return 'N/A';
  };

  const getProductImage = (item) => {
    let imgPath = null;
    if (item.images && item.images.length > 0) imgPath = item.images[0];
    else if (item.thumbnail) imgPath = item.thumbnail;
    else if (item.image) imgPath = item.image;
    
    if (imgPath) {
      if (imgPath.startsWith('http') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) {
        return imgPath;
      }
      const baseUrl = 'https://perfumeapis.brainexworld.com';
      return imgPath.startsWith('/') ? `${baseUrl}${imgPath}` : `${baseUrl}/${imgPath}`;
    }

    return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80';
  };

  const getCategoryName = (catId) => {
    if (!catId) return 'Perfume';
    const cleanId = typeof catId === 'object' ? (catId._id || catId.id) : catId;
    const cat = categories.find(c => c._id === cleanId || c.id === cleanId);
    if (cat) return cat.name;
    return typeof catId === 'object' && catId.name ? catId.name : 'Perfume';
  };

  const getStockStatus = (item) => {
    const total = getTotalStock(item);
    if (total === 0) return { label: 'Out of Stock', class: 'bg-danger/10 text-danger' };
    if (total <= 10) return { label: 'Low Stock', class: 'bg-warning/10 text-warning' };
    return { label: 'In Stock', class: 'bg-success/10 text-success' };
  };

  // Modal Handlers
  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormValues({
      name: '',
      brand: '',
      description: '',
      categoryId: categories[0]?._id || categories[0]?.id || '',
      fragranceFamily: '',
      concentration: 'Eau de Parfum',
      isActive: true,
      topNotes: '',
      middleNotes: '',
      baseNotes: '',
      tags: '',
      longevity: '10-12 Hours',
      sillage: 'Strong',
      isNewArrival: true,
      boxIncluded: true,
      isTester: false,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      thumbnail: '',
      video: '',
    });
    setVariants([{ size: '100ml', price: '', stock: '' }]);
    setMediaItems([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Cleanup preview URLs to prevent memory leaks
    mediaItems.forEach(item => {
      if (item.preview && item.preview.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
    });
  };

  // Image Selection Handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const removeFile = (index) => {
    const item = mediaItems[index];
    if (item && item.preview && item.preview.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (product) => {
    setIsEditMode(true);
    setEditingId(product._id || product.id);
    
    let catId = '';
    if (product.categoryId) {
      if (typeof product.categoryId === 'object') {
        catId = product.categoryId._id || product.categoryId.id || '';
      } else {
        catId = product.categoryId;
      }
    }

    // Populate Form Values
    setFormValues({
      name: product.name || '',
      brand: product.brand || '',
      description: product.description || '',
      categoryId: catId,
      fragranceFamily: product.fragranceFamily || '',
      concentration: product.concentration || 'Eau de Parfum',
      isActive: product.isActive !== undefined ? product.isActive : true,
      topNotes: Array.isArray(product.topNotes) ? product.topNotes.join(', ') : (product.topNotes || ''),
      middleNotes: Array.isArray(product.middleNotes) ? product.middleNotes.join(', ') : (product.middleNotes || ''),
      baseNotes: Array.isArray(product.baseNotes) ? product.baseNotes.join(', ') : (product.baseNotes || ''),
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      longevity: product.longevity || '10-12 Hours',
      sillage: product.sillage || 'Strong',
      isNewArrival: product.isNewArrival !== undefined ? product.isNewArrival : true,
      boxIncluded: product.boxIncluded !== undefined ? product.boxIncluded : true,
      isTester: product.isTester !== undefined ? product.isTester : false,
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: Array.isArray(product.metaKeywords) ? product.metaKeywords.join(', ') : (product.metaKeywords || ''),
      thumbnail: product.thumbnail || '',
      video: product.video || '',
    });

    // Populate variants
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map(v => ({
        size: v.size || '',
        price: v.price || '',
        stock: v.stock || ''
      })));
    } else {
      setVariants([{ size: '100ml', price: '', stock: '' }]);
    }

    // Pre-populate with existing images
    const existing = (product.images || []).map(url => ({
      file: null,
      preview: url,
      isExisting: true
    }));
    setMediaItems(existing);
    setIsModalOpen(true);
  };

  // Variant Inputs Handlers
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', price: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
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
    
    const newFiles = mediaItems.filter(item => !item.isExisting).map(item => item.file);
    const existingImageUrls = mediaItems.filter(item => item.isExisting).map(item => item.preview);

    if (mediaItems.length === 0) {
      showStatus('error', 'Image Required!', 'Please select at least one visual image for your luxury perfume.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append text inputs
      formData.append('name', formValues.name);
      formData.append('brand', formValues.brand);
      formData.append('description', formValues.description);
      let finalCategoryId = formValues.categoryId;
      if (finalCategoryId && typeof finalCategoryId === 'object') {
        finalCategoryId = finalCategoryId._id || finalCategoryId.id || '';
      }
      formData.append('categoryId', finalCategoryId);
      formData.append('fragranceFamily', formValues.fragranceFamily);
      formData.append('concentration', formValues.concentration);
      formData.append('isActive', String(formValues.isActive));
      
      // Append schema defaults
      formData.append('longevity', formValues.longevity);
      formData.append('sillage', formValues.sillage);
      formData.append('isNewArrival', String(formValues.isNewArrival));
      formData.append('boxIncluded', String(formValues.boxIncluded));
      formData.append('isTester', String(formValues.isTester));
      formData.append('metaTitle', formValues.metaTitle || `${formValues.brand} ${formValues.name} Perfume`);
      formData.append('metaDescription', formValues.metaDescription || `Buy original ${formValues.brand} ${formValues.name} perfume online in Pakistan.`);
      
      const keywords = formValues.metaKeywords 
        ? formValues.metaKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : [formValues.name.toLowerCase(), formValues.brand.toLowerCase()];
      keywords.forEach(kw => formData.append('metaKeywords', kw));

      formData.append('thumbnail', formValues.thumbnail || '');
      formData.append('video', formValues.video || '');
      
      // Append variants as structured JSON
      formData.append('variants', JSON.stringify(variants));
      
      // Append notes arrays
      const appendSplitValues = (fieldStr, apiField) => {
        if (!fieldStr) return;
        fieldStr.split(',').forEach(item => {
          const val = item.trim();
          if (val) formData.append(apiField, val);
        });
      };

      appendSplitValues(formValues.topNotes, 'topNotes');
      appendSplitValues(formValues.middleNotes, 'middleNotes');
      appendSplitValues(formValues.baseNotes, 'baseNotes');
      appendSplitValues(formValues.tags, 'tags');
      
      // Append new files
      newFiles.forEach(file => {
        formData.append('images', file);
      });

      // Append existing images to keep (useful for reconciliation in backends)
      existingImageUrls.forEach(url => {
        formData.append('existingImages', url);
      });

      let response;
      if (isEditMode) {
        response = await updateProduct(editingId, formData);
      } else {
        response = await createProduct(formData);
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
        response.status === 'success'
      );

      if (isSuccess) {
        showStatus('success', isEditMode ? 'Updated!' : 'Created!', isEditMode ? 'Masterwork perfume has been updated successfully.' : 'New masterwork perfume has been created successfully.');
        handleCloseModal();
        loadData();
      } else {
        const errorMsg = response?.message || response?.error || response?.err || (response ? JSON.stringify(response) : null) || 'The server returned an error during submission.';
        showStatus('error', 'Failed!', typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg));
      }
    } catch (error) {
      console.error("Product submission failed:", error);
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
      const response = await deleteProduct(id);
      const isSuccess = response && (
        response.success === true ||
        response._id ||
        response.id ||
        (response.message && (
          response.message.toLowerCase().includes('successfully') || 
          response.message.toLowerCase().includes('removed') ||
          response.message.toLowerCase().includes('deleted')
        )) || 
        response.status === 'success'
      );

      if (isSuccess) {
        showStatus('success', 'Deleted!', 'The perfume collection has been permanently removed from the vault.');
        setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
      } else {
        showStatus('error', 'Failed!', response?.message || 'Could not delete the product.');
      }
    } catch (error) {
      console.error("Product deletion error:", error);
      showStatus('error', 'Error!', 'A connection error occurred.');
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(p.categoryId)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0 pt-2 space-y-8 min-h-screen pb-24 text-white selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Premium Header */}
      <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/[0.02] backdrop-blur-3xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative z-10 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-luxury text-white tracking-tight italic flex items-center gap-4">
            <i className="ri-ink-bottle-line text-rose-400"></i>
            <span>Scent <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Inventory</span></span>
          </h1>
          <p className="text-text-muted mt-1 tracking-[0.4em] uppercase text-[9px] font-bold opacity-50">Manage your luxury perfume collections</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_rgba(192,38,211,0.4)] active:scale-95 shadow-xl"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
          <i className="ri-add-line text-lg relative z-10"></i>
          <span className="relative z-10 tracking-widest uppercase text-[10px] font-bold">Add Product</span>
        </button>
      </div>

      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {[
          { label: 'Total Perfumes', icon: 'ri-briefcase-line', color: 'text-[#fbbf24]' },
          { label: 'Low Stock Items', icon: 'ri-alert-line', color: 'text-[#f472b6]' },
          { label: 'Total Scent Stock', icon: 'ri-dashboard-3-line', color: 'text-[#2dd4bf]' }
        ].map((stat, i) => (
          <div 
            key={i}
            ref={el => statsRef.current[i] = el}
            className="relative bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group/stat"
          >
            <div className="absolute inset-0 bg-rose-500/[0.02] group-hover/stat:bg-rose-500/[0.05] transition-colors duration-700"></div>
            <div className="flex items-center gap-4 md:gap-6 relative z-10">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center group-hover/stat:scale-110 transition-transform duration-700">
                <i className={`${stat.icon} text-lg md:text-xl ${stat.color} drop-shadow-[0_0_10px_currentColor]`}></i>
              </div>
              <div>
                <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">{stat.label}</p>
                <h3 className="text-xl md:text-3xl font-luxury text-white italic tracking-tighter stat-value">0</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product List Panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-rose-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-8 text-rose-400 tracking-[0.5em] uppercase text-[10px] font-bold animate-pulse italic">Retrieving Inventory...</p>
        </div>
      ) : (
        <div className="glass rounded-3xl md:rounded-[2rem] border border-white/5 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02]">
            <div className="relative w-full md:w-96">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-mutedText"></i>
              <input
                type="text"
                placeholder="Search by product, brand, category..."
                className="w-full bg-card/50 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-rose-500/50 transition-all text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs text-mutedText ml-auto">Showing {filteredProducts.length} items</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center text-mutedText">
                <i className="ri-error-warning-line text-4xl mb-4 block"></i>
                <p className="text-sm font-medium">No fragrances match your filters.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider whitespace-nowrap">Product Info</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider whitespace-nowrap">Base Price</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider whitespace-nowrap">Total Stock</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-mutedText uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((item, index) => {
                    const status = getStockStatus(item);
                    return (
                      <tr 
                        key={item._id || item.id || index} 
                        ref={el => cardsRef.current[index] = el}
                        className="hover:bg-white/[0.02] transition-all group"
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-rose-500/30 transition-colors bg-black/40 flex-shrink-0">
                              <img 
                                src={getProductImage(item)} 
                                alt={item.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80';
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-xs md:text-sm font-bold text-white group-hover:text-rose-400 transition-colors block leading-tight truncate max-w-[120px] sm:max-w-[150px] md:max-w-xs">{item.name}</span>
                              <span className="text-[9px] md:text-[10px] text-mutedText font-semibold uppercase tracking-widest block mt-0.5">{item.brand || 'Luxury'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-secondaryText font-medium whitespace-nowrap">
                          {getCategoryName(item.categoryId)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-white whitespace-nowrap">
                          {getPriceDisplay(item)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-mutedText font-medium whitespace-nowrap">
                          {getTotalStock(item)} Units
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:bg-[#c026d3]/20 hover:border-[#c026d3]/30 hover:text-[#c026d3] transition-all text-white/40"
                              title="Edit Masterpiece"
                            >
                              <i className="ri-edit-line text-sm md:text-base"></i>
                            </button>
                            <button 
                              onClick={() => showStatus('confirm', 'Archive Perfume?', 'Are you sure you want to permanently remove this masterpiece?', item._id || item.id)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-500 transition-all text-white/40"
                              title="Delete Masterpiece"
                            >
                              <i className="ri-delete-bin-line text-sm md:text-base"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create Modal Portal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/95 backdrop-blur-[40px]" 
            onClick={handleCloseModal} 
          />
          
          <motion.div 
            initial={{ scale: 0.93, y: 30, opacity: 0, rotateX: 12 }} 
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }} 
            exit={{ scale: 0.93, y: 30, opacity: 0, rotateX: -12 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 120 }} 
            className="bg-[#07060a]/90 border border-white/10 w-full max-w-4xl rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8),_0_0_120px_rgba(244,114,182,0.12)] relative z-10 max-h-[92vh] flex flex-col"
          >
            {/* Soft Ambient Glows Inside Modal */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c026d3]/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Modal Header */}
            <div className="p-5 md:p-10 border-b border-white/5 flex justify-between items-start md:items-center bg-gradient-to-r from-rose-500/[0.03] via-transparent to-transparent relative z-10">
              <div className="pr-4">
                <h2 className="text-2xl md:text-4xl font-luxury text-white italic tracking-tighter leading-none">
                  {isEditMode ? 'Update' : 'Create'} <span className="bg-gradient-to-r from-white via-rose-300 to-[#c026d3] bg-clip-text text-transparent">Perfume</span>
                </h2>
                <p className="text-[#fbbf24] text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.4em] font-black uppercase mt-2 md:mt-3.5 flex items-center gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse flex-shrink-0"></span>
                  {isEditMode ? 'Modify and refine this masterwork in your vault' : 'Craft a new masterpiece in your vault'}
                </p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-300 hover:rotate-90 active:scale-90 flex-shrink-0 mt-1 md:mt-0"
              >
                <i className="ri-close-line text-xl md:text-2xl"></i>
              </button>
            </div>
 
            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Core Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                      <i className="ri-quill-pen-line text-xs"></i> Scent Name
                    </label>
                    <input 
                      type="text" 
                      value={formValues.name} 
                      onChange={(e) => setFormValues({...formValues, name: e.target.value})} 
                      className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none focus:bg-[#09070c] focus:shadow-[0_0_20px_rgba(244,114,182,0.1)] transition-all duration-300 font-medium placeholder-white/20" 
                      placeholder="e.g. Sauvage Elixir" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                      <i className="ri-bank-line text-xs"></i> Brand House
                    </label>
                    <input 
                      type="text" 
                      value={formValues.brand} 
                      onChange={(e) => setFormValues({...formValues, brand: e.target.value})} 
                      className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none focus:bg-[#09070c] focus:shadow-[0_0_20px_rgba(244,114,182,0.1)] transition-all duration-300 font-medium placeholder-white/20" 
                      placeholder="e.g. Dior" 
                      required 
                    />
                  </div>
                </div>
 
                {/* 2. Secondary attributes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                      <i className="ri-folder-reduce-line text-xs"></i> Category Tier
                    </label>
                    <div className="relative">
                      <select 
                        value={formValues.categoryId} 
                        onChange={(e) => setFormValues({...formValues, categoryId: e.target.value})} 
                        className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none cursor-pointer appearance-none focus:bg-[#09070c] transition-all font-medium"
                        required
                      >
                        {categories.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"></i>
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                      <i className="ri-bubble-chart-line text-xs"></i> Concentration
                    </label>
                    <div className="relative">
                      <select 
                        value={formValues.concentration} 
                        onChange={(e) => setFormValues({...formValues, concentration: e.target.value})} 
                        className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none cursor-pointer appearance-none focus:bg-[#09070c] transition-all font-medium"
                      >
                        {['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Extrait de Parfum'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"></i>
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                      <i className="ri-windy-line text-xs"></i> Fragrance Family
                    </label>
                    <input 
                      type="text" 
                      value={formValues.fragranceFamily} 
                      onChange={(e) => setFormValues({...formValues, fragranceFamily: e.target.value})} 
                      className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none focus:bg-[#09070c] focus:shadow-[0_0_20px_rgba(244,114,182,0.1)] transition-all duration-300 font-medium placeholder-white/20" 
                      placeholder="e.g. Woody Spicy" 
                      required 
                    />
                  </div>
                </div>
 
                {/* 3. Description textarea */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-[0.2em] text-rose-400 uppercase ml-1 flex items-center gap-2">
                    <i className="ri-chat-quote-line text-xs"></i> Scent Narrative
                  </label>
                  <textarea 
                    value={formValues.description} 
                    onChange={(e) => setFormValues({...formValues, description: e.target.value})} 
                    className="w-full bg-[#030205] border border-white/5 hover:border-white/15 focus:border-rose-400/80 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white focus:outline-none focus:bg-[#09070c] focus:shadow-[0_0_20px_rgba(244,114,182,0.1)] transition-all duration-300 font-medium h-28 md:h-32 resize-none leading-relaxed placeholder-white/20" 
                    placeholder="Enter detailed description of note transitions, performance and visual feel..." 
                    required 
                  />
                </div>
 
                {/* 4. Perfume Variants Section (Dynamic) */}
                <div className="space-y-5 md:space-y-6 bg-white/[0.02] border border-white/5 p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-2xl relative overflow-hidden group/var">
                  <div className="absolute inset-0 bg-[#c026d3]/[0.01] pointer-events-none"></div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center relative z-10">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <i className="ri-stock-line text-rose-400"></i> Size Variations
                      </h4>
                      <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Manage pricing and warehouse inventory values</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-300 hover:bg-rose-500 hover:text-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(244,114,182,0.2)] active:scale-95 w-max"
                    >
                      <i className="ri-add-line text-sm"></i> Add Size
                    </button>
                  </div>
 
                  <div className="space-y-4 relative z-10">
                    {variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-end bg-[#050407]/60 p-4 md:p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Size</label>
                          <input 
                            type="text" 
                            value={v.size} 
                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                            placeholder="e.g. 100ml"
                            className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm focus:outline-none focus:border-rose-500/80 text-white font-bold transition-all placeholder-white/15"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Price (PKR)</label>
                          <input 
                            type="number" 
                            value={v.price} 
                            onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))}
                            placeholder="e.g. 12000"
                            className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm focus:outline-none focus:border-rose-500/80 text-white font-bold transition-all placeholder-white/15"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Stock Qty</label>
                          <input 
                            type="number" 
                            value={v.stock} 
                            onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                            placeholder="e.g. 10"
                            className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm focus:outline-none focus:border-rose-500/80 text-white font-bold transition-all placeholder-white/15"
                            required
                          />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            type="button" 
                            onClick={() => removeVariant(i)}
                            disabled={variants.length <= 1}
                            className="w-full h-9 md:h-[46px] flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-white/30 hover:text-rose-500 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <i className="ri-delete-bin-fill text-sm mr-2 lg:mr-0"></i>
                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest">Delete Size</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* 5. Notes & Tags Simplified Setup */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 bg-white/[0.02] border border-white/5 p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-2xl">
                  
                  {/* Notes Subgrid */}
                  <div className="space-y-5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <i className="ri-palette-line text-rose-400"></i> Olfactive Notes
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Top Notes</label>
                        <input 
                          type="text" 
                          value={formValues.topNotes} 
                          onChange={(e) => setFormValues({...formValues, topNotes: e.target.value})} 
                          placeholder="Comma separated: Cinnamon, Nutmeg" 
                          className="w-full bg-[#030205] border border-white/5 focus:border-rose-400/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none text-white font-medium placeholder-white/15" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Middle Notes</label>
                        <input 
                          type="text" 
                          value={formValues.middleNotes} 
                          onChange={(e) => setFormValues({...formValues, middleNotes: e.target.value})} 
                          placeholder="Comma separated: Lavender, Cardamom" 
                          className="w-full bg-[#030205] border border-white/5 focus:border-rose-400/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none text-white font-medium placeholder-white/15" 
                        />
                      </div>
 
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Base Notes</label>
                        <input 
                          type="text" 
                          value={formValues.baseNotes} 
                          onChange={(e) => setFormValues({...formValues, baseNotes: e.target.value})} 
                          placeholder="Comma separated: Sandalwood, Amber" 
                          className="w-full bg-[#030205] border border-white/5 focus:border-rose-400/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none text-white font-medium placeholder-white/15" 
                        />
                      </div>
                    </div>
                  </div>
 
                  {/* Tags Subgrid */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <i className="ri-price-tag-3-line text-rose-400"></i> Metadata Tags
                      </h4>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Tags</label>
                        <input 
                          type="text" 
                          value={formValues.tags} 
                          onChange={(e) => setFormValues({...formValues, tags: e.target.value})} 
                          placeholder="Comma separated: luxury, men, signature" 
                          className="w-full bg-[#030205] border border-white/5 focus:border-rose-400/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none text-white font-medium placeholder-white/15" 
                        />
                      </div>
                    </div>
 
                    <div className="flex items-center gap-5 bg-[#030205] p-5 rounded-2xl border border-white/5 mt-6 lg:mt-0">
                      <div className="flex-1">
                        <p className="text-white text-xs font-black uppercase tracking-widest">Active Inventory</p>
                        <p className="text-[8px] text-white/30 font-bold uppercase mt-1">Control web visibility dynamically</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormValues({...formValues, isActive: !formValues.isActive})} 
                        className={`w-14 h-8 rounded-full relative transition-all duration-500 ${formValues.isActive ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-500`} style={{ left: formValues.isActive ? '26px' : '4px' }}></div>
                      </button>
                    </div>
                  </div>
                </div>
 
                {/* 6. Media/Images upload */}
                <div className="space-y-5 bg-white/[0.02] border border-white/5 p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-2xl">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <i className="ri-image-line text-rose-400"></i> Perfume Images
                    </h4>
                    <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Upload high definition photography showing bottle artwork</p>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label className="md:col-span-1 border-2 border-dashed border-white/10 hover:border-rose-500/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#030205] text-center hover:bg-white/[0.01] h-36 group/upload">
                      <i className="ri-upload-cloud-2-line text-4xl text-rose-400 mb-2 group-hover/upload:scale-110 transition-transform duration-300"></i>
                      <span className="text-xs font-black text-white uppercase tracking-widest">Select Files</span>
                      <span className="text-[8px] text-white/30 font-bold uppercase mt-1.5">Supports multiple images</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
 
                    <div className="md:col-span-2 flex flex-wrap gap-3 max-h-36 overflow-y-auto p-4 border border-white/5 rounded-2xl bg-black/40 custom-scrollbar">
                      {mediaItems.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center text-[10px] text-white/20 font-bold uppercase h-full tracking-widest">
                          <i className="ri-image-add-line text-2xl mb-1 text-white/10"></i>
                          No images selected
                        </div>
                      ) : (
                        mediaItems.map((item, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group/img bg-black shadow-lg">
                            <img src={item.preview} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 text-lg"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
 
                {/* Modal Footer / Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between items-center pt-6 md:pt-8 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-6 md:px-8 h-12 md:h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white font-black rounded-lg uppercase tracking-widest text-[9px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <i className="ri-close-line text-sm"></i>
                    Cancel Crafting
                  </button>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 md:px-12 h-12 md:h-14 bg-gradient-to-r from-[#4d003e] via-[#c026d3] to-rose-500 hover:from-[#5c004b] hover:to-rose-400 border border-white/10 hover:border-white/20 text-white font-black rounded-lg uppercase tracking-[0.2em] text-[9px] hover:shadow-[0_0_35px_rgba(192,38,211,0.45)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2.5 relative overflow-hidden group/btn cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span className="relative z-10">{isEditMode ? 'Updating Scent...' : 'Initializing Scent...'}</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-shield-flash-line text-sm relative z-10"></i>
                        <span className="relative z-10">{isEditMode ? 'Update Masterwork in Vault' : 'Add Masterwork to Vault'}</span>
                      </>
                    )}
                  </button>
                </div>
 
              </form>
            </div>
          </motion.div>
        </div>, document.body
      )}

      {/* Confirmation / Status Modal */}
      {statusPopup.show && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/90 backdrop-blur-[30px]" 
            onClick={statusPopup.type !== 'confirm' ? closeStatus : undefined}
          />
          
          <motion.div 
            initial={{ scale: 0.93, y: 30, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.93, y: -30, opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 120 }} 
            className="bg-[#07060a]/90 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8),_0_0_100px_rgba(244,114,182,0.1)] relative z-10 text-center p-6 md:p-12" 
          >
            {/* Elegant Background Light Leak Glows */}
            <div className="absolute top-[-30%] left-[-30%] w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none bg-rose-500/5"></div>
            <div className="absolute bottom-[-30%] right-[-30%] w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none bg-[#c026d3]/5"></div>

            <div className="relative z-10">
              {/* Premium Glassmorphic Icon Container */}
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border ${
                statusPopup.type === 'confirm' 
                  ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_30px_rgba(244,114,182,0.15)]' 
                  : statusPopup.type === 'success' 
                    ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_30px_rgba(244,114,182,0.15)]' 
                    : 'border-rose-500/30 bg-rose-500/5'
              }`}>
                <i className={`text-3xl ${
                  statusPopup.type === 'confirm' 
                    ? 'ri-question-mark text-rose-400' 
                    : statusPopup.type === 'success' 
                      ? 'ri-check-line text-rose-400' 
                      : 'ri-error-warning-line text-rose-400'
                }`}></i>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-luxury text-white italic tracking-tight mb-3">
                {statusPopup.title}
              </h3>
              <p className="text-white/60 text-[11px] md:text-xs leading-relaxed mb-6 md:mb-8 font-medium px-2 md:px-4">
                {statusPopup.message}
              </p>
              
              <div className="flex flex-col gap-3">
                {statusPopup.type === 'confirm' ? (
                  <>
                    <button 
                      onClick={confirmDelete} 
                      className="w-full h-14 bg-gradient-to-r from-[#4d003e] via-[#c026d3] to-rose-500 hover:from-[#5c004b] hover:to-rose-400 border border-white/10 hover:border-white/20 text-white font-black rounded-lg uppercase tracking-[0.2em] text-[9px] hover:shadow-[0_0_30px_rgba(192,38,211,0.45)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Confirm Deletion
                    </button>
                    <button 
                      onClick={closeStatus} 
                      className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white font-black rounded-lg uppercase tracking-widest text-[9px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Cancel Action
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={closeStatus} 
                    className="w-full h-14 bg-gradient-to-r from-[#4d003e] via-[#c026d3] to-rose-500 hover:from-[#5c004b] hover:to-rose-400 border border-white/10 hover:border-white/20 text-white font-black rounded-lg uppercase tracking-[0.2em] text-[9px] hover:shadow-[0_0_30px_rgba(192,38,211,0.45)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Dismiss Notification
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>, document.body
      )}

    </div>
  );
};

export default Products;
