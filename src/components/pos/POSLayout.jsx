import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const POSLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/pos/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">POS Terminal</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base text-gray-700 truncate max-w-full">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Выход
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex gap-2 sm:gap-4 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <NavLink
            to="/pos"
            end
            className={({ isActive }) =>
              `px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap text-sm sm:text-base ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            Продажи
          </NavLink>
          <NavLink
            to="/pos/sales"
            className={({ isActive }) =>
              `px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap text-sm sm:text-base ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            Мои продажи
          </NavLink>
        </nav>
      </header>

      {/* Page Content */}
      <main className="bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default POSLayout;

