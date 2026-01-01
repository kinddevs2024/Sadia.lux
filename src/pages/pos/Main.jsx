import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { posService } from '../../services/pos.service';
import { Analytics } from '@vercel/analytics/react';

const POSMain = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['pos-products', selectedCategory, searchQuery],
    queryFn: () =>
      productService.getProducts({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100,
      }),
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => posService.createOrder(orderData),
    onSuccess: (data) => {
      navigate(`/pos/payment/${data.data.id}`);
    },
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.data?.data || [];

  const addToCart = (product, size, quantity = 1) => {
    const inventory = product.inventory?.find((inv) => inv.size === size);
    if (!inventory || inventory.quantity < quantity) {
      alert('Insufficient inventory');
      return;
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

      return [
        ...prevCart,
        {
          productId: product.id,
          product,
          size,
          quantity,
          price: product.price,
        },
      ];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      items: orderItems,
      paymentMethod: 'TERMINAL',
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Search Bar */}
      <div className="bg-white p-4 border-b">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="w-48 bg-gray-200 overflow-y-auto p-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left p-3 mb-2 rounded ${
              selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left p-3 mb-2 rounded ${
                selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Center - Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => {
                const sizes = product.inventory?.map((inv) => inv.size) || [];
                const imageUrl = product.images?.[0]?.url;
                const mainImage = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`) : '';

                return (
                  <div
                    key={product.id}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      if (sizes.length === 1) {
                        addToCart(product, sizes[0]);
                      } else {
                        // Show size selection modal or quick add
                        const size = prompt(`Select size (${sizes.join(', ')}):`);
                        if (size && sizes.includes(size)) {
                          addToCart(product, size);
                        }
                      }
                    }}
                  >
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Нет</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                    <p className="text-blue-600 font-bold">{product.price.toFixed(2)} UZS</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar - Cart */}
        <div className="w-80 bg-gray-100 border-l flex flex-col">
          <div className="p-4 border-b bg-white">
            <h2 className="text-xl font-bold">Cart</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="bg-white rounded p-3 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                    <p className="text-xs text-blue-600">{item.price.toFixed(2)} UZS</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-white">
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total:</span>
              <span>{getCartTotal().toFixed(2)} UZS</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createOrderMutation.isPending ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default POSMain;

