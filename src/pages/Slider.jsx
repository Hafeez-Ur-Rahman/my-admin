import React, { useState } from 'react';
import { Reorder, motion } from 'framer-motion';

const initialSlides = [
  { id: '1', title: 'Midnight Oud Collection', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', active: true },
  { id: '2', title: 'Summer Blossom 2026', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600', active: true },
  { id: '3', title: 'Golden Sandalwood Luxury', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600', active: false },
];

const Slider = () => {
  const [slides, setSlides] = useState(initialSlides);

  const toggleSlide = (id) => {
    setSlides(slides.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Home Hero Slider</h1>
          <p className="text-mutedText mt-1 font-medium">Drag to reorder and manage your homepage hero banners.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-accentGold text-background rounded-luxury text-sm font-bold hover:bg-hoverGold transition-all shadow-glow">
          <i className="ri-image-add-line text-lg"></i>
          Upload New Banner
        </button>
      </div>

      <div className="glass p-6 rounded-luxury border border-white/5">
        <Reorder.Group axis="y" values={slides} onReorder={setSlides} className="space-y-4">
          {slides.map((slide) => (
            <Reorder.Item
              key={slide.id}
              value={slide}
              className="glass bg-white/[0.02] p-4 rounded-xl border border-white/5 flex items-center gap-6 cursor-grab active:cursor-grabbing hover:bg-white/[0.04] transition-colors group"
            >
              <div className="text-mutedText group-hover:text-white transition-colors">
                <i className="ri-draggable text-2xl"></i>
              </div>
              
              <div className="w-40 h-24 rounded-lg overflow-hidden border border-white/10 shrink-0">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{slide.title}</h3>
                <p className="text-sm text-mutedText">Banner ID: {slide.id}</p>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-mutedText uppercase tracking-widest">Status</span>
                  <button
                    onClick={() => toggleSlide(slide.id)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${slide.active ? 'bg-success' : 'bg-cardHover'}`}
                  >
                    <motion.div
                      animate={{ x: slide.active ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-card/50 hover:bg-accentGold/20 hover:text-accentGold transition-all border border-white/5">
                    <i className="ri-edit-line"></i>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-card/50 hover:bg-danger/20 hover:text-danger transition-all border border-white/5">
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <div className="glass p-8 rounded-luxury border border-white/5 bg-gradient-to-br from-accentGold/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accentGold/20 flex items-center justify-center text-accentGold">
            <i className="ri-information-line text-2xl"></i>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Pro Tip: Optimization</h4>
            <p className="text-sm text-mutedText max-w-2xl">
              For the best visual experience, use high-resolution images with a 16:9 aspect ratio. 
              Our system automatically applies a subtle vignette to ensure text readability on all slides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
