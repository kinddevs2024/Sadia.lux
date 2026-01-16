import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { trackEvent } from '../utils/analytics';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = user?.id ? `cart_${user.id}` : 'cart_guest';

  useEffect(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate that parsedCart is an array
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn('Invalid cart data in localStorage, resetting cart');
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      try {
      localStorage.removeItem(storageKey);
      } catch (e) {
        console.error('Error clearing corrupted cart data:', e);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes (but only after initialization)
    if (!isInitialized) return;

    try {
      if (cart.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } else {
        // Remove from localStorage if cart is empty to save space
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Clearing old cart data.');
        try {
          localStorage.removeItem(storageKey);
          // Try saving again
          if (cart.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(cart));
          }
        } catch (e) {
          console.error('Error after clearing localStorage:', e);
        }
      }
    }
  }, [cart, isInitialized, storageKey]);

  const addToCart = (product, size, quantity = 1) => {
    // Check inventory availability
    const inventory = Array.isArray(product?.inventory) ? product.inventory : [];
    const inventoryItem = inventory.find((inv) => inv.size === size);
    
    if (inventoryItem) {
      // Check if requested quantity exceeds available stock
      const existingItem = cart.find(
        (item) => item.productId === product.id && item.size === size
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const requestedQuantity = currentQuantity + quantity;
      
      if (requestedQuantity > inventoryItem.quantity) {
        const available = inventoryItem.quantity - currentQuantity;
        if (available <= 0) {
          alert(`Извините, товар размера ${size} закончился на складе.`);
          return;
        }
        alert(`В наличии только ${inventoryItem.quantity} шт. размера ${size}. Вы можете заказать максимум ${available} шт.`);
        quantity = available; // Limit to available quantity
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id && item.size === size
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newCart = [
        ...prevCart,
        {
          productId: product.id,
          product,
          size,
          quantity,
          price: product.price,
        },
      ];
      return newCart;
    });

    trackEvent("add_to_cart", {
      product_id: product.id,
      size,
      quantity,
      price: product.price,
      source: "online",
      user_id: user?.id,
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    // Check inventory availability when updating quantity
    const cartItem = cart.find(
      (item) => item.productId === productId && item.size === size
    );
    
    if (cartItem && cartItem.product) {
      const inventory = Array.isArray(cartItem.product?.inventory) ? cartItem.product.inventory : [];
      const inventoryItem = inventory.find((inv) => inv.size === size);
      
      if (inventoryItem && quantity > inventoryItem.quantity) {
        alert(`В наличии только ${inventoryItem.quantity} шт. размера ${size}.`);
        quantity = inventoryItem.quantity; // Limit to available quantity
      }
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

