import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductsGridSkeleton } from '../components/common/Skeleton';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeCategory = searchParams.get('category') || '';
  const activeSort = searchParams.get('sort') || 'latest';
  const searchQuery = searchParams.get('search') || '';

  
  const [searchInput, setSearchInput] = useState(searchQuery);

  
  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('[Error fetching categories]:', error.message);
    }
  };

  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 8,
        search: searchQuery,
        category: activeCategory,
        sort: activeSort,
      });

      const response = await API.get(`/products?${query.toString()}`);
      if (response.data && response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pages);
        setTotalProducts(response.data.data.totalProducts);
      }
    } catch (error) {
      console.error('[Error fetching products]:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeCategory, activeSort, searchQuery]);

  
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  
  const updateParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    
    if (!newParams.page) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#dde5b6]">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-wide">Catalog Collection</h1>
            <p className="text-xs text-[#8c9f5e] mt-1 font-light">
              Showing {totalProducts} object{totalProducts !== 1 ? 's' : ''} tailored for your space
            </p>
          </div>
          
          
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#8c9f5e] font-medium">Sort by:</span>
            <select
              value={activeSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="bg-[#f0ead2] border border-[#dde5b6] rounded-xl px-3 py-1.5 text-xs text-[#6c584c] font-medium focus:ring-1 focus:ring-[#a98467] focus:outline-none"
            >
              <option value="latest">Latest Addition</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search objects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#f0ead2] border border-[#dde5b6] rounded-xl px-4 py-2 text-xs w-full text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#a98467] hover:bg-[#8c9f5e] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer"
              >
                Search
              </button>
            </form>

            
            <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-5 shadow-sm">
              <h3 className="font-serif text-sm font-semibold tracking-wider uppercase mb-4 pb-2 border-b border-[#dde5b6]/40">
                Categories
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => updateParams({ category: '' })}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium tracking-wide transition-all cursor-pointer ${
                    activeCategory === ''
                      ? 'bg-[#a98467] text-white'
                      : 'bg-transparent text-[#6c584c] hover:bg-[#adc178]/20'
                  }`}
                >
                  All Objects
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParams({ category: cat._id })}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium tracking-wide transition-all cursor-pointer ${
                      activeCategory === cat._id
                        ? 'bg-[#a98467] text-white'
                        : 'bg-transparent text-[#6c584c] hover:bg-[#adc178]/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            
            {(activeCategory || searchQuery || activeSort !== 'latest') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 text-xs uppercase tracking-widest font-semibold border border-red-800/20 bg-red-700/5 hover:bg-red-700/10 text-red-900 rounded-xl transition-all w-full cursor-pointer"
              >
                Clear Filters
              </button>
            )}

          </div>

          
          <div className="lg:col-span-3 flex flex-col gap-8">
            {loading ? (
              <ProductsGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6 border-t border-[#dde5b6]/40 mt-auto">
                    <button
                      onClick={() => updateParams({ page: currentPage - 1 })}
                      disabled={currentPage === 1}
                      className="px-3.5 py-1.5 bg-[#f0ead2] border border-[#dde5b6] text-[#6c584c] rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#adc178]/10 transition-all cursor-pointer"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParams({ page: i + 1 })}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                          currentPage === i + 1
                            ? 'bg-[#a98467] text-white shadow-sm'
                            : 'bg-[#f0ead2] border border-[#dde5b6] text-[#6c584c] hover:bg-[#adc178]/10'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => updateParams({ page: currentPage + 1 })}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-1.5 bg-[#f0ead2] border border-[#dde5b6] text-[#6c584c] rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#adc178]/10 transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-8 flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-[#a98467]/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                <h3 className="font-serif text-lg font-medium text-[#6c584c] mb-1">No Objects Found</h3>
                <p className="text-xs text-[#8c9f5e] max-w-xs font-light leading-relaxed mb-4">
                  We couldn't find any objects matching your search filters. Try clearing filters to explore.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all cursor-pointer"
                >
                  Reset Filter State
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Products;
