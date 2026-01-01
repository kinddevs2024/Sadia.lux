import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeService } from '../../services/exchange.service';
import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

const AdminExchanges = () => {
  const queryClient = useQueryClient();
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: exchangesData, isLoading } = useQuery({
    queryKey: ['exchanges'],
    queryFn: () => exchangeService.getAllExchanges(),
  });

  // Фильтруем только запросы на отмену заказов
  const exchanges = (exchangesData?.data || []).filter(ex => ex.type === 'CANCELLATION');

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => exchangeService.updateExchangeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['exchanges']);
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['userOrders']);
      setSelectedExchange(null);
      setNewStatus('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => exchangeService.deleteExchange(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['exchanges']);
    },
  });


  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const handleUpdateStatus = () => {
    if (selectedExchange && newStatus) {
      updateStatusMutation.mutate({ id: selectedExchange.id, status: newStatus });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить этот запрос на обмен?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>;
  }

  return (
    <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Запросы на отмену заказов
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Номер заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Причина
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {exchanges.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Запросов на отмену пока нет
                  </td>
                </tr>
              ) : (
                exchanges.map((exchange) => (
                  <tr key={exchange.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {exchange.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {exchange.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          exchange.status
                        )} dark:bg-opacity-20`}
                      >
                        {exchange.status === 'PENDING' ? 'Ожидает' :
                         exchange.status === 'APPROVED' ? 'Одобрено' :
                         exchange.status === 'REJECTED' ? 'Отклонено' :
                         exchange.status === 'COMPLETED' ? 'Завершено' : exchange.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exchange.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedExchange(exchange)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Управление
                      </button>
                      <button
                        onClick={() => handleDelete(exchange.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedExchange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Обновить статус отмены
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Номер заказа
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                  {selectedExchange.orderId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Текущий статус
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedExchange.status === 'PENDING' ? 'Ожидает' :
                   selectedExchange.status === 'APPROVED' ? 'Одобрено' :
                   selectedExchange.status === 'REJECTED' ? 'Отклонено' :
                   selectedExchange.status === 'COMPLETED' ? 'Завершено' : selectedExchange.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Причина отмены
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedExchange.reason}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Новый статус
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2"
                >
                  <option value="">Выберите статус</option>
                  <option value="PENDING">Ожидает</option>
                  <option value="APPROVED">Одобрено</option>
                  <option value="REJECTED">Отклонено</option>
                  <option value="COMPLETED">Завершено</option>
                </select>
                {selectedExchange.type === 'CANCELLATION' && newStatus === 'APPROVED' && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    ⚠️ При одобрении запроса заказ будет автоматически отменен.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedExchange(null);
                  setNewStatus('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Отмена
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Обновить статус
              </button>
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default AdminExchanges;

