import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    originalTotal,
    totalSavings,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const { isAuthenticated, user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileAddress, setProfileAddress] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  
  const shippingFee = cartTotal >= 1500 || cartTotal === 0 ? 0 : 150;
  const finalTotal = cartTotal + shippingFee;

  // 1. Dynamic Script Loader helper for Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 2. Main checkout handler trigger
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // A. Verify authentication before proceeding
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed with checkout.');
      // Store intent in sessionStorage to auto-trigger checkout after successful login
      sessionStorage.setItem('pendingCheckout', 'true');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    // B. Verify profile complete
    if (!user?.address || !user?.phone) {
      setProfileAddress(user?.address || '');
      setProfilePhone(user?.phone || '');
      setIsProfileModalOpen(true);
      return;
    }

    // C. Already populated, proceed directly
    await proceedToRazorpay(user);
  };

  // 2b. Razorpay Checkout Flow Execution
  const proceedToRazorpay = async (currentUser) => {
    setIsCheckoutLoading(true);

    try {
      // A. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load the payment gateway SDK. Please check your network connection.');
        setIsCheckoutLoading(false);
        return;
      }

      // B. Request backend order creation
      const requestProducts = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.discountedPrice || item.originalPrice,
      }));

      const response = await API.post('/payments/create-order', {
        products: requestProducts,
        totalAmount: finalTotal,
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Error creating Razorpay order.');
      }

      const { order_id, amount, currency, key_id } = response.data.data;

      // C. Define Razorpay checkout options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Harsh Studio',
        description: `Bundle of ${cartCount} handcrafted object${cartCount !== 1 ? 's' : ''}`,
        image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=200&auto=format&fit=crop',
        order_id: order_id,
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || '',
        },
        theme: {
          color: '#a98467',
        },
        notes: {
          userId: currentUser?._id || '',
        },
        handler: async function (paymentResponse) {
          const verificationToastId = toast.loading('Verifying secure transaction details...');
          try {
            // E. Verify transaction signature in backend
            const verifyResponse = await API.post('/payments/verify-payment', {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.data && verifyResponse.data.success) {
              toast.success('Payment successfully captured!', { id: verificationToastId });
              
              // Clear shopping cart items
              clearCart();

              // Trigger payment success receipt representation
              setPaymentSuccessData(verifyResponse.data.data);
            } else {
              throw new Error(verifyResponse.data?.message || 'Cryptographic verification check failed.');
            }
          } catch (error) {
            console.error('[Verification Failure]:', error);
            toast.error(error.apiMessage || 'Could not verify payment. Please contact support.', {
              id: verificationToastId,
            });
          } finally {
            setIsCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsCheckoutLoading(false);
            toast.error('Payment checkout session was cancelled.', { icon: '⚠️' });
          },
        },
      };

      // F. Open Razorpay transaction popup window
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setIsCheckoutLoading(false);
        toast.error(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error('[Checkout API Error]:', error);
      setIsCheckoutLoading(false);
      toast.error(error.apiMessage || 'Failed to initialize payment gateway checkout.');
    }
  };

  // 2c. Save updated profile credentials & continue checkout flow automatically
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileAddress.trim() || !profilePhone.trim()) {
      return toast.error('Please enter both shipping address and phone number.');
    }

    if (profileAddress.trim().length < 10) {
      return toast.error('Shipping address must be detailed (at least 10 characters long).');
    }

    if (!/^\d{10}$/.test(profilePhone.trim())) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }

    setIsSavingProfile(true);
    try {
      const response = await updateProfile(profileAddress.trim(), profilePhone.trim());
      if (response && response.success) {
        toast.success('Shipping profile updated successfully!');
        setIsProfileModalOpen(false);
        
        // Resume checkout flow automatically with updated credentials
        const updatedUser = response.data;
        await proceedToRazorpay(updatedUser);
      }
    } catch (error) {
      toast.error(error.apiMessage || 'Could not save shipping profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 3. Effect hook to restore check-out automatically after redirect login authentication
  useEffect(() => {
    if (isAuthenticated && sessionStorage.getItem('pendingCheckout') === 'true') {
      sessionStorage.removeItem('pendingCheckout');
      
      // Short delay to let other state processes settle before initializing modal
      const timer = setTimeout(() => {
        handleCheckout();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  // 4. Premium checkout success receipt overlay
  if (paymentSuccessData) {
    return (
      <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] py-16 px-6 flex items-center justify-center">
        <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-md text-center flex flex-col items-center animate-fade-in">
          {/* Animated Success Icon */}
          <div className="w-16 h-16 bg-[#adc178]/20 border border-[#dde5b6] text-[#6c584c] rounded-full flex items-center justify-center mb-6 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#8c9f5e]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
            Transaction Complete
          </span>
          <h2 className="font-serif text-3xl font-medium text-[#6c584c] mt-2 mb-4">
            Thank you for your purchase
          </h2>
          <p className="text-xs text-[#8c9f5e] max-w-md font-light leading-relaxed mb-8">
            Your payment was securely verified. We are preparing your order of handcrafted items using our signature sustainable wrap.
          </p>

          {/* Premium Receipt Summary */}
          <div className="bg-[#fbfaf5]/60 border border-[#dde5b6]/60 rounded-2xl p-6 w-full text-left flex flex-col gap-4 mb-8">
            <div className="flex justify-between border-b border-[#dde5b6]/40 pb-2 text-xs">
              <span className="font-semibold text-[#8c9f5e]">Payment ID</span>
              <span className="font-mono text-[#a98467] font-bold">{paymentSuccessData.paymentId}</span>
            </div>
            <div className="flex justify-between border-b border-[#dde5b6]/40 pb-2 text-xs">
              <span className="font-semibold text-[#8c9f5e]">Razorpay Order ID</span>
              <span className="font-mono text-[#a98467]">{paymentSuccessData.orderId}</span>
            </div>
            <div className="flex justify-between border-b border-[#dde5b6]/40 pb-2 text-xs">
              <span className="font-semibold text-[#8c9f5e]">Estimated Delivery</span>
              <span className="text-[#6c584c] font-medium">Within 5-7 business days</span>
            </div>

            {/* List of items purchased */}
            <div className="flex flex-col gap-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold border-b border-[#dde5b6]/40 pb-1">
                Items Purchased
              </span>
              {paymentSuccessData.products?.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.image} alt={item.product?.title} className="w-8 h-8 rounded-lg object-cover border border-[#dde5b6]/40" />
                    <div>
                      <span className="font-semibold text-[#6c584c] line-clamp-1">{item.product?.title || 'Handcrafted Object'}</span>
                      <span className="text-[9px] text-[#8c9f5e]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-medium text-[#6c584c]">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#dde5b6]/60">
              <span className="font-serif text-sm font-semibold uppercase tracking-wider">Total Paid</span>
              <span className="text-lg font-bold text-[#a98467]">Rs.{paymentSuccessData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setPaymentSuccessData(null)}
              className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#fbfaf5] min-h-[80vh] flex flex-col items-center justify-center py-16 px-6 text-[#6c584c]">
        <div className="text-center bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-8 md:p-16 max-w-lg shadow-sm flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-[#a98467]/60 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h2 className="font-serif text-2xl font-normal mb-2">Your collection is empty</h2>
          <p className="text-xs text-[#8c9f5e] max-w-xs font-light leading-relaxed mb-8">
            You haven't added any ceramic or fiber items to your basket yet. Discover our curated catalog to begin.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 font-medium uppercase tracking-widest text-xs text-white bg-[#a98467] hover:bg-[#8c9f5e] rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
          >
           Add Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Title */}
        <div className="border-b border-[#dde5b6] pb-6">
          <h1 className="font-serif text-3xl font-medium tracking-wide">Shopping Cart</h1>
          <p className="text-xs text-[#8c9f5e] mt-1 font-light">
            You have selected {cartCount} Items{cartCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* Two-Column checkout layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => {
              const itemCategory = item.category && typeof item.category === 'object' ? item.category.name : 'Catalog';
              return (
                <div
                  key={item._id}
                  className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between"
                >
                  
                  {/* Photo & Metadata */}
                  <div className="flex gap-4 items-center">
                    <Link to={`/products/${item._id}`} className="w-16 h-16 bg-[#fbfaf5] rounded-xl overflow-hidden flex-shrink-0 border border-[#dde5b6]/40">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </Link>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#8c9f5e] font-bold">
                        {itemCategory}
                      </span>
                      <Link to={`/products/${item._id}`} className="hover:text-[#a98467] transition-colors">
                        <h4 className="text-sm font-semibold text-[#6c584c] line-clamp-1">{item.title}</h4>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-[#a98467]">Rs.{item.discountedPrice.toFixed(2)}</span>
                        {item.originalPrice > item.discountedPrice && (
                          <span className="text-[10px] text-[#8c9f5e] line-through">Rs.{item.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions split */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#dde5b6]/40">
                    
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#dde5b6] rounded-lg px-2 py-1 bg-[#fbfaf5]/40">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold hover:bg-[#adc178]/20 disabled:opacity-20 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold w-6 text-center select-none">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold hover:bg-[#adc178]/20 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price & Delete Action */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#6c584c]">
                          Rs.{(item.discountedPrice * item.quantity).toFixed(2)}
                        </span>
                        {item.originalPrice > item.discountedPrice && (
                          <span className="text-[9px] text-[#8c9f5e] font-light">
                            Saved Rs.{( (item.originalPrice - item.discountedPrice) * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1.5 hover:bg-red-700/5 text-[#8c9f5e] hover:text-red-700 transition-all rounded-lg cursor-pointer"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}

            {/* Shop Back link */}
            <div className="flex justify-between items-center mt-2 px-2">
              <Link to="/products" className="text-xs uppercase tracking-widest font-semibold text-[#a98467] hover:text-[#8c9f5e] transition-colors">
                ← Back to Catalog
              </Link>
              <button
                onClick={clearCart}
                className="text-xs uppercase tracking-widest font-semibold text-red-800/80 hover:text-red-900 cursor-pointer"
              >
                Clear Cart Items
              </button>
            </div>
          </div>

          {/* Right: Summary panel */}
          <div className="lg:col-span-1 bg-[#f0ead2] border border-[#dde5b6] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-serif text-base font-semibold tracking-wider uppercase pb-2 border-b border-[#dde5b6]/40">
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between text-[#8c9f5e] font-light">
                <span>Original Subtotal</span>
                <span>Rs.{originalTotal.toFixed(2)}</span>
              </div>
              
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Discounted price</span>
                  <span>−Rs.{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#8c9f5e] font-light">
                <span>Standard Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toFixed(2)}`}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-[#8c9f5e] font-light -mt-2">
                  Add <span className="font-semibold">Rs.{(1500 - cartTotal).toFixed(2)}</span> more to unlock free shipping!
                </p>
              )}
            </div>

            <hr className="border-[#dde5b6]" />

            <div className="flex justify-between items-baseline">
              <span className="font-serif text-sm font-semibold uppercase tracking-wider">Estimated Total</span>
              <span className="text-xl font-bold text-[#a98467]">Rs.{finalTotal.toFixed(2)}</span>
            </div>

            {/* Check-out Action Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="w-full py-3.5 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckoutLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Loading checkout...
                </>
              ) : (
                'Checkout Order'
              )}
            </button>

            <div className="text-[10px] text-[#8c9f5e] font-light text-center leading-relaxed">
              We package your ceramic and linen objects with carbon-neutral recycled materials. Returns are accepted within 30 days.
            </div>

          </div>

        </div>

      </div>

      {/* Checkout Validation Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6c584c]/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-6 md:p-8 shadow-lg max-w-md w-full flex flex-col relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#adc178]/25 text-[#8c9f5e] hover:text-[#6c584c] rounded-lg transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold mb-1">
              Shipping Credentials Required
            </span>
            <h3 className="font-serif text-xl font-medium tracking-wide mb-2 text-[#6c584c]">
              Complete Your Profile
            </h3>
            <p className="text-xs text-[#8c9f5e] font-light leading-relaxed mb-6">
              Please provide your full shipping address and contact number to proceed with the secure checkout process.
            </p>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
                  Delivery Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-[#fbfaf5]/60 border border-[#dde5b6] rounded-xl px-3 py-2.5 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/40 font-mono"
                  required
                />
                <span className="text-[9px] text-[#8c9f5e] font-light">
                  Must be a valid 10-digit mobile number.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#6c584c]">
                  Full Shipping Address
                </label>
                <textarea
                  placeholder="House No, Street, Landmark, City, State - Pincode"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  rows="3"
                  className="bg-[#fbfaf5]/60 border border-[#dde5b6] rounded-xl px-3 py-2.5 text-xs text-[#6c584c] focus:ring-1 focus:ring-[#a98467] focus:outline-none placeholder-[#8c9f5e]/40 resize-none leading-relaxed"
                  required
                />
                <span className="text-[9px] text-[#8c9f5e] font-light">
                  Provide detailed address for reliable delivery (min 10 characters).
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-3.5 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving details...
                  </>
                ) : (
                  'Save & Proceed to Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
