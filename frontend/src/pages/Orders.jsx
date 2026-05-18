import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/payments/my-orders');
      if (response.data && response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('[Fetch Orders Failure]:', error);
      toast.error(error.apiMessage || 'Could not fetch your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();

    const socketBaseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://basicproject-rjat.onrender.com';

    const socket = io(socketBaseURL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.io Client]: Connected to server');
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('[Socket.io Client]: Received real-time order status update:', updatedOrder);
      
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === updatedOrder._id ? { ...o, orderStatus: updatedOrder.orderStatus } : o))
      );

      toast.success(`Order #${updatedOrder.orderId} status has been updated to "${updatedOrder.orderStatus}"!`, {
        duration: 5000,
        icon: '📦',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const steps = ['Order Received', 'Packed', 'Dispatched', 'Delivered'];

  const getStepStatus = (currentStatus, stepIndex) => {
    const activeIndex = steps.indexOf(currentStatus);
    if (activeIndex === -1) return 'pending';
    if (currentStatus === 'Delivered') return 'completed';
    if (stepIndex < activeIndex) return 'completed';
    if (stepIndex === activeIndex) return 'current';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
          <div className="h-6 w-48 bg-[#dde5b6]/60 rounded-lg"></div>
          <div className="h-3 w-64 bg-[#dde5b6]/40 rounded-lg mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#dde5b6]/35 border border-[#dde5b6]/50 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf5] min-h-screen text-[#6c584c] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto flex flex-col">
        <div className="flex flex-col gap-1.5 mb-8">
          <span className="text-[10px] uppercase tracking-widest text-[#8c9f5e] font-bold">
            Purchase History Ledger
          </span>
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-wide">
              My Orders
            </h1>
            <button
              onClick={fetchMyOrders}
              className="p-2 hover:bg-[#adc178]/20 text-[#8c9f5e] hover:text-[#6c584c] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
              title="Refresh ledger"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
          <p className="text-xs text-[#8c9f5e] font-light">
            Review detailed invoice manifests, real-time shipment updates, and transaction receipts.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl p-12 text-center flex flex-col items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-[#adc178]/20 border border-[#dde5b6] rounded-full flex items-center justify-center text-[#8c9f5e]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-serif text-lg font-medium text-[#6c584c]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#8c9f5e] font-light max-w-sm leading-relaxed">
                Explore our curated catalog of eco-conscious handcrafted pottery, linens, and minimalist home design essentials.
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-[#a98467] hover:bg-[#8c9f5e] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-sm"
            >
              Shop Curated Collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order._id];
              const orderDate = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order._id}
                  className="bg-[#f0ead2] border border-[#dde5b6] rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:border-[#adc178]/50 flex flex-col"
                >
                  <div
                    onClick={() => toggleExpand(order._id)}
                    className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#adc178]/10 transition-all select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-12 h-12 border border-[#dde5b6] rounded-xl overflow-hidden bg-white shrink-0">
                        {order.products?.[0]?.product?.image ? (
                          <img
                            src={order.products[0].product.image}
                            alt="product preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#fbfaf5] flex items-center justify-center text-[10px] font-bold text-[#8c9f5e]">H</div>
                        )}
                        {order.products?.length > 1 && (
                          <span className="absolute bottom-0 right-0 bg-[#a98467] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                            +{order.products.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-[#8c9f5e] uppercase">
                          ID: {order.orderId}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8c9f5e] font-light">{orderDate}</span>
                          <span className="text-[10px] text-[#8c9f5e]">&bull;</span>
                          <span className="text-xs font-semibold text-[#6c584c]">
                            {order.products?.reduce((acc, p) => acc + p.quantity, 0)} {order.products?.reduce((acc, p) => acc + p.quantity, 0) === 1 ? 'Item' : 'Items'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t border-[#dde5b6]/30 md:border-none pt-3 md:pt-0">
                      <div className="flex flex-col md:items-end gap-0.5">
                        <span className="text-[8px] uppercase tracking-wider text-[#8c9f5e]">Paid Amount</span>
                        <span className="text-sm font-bold text-[#a98467]">Rs.{order.totalAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-xl ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-[#adc178]/25 text-[#6c584c]'
                              : order.orderStatus === 'Dispatched'
                              ? 'bg-[#a98467]/20 text-[#a98467]'
                              : 'bg-[#a98467]/10 text-[#6c584c]/85'
                          }`}
                        >
                          {order.orderStatus}
                        </span>

                        <span className={`text-[#8c9f5e] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6 md:px-6 border-t border-[#dde5b6]/40 bg-[#fbfaf5]/40 flex flex-col gap-6 animate-fade-in">
                      <div className="pt-6 border-b border-[#dde5b6]/30 pb-6">
                        <div className="relative flex items-center justify-between w-full max-w-lg mx-auto">
                          <div className="absolute left-0 right-0 top-3.5 h-[2px] bg-[#dde5b6]/60 z-0"></div>
                          <div
                            className="absolute left-0 top-3.5 h-[2px] bg-[#8c9f5e] transition-all duration-500 z-0"
                            style={{
                              width: `${(steps.indexOf(order.orderStatus) / (steps.length - 1)) * 100}%`,
                            }}
                          ></div>

                          {steps.map((step, idx) => {
                            const status = getStepStatus(order.orderStatus, idx);
                            return (
                              <div key={step} className="flex flex-col items-center z-10 shrink-0">
                                <div
                                  className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                    status === 'completed'
                                      ? 'bg-[#8c9f5e] border-[#8c9f5e] text-white shadow-sm'
                                      : status === 'current'
                                      ? 'bg-[#f0ead2] border-[#8c9f5e] text-[#8c9f5e] ring-2 ring-[#8c9f5e]/20 font-bold'
                                      : 'bg-[#fbfaf5] border-[#dde5b6] text-[#8c9f5e]/40'
                                  }`}
                                >
                                  {status === 'completed' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                  ) : (
                                    <span className="text-[10px]">{idx + 1}</span>
                                  )}
                                </div>
                                <span
                                  className={`text-[9px] uppercase tracking-wider font-bold mt-2.5 ${
                                    status === 'completed' || status === 'current'
                                      ? 'text-[#6c584c]'
                                      : 'text-[#8c9f5e]/55 font-normal'
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#8c9f5e]">Ordered Items</h4>
                        <div className="flex flex-col border border-[#dde5b6]/50 bg-white/50 rounded-2xl overflow-hidden divide-y divide-[#dde5b6]/30">
                          {order.products?.map((item) => (
                            <div key={item._id} className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={item.product?.image || 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=200'}
                                  alt={item.product?.title}
                                  className="w-12 h-12 object-cover border border-[#dde5b6]/40 rounded-lg shrink-0 bg-white"
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold text-[#6c584c]">
                                    {item.product?.title || 'Handcrafted Design Item'}
                                  </span>
                                  <span className="text-[10px] text-[#8c9f5e] font-light">
                                    Quantity: {item.quantity} &times; Rs.{item.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#a98467] font-mono">
                                Rs.{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2.5">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#8c9f5e]">Shipping Address</h4>
                          <div className="bg-[#f0ead2]/40 border border-[#dde5b6]/40 rounded-2xl p-4 flex flex-col text-xs leading-relaxed">
                            <span className="font-bold text-[#6c584c] mb-1">{order.user?.name || 'Valued Customer'}</span>
                            <p className="text-[#6c584c] font-light">{order.shippingAddress}</p>
                            <div className="mt-3 text-[10px] font-bold text-[#8c9f5e] uppercase tracking-wider">
                              Phone: <span className="font-mono text-[#6c584c] font-bold tracking-normal">{order.shippingPhone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#8c9f5e]">Transaction Details</h4>
                          <div className="bg-[#f0ead2]/40 border border-[#dde5b6]/40 rounded-2xl p-4 flex flex-col gap-2 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-[#8c9f5e] uppercase text-[9px] font-bold tracking-wider shrink-0">Razorpay Order ID:</span>
                              <span className="text-[#6c584c] text-right truncate pl-2">{order.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8c9f5e] uppercase text-[9px] font-bold tracking-wider shrink-0">Razorpay Payment ID:</span>
                              <span className="text-[#6c584c] text-right truncate pl-2">{order.paymentId || 'Pending'}</span>
                            </div>
                            <div className="flex justify-between border-t border-[#dde5b6]/30 pt-2 font-sans text-xs">
                              <span className="text-[#8c9f5e] uppercase text-[9px] font-bold tracking-wider shrink-0">Subtotal:</span>
                              <span className="text-[#6c584c] font-medium">Rs.{(order.totalAmount - order.shippingFee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-sans text-xs">
                              <span className="text-[#8c9f5e] uppercase text-[9px] font-bold tracking-wider shrink-0">Shipping:</span>
                              <span className="text-[#8c9f5e] font-semibold">{order.shippingFee === 0 ? 'FREE' : `Rs.${order.shippingFee}`}</span>
                            </div>
                            <div className="flex justify-between font-sans text-xs border-t border-[#dde5b6]/30 pt-1.5 font-bold">
                              <span className="text-[#6c584c] uppercase text-[9px] tracking-wider shrink-0">Total Price Paid:</span>
                              <span className="text-[#a98467] text-sm">Rs.{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
