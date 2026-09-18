import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartData, Product } from '../types';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartData;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const defaultCart: CartData = {
  user_id: 'USR-101',
  items: [],
  subtotal: 0,
  delivery_charge: 0,
  discount: 0,
  total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.user_id || 'USR-101';
  const [cart, setCart] = useState<CartData>(defaultCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.get(userId);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const res = await cartService.add(userId, product.product_id, quantity);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await cartService.update(itemId, userId, quantity);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to update cart', err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await cartService.remove(itemId, userId);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, refreshCart: fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
