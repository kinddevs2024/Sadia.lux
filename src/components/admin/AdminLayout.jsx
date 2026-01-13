import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/admin/dashboard", label: "Дашборд" },
    { to: "/admin/categories", label: "Категории" },
    { to: "/admin/products", label: "Товары" },
    { to: "/admin/inventory", label: "Склад" },
    { to: "/admin/orders", label: "Заказы" },
    { to: "/admin/offline-shopping", label: "Оффлайн продажи" },
    { to: "/admin/cashiers", label: "Кассиры" },
    { to: "/admin/analytics", label: "Аналитика" },
    { to: "/admin/reviews", label: "Отзывы" },
    { to: "/admin/support", label: "Поддержка" },
    { to: "/admin/newsletter", label: "Рассылки" },
    { to: "/admin/database", label: "База данных" },
  ];

  const superMenu = [
    { to: "/admin/users", label: "Пользователи" },
    { to: "/admin/coupons", label: "Купоны" },
    { to: "/admin/exchanges", label: "Возвраты/обмены" },
  ];

  const linkClasses = (path) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-200 hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 min-w-[16rem] flex-none bg-gray-900 text-white flex flex-col border-r border-gray-800 sticky top-0 self-start h-screen">
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="text-xl font-semibold tracking-tight">Sadia Admin</div>
          <div className="text-xs text-gray-400 mt-1">
            {isSuperAdmin ? "Superadmin" : user?.role}
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClasses(item.to)}>
              {item.label}
            </Link>
          ))}
          {isSuperAdmin && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs uppercase text-gray-500 px-2">
                Управление
              </div>
              {superMenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClasses(item.to)}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 text-sm text-gray-300">
          <div className="mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Панель управления
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("ru-RU")}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
