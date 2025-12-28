import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Панель администратора</h2>
          <p className="text-sm text-gray-400 mt-1">
            {isSuperAdmin ? 'СуперАдмин' : user?.role}
          </p>
        </div>
        <nav className="mt-8">
          <Link
            to="/admin/dashboard"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Панель управления
          </Link>
          <Link
            to="/admin/categories"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Категории
          </Link>
          <Link
            to="/admin/products"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Товары
          </Link>
          <Link
            to="/admin/inventory"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Склад
          </Link>
          <Link
            to="/admin/orders"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Заказы
          </Link>
          <Link
            to="/admin/analytics"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Аналитика
          </Link>
          <Link
            to="/admin/reviews"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Отзывы
          </Link>
          <Link
            to="/admin/support"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Сообщения поддержки
          </Link>
          <Link
            to="/admin/newsletter"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Рассылка новостей
          </Link>
          <Link
            to="/admin/database"
            className="block px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            База данных
          </Link>
          
          {/* SuperAdmin only */}
          {isSuperAdmin && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="px-6 py-2 text-xs text-gray-400 uppercase">СуперАдмин</p>
              </div>
              <Link
                to="/admin/users"
                className="block px-6 py-3 hover:bg-gray-700 transition-colors"
              >
                Пользователи
              </Link>
              <Link
                to="/admin/coupons"
                className="block px-6 py-3 hover:bg-gray-700 transition-colors"
              >
                Купоны
              </Link>
              <Link
                to="/admin/exchanges"
                className="block px-6 py-3 hover:bg-gray-700 transition-colors"
              >
                Запросы на отмену
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Панель администратора</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Выход
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

