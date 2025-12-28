import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => adminService.getAnalytics(),
  });

  const analytics = analyticsData?.data?.data || [];
  const totals = analyticsData?.data?.totals || {};

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Аналитика</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Общий доход
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.totalRevenue?.toFixed(2) || '0.00'} сум
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Всего заказов
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Товаров продано
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.productsSold || 0}
          </p>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Источник
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Доход
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Заказы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Товаров продано
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Загрузка...
                </td>
              </tr>
            ) : analytics.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Данные аналитики не найдены
                </td>
              </tr>
            ) : (
              analytics.map((item) => (
                <tr key={`${item.date}-${item.source}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(item.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.source === 'ONLINE' ? 'Онлайн' : item.source === 'POS' ? 'Касса' : item.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.totalRevenue.toFixed(2)} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.productsSold}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;

