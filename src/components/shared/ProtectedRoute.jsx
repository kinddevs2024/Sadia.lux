import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPOSRoute = location.pathname.startsWith('/pos');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to regular login, not admin login (admin login only accessible via direct URL)
    if (isPOSRoute) {
      return <Navigate to="/pos/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Check role permissions - if no requiredRole specified, check if user is ADMIN or SUPERADMIN
  if (!requiredRole) {
    // For admin panel routes without specific role, allow ADMIN and SUPERADMIN
    if (isAdminRoute && user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      // Show error message, don't redirect
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Доступ запрещен. Требуются права администратора.</div>
        </div>
      );
    }
  } else {
    const allowedRoles = ['SUPERADMIN']; // SUPERADMIN can access everything
    
    // ADMIN can access ADMIN routes
    if (requiredRole === 'ADMIN') {
      allowedRoles.push('ADMIN');
    }
    
    // CASHIER can access CASHIER routes, ADMIN and SUPERADMIN can too
    if (requiredRole === 'CASHIER') {
      allowedRoles.push('CASHIER', 'ADMIN');
    }
    
    if (!allowedRoles.includes(user?.role)) {
      // Don't redirect, just show error
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Доступ запрещен. Недостаточно прав.</div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

