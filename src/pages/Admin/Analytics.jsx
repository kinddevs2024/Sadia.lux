import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

const fmt = (n) =>
  (n || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const presets = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

const sources = [
  { label: "All sources", value: "" },
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "POS", value: "POS" },
  { label: "Telegram", value: "TELEGRAM" },
];

const paymentMethods = [
  { label: "All payments", value: "" },
  { label: "Cash", value: "CASH" },
  { label: "Terminal", value: "TERMINAL" },
  { label: "Transfer", value: "TRANSFER" },
];

const buildSeries = (rows) => {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return sorted.map((item, idx) => ({
    x: idx,
    y: item.totalOrders || 0,
    y2: item.totalRevenue || 0,
    yPaid: item.paidOrders || item.totalOrders || 0,
    yCompleted: item.completedOrders || 0,
    y2Completed: item.completedRevenue || 0,
    label: new Date(item.date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));
};

const linePath = (points, maxY, height, width) => {
  if (!points.length || maxY === 0) return "";
  const stepX = width / Math.max(points.length - 1, 1);
  return points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - (p.y / maxY) * height;
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
};

const getDateRange = (period) => {
  const today = new Date();
  const start = new Date(today);
  if (period === "yesterday") {
    start.setDate(start.getDate() - 1);
    today.setDate(today.getDate() - 1);
  } else if (period === "7d") {
    start.setDate(start.getDate() - 6);
  } else if (period === "30d") {
    start.setDate(start.getDate() - 29);
  }
  const toISO = (d) => d.toISOString().split("T")[0];
  return { start: toISO(start), end: toISO(today) };
};

const Analytics = () => {
  const [period, setPeriod] = useState("today");
  const [source, setSource] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tab, setTab] = useState("orders"); // orders | buyouts | products

  const { start, end } = getDateRange(period);
  const rangeLabel = start === end ? start : `${start} — ${end}`;

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", period, source, paymentMethod],
    queryFn: () =>
      adminService.getAnalytics({
        startDate: start,
        endDate: end,
        source,
        paymentMethod,
      }),
    enabled: tab !== "products",
  });

  const { data: productAnalyticsData, isLoading: productsLoading } = useQuery({
    queryKey: ["product-analytics", period, source],
    queryFn: () =>
      adminService.getProductAnalytics({
        startDate: start,
        endDate: end,
        source,
      }),
    enabled: tab === "products",
  });

  const payload = analyticsData?.data || {};
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
    ? payload.data
    : [];
  const totals = payload.totals || {};

  const series = useMemo(() => buildSeries(rows), [rows]);
  const maxOrders =
    tab === "buyouts"
      ? Math.max(...series.map((p) => p.yCompleted), 0)
      : Math.max(...series.map((p) => p.y), 0);
  const maxRevenue =
    tab === "buyouts"
      ? Math.max(...series.map((p) => p.y2Completed), 0)
      : Math.max(...series.map((p) => p.y2), 0);
  const svgWidth = 1200;
  const svgHeight = 280;

  const funnel = {
    created: totals.totalOrders || 0,
    paid: totals.paidOrders || totals.totalOrders || 0,
    completed: totals.completedOrders || totals.totalOrders || 0,
  };

  const cards = useMemo(() => {
    const sourceLabel =
      sources.find((s) => s.value === source)?.label || "All sources";
    const dataByTab =
      tab === "buyouts"
        ? {
            orders: totals.completedOrders || 0,
            revenue: totals.completedRevenue || totals.totalRevenue || 0,
          }
        : {
            orders: totals.totalOrders || 0,
            revenue: totals.totalRevenue || 0,
          };
    return [
      {
        title: tab === "buyouts" ? "Completed orders" : "Orders",
        value: fmt(dataByTab.orders),
        hint: sourceLabel,
      },
      {
        title: "Revenue",
        value: `${fmt(dataByTab.revenue)} UZS`,
        hint: tab === "buyouts" ? "Completed revenue" : "Paid + completed",
      },
      {
        title: "Products sold",
        value: fmt(totals.productsSold),
        hint: "Units sold",
      },
      {
        title: "Average order value",
        value:
          dataByTab.orders && dataByTab.revenue
            ? `${fmt(Math.round(dataByTab.revenue / dataByTab.orders))} UZS`
            : "0",
        hint: "Revenue / orders",
      },
    ];
  }, [tab, totals, source]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sales analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Updated at{" "}
            {new Date().toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {presets.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {[
          { key: "orders", label: "Orders" },
          { key: "buyouts", label: "Completed" },
          { key: "products", label: "Products" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 border-b-2 ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {cards.map((c) => (
            <div key={c.title}>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {c.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {c.value}
              </p>
              {c.hint && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {c.hint}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-0 top-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span> Orders
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-teal-400"></span> Revenue
            </span>
          </div>
          {series.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 pt-10">
              No data for the selected filters yet.
            </div>
          ) : (
            <div className="overflow-x-auto pt-8">
              <svg
                width={svgWidth}
                height={svgHeight}
                className="min-w-full"
                aria-label="chart"
              >
                <line
                  x1="0"
                  y1={svgHeight - 20}
                  x2={svgWidth}
                  y2={svgHeight - 20}
                  stroke="#d9e2ec"
                  strokeWidth="2"
                />
                {series.map((p, i) => (
                  <text
                    key={i}
                    x={(i / Math.max(series.length - 1, 1)) * svgWidth}
                    y={svgHeight - 6}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#8a94a6"
                  >
                    {p.label}
                  </text>
                ))}
                <path
                  d={linePath(
                    tab === "buyouts"
                      ? series.map((p) => ({ ...p, y: p.yCompleted }))
                      : series,
                    maxOrders,
                    svgHeight - 40,
                    svgWidth
                  )}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
                <path
                  d={linePath(
                    tab === "buyouts"
                      ? series.map((p) => ({ ...p, y: p.y2Completed }))
                      : series.map((p) => ({ ...p, y: p.y2 })),
                    maxRevenue,
                    svgHeight - 40,
                    svgWidth
                  )}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Order funnel
        </h2>
        <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <span>Created</span>
            <span className="font-semibold">{fmt(funnel.created)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <span>Paid</span>
            <span className="font-semibold">{fmt(funnel.paid)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Completed</span>
            <span className="font-semibold">{fmt(funnel.completed)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily breakdown
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Source and payment filters apply to all rows
          </span>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Products sold
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading analytics...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data for this selection yet.
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={`${item.date}-${item.source}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(item.date).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.source || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fmt(item.totalRevenue)} UZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fmt(
                        tab === "buyouts"
                          ? item.completedOrders || 0
                          : item.totalOrders || 0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fmt(item.productsSold)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Analytics Tab */}
      {tab === "products" && (
        <>
          {(() => {
            const productData = productAnalyticsData?.data || {};
            const products = productData.products || [];
            const topProducts = products.slice(0, 10);

            return (
              <>
                {/* Product Stats Cards */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Products Sold
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {fmt(productData.totalProducts || 0)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Unique products
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {fmt(productData.totalRevenue || 0)} UZS
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From all products
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Units Sold
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {fmt(productData.totalQuantity || 0)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Items sold
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Products List */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Products by Sales
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Sorted by revenue
                    </span>
                  </div>
                  <div className="max-h-[600px] overflow-auto">
                    {productsLoading ? (
                      <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading product analytics...
                      </div>
                    ) : topProducts.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No product sales data for this period.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {topProducts.map((product, index) => {
                          const maxRevenue = Math.max(...topProducts.map(p => p.totalRevenue), 1);
                          const revenuePercentage = (product.totalRevenue / maxRevenue) * 100;

                          return (
                            <div
                              key={product.productId}
                              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {product.productName}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {fmt(product.totalQuantity)} units · {fmt(product.ordersCount)} orders
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {fmt(product.totalRevenue)} UZS
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.totalQuantity > 0
                                      ? `${fmt(Math.round(product.totalRevenue / product.totalQuantity))} UZS/unit`
                                      : "—"}
                                  </p>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                                  style={{ width: `${revenuePercentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Sales Charts */}
                {topProducts.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sales Trends by Product
                    </h2>
                    {topProducts.slice(0, 5).map((product) => {
                      const productSeries = product.dates.map((item, idx) => ({
                        x: idx,
                        y: item.quantity,
                        y2: item.revenue,
                        label: new Date(item.date).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                        }),
                      }));

                      const maxQty = Math.max(...productSeries.map((p) => p.y), 1);
                      const maxRev = Math.max(...productSeries.map((p) => p.y2), 1);

                      return (
                        <div
                          key={product.productId}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
                        >
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {product.productName}
                            </h3>
                            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Total: {fmt(product.totalRevenue)} UZS</span>
                              <span>Units: {fmt(product.totalQuantity)}</span>
                            </div>
                          </div>
                          {productSeries.length === 0 ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                              No sales data for this period
                            </div>
                          ) : (
                            <div className="overflow-x-auto pt-4">
                              <svg
                                width={svgWidth}
                                height={svgHeight}
                                className="min-w-full"
                                aria-label="chart"
                              >
                                <line
                                  x1="0"
                                  y1={svgHeight - 20}
                                  x2={svgWidth}
                                  y2={svgHeight - 20}
                                  stroke="#d9e2ec"
                                  strokeWidth="2"
                                />
                                {productSeries.map((p, i) => (
                                  <text
                                    key={i}
                                    x={(i / Math.max(productSeries.length - 1, 1)) * svgWidth}
                                    y={svgHeight - 6}
                                    fontSize="10"
                                    textAnchor="middle"
                                    fill="#8a94a6"
                                  >
                                    {p.label}
                                  </text>
                                ))}
                                <path
                                  d={linePath(
                                    productSeries,
                                    maxQty,
                                    svgHeight - 40,
                                    svgWidth
                                  )}
                                  fill="none"
                                  stroke="#ec4899"
                                  strokeWidth="2"
                                />
                                <path
                                  d={linePath(
                                    productSeries.map((p) => ({ ...p, y: p.y2 })),
                                    maxRev,
                                    svgHeight - 40,
                                    svgWidth
                                  )}
                                  fill="none"
                                  stroke="#14b8a6"
                                  strokeWidth="2"
                                  strokeDasharray="6 4"
                                />
                              </svg>
                              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full bg-pink-500"></span> Units
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full bg-teal-400"></span> Revenue
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}

      <VercelAnalytics />
    </div>
  );
};

export default Analytics;
