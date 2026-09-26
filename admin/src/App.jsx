import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CustomOrdersPage from './pages/CustomOrdersPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import WebsiteContentPage from './pages/WebsiteContentPage.jsx';
import StoreSettingsPage from './pages/StoreSettingsPage.jsx';
import AdminProfilePage from './pages/AdminProfilePage.jsx';
import api from './utils/api.js';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Hash-based routing with clean sync
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#', '').trim();
    const validRoutes = [
      'dashboard',
      'products',
      'categories',
      'orders',
      'custom-orders',
      'reviews',
      'content',
      'settings',
      'profile'
    ];
    return validRoutes.includes(hash) ? hash : 'dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Sync route to hash
  const navigateTo = (route) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch dashboard stats periodically & on demand
  const fetchStats = async () => {
    if (!isAuthenticated) return;
    try {
      setRefreshing(true);
      const data = await api.get('/admin/dashboard/stats');
      setDashboardStats(data);
    } catch (e) {
      console.warn('Could not fetch stats', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 45000); // 45s poll for new orders
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-cream)',
        color: 'var(--color-forest)',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.25rem'
      }}>
        🌸 Loading Fleuria Studio...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getPageInfo = () => {
    switch (currentRoute) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Store performance & artisan operations' };
      case 'products':
        return { title: 'Products', subtitle: 'Manage botanical creations, prices & stock' };
      case 'categories':
        return { title: 'Categories', subtitle: 'Craft collections and catalog filter pills' };
      case 'orders':
        return { title: 'Orders', subtitle: 'WhatsApp customer purchases & tracking' };
      case 'custom-orders':
        return { title: 'Custom Orders', subtitle: 'Bespoke commissions & wedding favor briefs' };
      case 'reviews':
        return { title: 'Customer Reviews', subtitle: 'Verified testimonials displayed on website' };
      case 'content':
        return { title: 'Website Content', subtitle: 'CMS editor for Hero, About, Care Guide & Footer' };
      case 'settings':
        return { title: 'Store Settings', subtitle: 'WhatsApp configuration & currency fees' };
      case 'profile':
        return { title: 'Admin Profile', subtitle: 'Account credentials and security' };
      default:
        return { title: 'Dashboard', subtitle: 'Artisan studio management' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={dashboardStats}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <Header
          pageTitle={title}
          pageSubtitle={subtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={fetchStats}
          refreshing={refreshing}
        />

        <main className="content-area">
          {currentRoute === 'dashboard' && (
            <DashboardPage
              stats={dashboardStats}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'products' && (
            <ProductsPage
              onStatsChange={fetchStats}
            />
          )}

          {currentRoute === 'categories' && (
            <CategoriesPage
              onStatsChange={fetchStats}
            />
          )}

          {currentRoute === 'orders' && (
            <OrdersPage
              onStatsChange={fetchStats}
            />
          )}

          {currentRoute === 'custom-orders' && (
            <CustomOrdersPage
              onStatsChange={fetchStats}
            />
          )}

          {currentRoute === 'reviews' && (
            <ReviewsPage />
          )}

          {currentRoute === 'content' && (
            <WebsiteContentPage />
          )}

          {currentRoute === 'settings' && (
            <StoreSettingsPage />
          )}

          {currentRoute === 'profile' && (
            <AdminProfilePage />
          )}
        </main>
      </div>
    </div>
  );
}
