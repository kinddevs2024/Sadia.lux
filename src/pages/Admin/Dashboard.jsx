import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { orderService } from '../../services/order.service';
import { Analytics } from '@vercel/analytics/react';

const Dashboard = () => {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => adminService.getRecentOrders(5),
  });

  const stats = statsData?.data || { today: {}, allTime: {} };
  const recentOrders = recentOrdersData?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Панель управления</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Доход за сегодня
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.today?.revenue?.toFixed(2) || '0.00'} сум
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Заказов за сегодня
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.today?.orders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Общий доход
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.allTime?.revenue?.toFixed(2) || '0.00'} сум
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Всего заказов
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.allTime?.orders || 0}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Недавние заказы</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Номер заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Всего
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status === 'PENDING' ? 'Ожидает оплаты' :
                       order.status === 'PAID' ? 'Оплачен' :
                       order.status === 'COMPLETED' ? 'Завершен' :
                       order.status === 'CANCELLED' ? 'Отменен' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.total.toFixed(2)} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default Dashboard;

