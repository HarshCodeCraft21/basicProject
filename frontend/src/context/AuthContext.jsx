import React, { createContext, useReducer, useEffect } from 'react';
import API from '../services/api';


export const AuthContext = createContext();


const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};


const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};


export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  
  const checkAuthStatus = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data && response.data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
        return response.data;
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  
  const signup = async (name, email, password, role) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.post('/auth/signup', { name, email, password, role });
      if (response.data && response.data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
        return response.data;
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await API.post('/auth/logout');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('[Logout Error]:', error.message);
    }
  };

  const updateProfile = async (address, phone) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.put('/auth/profile', { address, phone });
      if (response.data && response.data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
        return response.data;
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        login,
        signup,
        logout,
        updateProfile,
        checkAuth: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
