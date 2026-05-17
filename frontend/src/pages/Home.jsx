import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductsGridSkeleton } from '../components/common/Skeleton';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await API.get('/products?limit=4');
      if (response.data && response.data.success) {
        setFeaturedProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('[Error fetching featured products]:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
            Curated Highlights
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#6c584c] mt-1">
            Featured Products
          </h2>
        </div>

        {loading ? (
          <ProductsGridSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#f0ead2] border border-[#dde5b6] rounded-2xl">
            <p className="text-sm text-[#8c9f5e] font-light">No products available at the moment. Please seed the DB.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
