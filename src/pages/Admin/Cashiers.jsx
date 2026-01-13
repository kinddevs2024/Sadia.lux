import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

const AdminCashiers = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCashierId, setSelectedCashierId] = useState(null);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['cashier-stats', dateFrom, dateTo, selectedCashierId],
    queryFn: () => adminService.getCashierStats({
      dateFrom,
      dateTo,
      cashierId: selectedCashierId || undefined
    }),
  });

  const cashiers = statsData?.data?.cashiers || [];
  const summary = statsData?.data?.summary || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' сум';
  };

  const handleCashierClick = (cashierId) => {
    setSelectedCashierId(selectedCashierId === cashierId ? null : cashierId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Статистика кассиров</h1>
        
        {/* Date Filters */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">С</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">По</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          {selectedCashierId && (
            <div className="flex items-end">
              <button
                onClick={() => setSelectedCashierId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Сбросить фильтр
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Активных кассиров</div>
            <div className="text-2xl font-bold">{summary.totalCashiers || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Всего продаж</div>
            <div className="text-2xl font-bold">{summary.totalOrders || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Общая выручка</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalRevenue || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Cashiers List */}
      {isLoading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : cashiers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет данных за выбранный период
        </div>
      ) : (
        <div className="space-y-4">
          {cashiers.map((cashier) => (
            <div
              key={cashier.cashierId}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleCashierClick(cashier.cashierId)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{cashier.cashierName}</h3>
                    <p className="text-sm text-gray-500">{cashier.cashierEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Продаж: {cashier.totalOrders}</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(cashier.totalRevenue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details (Expandable) */}
              {selectedCashierId === cashier.cashierId && (
                <div className="border-t bg-gray-50 p-4">
                  <h4 className="font-semibold mb-3">Детализация по товарам:</h4>
                  {cashier.productStats && cashier.productStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                              Товар
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">
                              Количество
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">
                              Выручка
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cashier.productStats.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{product.productName}</td>
                              <td className="px-4 py-2 text-sm text-right">{product.quantity}</td>
                              <td className="px-4 py-2 text-sm font-medium text-right">
                                {formatCurrency(product.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Нет данных по товарам</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCashiers;
