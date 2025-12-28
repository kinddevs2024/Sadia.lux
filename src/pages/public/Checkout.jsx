import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import { couponService } from '../../services/coupon.service';
import CompactCartItem from '../../components/public/CompactCartItem';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'PAYME',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Заполнить данные из профиля пользователя, если он авторизован
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || '';
      setFormData((prev) => ({
        ...prev,
        name: fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      clearCart();
      navigate(`/order/${data.data.orderNumber}`);
    },
    onError: (error) => {
      alert('Не удалось создать заказ. Пожалуйста, попробуйте снова.');
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Ваша корзина пуста');
      return;
    }

    // Проверка: email или phone должны быть заполнены
    if (!formData.email && !formData.phone) {
      alert('Пожалуйста, укажите либо электронную почту, либо номер телефона');
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      items: orderItems,
      paymentMethod: formData.paymentMethod,
      couponCode: appliedCoupon?.code || null,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateCouponMutation = useMutation({
    mutationFn: (code) => couponService.validateCoupon(code),
    onSuccess: (response) => {
      // API возвращает { success: true, data: { valid: true, coupon: {...} } }
      // couponService возвращает response.data, то есть { success: true, data: {...} }
      const couponData = response?.data?.coupon;
      if (couponData) {
        setAppliedCoupon(couponData);
        setCouponError('');
        setCouponCode(''); // Очистить поле ввода после успешного применения
      } else {
        setCouponError('Ошибка при применении купона');
        setAppliedCoupon(null);
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Купон недействителен';
      setCouponError(errorMessage);
      setAppliedCoupon(null);
    },
  });

  const handleApplyCoupon = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Предотвратить всплытие события
    }
    if (!couponCode.trim()) {
      setCouponError('Введите код купона');
      return;
    }
    validateCouponMutation.mutate(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const total = getCartTotal();
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return (total * appliedCoupon.discount) / 100;
    } else {
      return appliedCoupon.discount;
    }
  };

  const getFinalTotal = () => {
    const total = getCartTotal();
    const discount = calculateDiscount();
    return Math.max(0, total - discount);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Ваша корзина пуста
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Оформление заказа</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Контактная информация
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ФИО *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email или Телефон *
                    </label>
                    <input
                      type="text"
                      name="contact"
                      placeholder="Email (example@mail.com) или телефон (+998 XX XXX XX XX)"
                      value={formData.email || formData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Проверяем, является ли значение email или телефоном
                        const isEmail = value.includes('@');
                        if (isEmail) {
                          setFormData({ ...formData, email: value, phone: '' });
                        } else {
                          setFormData({ ...formData, phone: value, email: '' });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    * Укажите email или номер телефона (один из них обязателен)
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Адрес *
                    </label>
                    <textarea
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Способ оплаты
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYME"
                        checked={formData.paymentMethod === 'PAYME'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">Payme</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Оплата через Payme</div>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CLICK"
                        checked={formData.paymentMethod === 'CLICK'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">Click</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Оплата через Click</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Промокод
                </h2>
                {appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-semibold text-green-800 dark:text-green-300">
                          Промокод применен: {appliedCoupon.code}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Скидка: {appliedCoupon.discountType === 'PERCENTAGE' 
                            ? `${appliedCoupon.discount}%` 
                            : `${appliedCoupon.discount} сум`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon(e);
                          }
                        }}
                        placeholder="Введите промокод"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validateCouponMutation.isPending || !couponCode.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validateCouponMutation.isPending ? 'Проверка...' : 'Применить'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {createOrderMutation.isPending ? 'Обработка...' : 'Оформить заказ'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Итого заказа
              </h2>
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <CompactCartItem key={`${item.productId}-${item.size}`} item={item} />
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Товары</span>
                  <span>{getCartTotal().toFixed(2)} сум</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Скидка ({appliedCoupon.code})</span>
                    <span>-{calculateDiscount().toFixed(2)} сум</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Всего</span>
                  <span>{getFinalTotal().toFixed(2)} сум</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

