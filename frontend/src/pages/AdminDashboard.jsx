import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  
  const activeTab = searchParams.get('tab') || 'overview';
  const urlAction = searchParams.get('action') || '';

  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormType, setProductFormType] = useState('add'); 
  const [editingProductId, setEditingProductId] = useState(null);

  const [productTitle, setProductTitle] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productDiscountedPrice, setProductDiscountedPrice] = useState('');
  const [productCatId, setProductCatId] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await API.get('/products?limit=50'); 
      if (response.data && response.data.success) {
        setProducts(response.data.data.products);
        setTotalProductsCount(response.data.data.totalProducts);
      }
    } catch (error) {
      console.error('[Error loading products]:', error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await API.get('/categories');
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('[Error loading categories]:', error.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  
  useEffect(() => {
    if (urlAction === 'add') {
      if (activeTab === 'products') {
        openAddProductModal();
      }
      
      setSearchParams({ tab: activeTab });
    }
  }, [urlAction, activeTab]);

  const switchTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  
  
  

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.error('Category name cannot be empty.');

    try {
      const response = await API.post('/categories', { name: newCatName });
      if (response.data && response.data.success) {
        toast.success(`Category "${newCatName}" created successfully!`);
        setNewCatName('');
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.apiMessage || 'Could not add category.');
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditingCategory(cat._id);
    setEditCatName(cat.name);
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCatName('');
  };

  const handleUpdateCategory = async (id) => {
    if (!editCatName.trim()) return toast.error('Category name cannot be empty.');
    try {
      const response = await API.put(`/categories/${id}`, { name: editCatName });
      if (response.data && response.data.success) {
        toast.success('Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
        fetchProducts(); 
      }
    } catch (error) {
      toast.error(error.apiMessage || 'Could not update category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Associated products will be unlinked (set to Uncategorized).')) return;
    try {
      const response = await API.delete(`/categories/${id}`);
      if (response.data && response.data.success) {
        toast.success('Category deleted successfully.');
        fetchCategories();
        fetchProducts(); 
      }
    } catch (error) {
      toast.error(error.apiMessage || 'Could not delete category.');
    }
  };

  
  
  

  const openAddProductModal = () => {
    setProductFormType('add');
    setEditingProductId(null);
    setProductTitle('');
    setProductDesc('');
    setProductOriginalPrice('');
    setProductDiscountedPrice('');
    setProductCatId(categories[0]?._id || '');
    setProductImageFile(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setProductFormType('edit');
    setEditingProductId(product._id);
    setProductTitle(product.title);
    setProductDesc(product.description);
    setProductOriginalPrice(product.originalPrice.toString());
    setProductDiscountedPrice(product.discountedPrice.toString());
    setProductCatId(product.category?._id || product.category || '');
    setProductImageFile(null); 
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await API.delete(`/products/${id}`);
      if (response.data && response.data.success) {
        toast.success('Product deleted successfully.');
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.apiMessage || 'Could not delete product.');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productTitle || !productDesc || !productOriginalPrice || !productDiscountedPrice || !productCatId) {
      return toast.error('Please fill in all product form fields.');
    }

    if (Number(productDiscountedPrice) > Number(productOriginalPrice)) {
      return toast.error('Discounted price must be less than or equal to the original price.');
    }

    
    const formData = new FormData();
    formData.append('title', productTitle);
    formData.append('description', productDesc);
    formData.append('originalPrice', productOriginalPrice);
    formData.append('discountedPrice', productDiscountedPrice);
    formData.append('category', productCatId);
    if (productImageFile) {
      formData.append('image', productImageFile);
    }

    setSavingProduct(true);
    try {
      if (productFormType === 'add') {
        const response = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data && response.data.success) {
          toast.success('New product added successfully!');
          setIsProductModalOpen(false);
          fetchProducts();
        }
      } else {
        const response = await API.put(`/products/${editingProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data && response.data.success) {
          toast.success('Product updated successfully!');
          setIsProductModalOpen(false);
          fetchProducts();
        }
      }
    } catch (error) {
      console.error('[Product Form Submit Error]:', error);
      toast.error(error.apiMessage || 'Failed to save product details.');
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#dde5b6]">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
              Administrator Sandbox
            </span>
            <h1 className="font-serif text-3xl font-medium tracking-wide">Studio Dashboard</h1>
            <p className="text-xs text-[#8c9f5e] mt-1 font-light">
              Welcome, <span className="font-semibold">{user?.name}</span>. Manage your product catalog and category metadata.
            </p>
          </div>

          
          <div className="flex gap-2">
            <button
              onClick={openAddProductModal}
              className="px-4 py-2 bg-[#a98467] hover:bg-[#8c9f5e] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
            >
              Add Product
            </button>
          </div>
        </div>

        
        <div className="flex border-b border-[#dde5b6]/60 gap-4 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => switchTab('overview')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#a98467] text-[#a98467]'
                : 'border-transparent text-[#8c9f5e] hover:text-[#6c584c]'
            }`}
          >
            Overview Stats
          </button>
          <button
            onClick={() => switchTab('products')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#a98467] text-[#a98467]'
                : 'border-transparent text-[#8c9f5e] hover:text-[#6c584c]'
            }`}
          >
            Product Inventory ({products.length})
          </button>
          <button
            onClick={() => switchTab('categories')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#a98467] text-[#a98467]'
                : 'border-transparent text-[#8c9f5e] hover:text-[#6c584c]'
            }`}
          >
            Category Settings ({categories.length})
          </button>
        </div>

        
        
        
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm">
                <svg className="w-8 h-8 text-[#a98467] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <h4 className="text-xs uppercase tracking-widest text-[#8c9f5e] font-semibold">Total Products</h4>
                <p className="font-serif text-3xl font-medium mt-2 text-[#6c584c]">{totalProductsCount}</p>
                <span className="text-[10px] text-green-700 font-medium">Active in database</span>
              </div>

              <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm">
                <svg className="w-8 h-8 text-[#a98467] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 002.036 0l4.318-4.318a1.44 1.44 0 000-2.036L11.16 3.659A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <h4 className="text-xs uppercase tracking-widest text-[#8c9f5e] font-semibold">Categories</h4>
                <p className="font-serif text-3xl font-medium mt-2 text-[#6c584c]">{categories.length}</p>
                <span className="text-[10px] text-green-700 font-medium">Distinct catalog tags</span>
              </div>

            </div>
          </div>
        )}

        
        {activeTab === 'products' && (
          <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#dde5b6]/40">
              <h3 className="font-serif text-lg font-medium">Catalog Inventory</h3>
              <button
                onClick={openAddProductModal}
                className="px-3 py-1.5 bg-[#a98467]/10 hover:bg-[#a98467]/20 text-[#a98467] border border-[#a98467]/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                + New Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-12 text-xs font-semibold text-[#8c9f5e]">Loading inventory list...</div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#6c584c] border-collapse">
                  <thead>
                    <tr className="border-b border-[#dde5b6] text-[#8c9f5e] uppercase tracking-wider font-semibold text-[10px]">
                      <th className="pb-3 pr-4">Image</th>
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4">Discount Price</th>
                      <th className="pb-3 pr-4">Original Price</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const catName = product.category && typeof product.category === 'object' ? product.category.name : 'Uncategorized';
                      return (
                        <tr key={product._id} className="border-b border-[#dde5b6]/35 hover:bg-[#fbfaf5]/20 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#fbfaf5] border border-[#dde5b6]/30">
                              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold max-w-xs truncate">{product.title}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#adc178]/30 text-[10px] uppercase font-bold text-[#8c9f5e]">
                              {catName}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-[#a98467]">Rs.{product.discountedPrice.toFixed(2)}</td>
                          <td className="py-3 pr-4 text-[#8c9f5e]">Rs.{product.originalPrice.toFixed(2)}</td>
                          <td className="py-3 text-right flex justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="px-2.5 py-1.5 border border-[#dde5b6] hover:bg-[#adc178]/20 rounded-lg transition-all cursor-pointer font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="px-2.5 py-1.5 bg-red-700/80 hover:bg-red-700/90 text-white rounded-lg transition-all cursor-pointer font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs font-light text-[#8c9f5e]">No inventory found. Try creating a product.</div>
            )}
          </div>
        )}

        
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            
            <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm md:col-span-1 h-fit">
              <h3 className="font-serif text-base font-semibold tracking-wider uppercase mb-4 pb-2 border-b border-[#dde5b6]/40">
                New Category
              </h3>
              <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Clay Plates"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Create Category
                </button>
              </form>
            </div>

            
            <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm md:col-span-2">
              <h3 className="font-serif text-base font-semibold tracking-wider uppercase mb-4 pb-2 border-b border-[#dde5b6]/40">
                Catalog Categories
              </h3>
              
              {loadingCategories ? (
                <div className="text-center py-6 text-xs text-[#8c9f5e]">Loading categories...</div>
              ) : categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#6c584c] border-collapse">
                    <thead>
                      <tr className="border-b border-[#dde5b6] text-[#8c9f5e] uppercase tracking-wider font-semibold text-[10px]">
                        <th className="pb-3 pr-4">Category Name</th>
                        <th className="pb-3 pr-4">Slug (URL-friendly)</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat._id} className="border-b border-[#dde5b6]/35 hover:bg-[#fbfaf5]/20 transition-colors">
                          <td className="py-3 pr-4">
                            {editingCategory === cat._id ? (
                              <input
                                type="text"
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                className="bg-white border border-[#dde5b6] rounded-lg px-2.5 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#a98467]"
                              />
                            ) : (
                              <span className="font-semibold">{cat.name}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 font-mono text-[11px] text-[#8c9f5e]">{cat.slug}</td>
                          <td className="py-3 text-right">
                            {editingCategory === cat._id ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateCategory(cat._id)}
                                  className="px-2 py-1 bg-green-700/80 hover:bg-green-700 text-white rounded-lg transition-all cursor-pointer font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditCategory}
                                  className="px-2 py-1 border border-[#dde5b6] hover:bg-[#adc178]/10 rounded-lg transition-all cursor-pointer font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditCategory(cat)}
                                  className="px-2 py-1 border border-[#dde5b6] hover:bg-[#adc178]/20 rounded-lg transition-all cursor-pointer font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat._id)}
                                  className="px-2 py-1 bg-red-700/80 hover:bg-red-700/90 text-white rounded-lg transition-all cursor-pointer font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#8c9f5e] font-light">No categories loaded. Create one.</div>
              )}
            </div>

          </div>
        )}

      </div>

      
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6c584c]/40 backdrop-blur-sm p-4">
          <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-6 md:p-8 shadow-lg max-w-lg w-full flex flex-col max-h-[90vh] overflow-y-auto relative animate-fadeIn">
            
            
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#adc178]/20 text-[#8c9f5e] hover:text-[#6c584c] rounded-lg transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            
            <h3 className="font-serif text-xl font-medium tracking-wide mb-6 pb-2 border-b border-[#dde5b6]/40">
              {productFormType === 'add' ? 'Add Ceramic & Fiber Product' : 'Modify Product Credentials'}
            </h3>

            
            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-bold">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Terracotta Water Pitcher"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-bold">Category Folder</label>
                <select
                  value={productCatId}
                  onChange={(e) => setProductCatId(e.target.value)}
                  className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-2.5 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none"
                  required
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold">Original Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={productOriginalPrice}
                    onChange={(e) => setProductOriginalPrice(e.target.value)}
                    className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold">Discounted Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="95.00"
                    value={productDiscountedPrice}
                    onChange={(e) => setProductDiscountedPrice(e.target.value)}
                    className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-bold">Description Details</label>
                <textarea
                  placeholder="Explain clay texture, glazing, size specifications, care instructions..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  rows="3"
                  className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-bold">Product Image (File Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImageFile(e.target.files[0])}
                  className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-[#a98467] file:text-white file:cursor-pointer"
                />
                <p className="text-[9px] text-[#8c9f5e] font-light mt-0.5">
                  {productFormType === 'edit' 
                    ? 'Leave empty to retain the current product catalog picture.'
                    : 'Choose an image file. If omitted, standard placeholder will be used.'}
                </p>
              </div>

              
              <div className="flex gap-3 mt-4 pt-4 border-t border-[#dde5b6]/40">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3 text-center border border-[#dde5b6] hover:bg-[#adc178]/10 text-[#6c584c] font-semibold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 py-3 bg-[#a98467] hover:bg-[#8c9f5e] text-white font-semibold rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingProduct ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Save Details'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
