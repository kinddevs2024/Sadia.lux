import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role permissions - if no requiredRole specified, check if user is ADMIN or SUPERADMIN
  if (!requiredRole) {
    // For admin panel routes without specific role, allow ADMIN and SUPERADMIN
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return <Navigate to="/admin/login" replace />;
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
      return <Navigate to="/admin/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

