import { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_agri_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('smart_agri_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.pricePerUnit,
          unit: product.unit || 'kg',
          stock: product.stock,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          isOrganic: product.isOrganic,
          farmerId: product.farmerId?._id || product.farmerId,
          farmerName: product.farmerInfo?.name || 'Local Farmer',
          farmName: product.farmerInfo?.farmName || "Farmer's Field",
          quantity: Math.min(quantity, product.stock)
        }
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(newQty, item.stock) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Group items by farmer
  const groupedByFarmer = cartItems.reduce((acc, item) => {
    const fId = item.farmerId || 'unknown';
    if (!acc[fId]) {
      acc[fId] = {
        farmerId: fId,
        farmerName: item.farmerName,
        farmName: item.farmName,
        items: [],
        subtotal: 0
      };
    }
    acc[fId].items.push(item);
    acc[fId].subtotal += item.price * item.quantity;
    return acc;
  }, {});

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        groupedByFarmer,
        totalItemsCount,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

