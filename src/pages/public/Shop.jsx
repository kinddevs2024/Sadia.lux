import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import ProductGrid from '../../components/public/ProductGrid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Analytics } from '@vercel/analytics/react';

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const categoryScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery, page],
    queryFn: () =>
      productService.getProducts({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      }),
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.data?.data || [];
  const pagination = productsData?.data?.pagination || {};

  // Check scroll position for arrows
  const checkScrollPosition = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = categoryScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [categories]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Магазин</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Categories - YouTube style */}
        <div className="mb-6 relative">
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-0 bottom-0 z-10 bg-gray-50 dark:bg-gray-900 flex items-center justify-center w-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Прокрутить влево"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-0 bottom-0 z-10 bg-gray-50 dark:bg-gray-900 flex items-center justify-center w-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Прокрутить вправо"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === ''
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Все категории
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} loading={isLoading} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              Назад
            </button>
            <span className="px-4 py-2 flex items-center text-gray-700 dark:text-gray-300">
              Страница {pagination.page || page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
};

export default Shop;

