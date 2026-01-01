import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { databaseService } from "../../services/database.service";
import { Analytics } from '@vercel/analytics/react';

const Database = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ["database-overview"],
    queryFn: () => databaseService.getCollectionsOverview(),
  });

  const { data: collectionData, isLoading: collectionLoading } = useQuery({
    queryKey: ["database-collection", selectedCollection],
    queryFn: () => databaseService.getCollection(selectedCollection, 100),
    enabled: !!selectedCollection,
  });

  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: ["database-item", selectedCollection, selectedItem],
    queryFn: () => databaseService.getItem(selectedCollection, selectedItem),
    enabled: !!selectedCollection && !!selectedItem,
  });

  const handleExport = async () => {
    try {
      const data = await databaseService.exportFullDatabase();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Ошибка экспорта базы данных");
    }
  };

  const collections = [
    "users",
    "categories",
    "products",
    "reviews",
    "supportMessages",
    "orders",
    "orderItems",
    "payments",
    "inventory",
    "saleAnalytics",
    "coupons",
    "exchanges",
  ];

  const getCollectionName = (collection) => {
    const names = {
      users: "Пользователи",
      categories: "Категории",
      products: "Товары",
      reviews: "Отзывы",
      supportMessages: "Сообщения поддержки",
      orders: "Заказы",
      orderItems: "Элементы заказов",
      payments: "Платежи",
      inventory: "Инвентарь",
      saleAnalytics: "Аналитика продаж",
      coupons: "Купоны",
      exchanges: "Запросы на обмен",
    };
    return names[collection] || collection;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Просмотр базы данных
        </h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Экспортировать всю базу данных
        </button>
      </div>

      {overviewLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка обзора...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {collections.map((collection) => {
            const overview = overviewData?.data?.find((item) => item.name === collection);
            const count = overview?.count || 0;
            return (
              <div
                key={collection}
                onClick={() => {
                  setSelectedCollection(collection);
                  setSelectedItem(null);
                }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedCollection === collection
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">
                  {getCollectionName(collection)}
                </h3>
                <p className="text-3xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">записей</p>
              </div>
            );
          })}
        </div>
      )}

      {selectedCollection && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {getCollectionName(selectedCollection)}
            </h2>
            <button
              onClick={() => {
                setSelectedCollection(null);
                setSelectedItem(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Назад
            </button>
          </div>

          {collectionLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка коллекции...</div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Всего: {collectionData?.data?.total || 0} записей
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Предпросмотр
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {collectionData?.data?.items?.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <pre className="max-w-md truncate text-xs">
                            {JSON.stringify(item, null, 2).substring(0, 200)}
                            {JSON.stringify(item, null, 2).length > 200
                              ? "..."
                              : ""}
                          </pre>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedItem(item.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Просмотр
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCollectionName(selectedCollection)} / {selectedItem}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Закрыть
                </button>
              </div>

              {itemLoading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Загрузка элемента...</div>
              ) : (
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(itemData?.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default Database;
