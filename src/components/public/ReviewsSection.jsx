import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '../../services/review.service';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import ScrollReveal from '../shared/ScrollReveal';

const ReviewsSection = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5,
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewService.getReviews(),
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      setFormData({ name: '', text: '', rating: 5 });
      setShowForm(false);
      alert('Спасибо за ваш отзыв! Он будет опубликован после модерации.');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Ошибка при отправке отзыва');
    },
  });

  const reviews = reviewsData?.data || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    createReviewMutation.mutate(formData);
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>
              Отзывы наших клиентов
            </h2>
            <p className="text-lg text-secondary" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Что говорят о нас наши покупательницы
            </p>
          </div>
        </ScrollReveal>

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Загрузка отзывов...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {reviews.map((review, index) => (
              <ScrollReveal key={review.id} direction="up" delay={0.1 * index}>
                <motion.div
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mr-4">
                    <span className="text-primary text-xl font-semibold">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{review.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="leading-relaxed italic" style={{ color: 'rgb(var(--color-text-secondary))' }}>"{review.text}"</p>
                <p className="text-xs mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </motion.div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'rgb(var(--color-text-secondary))' }}>Пока нет отзывов. Будьте первыми!</p>
          </div>
        )}

        {/* Add Review Button */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="text-center">
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-all duration-300 hover:shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {showForm ? 'Отмена' : 'Оставить отзыв'}
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-12 max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl"
            >
            <h3 className="text-2xl font-light mb-6 text-center" style={{ color: 'rgb(var(--color-text-primary))' }}>
              Поделитесь своим мнением
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Введите ваше имя"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка *
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className="focus:outline-none"
                    >
                      {rating <= formData.rating ? (
                        <StarIcon className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш отзыв *
                </label>
                <textarea
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Расскажите о вашем опыте покупки..."
                  minLength={10}
                  maxLength={1000}
                />
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    {formData.text.length}/1000 символов
                  </p>
              </div>

              <button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="w-full bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {createReviewMutation.isPending ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </form>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ReviewsSection;

