import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterService } from '../../services/newsletter.service';
import { Analytics } from '@vercel/analytics/react';

const Newsletter = () => {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data: subscribersData, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => newsletterService.getSubscribers(),
  });

  const sendMutation = useMutation({
    mutationFn: ({ subject, message }) => newsletterService.sendNewsletter(subject, message),
    onSuccess: (data) => {
      alert(`Рассылка отправлена ${data.data.recipientsCount} подписчикам!`);
      setSubject('');
      setMessage('');
      queryClient.invalidateQueries(['newsletter-subscribers']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || error.response?.data?.message || 'Ошибка при отправке рассылки');
    },
  });

  const subscribers = subscribersData?.data || [];
  const subscribersCount = subscribers.length;

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Пожалуйста, заполните тему и сообщение');
      return;
    }
    if (subscribersCount === 0) {
      alert('Нет подписчиков для рассылки');
      return;
    }
    if (window.confirm(`Вы уверены, что хотите отправить рассылку ${subscribersCount} подписчикам?`)) {
      sendMutation.mutate({ subject, message });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Рассылка новостей
      </h1>

      {/* Статистика */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Статистика подписчиков
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего подписчиков</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{subscribersCount}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Получат рассылку</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{subscribersCount}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Последняя рассылка</p>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {subscribersCount > 0 ? 'Готова к отправке' : 'Нет подписчиков'}
            </p>
          </div>
        </div>
      </div>

      {/* Форма рассылки */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Создать рассылку
        </h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тема письма *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Например: Новые коллекции весна 2024"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Сообщение *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Текст письма для подписчиков..."
              rows={10}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Внимание:</strong> Рассылка будет отправлена <strong>{subscribersCount}</strong> подписчикам.
            </p>
          </div>
          <button
            type="submit"
            disabled={sendMutation.isPending || subscribersCount === 0}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMutation.isPending ? 'Отправка...' : `Отправить рассылку (${subscribersCount} подписчиков)`}
          </button>
        </form>
      </div>

      {/* Список подписчиков */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Список подписчиков ({subscribersCount})
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Пока нет подписчиков
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Дата подписки
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(subscriber.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
};

export default Newsletter;

