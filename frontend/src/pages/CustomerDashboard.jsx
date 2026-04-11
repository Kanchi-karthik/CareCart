import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import apiClient from '../utils/axiosConfig';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { getCartCount, getCartTotal } = useCart();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    cartValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get customer info
      const customersRes = await apiClient.get('/customers');
      const customer = customersRes.data.find(c => c.user_id === user.user_id);

      if (!customer) {
        if (user.role?.toUpperCase() === 'CUSTOMER') {
          // No alert here but ensure we stop loading
        }
        setLoading(false);
        return;
      }
      // Fetch orders
      const ordersRes = await apiClient.get('/b2c-orders');
      const allOrders = ordersRes.data || [];
      const myOrders = allOrders.filter(o => o.customer_id === customer.customer_id);
      setRecentOrders(myOrders.slice(0, 5));

      // Calculate stats
      const totalSpent = myOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

      setStats({
        totalOrders: myOrders.length,
        totalSpent: totalSpent,
        cartItems: getCartCount(),
        cartValue: getCartTotal()
      });
      // Fetch featured products
      const productsRes = await apiClient.get('/products');
      const products = productsRes.data || [];
      setFeaturedProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.username}!</h1>
          <p className="dashboard-subtitle">Your personalized shopping dashboard</p>
        </div>
        <div className="header-time">
          <ShoppingCart size={20} />
          <span>Customer Portal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mt-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <ShoppingCart size={20} className="stat-icon" />
            <span className="stat-title">Cart Items</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.cartItems}</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <TrendingUp size={20} className="stat-icon" />
            <span className="stat-title">Cart Value</span>
          </div>
          <div className="stat-value-wrapper">
            <div className="stat-number">${stats.cartValue.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <ShoppingBag size={20} className="stat-icon" />
            <span className="stat-title">Total Orders</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <TrendingUp size={20} className="stat-icon" />
            <span className="stat-title">Total Spent</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">${stats.totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section mt-6">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/app/products')} className="quick-action-btn">
            <Package size={24} />
            Products
          </button>
          <button onClick={() => navigate('/app/cart')} className="quick-action-btn" style={{ background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)' }}>
            <ShoppingCart size={24} />
            My Cart
          </button>
          <button onClick={() => navigate('/app/orders')} className="quick-action-btn" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)' }}>
            <ShoppingBag size={24} />
            Orders
          </button>
        </div>
      </div>

      <div className="dashboard-grid mt-6">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <button onClick={() => navigate('/app/orders')} className="view-all-btn">View All</button>
          </div>
          <div className="recent-items-list mt-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">No orders yet</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.order_id} className="recent-item">
                  <div className="recent-item-info">
                    <h4>Order #{order.order_id}</h4>
                    <p className="recent-item-detail">{order.product_name} x {order.quantity}</p>
                    <p className="recent-item-detail" style={{ fontSize: '0.75rem' }}>{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${order.total_amount}</p>
                    <span className="status completed">{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Featured Products */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <button onClick={() => navigate('/app/products')} className="view-all-btn">Show More</button>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {featuredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">No products found</p>
            ) : (
              featuredProducts.map(product => (
                <div key={product.product_id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center group hover:border-red-300 transition">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                    <p className="text-red-700 font-bold mt-1">${product.price}</p>
                  </div>
                  <button onClick={() => navigate('/app/products')} className="text-red-600 font-bold text-sm bg-white border border-red-200 px-3 py-1 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">Buy Now</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
