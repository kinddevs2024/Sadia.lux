import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../services/review.service';
import { useState } from 'react';

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewService.getAllReviews(),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => reviewService.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews']);
    },
  });

  // Фильтруем отзывы в зависимости от showApprovedOnly
  const allReviews = reviewsData?.data || [];
  const reviews = showApprovedOnly 
    ? allReviews.filter(r => r.approved) 
    : allReviews;

  const handleApprove = (id) => {
    if (window.confirm('Одобрить этот отзыв?')) {
      approveMutation.mutate(id);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить этот отзыв?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Отзывы</h1>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showApprovedOnly}
            onChange={(e) => setShowApprovedOnly(e.target.checked)}
            className="mr-2"
          />
          <span className="text-gray-700 dark:text-gray-300">Показывать только одобренные</span>
        </label>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Отзыв
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Пока нет отзывов
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {review.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {review.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          review.approved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {review.approved ? 'Одобрено' : 'Ожидает'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          Одобрить
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
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
    </div>
  );
};

export default AdminReviews;

