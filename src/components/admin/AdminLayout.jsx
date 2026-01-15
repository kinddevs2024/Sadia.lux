import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        ? "bg-primary text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 min-w-[16rem] flex-none bg-white text-gray-800 flex flex-col border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-5 py-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <div className="text-xl font-semibold tracking-tight text-primary">Sadia Admin</div>
            <div className="text-xs text-gray-500 mt-1">
              {isSuperAdmin ? "Superadmin" : user?.role}
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClasses(item.to)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isSuperAdmin && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs uppercase text-gray-500 px-2">
                Управление
              </div>
              {superMenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClasses(item.to)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
          <div className="mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Панель управления
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("ru-RU")}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
