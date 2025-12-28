import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { productService } from '../../services/product.service';
import { exchangeService } from '../../services/exchange.service';

const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Ожидает оплаты',
    PAID: 'Оплачен',
    CANCELLED: 'Отменен',
    COMPLETED: 'Завершен',
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

const OrderCard = ({ order, orderItems = [], products = [], onCancelRequest }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const orderProducts = orderItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const canCancel = order.status !== 'CANCELLED' && order.status !== 'COMPLETED';

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert('Пожалуйста, укажите причину отмены заказа');
      return;
    }

    setIsRequesting(true);
    try {
      await onCancelRequest(order.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      alert('Запрос на отмену заказа отправлен. Мы рассмотрим его в ближайшее время.');
    } catch (error) {
      console.error('Error creating cancel request:', error);
      alert('Ошибка при отправке запроса на отмену заказа');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Заказ #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {Number(order.total).toFixed(2)} сум
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-3">
            {orderProducts.map((item) => {
              const imageUrl = item.product?.images?.[0]?.url;
              const mainImage = imageUrl ? getImageUrl(imageUrl) : '';

              return (
                <div key={item.id} className="flex items-center gap-3">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Нет</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Размер: {item.size} × {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Number(item.price).toFixed(2)} сум
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {canCancel && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Запросить отмену заказа
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно для запроса отмены */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Запрос на отмену заказа
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Заказ #{order.orderNumber}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Причина отмены *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Укажите причину отмены заказа..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isRequesting}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isRequesting || !cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? 'Отправка...' : 'Отправить запрос'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OrderList = ({ limit = null }) => {
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['userOrders'],
    queryFn: () => orderService.getUserOrders(),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts({ limit: 1000 }),
    enabled: !!ordersData,
  });

  const [ordersWithItems, setOrdersWithItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const orders = ordersData?.data || [];
  const displayedOrders = limit ? orders.slice(0, limit) : orders;
  const products = productsData?.data?.data || [];

  const createCancelRequestMutation = useMutation({
    mutationFn: ({ orderId, reason }) => 
      exchangeService.createExchange({
        orderId,
        reason,
        type: 'CANCELLATION',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['userOrders']);
    },
  });

  const handleCancelRequest = async (orderId, reason) => {
    await createCancelRequestMutation.mutateAsync({ orderId, reason });
  };

  useEffect(() => {
    if (displayedOrders.length === 0) {
      setOrdersWithItems([]);
      return;
    }

    let isCancelled = false;
    setIsLoadingItems(true);
    
    Promise.all(
      displayedOrders.map(async (order) => {
        try {
          const res = await orderService.getOrder(order.id);
          return {
            ...order,
            items: res.data?.items || [],
          };
        } catch (error) {
          console.error(`Error loading order ${order.id}:`, error);
          return {
            ...order,
            items: [],
          };
        }
      })
    ).then((ordersWithItemsData) => {
      if (!isCancelled) {
        setOrdersWithItems(ordersWithItemsData);
        setIsLoadingItems(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [displayedOrders.map(o => o.id).join(',')]);

  if (ordersLoading || isLoadingItems) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Загрузка заказов...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">У вас пока нет заказов</p>
      </div>
    );
  }

  return (
    <div>
      {ordersWithItems.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          orderItems={order.items || []}
          products={products}
          onCancelRequest={handleCancelRequest}
        />
      ))}
    </div>
  );
};

export default OrderList;

