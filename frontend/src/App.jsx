import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';


import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';


import Navbar from './components/common/Navbar';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';


import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#fbfaf5] font-sans antialiased text-[#6c584c]">
            
            <Navbar />

            
            <main className="flex-grow">
              <Routes>
                
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                
                
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>

            
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#f0ead2',
                  color: '#6c584c',
                  border: '1px solid #dde5b6',
                  borderRadius: '16px',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  letterSpacing: '0.025em',
                },
              }}
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
