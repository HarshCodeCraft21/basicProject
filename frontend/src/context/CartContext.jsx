import React, { createContext, useReducer, useEffect } from 'react';


export const CartContext = createContext();


const initialState = {
  items: JSON.parse(localStorage.getItem('harsh_cart_items')) || [],
};


const cartReducer = (state, action) => {
  let updatedItems = [];

  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.items.findIndex(
        (item) => item._id === action.payload._id
      );

      if (existingItemIndex > -1) {
        
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        
        updatedItems = [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ];
      }
      return { ...state, items: updatedItems };

    case 'REMOVE_FROM_CART':
      updatedItems = state.items.filter((item) => item._id !== action.payload);
      return { ...state, items: updatedItems };

    case 'UPDATE_QUANTITY':
      updatedItems = state.items.map((item) =>
        item._id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return { ...state, items: updatedItems };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};


export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  
  useEffect(() => {
    localStorage.setItem('harsh_cart_items', JSON.stringify(state.items));
  }, [state.items]);

  
  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = state.items.reduce(
    (sum, item) => sum + (item.discountedPrice || item.originalPrice) * item.quantity,
    0
  );

  const originalTotal = state.items.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const totalSavings = originalTotal - cartTotal;

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        cartCount,
        cartTotal,
        originalTotal,
        totalSavings,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
