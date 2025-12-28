import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import CartItem from '../../components/public/CartItem';
import OrderList from '../../components/public/OrderList';

const Cart = () => {
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const { isAuthenticated } = useAuth();

  // Получаем заказы пользователя для проверки незавершенных
  const { data: ordersData } = useQuery({
    queryKey: ['userOrders'],
    queryFn: () => orderService.getUserOrders(),
    enabled: isAuthenticated,
  });

  const orders = ordersData?.data || [];
  // Проверяем, есть ли незавершенные заказы (PENDING или PAID)
  const hasActiveOrders = orders.some(
    order => order.status === 'PENDING' || order.status === 'PAID'
  );

  // Если корзина пуста и нет активных незавершенных заказов, показываем прошлые заказы
  if (cart.length === 0 && !hasActiveOrders) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Корзина</h1>
          
          {isAuthenticated && orders.length > 0 ? (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  Ваша корзина пуста
                </p>
                <Link
                  to="/shop"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Продолжить покупки
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Мои заказы</h2>
                <OrderList />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                Ваша корзина пуста
              </p>
              <Link
                to="/shop"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Продолжить покупки
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Корзина</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem key={`${item.productId}-${item.size}`} item={item} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Итого заказа
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Товары ({getCartItemCount()})</span>
                  <span>{getCartTotal().toFixed(2)} сум</span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>Всего</span>
                  <span>{getCartTotal().toFixed(2)} сум</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-primary text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Оформить заказ
              </Link>
              <Link
                to="/shop"
                className="block w-full mt-4 text-center text-primary hover:text-primary-dark transition-colors"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="container mx-auto px-4 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Мои заказы</h2>
            <OrderList limit={5} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

