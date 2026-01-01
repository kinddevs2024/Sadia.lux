import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { Analytics } from '@vercel/analytics/react';

const Products = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
    },
  });

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Товары</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Добавить товар
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Себестоимость
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Прибыль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Загрузка...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Товары не найдены
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.price ? Number(product.price).toFixed(2) : '0.00'} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.costPrice ? `${Number(product.costPrice).toFixed(2)} сум` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.profit !== undefined && product.profit !== null
                      ? `${Number(product.profit).toFixed(2)} сум`
                      : product.costPrice && product.price
                      ? `${(Number(product.price) - Number(product.costPrice)).toFixed(2)} сум`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}/images`)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                    >
                      Изображения
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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
  );
};

const ProductForm = ({ product, categories, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || '',
    costPrice: product?.costPrice || '',
    categoryId: product?.categoryId || '',
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      product
        ? productService.updateProduct(product.id, data)
        : productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      onClose();
    },
    onError: (error) => {
      console.error('Error creating/updating product:', error);
      // Error is displayed in the form UI, no need for alert
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
    };
    if (formData.costPrice && formData.costPrice !== '') {
      submitData.costPrice = parseFloat(formData.costPrice);
    } else {
      // Remove costPrice if empty
      delete submitData.costPrice;
    }
    // Remove empty slug - let backend generate it
    if (!submitData.slug || submitData.slug.trim() === '') {
      delete submitData.slug;
    }
    mutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{product ? 'Edit' : 'Add'} Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              placeholder="Auto-generated from name if empty"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cost Price (Себестоимость)</label>
            <input
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Прибыль будет рассчитана автоматически: Цена - Себестоимость
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Категория *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {mutation.isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {mutation.error?.response?.data?.error || mutation.error?.message || 'Не удалось сохранить товар'}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isLoading ? 'Сохранение...' : (product ? 'Обновить' : 'Создать')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isLoading}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
      <Analytics />
    </div>
  );
};

export default Products;

