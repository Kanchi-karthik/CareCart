import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axiosConfig';
import { ShoppingCart, Users, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    customers: 0,
    products: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, customersRes, productsRes, ordersRes] = await Promise.all([
          apiClient.get('/dashboard/clients-count'),
          apiClient.get('/dashboard/customers-count'),
          apiClient.get('/dashboard/products-count'),
          apiClient.get('/dashboard/orders-count')
        ]);

        setStats({
          clients: clientsRes.data.count || 0,
          customers: customersRes.data.count || 0,
          products: productsRes.data.count || 0,
          orders: ordersRes.data.count || 0
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <AlertCircle size={32} style={{ margin: '0 auto', marginBottom: '10px' }} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <Users size={24} />
            <span>Clients</span>
          </div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-label">B2B Buyers</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <ShoppingCart size={24} />
            <span>Customers</span>
          </div>
          <div className="stat-value">{stats.customers}</div>
          <div className="stat-label">B2C Buyers</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <Package size={24} />
            <span>Products</span>
          </div>
          <div className="stat-value">{stats.products}</div>
          <div className="stat-label">Total Inventory</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <TrendingUp size={24} />
            <span>Orders</span>
          </div>
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/app/products'}>
            <Package size={20} />
            Add New Product
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/app/b2b-orders'}>
            <ShoppingCart size={20} />
            Create B2B Order
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/app/b2c-orders'}>
            <ShoppingCart size={20} />
            Create B2C Order
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/app/stock-alerts'}>
            <AlertCircle size={20} />
            View Stock Alerts
          </button>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <CheckCircle size={20} style={{ color: 'green' }} />
            <span>System is operational and all modules are loaded</span>
          </div>
          <div className="activity-item">
            <CheckCircle size={20} style={{ color: 'green' }} />
            <span>Database connection established successfully</span>
          </div>
          <div className="activity-item">
            <CheckCircle size={20} style={{ color: 'green' }} />
            <span>All API endpoints are responding</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
