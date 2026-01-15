import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { posService } from '../../services/pos.service';

const POSSales = () => {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    date.setHours(0, 0, 0, 0);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const { data: ordersData, isLoading, error: ordersError } = useQuery({
    queryKey: ['pos-orders', user?.id, dateFrom, dateTo],
    queryFn: () => posService.getOrders({
      cashierId: user?.id,
      dateFrom,
      dateTo,
      limit: 1000
    }),
    enabled: !!user?.id,
    onError: (err) => {
      console.error("Failed to load orders:", err);
    },
  });

  // Extract orders array from API response
  // api.get() returns axios response object: { data: { success: true, data: { data: [...], meta: {...} } }, status, ... }
  // So ordersData = { data: { success: true, data: { data: [...], meta: {...} } } }
  let orders = [];
  
  if (ordersError) {
    console.error("Orders query error:", ordersError);
    orders = [];
  } else if (ordersData?.data) {
    // Primary extraction: ordersData.data.data.data (axios response -> body -> data -> data array)
    if (ordersData.data.data?.data && Array.isArray(ordersData.data.data.data)) {
      orders = ordersData.data.data.data;
    }
    // Fallback: check if ordersData.data.data is directly an array
    else if (ordersData.data.data && Array.isArray(ordersData.data.data)) {
      orders = ordersData.data.data;
    }
    // Fallback: check if ordersData.data is directly an array
    else if (Array.isArray(ordersData.data)) {
      orders = ordersData.data;
    }
    // If still empty, log for debugging
    else {
      console.warn('Could not extract orders. Structure:', {
        hasData: !!ordersData.data,
        hasDataData: !!ordersData.data.data,
        hasDataDataData: !!ordersData.data.data?.data,
        isDataArray: Array.isArray(ordersData.data),
        isDataDataArray: Array.isArray(ordersData.data.data),
        isDataDataDataArray: Array.isArray(ordersData.data.data?.data),
        fullData: ordersData
      });
      orders = [];
    }
  }
  
  // Ensure orders is always an array
  if (!Array.isArray(orders)) {
    orders = [];
  }

  const totalRevenue = Array.isArray(orders) 
    ? orders.reduce((sum, order) => sum + (order.total || 0), 0) 
    : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
  };

  // Debug info
  console.log("Sales page - User ID:", user?.id);
  console.log("Sales page - Date range:", dateFrom, "to", dateTo);
  console.log("Sales page - Orders count:", orders.length);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Мои продажи</h1>
        {user?.id && (
          <p className="text-sm text-gray-500 mb-4">Кассир: {user.email} (ID: {user.id})</p>
        )}
        
        {/* Date Filters */}
        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">С</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">По</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setDateFrom(`${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`);
              setDateTo(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Текущий месяц
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Всего продаж</div>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Общая выручка</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      ) : !Array.isArray(orders) || orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">Нет продаж за выбранный период</p>
          <p className="text-sm">Период: {dateFrom} - {dateTo}</p>
          {user?.id && (
            <p className="text-xs mt-2 text-gray-400">Cashier ID: {user.id}</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер заказа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Способ оплаты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(orders) && orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order.receipt_number || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod === 'CASH' ? 'Наличные' :
                       order.paymentMethod === 'TERMINAL' ? 'Терминал' :
                       order.paymentMethod === 'TRANSFER' ? 'Перевод' :
                       order.paymentMethod || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'COMPLETED' ? 'bg-primary-light text-primary-dark' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PAID' ? 'Оплачен' :
                         order.status === 'PENDING' ? 'В ожидании' :
                         order.status === 'COMPLETED' ? 'Завершен' :
                         order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSales;
