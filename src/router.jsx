import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import Product from './pages/public/Product';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PublicLayout from './components/public/PublicLayout';

// User pages
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import UserProfile from './pages/user/Profile';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminInventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/Orders';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSupport from './pages/admin/Support';
import AdminReviews from './pages/admin/Reviews';
import AdminUsers from './pages/admin/Users';
import AdminCoupons from './pages/admin/Coupons';
import AdminExchanges from './pages/admin/Exchanges';
import AdminDatabase from './pages/admin/Database';
import AdminCategories from './pages/admin/Categories';
import AdminProductImages from './pages/admin/ProductImages';
import AdminNewsletter from './pages/admin/Newsletter';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// POS pages
import POSLogin from './pages/pos/Login';
import POSMain from './pages/pos/Main';
import POSPayment from './pages/pos/Payment';
import POSLayout from './components/pos/POSLayout';

// ProtectedRoute is now imported from components

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <PublicLayout />
          </PublicRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<UserLogin />} />
        <Route path="register" element={<UserRegister />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id/images" element={<AdminProductImages />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="exchanges" element={<AdminExchanges />} />
        <Route path="database" element={<AdminDatabase />} />
      </Route>

      {/* POS Routes */}
      <Route path="/pos/login" element={<POSLogin />} />
      <Route
        path="/pos"
        element={
          <ProtectedRoute requiredRole="CASHIER">
            <POSLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<POSMain />} />
        <Route path="payment/:orderId" element={<POSPayment />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

