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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">POS Terminal</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Выход
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex gap-4">
          <NavLink
            to="/pos"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
              }`
            }
          >
            Продажи
          </NavLink>
          <NavLink
            to="/pos/sales"
            className={({ isActive }) =>
              `px-4 py-2 rounded ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
              }`
            }
          >
            Мои продажи
          </NavLink>
        </nav>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default POSLayout;

