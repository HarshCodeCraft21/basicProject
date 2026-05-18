import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-[#a98467] font-semibold'
      : 'text-[#6c584c]/80 hover:text-[#a98467] transition-colors duration-200';
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-[#fbfaf5]/95 backdrop-blur-md border-b border-[#dde5b6] py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-[#a98467] flex items-center justify-center text-white font-serif text-sm font-bold shadow-sm group-hover:bg-[#8c9f5e] transition-colors duration-300">
            H
          </span>
          <span className="font-serif text-lg tracking-widest text-[#6c584c] font-bold uppercase">
            E-Commerce
          </span>
        </Link>

        
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/products" className={isActive('/products')}>Products</Link>
          
          
          {isAuthenticated && user && user.role === 'admin' && (
            <>
              <Link to="/admin?tab=products&action=add" className={isActive('/admin?tab=products&action=add')}>
                Add Product
              </Link>
              <Link to="/admin?tab=categories&action=add" className={isActive('/admin?tab=categories&action=add')}>
                Add Category
              </Link>
              <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
            </>
          )}
        </div>

        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/cart" className="relative p-2 text-[#6c584c] hover:text-[#a98467] transition-colors duration-200">
            
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#a98467] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/orders" className="text-xs uppercase tracking-widest font-semibold text-[#6c584c]/80 hover:text-[#a98467] transition-colors duration-200">
                My Orders
              </Link>
              <span className="text-xs text-[#8c9f5e] font-light">
                Hello, <span className="font-semibold text-[#6c584c]">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-xs uppercase tracking-widest font-medium border border-[#dde5b6] hover:bg-[#adc178]/10 rounded-xl transition-all duration-200 text-[#6c584c] cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 text-xs uppercase tracking-widest font-medium text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>

        
        <div className="flex md:hidden items-center gap-4">
          <Link to="/cart" className="relative p-2 text-[#6c584c] hover:text-[#a98467]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#a98467] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="p-2 text-[#6c584c] focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

      </div>

      
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-[#f0ead2] border-b border-[#dde5b6] shadow-md z-40 p-6 flex flex-col gap-5 text-sm uppercase tracking-widest font-medium transition-all duration-300 ease-in-out animate-fadeIn">
          <Link to="/" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">Home</Link>
          <Link to="/products" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">Products</Link>

          
          {isAuthenticated && user && user.role === 'admin' && (
            <>
              <Link to="/admin?tab=products&action=add" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">
                Add Product
              </Link>
              <Link to="/admin?tab=categories&action=add" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">
                Add Category
              </Link>
              <Link to="/admin" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">Dashboard</Link>
            </>
          )}

          {isAuthenticated && (
            <Link to="/orders" onClick={toggleMobileMenu} className="py-2 border-b border-[#dde5b6]/40 text-[#6c584c]">
              My Orders
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex flex-col gap-4 mt-2">
              <span className="text-xs text-[#8c9f5e] normal-case font-light">
                Logged in as: <span className="font-semibold text-[#6c584c]">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-2.5 text-xs font-semibold border border-[#dde5b6] rounded-xl text-[#6c584c] hover:bg-[#adc178]/10 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={toggleMobileMenu}
              className="w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all block"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
