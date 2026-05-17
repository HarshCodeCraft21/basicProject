import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const { signup, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all registration fields.');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match. Please verify.');
    }

    setIsSubmitting(true);
    try {
      await signup(name, email, password, role);
      toast.success(`Account created successfully! Welcome, ${name}.`, {
        style: {
          background: '#f0ead2',
          color: '#6c584c',
          border: '1px solid #dde5b6',
        },
      });
      navigate('/');
    } catch (error) {
      console.error('[Signup Error]:', error);
      toast.error(error.apiMessage || 'Registration failed. Email might be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbfaf5] min-h-[85vh] flex items-center justify-center py-12 px-6">
      <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-8 md:p-12 shadow-sm w-full max-w-md flex flex-col">
        
        
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
            Studio Registration
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#6c584c] mt-1">
            Create Account
          </h2>
          <p className="text-xs text-[#8c9f5e] mt-1 font-light">
            Join the studio to start collecting objects
          </p>
        </div>

        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Oliver Dune"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="oliver@dune.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Select Profile Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-3 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none"
            >
              <option value="user">Standard User (Shopper)</option>
              <option value="admin">Administrator (Inventory Manager)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Password
            </label>
            <input
              type="password"
              placeholder="•••••••• (Min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#fbfaf5]/50 border border-[#dde5b6] rounded-xl px-4 py-2 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/30"
              required
            />
          </div>

          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 px-6 py-3 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>

        </form>

        
        <div className="mt-6 border-t border-[#dde5b6]/40 pt-4 text-center">
          <p className="text-[11px] text-[#8c9f5e] font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#a98467] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
