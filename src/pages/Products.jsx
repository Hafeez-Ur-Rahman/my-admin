import React, { useState } from 'react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: 1, name: 'Midnight Oud', category: 'Oriental', price: '$240.00', stock: 45, status: 'In Stock', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200' },
    { id: 2, name: 'Velvet Rose', category: 'Floral', price: '$180.00', stock: 12, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200' },
    { id: 3, name: 'Golden Sandalwood', category: 'Woody', price: '$320.00', stock: 89, status: 'In Stock', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=200' },
    { id: 4, name: 'Citrus Bloom', category: 'Fresh', price: '$150.00', stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=200' },
    { id: 5, name: 'Ocean Mist', category: 'Fresh', price: '$120.00', stock: 67, status: 'In Stock', image: 'https://images.unsplash.com/photo-1557170334-a7c3a4e2ef38?auto=format&fit=crop&q=80&w=200' },
    { id: 6, name: 'Imperial Leather', category: 'Woody', price: '$450.00', stock: 23, status: 'In Stock', image: 'https://images.unsplash.com/photo-1512568433530-571860882e9e?auto=format&fit=crop&q=80&w=200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Product Inventory</h1>
          <p className="text-mutedText mt-1 font-medium">Manage your premium perfume collections.</p>
        </div>
        <button className="flex items-center justify-center w-full md:w-auto gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white rounded-luxury text-sm font-bold hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(192,38,211,0.3)]">
          <i className="ri-add-line text-lg"></i>
          Add New Product
        </button>
      </div>

      <div className="glass rounded-luxury border border-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-mutedText"></i>
            <input
              type="text"
              placeholder="Search by product name or category..."
              className="w-full bg-card/50 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-accentGold/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card/50 border border-white/10 rounded-xl text-sm font-medium hover:bg-cardHover transition-all text-white">
              <i className="ri-filter-3-line"></i>
              Filters
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card/50 border border-white/10 rounded-xl text-sm font-medium hover:bg-cardHover transition-all text-white">
              <i className="ri-arrow-up-down-line"></i>
              Sort
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-mutedText uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-cardHover/20 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-accentGold/30 transition-colors">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-accentGold transition-colors">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondaryText font-medium">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{item.price}</td>
                  <td className="px-6 py-4 text-sm text-mutedText font-medium">{item.stock} Units</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'In Stock' ? 'bg-success/10 text-success' :
                      item.status === 'Low Stock' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card/50 hover:bg-aquaBlue/20 hover:text-aquaBlue transition-all">
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card/50 hover:bg-accentGold/20 hover:text-accentGold transition-all">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-card/50 hover:bg-danger/20 hover:text-danger transition-all">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:p-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.01]">
          <p className="text-xs text-mutedText font-medium">Showing 1 to 6 of 48 products</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-mutedText hover:bg-card transition-all disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white text-xs font-bold shadow-[0_4px_15px_rgba(192,38,211,0.3)] hover:opacity-90 transition-all">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-mutedText hover:bg-card transition-all">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-mutedText hover:bg-card transition-all">3</button>
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-mutedText hover:bg-card transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
