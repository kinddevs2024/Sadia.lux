import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/order.service";
import { Analytics } from "@vercel/analytics/react";

const statusOptions = [
  { value: "PENDING", label: "Ожидает оплаты" },
  { value: "PAID", label: "Оплачено" },
  { value: "COMPLETED", label: "Выполнено" },
  { value: "CANCELLED", label: "Отменено" },
];

const sourceLabels = {
  ONLINE: "Онлайн",
  POS: "POS",
  OFFLINE: "Оффлайн",
  TELEGRAM: "Telegram",
};

const paymentLabels = {
  CASH: "Наличные",
  TERMINAL: "Терминал",
  TRANSFER: "Перевод",
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await orderService.getAllOrders({ limit: 100 });
      if (response.data) {
        const ordersWithItems = await Promise.all(
          response.data.map(async (order) => {
            try {
              const orderDetail = await orderService.getOrder(order.id);
              return {
                ...order,
                items: orderDetail.data?.items || [],
              };
            } catch (error) {
              console.error(`Error loading order ${order.id} items:`, error);
              return { ...order, items: [] };
            }
          })
        );
        return { ...response, data: ordersWithItems };
      }
      return response;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["userOrders"]);
    },
  });

  const orders = ordersData?.data || [];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 lg:mb-8">
        Заказы
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Номер
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Источник
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Оплата
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Загружаем...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Заказы не найдены
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        if (
                          window.confirm(
                            `Изменить статус заказа ${order.orderNumber} на "${statusOptions.find(
                              (s) => s.value === e.target.value
                            )?.label}"?`
                          )
                        ) {
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          });
                        } else {
                          e.target.value = order.status;
                        }
                      }}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-primary cursor-pointer ${
                        order.status === "PAID"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : order.status === "COMPLETED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                      disabled={updateStatusMutation.isPending}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sourceLabels[order.source] || order.source}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {paymentLabels[order.paymentMethod || order.payment_method] ||
                      order.paymentMethod ||
                      order.payment_method ||
                      "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {Number(order.total).toFixed(2)} UZS
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:text-primary-dark dark:text-primary-light text-xs sm:text-sm"
                    >
                      Подробнее
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={(status) =>
            updateStatusMutation.mutate({ id: selectedOrder.id, status })
          }
        />
      )}
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      onClose();
      return;
    }
    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Не удалось обновить статус заказа");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Детали заказа
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-700 dark:text-gray-300">
                Номер:{" "}
                <span className="text-gray-900 dark:text-white">
                  {order.orderNumber}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                Источник:{" "}
                <span className="text-gray-900 dark:text-white">
                  {sourceLabels[order.source] || order.source}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                Оплата:{" "}
                <span className="text-gray-900 dark:text-white">
                  {paymentLabels[order.paymentMethod || order.payment_method] ||
                    order.paymentMethod ||
                    order.payment_method ||
                    "—"}
                </span>
              </div>
              {order.cashier_id && (
                <div className="text-gray-700 dark:text-gray-300">
                  Кассир:{" "}
                  <span className="text-gray-900 dark:text-white">
                    {order.cashier_id}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-gray-700 dark:text-gray-300">
                Создан:{" "}
                <span className="text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                Сумма:{" "}
                <span className="text-gray-900 dark:text-white font-semibold">
                  {Number(order.total).toFixed(2)} UZS
                </span>
              </div>
            </div>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              Статус:
            </strong>
            <div className="mt-2 flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  selectedStatus
                )}`}
              >
                {statusOptions.find((opt) => opt.value === selectedStatus)?.label}
              </span>
            </div>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              Позиции:
            </strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {order.items?.map((item, index) => (
                <li key={index} className="text-gray-900 dark:text-white">
                  {item.product?.name || item.product_name || "Товар"}{" "}
                  {item.sku ? `(SKU: ${item.sku})` : ""} — {item.quantity} x{" "}
                  {Number(item.price).toFixed(2)} UZS
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || selectedStatus === order.status}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating
                ? "Сохраняем..."
                : selectedStatus === order.status
                ? "Без изменений"
                : "Обновить статус"}
            </button>
          </div>
        </div>
        <Analytics />
      </div>
    </div>
  );
};

export default Orders;
