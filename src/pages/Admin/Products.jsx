import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/product.service";
import printBarcode from "../../utils/printBarcode";
import { categoryService } from "../../services/category.service";
import { Analytics } from "@vercel/analytics/react";

const Products = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productService.getProducts({ limit: 200 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
    },
  });

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Удалить товар? Это действие нельзя отменить."
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Товары
        </h1>
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
                Онлайн цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Оффлайн цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                POS активен
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
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Загружаем...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Товары не найдены
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={`${product.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                    {product.sku ? (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        SKU: {product.sku}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.category?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.price ? Number(product.price).toFixed(2) : "0.00"} UZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.offline_price != null
                      ? `${Number(product.offline_price).toFixed(2)} UZS`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.active_for_pos
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {product.active_for_pos ? "Включен" : "Выкл"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.costPrice
                      ? `${Number(product.costPrice).toFixed(2)} UZS`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.profit !== undefined && product.profit !== null
                      ? `${Number(product.profit).toFixed(2)} UZS`
                      : product.costPrice && product.price
                      ? `${(
                          Number(product.price) - Number(product.costPrice)
                        ).toFixed(2)} UZS`
                      : "-"}
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
                      onClick={() =>
                        navigate(`/admin/products/${product.id}/images`)
                      }
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                    >
                      Медиа
                    </button>
                    <button
                      onClick={() => printBarcode({ product })}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      Печать штрихкода
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
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price ?? "",
    offline_price:
      product?.offline_price !== null && product?.offline_price !== undefined
        ? product.offline_price
        : "",
    costPrice: product?.costPrice ?? "",
    categoryId: product?.categoryId || "",
    sku: product?.sku || "",
    stock: product?.stock ?? "",
    active_for_pos: product?.active_for_pos ?? false,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      product
        ? productService.updateProduct(product.id, data)
        : productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      onClose();
    },
    onError: (error) => {
      console.error("Error creating/updating product:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      active_for_pos: !!formData.active_for_pos,
    };

    if (formData.costPrice !== "" && formData.costPrice !== null) {
      submitData.costPrice = parseFloat(formData.costPrice);
    } else {
      delete submitData.costPrice;
    }

    if (formData.offline_price !== "" && formData.offline_price !== null) {
      submitData.offline_price = parseFloat(formData.offline_price);
    } else {
      submitData.offline_price = null;
    }

    if (formData.stock !== "" && formData.stock !== null) {
      submitData.stock = parseInt(formData.stock, 10);
    } else {
      delete submitData.stock;
    }

    if (formData.sku) {
      submitData.sku = formData.sku.trim();
    } else {
      delete submitData.sku;
    }

    if (!submitData.slug || submitData.slug.trim() === "") {
      delete submitData.slug;
    }

    mutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">
          {product ? "Редактировать товар" : "Добавить товар"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
                placeholder="Авто, если пусто"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Онлайн цена *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Оффлайн цена (опционально)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.offline_price}
                onChange={(e) =>
                  setFormData({ ...formData, offline_price: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
                placeholder="Если пусто — берём онлайн цену"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Себестоимость
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Прибыль = Онлайн цена - Себестоимость
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Категория *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SKU / баркод</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
                placeholder="Для сканера"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Остаток</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active_for_pos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active_for_pos: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
                <span className="text-sm">Доступно в POS</span>
              </label>
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {mutation.error?.response?.data?.error ||
                mutation.error?.message ||
                "Ошибка при сохранении товара"}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isLoading
                ? "Сохраняем..."
                : product
                ? "Сохранить"
                : "Добавить"}
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
