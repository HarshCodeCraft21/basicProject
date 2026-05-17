import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error('Please enter both email and password.');
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!', {
        style: {
          background: '#f0ead2',
          color: '#6c584c',
          border: '1px solid #dde5b6',
        },
      });
    } catch (error) {
      console.error('[Login Error]:', error);
      toast.error(error.apiMessage || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbfaf5] min-h-[85vh] flex items-center justify-center py-12 px-6">
      <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-8 md:p-12 shadow-sm w-full max-w-md flex flex-col">

        
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
            Studio Session
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#6c584c] mt-1">
            Welcome Back
          </h2>
          <p className="text-xs text-[#8c9f5e] mt-1 font-light">
            Sign in to access your cart and account details
          </p>
        </div>

        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2.5 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2.5 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 px-6 py-3 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        
        <div className="mt-6 border-t border-[#dde5b6]/40 pt-4 text-center">
          <p className="text-[11px] text-[#8c9f5e] font-light">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#a98467] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
