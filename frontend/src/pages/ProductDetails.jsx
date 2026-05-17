import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/common/Skeleton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/products/${id}`);
      if (response.data && response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error('[Error fetching product details]:', error.message);
      toast.error('Could not find product details.');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.title} added to cart!`, {
      style: {
        background: '#f0ead2',
        color: '#6c584c',
        border: '1px solid #dde5b6',
      },
      iconTheme: {
        primary: '#a98467',
        secondary: '#f0ead2',
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-[#fbfaf5] min-h-screen py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const { title, description, originalPrice, discountedPrice, image, category } = product;
  const categoryName = category && typeof category === 'object' ? category.name : 'Catalog';

  const savingsPercent = originalPrice > discountedPrice
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-[#fbfaf5] min-h-screen py-12 px-6 md:px-12 text-[#6c584c]">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c9f5e] font-medium">
          <Link to="/" className="hover:text-[#a98467]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#a98467]">Products</Link>
          <span>/</span>
          <span className="text-[#6c584c] font-semibold">{title}</span>
        </div>

        
        <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-6 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          
          <div className="w-full aspect-square bg-[#fbfaf5] rounded-2xl overflow-hidden relative border border-[#dde5b6]/40">
            {savingsPercent > 0 && (
              <span className="absolute top-6 left-6 z-10 bg-[#a98467] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                {savingsPercent}% OFF
              </span>
            )}
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          
          <div className="flex flex-col justify-center py-4">
            
            
            <span className="text-xs uppercase tracking-widest text-[#8c9f5e] font-semibold mb-2">
              {categoryName}
            </span>

            
            <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-4">
              {title}
            </h1>

            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-[#a98467]">
                Rs.{discountedPrice.toFixed(2)}
              </span>
              {originalPrice > discountedPrice && (
                <>
                  <span className="text-sm text-[#8c9f5e] line-through">
                    Rs.{originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-[#8c9f5e] bg-[#adc178]/30 px-2 py-0.5 rounded">
                    Save Rs.{(originalPrice - discountedPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <hr className="border-[#dde5b6] my-6" />

            
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8c9f5e] mb-2">
                Description
              </h3>
              <p className="text-sm text-[#6c584c]/90 font-light leading-relaxed">
                {description}
              </p>
            </div>

            
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mt-auto">
              
              
              <div className="flex items-center justify-between border border-[#dde5b6] rounded-xl px-3 py-2 bg-[#fbfaf5]/50 sm:w-32">
                <button
                  onClick={handleDecrement}
                  disabled={quantity === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-[#adc178]/20 disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease Quantity"
                >
                  −
                </button>
                <span className="text-sm font-bold w-6 text-center select-none">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-[#adc178]/20 cursor-pointer"
                  aria-label="Increase Quantity"
                >
                  +
                </button>
              </div>

              
              <button
                onClick={handleAddToCart}
                className="flex-grow px-6 py-3 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Add to Cart
              </button>

            </div>

            
            <div className="mt-8 text-[11px] text-[#8c9f5e] font-light flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-green-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Insured worldwide carbon-neutral delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-green-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Secured checkout (VISA, MC, AMEX, Apple Pay)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
