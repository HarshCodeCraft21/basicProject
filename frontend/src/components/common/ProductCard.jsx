import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const isAdmin = user && user.role === 'admin';

  
  const {
    _id,
    title,
    description,
    originalPrice,
    discountedPrice,
    image,
    category,
  } = product;

  
  const savingsPercent = originalPrice > discountedPrice
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    addToCart(product, 1);
    toast.success(`${title} added to cart!`, {
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

  
  const categoryName = category && typeof category === 'object' ? category.name : 'Catalog';

  return (
    <div className="group bg-[#f0ead2] border border-[#dde5b6] rounded-2xl overflow-hidden p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative">
      
      {savingsPercent > 0 && (
        <span className="absolute top-6 left-6 z-10 bg-[#a98467] text-white text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full">
          {savingsPercent}% OFF
        </span>
      )}

      
      <Link to={`/products/${_id}`} className="w-full aspect-square overflow-hidden rounded-xl bg-[#fbfaf5] mb-4 block relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      
      <span className="text-[11px] uppercase tracking-widest text-[#8c9f5e] font-medium mb-1">
        {categoryName}
      </span>

      
      <Link to={`/products/${_id}`} className="hover:text-[#a98467] transition-colors duration-200 block">
        <h3 className="text-base font-semibold text-[#6c584c] leading-snug line-clamp-1 mb-1">
          {title}
        </h3>
      </Link>

      
      <p className="text-xs text-[#8c9f5e] line-clamp-2 mb-4 flex-grow font-light">
        {description}
      </p>

      
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-base font-semibold text-[#a98467]">
          Rs.{discountedPrice.toFixed(2)}
        </span>
        {originalPrice > discountedPrice && (
          <span className="text-xs text-[#8c9f5e] line-through">
            Rs.{originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      
      <div className="mt-auto pt-3 border-t border-[#dde5b6]/40">
        {isAdmin ? (
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-2 text-xs font-medium text-[#6c584c] bg-[#adc178]/40 hover:bg-[#adc178]/70 rounded-xl transition-colors duration-200 border border-[#dde5b6] cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(_id)}
              className="px-3 py-2 text-xs font-medium text-white bg-red-700/80 hover:bg-red-700/90 rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ) : (
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link
              to={`/products/${_id}`}
              className="px-3 py-2 text-center text-xs font-medium text-[#6c584c] bg-transparent hover:bg-[#adc178]/20 border border-[#dde5b6] rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
            >
              Details
            </Link>
            <button
              onClick={handleAddToCart}
              className="px-3 py-2 text-xs font-medium text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
